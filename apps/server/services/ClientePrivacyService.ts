/**
 * @en Customer data-subject export and irreversible PII anonymization (#195).
 * @es Exportación de datos del titular y anonimización irreversible de PII (#195).
 * @pt-BR Exportação de dados do titular e anonimização irreversível de PII (#195).
 */
import type { Cliente, Prisma, PrismaClient } from '@prisma/client'
import type { ServiceResult } from './serviceResults'

export const ANONYMIZE_CONFIRM_TOKEN = 'ANONYMIZE'

export type ClientePrivacyExport = {
  exportedAt: string
  cliente: Cliente
  facturas: Array<{
    id: number
    fecha: string
    tipo: string
    prefijo: string
    numero: number
    total: string
    estado: string
  }>
  cobros: Array<{
    id: number
    fecha: string
    monto: string
    referencia?: string | null
  }>
  pedidos: Array<{
    id: number
    createdAt: string
    estado: string
    total: string
  }>
  recibosCobro: Array<{
    id: number
    numero: number
    fecha: string
    totalCobrado: string
    estado: string
  }>
}

/**
 * @en Builds irreversible PII scrub payload for a customer row (keeps codigo / fiscal FKs).
 * @es Construye payload de scrub irreversible de PII (conserva codigo / FKs fiscales).
 * @pt-BR Constrói payload de scrub irreversível de PII (mantém codigo / FKs fiscais).
 */
export function buildAnonymizedClienteData(
  id: number,
  now: Date = new Date(),
): Prisma.ClienteUpdateInput {
  const label = `ANON-${id}`.slice(0, 30)
  return {
    rsocial: label,
    fantasia: null,
    cuit: null,
    domicilio: null,
    localidad: null,
    cpost: null,
    telef: null,
    email: null,
    activo: false,
    suspended: true,
    anonymizedAt: now,
  }
}

function decimalToString(value: unknown): string {
  if (value == null) return '0'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    return String((value as { toString: () => string }).toString())
  }
  return String(value)
}

export class ClientePrivacyService {
  constructor(private readonly prisma: PrismaClient) {}

  async exportDatos(tenantId: number, clienteId: number): Promise<ServiceResult<ClientePrivacyExport>> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
    })
    if (!cliente) {
      return { ok: false, status: 404, error: 'Cliente not found' }
    }

    const [facturas, cobros, pedidos, recibosCobro] = await Promise.all([
      this.prisma.factura.findMany({
        where: { tenantId, clienteId },
        orderBy: { fecha: 'desc' },
        take: 5000,
        select: {
          id: true,
          fecha: true,
          tipo: true,
          prefijo: true,
          numero: true,
          total: true,
          estado: true,
        },
      }),
      this.prisma.cobro.findMany({
        where: { tenantId, clienteId },
        orderBy: { fecha: 'desc' },
        take: 5000,
        select: {
          id: true,
          fecha: true,
          monto: true,
          referencia: true,
        },
      }),
      this.prisma.pedido.findMany({
        where: { tenantId, clienteId },
        orderBy: { createdAt: 'desc' },
        take: 5000,
        select: {
          id: true,
          createdAt: true,
          estado: true,
          total: true,
        },
      }),
      this.prisma.reciboCobro.findMany({
        where: { tenantId, clienteId },
        orderBy: { fecha: 'desc' },
        take: 5000,
        select: {
          id: true,
          numero: true,
          fecha: true,
          totalCobrado: true,
          estado: true,
        },
      }),
    ])

    return {
      ok: true,
      data: {
        exportedAt: new Date().toISOString(),
        cliente,
        facturas: facturas.map((f) => ({
          id: f.id,
          fecha: f.fecha.toISOString(),
          tipo: f.tipo,
          prefijo: f.prefijo,
          numero: f.numero,
          total: decimalToString(f.total),
          estado: f.estado,
        })),
        cobros: cobros.map((c) => ({
          id: c.id,
          fecha: c.fecha.toISOString(),
          monto: decimalToString(c.monto),
          referencia: c.referencia,
        })),
        pedidos: pedidos.map((p) => ({
          id: p.id,
          createdAt: p.createdAt.toISOString(),
          estado: p.estado,
          total: decimalToString(p.total),
        })),
        recibosCobro: recibosCobro.map((r) => ({
          id: r.id,
          numero: r.numero,
          fecha: r.fecha.toISOString(),
          totalCobrado: decimalToString(r.totalCobrado),
          estado: r.estado,
        })),
      },
    }
  }

  async anonymize(
    tenantId: number,
    clienteId: number,
    confirm: string,
  ): Promise<ServiceResult<Cliente>> {
    if (confirm !== ANONYMIZE_CONFIRM_TOKEN) {
      return {
        ok: false,
        status: 400,
        error: `confirm must be exactly "${ANONYMIZE_CONFIRM_TOKEN}"`,
      }
    }

    const existing = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'Cliente not found' }
    }
    if (existing.anonymizedAt) {
      return { ok: false, status: 409, error: 'Cliente already anonymized' }
    }

    const now = new Date()
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.portalSession.updateMany({
        where: { tenantId, clienteId, revokedAt: null },
        data: { revokedAt: now },
      })
      await tx.portalMagicLink.updateMany({
        where: { tenantId, clienteId, usedAt: null },
        data: { usedAt: now },
      })
      return tx.cliente.update({
        where: { id: clienteId },
        data: buildAnonymizedClienteData(clienteId, now),
      })
    })

    return { ok: true, data: updated }
  }
}

/**
 * @en Flattens export JSON into CSV rows (one section marker + header + data rows).
 * @es Aplana el JSON de export a filas CSV (marcador de sección + cabecera + datos).
 * @pt-BR Achata o JSON de export em linhas CSV (marcador de seção + cabeçalho + dados).
 */
export function exportDatosToCsv(payload: ClientePrivacyExport): string {
  const lines: string[] = []
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  lines.push('section,field,value')
  lines.push(`cliente,id,${esc(payload.cliente.id)}`)
  lines.push(`cliente,codigo,${esc(payload.cliente.codigo)}`)
  lines.push(`cliente,rsocial,${esc(payload.cliente.rsocial)}`)
  lines.push(`cliente,cuit,${esc(payload.cliente.cuit)}`)
  lines.push(`cliente,email,${esc(payload.cliente.email)}`)
  lines.push(`cliente,telef,${esc(payload.cliente.telef)}`)
  lines.push(`cliente,domicilio,${esc(payload.cliente.domicilio)}`)
  lines.push(`meta,exportedAt,${esc(payload.exportedAt)}`)

  lines.push('section,id,fecha,tipo_or_estado,extra,total')
  for (const f of payload.facturas) {
    lines.push(
      `factura,${esc(f.id)},${esc(f.fecha)},${esc(`${f.tipo}-${f.prefijo}-${f.numero}`)},${esc(f.estado)},${esc(f.total)}`,
    )
  }
  for (const c of payload.cobros) {
    lines.push(`cobro,${esc(c.id)},${esc(c.fecha)},${esc(c.referencia)},,${esc(c.monto)}`)
  }
  for (const p of payload.pedidos) {
    lines.push(`pedido,${esc(p.id)},${esc(p.createdAt)},${esc(p.estado)},,${esc(p.total)}`)
  }
  for (const r of payload.recibosCobro) {
    lines.push(
      `recibo,${esc(r.id)},${esc(r.fecha)},${esc(r.estado)},${esc(r.numero)},${esc(r.totalCobrado)}`,
    )
  }
  return `${lines.join('\n')}\n`
}
