/**
 * @en Dry-run by default: backfill PaymentTransaction webhook rows with amount=0 / amountVerified=false (#448).
 *   Pass `--apply` to write. Never run against production without explicit review.
 * @es Dry-run por defecto: backfill de filas webhook PaymentTransaction con amount=0 / amountVerified=false (#448).
 *   Usar `--apply` para escribir. No ejecutar en producción sin revisión explícita.
 * @pt-BR Dry-run por padrão: backfill de linhas webhook PaymentTransaction com amount=0 / amountVerified=false (#448).
 *   Use `--apply` para gravar. Não executar em produção sem revisão explícita.
 */

import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { decryptFiscalSecret } from '../apps/server/fiscal/ar/fiscalSecrets'
import {
  fetchMercadoPagoPayment,
  MercadoPagoApiError,
} from '../apps/server/integrations/mercadopago/mercadoPagoApiClient'

const APPLY = process.argv.includes('--apply')

type Counters = {
  scanned: number
  wouldUpdate: number
  updated: number
  skippedNoSource: number
  skippedAlreadyOk: number
  errors: number
}

async function resolveAmount(
  prisma: PrismaClient,
  tenantId: number,
  externalPaymentId: string | null,
  reciboCobroId: number | null,
): Promise<{ amount: Decimal; currency: string; source: string } | null> {
  if (externalPaymentId) {
    const mpRow = await prisma.mercadoPagoConfig.findUnique({ where: { tenantId } })
    if (mpRow?.accessTokenEncrypted) {
      try {
        const accessToken = decryptFiscalSecret(mpRow.accessTokenEncrypted)
        const payment = await fetchMercadoPagoPayment(accessToken, externalPaymentId)
        if (
          typeof payment.transaction_amount === 'number' &&
          Number.isFinite(payment.transaction_amount) &&
          payment.transaction_amount > 0
        ) {
          const currency =
            typeof payment.currency_id === 'string' && payment.currency_id.trim()
              ? payment.currency_id.trim().toUpperCase().slice(0, 3)
              : 'ARS'
          return {
            amount: new Decimal(payment.transaction_amount),
            currency,
            source: 'mercadopago_payment',
          }
        }
      } catch (err: unknown) {
        if (!(err instanceof MercadoPagoApiError)) {
          console.warn(
            JSON.stringify({
              level: 'warn',
              event: 'backfill_mp_fetch_error',
              tenantId,
              externalPaymentId,
              detail: err instanceof Error ? err.message : String(err),
            }),
          )
        }
      }
    }
  }

  if (reciboCobroId != null) {
    const recibo = await prisma.reciboCobro.findFirst({
      where: { id: reciboCobroId, tenantId },
      select: { totalCobrado: true },
    })
    if (recibo && recibo.totalCobrado.gt(0)) {
      return { amount: recibo.totalCobrado, currency: 'ARS', source: 'recibo_cobro' }
    }
  }

  return null
}

async function main(): Promise<void> {
  const prisma = new PrismaClient()
  const counters: Counters = {
    scanned: 0,
    wouldUpdate: 0,
    updated: 0,
    skippedNoSource: 0,
    skippedAlreadyOk: 0,
    errors: 0,
  }

  try {
    const rows = await prisma.paymentTransaction.findMany({
      where: {
        providerCode: 'mercadopago',
        OR: [
          { paymentType: 'webhook', amount: new Decimal(0) },
          { amountVerified: false },
        ],
      },
      orderBy: [{ tenantId: 'asc' }, { id: 'asc' }],
      take: 5000,
    })

    for (const row of rows) {
      counters.scanned += 1
      if (row.amountVerified && !row.amount.equals(0)) {
        counters.skippedAlreadyOk += 1
        continue
      }

      try {
        const resolved = await resolveAmount(
          prisma,
          row.tenantId,
          row.externalPaymentId,
          row.reciboCobroId,
        )
        if (!resolved) {
          counters.skippedNoSource += 1
          console.log(
            JSON.stringify({
              dryRun: !APPLY,
              action: 'skip_no_source',
              id: row.id,
              tenantId: row.tenantId,
            }),
          )
          continue
        }

        counters.wouldUpdate += 1
        console.log(
          JSON.stringify({
            dryRun: !APPLY,
            action: APPLY ? 'update' : 'would_update',
            id: row.id,
            tenantId: row.tenantId,
            amount: resolved.amount.toString(),
            currency: resolved.currency,
            source: resolved.source,
          }),
        )

        if (APPLY) {
          await prisma.paymentTransaction.update({
            where: { id: row.id },
            data: {
              amount: resolved.amount,
              currency: resolved.currency,
              amountVerified: true,
              rawMetadata: {
                amountSource: resolved.source,
                backfill: '448',
              },
            },
          })
          counters.updated += 1
        }
      } catch (err: unknown) {
        counters.errors += 1
        console.warn(
          JSON.stringify({
            level: 'error',
            id: row.id,
            tenantId: row.tenantId,
            detail: err instanceof Error ? err.message : String(err),
          }),
        )
      }
    }

    console.log(JSON.stringify({ apply: APPLY, ...counters }))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
