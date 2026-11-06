/**
 * @en Durable claim + single accounting apply for Mercado Pago payments (#446).
 * @es Reserva durable y una sola aplicación contable por pago Mercado Pago (#446).
 * @pt-BR Reserva durável e uma única aplicação contábil por pagamento Mercado Pago (#446).
 */

import { Prisma, type PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { computeFacturaPendiente } from '../lib/mercadopagoFacturaPendiente'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import { notifyManagers } from '../notifications'
import { ReciboCobroService } from './ReciboCobroService'

/** @en In-flight claim before recibo/final estado is written (#446). */
export const MP_PROCESSED_ESTADO_PROCESSING = 'processing'

export type MpFacturaRef = {
  id: number
  clienteId: number
  tipo: string
  prefijo: string
  numero: number
  total: Decimal
}

export type ApplyApprovedMpPaymentInput = {
  tenantId: number
  mpPaymentId: string
  factura: MpFacturaRef
  transactionAmount: number
  usuarioId: number
  /** @en When true, notify managers after a new successful apply. */
  notifyOnApply?: boolean
}

export type ApplyApprovedMpPaymentResult =
  | { ok: true; skipped: boolean; reciboCobroId: number | null }
  | { ok: false; error: string }

function formatFacturaRef(factura: MpFacturaRef): string {
  const prefijo = factura.prefijo.padStart(4, '0')
  const numero = String(factura.numero).padStart(8, '0')
  return `${factura.tipo}-${prefijo}-${numero}`
}

export function isPrismaUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
}

/**
 * @en True when the processed-payment row is a finished outcome (not an in-flight claim).
 * @es True cuando la fila processed es un resultado final (no una reserva en curso).
 * @pt-BR True quando a linha processed é um resultado final (não uma reserva em andamento).
 */
export function isProcessedPaymentComplete(row: {
  estado: string
  reciboCobroId: number | null
}): boolean {
  if (row.estado === MP_PROCESSED_ESTADO_PROCESSING) return false
  return true
}

function hashPaymentIdToInt32(paymentId: string): number {
  let hash = 0
  for (let i = 0; i < paymentId.length; i += 1) {
    hash = (hash * 31 + paymentId.charCodeAt(i)) | 0
  }
  return hash === 0 ? 1 : hash
}

/**
 * @en Session advisory lock per tenant+payment (Postgres) to serialize claim/resume (#446).
 * @es Lock advisory de sesión por tenant+pago (Postgres) para serializar claim/resume (#446).
 * @pt-BR Lock advisory de sessão por tenant+pagamento (Postgres) para serializar claim/resume (#446).
 */
async function withMpPaymentAdvisoryLock<T>(
  prisma: PrismaClient,
  tenantId: number,
  mpPaymentId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const key2 = hashPaymentIdToInt32(mpPaymentId)
  try {
    await prisma.$executeRaw`SELECT pg_advisory_lock(${tenantId}, ${key2})`
  } catch {
    // Unit mocks / non-Postgres: proceed without lock (unique claim still applies).
    return fn()
  }
  try {
    return await fn()
  } finally {
    try {
      await prisma.$executeRaw`SELECT pg_advisory_unlock(${tenantId}, ${key2})`
    } catch {
      // ignore unlock failures on mocks
    }
  }
}

export async function findReciboCobroIdByMpPaymentRef(
  prisma: PrismaClient,
  tenantId: number,
  mpPaymentId: string,
): Promise<number | null> {
  const forma = await prisma.reciboCobroForma.findFirst({
    where: {
      tipo: 'mercadopago',
      referencia: mpPaymentId,
      reciboCobro: { tenantId },
    },
    select: { reciboCobroId: true },
    orderBy: { id: 'asc' },
  })
  return forma?.reciboCobroId ?? null
}

type ClaimOutcome =
  | { kind: 'skip'; reciboCobroId: number | null }
  | { kind: 'proceed'; processedId: number }

async function claimOrResumeProcessedPayment(
  prisma: PrismaClient,
  input: { tenantId: number; mpPaymentId: string; facturaId: number },
): Promise<ClaimOutcome> {
  const existing = await prisma.mercadoPagoProcessedPayment.findUnique({
    where: {
      tenantId_mpPaymentId: {
        tenantId: input.tenantId,
        mpPaymentId: input.mpPaymentId,
      },
    },
  })

  if (existing && isProcessedPaymentComplete(existing)) {
    return { kind: 'skip', reciboCobroId: existing.reciboCobroId }
  }

  if (existing?.estado === MP_PROCESSED_ESTADO_PROCESSING) {
    const existingReciboId = await findReciboCobroIdByMpPaymentRef(
      prisma,
      input.tenantId,
      input.mpPaymentId,
    )
    if (existingReciboId != null) {
      await prisma.mercadoPagoProcessedPayment.update({
        where: { id: existing.id },
        data: {
          estado: 'approved',
          facturaId: input.facturaId,
          reciboCobroId: existingReciboId,
        },
      })
      return { kind: 'skip', reciboCobroId: existingReciboId }
    }
    return { kind: 'proceed', processedId: existing.id }
  }

  try {
    const created = await prisma.mercadoPagoProcessedPayment.create({
      data: {
        tenantId: input.tenantId,
        mpPaymentId: input.mpPaymentId,
        facturaId: input.facturaId,
        estado: MP_PROCESSED_ESTADO_PROCESSING,
        reciboCobroId: null,
      },
    })
    return { kind: 'proceed', processedId: created.id }
  } catch (err: unknown) {
    if (!isPrismaUniqueViolation(err)) throw err
    const raced = await prisma.mercadoPagoProcessedPayment.findUnique({
      where: {
        tenantId_mpPaymentId: {
          tenantId: input.tenantId,
          mpPaymentId: input.mpPaymentId,
        },
      },
    })
    if (!raced) {
      return { kind: 'skip', reciboCobroId: null }
    }
    if (isProcessedPaymentComplete(raced)) {
      return { kind: 'skip', reciboCobroId: raced.reciboCobroId }
    }
    const existingReciboId = await findReciboCobroIdByMpPaymentRef(
      prisma,
      input.tenantId,
      input.mpPaymentId,
    )
    if (existingReciboId != null) {
      await prisma.mercadoPagoProcessedPayment.update({
        where: { id: raced.id },
        data: {
          estado: 'approved',
          facturaId: input.facturaId,
          reciboCobroId: existingReciboId,
        },
      })
      return { kind: 'skip', reciboCobroId: existingReciboId }
    }
    // Another worker holds the in-flight claim; advisory lock serializes real races.
    return { kind: 'skip', reciboCobroId: null }
  }
}

/**
 * @en Applies an approved MP payment at most once (claim → recibo → complete) (#446).
 * @es Aplica un pago MP aprobado como máximo una vez (claim → recibo → complete) (#446).
 * @pt-BR Aplica um pagamento MP aprovado no máximo uma vez (claim → recibo → complete) (#446).
 */
export async function applyApprovedMercadoPagoPaymentOnce(
  prisma: PrismaClient,
  reciboCobro: ReciboCobroService,
  input: ApplyApprovedMpPaymentInput,
): Promise<ApplyApprovedMpPaymentResult> {
  return withMpPaymentAdvisoryLock(prisma, input.tenantId, input.mpPaymentId, async () => {
    const claim = await claimOrResumeProcessedPayment(prisma, {
      tenantId: input.tenantId,
      mpPaymentId: input.mpPaymentId,
      facturaId: input.factura.id,
    })
    if (claim.kind === 'skip') {
      return { ok: true, skipped: true, reciboCobroId: claim.reciboCobroId }
    }

    const pendiente = await computeFacturaPendiente(prisma, {
      tenantId: input.tenantId,
      clienteId: input.factura.clienteId,
      facturaId: input.factura.id,
      total: input.factura.total,
    })

    if (pendiente.lessThanOrEqualTo(0)) {
      const existingReciboId = await findReciboCobroIdByMpPaymentRef(
        prisma,
        input.tenantId,
        input.mpPaymentId,
      )
      await prisma.mercadoPagoProcessedPayment.update({
        where: { id: claim.processedId },
        data: {
          estado: 'approved',
          facturaId: input.factura.id,
          reciboCobroId: existingReciboId,
        },
      })
      await prisma.factura.update({
        where: { id: input.factura.id },
        data: { mpEstado: 'approved', mpPagadoAt: new Date() },
      })
      return { ok: true, skipped: false, reciboCobroId: existingReciboId }
    }

    let reciboCobroId = await findReciboCobroIdByMpPaymentRef(
      prisma,
      input.tenantId,
      input.mpPaymentId,
    )

    if (reciboCobroId == null) {
      const importe = Math.min(input.transactionAmount, pendiente.toNumber())
      if (importe <= 0) {
        await prisma.mercadoPagoProcessedPayment.delete({ where: { id: claim.processedId } }).catch(() => {
          /* leave processing for retry */
        })
        return { ok: false, error: 'Invalid payment amount' }
      }

      const today = new Date().toISOString().slice(0, 10)
      const reciboResult = await reciboCobro.create(
        input.tenantId,
        input.factura.clienteId,
        input.usuarioId,
        {
          fecha: today,
          totalCobrado: importe,
          concepto: `Pago Mercado Pago #${input.mpPaymentId}`,
          formas: [{ tipo: 'mercadopago', importe, referencia: input.mpPaymentId }],
          imputaciones: [{ facturaId: input.factura.id, importe }],
          fifo: false,
        },
      )

      if (!reciboResult.ok) {
        console.warn(
          '[mercadopago-idempotency] recibo_error',
          'tenant',
          input.tenantId,
          'payment',
          sanitizeLogField(input.mpPaymentId),
          'error',
          reciboResult.error,
        )
        // Release claim so a later retry can re-claim.
        await prisma.mercadoPagoProcessedPayment.delete({ where: { id: claim.processedId } }).catch(() => {
          /* ignore */
        })
        return { ok: false, error: reciboResult.error }
      }
      reciboCobroId = reciboResult.data.id

      if (input.notifyOnApply !== false) {
        const cliente = await prisma.cliente.findFirst({
          where: { id: input.factura.clienteId, tenantId: input.tenantId },
          select: { rsocial: true },
        })
        await notifyManagers(prisma, input.tenantId, 'mercadopago_payment_received', {
          clienteId: input.factura.clienteId,
          facturaId: input.factura.id,
          facturaRef: formatFacturaRef(input.factura),
          rsocial: cliente?.rsocial,
          amount: importe.toFixed(2),
        })
      }
    }

    await prisma.mercadoPagoProcessedPayment.update({
      where: { id: claim.processedId },
      data: {
        estado: 'approved',
        facturaId: input.factura.id,
        reciboCobroId,
      },
    })
    await prisma.factura.update({
      where: { id: input.factura.id },
      data: { mpEstado: 'approved', mpPagadoAt: new Date() },
    })

    return { ok: true, skipped: false, reciboCobroId }
  })
}

/**
 * @en Marks a non-approved mapped estado on the processed-payment unique row (#446).
 * @es Marca un estado mapeado no-aprobado en la fila unique de processed-payment (#446).
 * @pt-BR Marca um estado mapeado não aprovado na linha unique de processed-payment (#446).
 */
export async function upsertNonApprovedProcessedPayment(
  prisma: PrismaClient,
  input: {
    tenantId: number
    mpPaymentId: string
    facturaId: number
    estado: 'rejected' | 'cancelled' | 'pending'
  },
): Promise<void> {
  try {
    await prisma.mercadoPagoProcessedPayment.create({
      data: {
        tenantId: input.tenantId,
        mpPaymentId: input.mpPaymentId,
        facturaId: input.facturaId,
        estado: input.estado,
        reciboCobroId: null,
      },
    })
  } catch (err: unknown) {
    if (!isPrismaUniqueViolation(err)) throw err
    const existing = await prisma.mercadoPagoProcessedPayment.findUnique({
      where: {
        tenantId_mpPaymentId: {
          tenantId: input.tenantId,
          mpPaymentId: input.mpPaymentId,
        },
      },
    })
    if (existing && isProcessedPaymentComplete(existing) && existing.estado !== MP_PROCESSED_ESTADO_PROCESSING) {
      return
    }
    if (existing) {
      await prisma.mercadoPagoProcessedPayment.update({
        where: { id: existing.id },
        data: { estado: input.estado, facturaId: input.facturaId },
      })
    }
  }
}
