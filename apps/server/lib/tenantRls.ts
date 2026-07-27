import { AsyncLocalStorage } from 'node:async_hooks'
import type { Prisma, PrismaClient } from '@prisma/client'

/**
 * @en PostgreSQL GUC used by FORCE RLS policies (`app.current_tenant_id`, numeric text).
 * @es GUC de PostgreSQL usado por policies FORCE RLS (`app.current_tenant_id`, texto numérico).
 * @pt-BR GUC do PostgreSQL usado pelas policies FORCE RLS (`app.current_tenant_id`, texto numérico).
 */
export const TENANT_RLS_GUC = 'app.current_tenant_id'

/**
 * @en Prisma models with ENABLE+FORCE RLS in migration `#215` (v1 AC set).
 * @es Modelos Prisma con ENABLE+FORCE RLS en la migración `#215` (conjunto AC v1).
 * @pt-BR Modelos Prisma com ENABLE+FORCE RLS na migração `#215` (conjunto AC v1).
 */
export const TENANT_RLS_MODELS = [
  'Factura',
  'Cliente',
  'Proveedor',
  'Articulo',
  'Pedido',
  'OrdenCompra',
  'StockAjuste',
  'Notification',
  'AuditEvent',
] as const

export type TenantRlsModel = (typeof TENANT_RLS_MODELS)[number]

const TENANT_RLS_MODEL_SET: ReadonlySet<string> = new Set(TENANT_RLS_MODELS)

type TenantRlsStore = {
  tenantId: number | null
  /** When true, GUC is already set on the current interactive transaction connection. */
  inRlsTx: boolean
}

const tenantRlsAls = new AsyncLocalStorage<TenantRlsStore>()

/**
 * @en True when `BIZCODE_RLS_BYPASS=true` (seed/migrate helpers / explicit local bypass only).
 * @es True cuando `BIZCODE_RLS_BYPASS=true` (helpers de seed/migrate / bypass local explícito).
 * @pt-BR True quando `BIZCODE_RLS_BYPASS=true` (helpers de seed/migrate / bypass local explícito).
 */
export function isTenantRlsBypassEnabled(): boolean {
  return process.env.BIZCODE_RLS_BYPASS?.trim() === 'true'
}

/**
 * @en Reads the current request/job RLS store from AsyncLocalStorage.
 * @es Lee el store RLS actual de petición/trabajo desde AsyncLocalStorage.
 * @pt-BR Lê o store RLS atual de requisição/trabalho do AsyncLocalStorage.
 */
export function getTenantRlsStore(): TenantRlsStore | undefined {
  return tenantRlsAls.getStore()
}

/**
 * @en Runs `fn` with ALS tenant context (used by Express middleware after `tenantContext`).
 * @es Ejecuta `fn` con contexto de tenant en ALS (middleware Express tras `tenantContext`).
 * @pt-BR Executa `fn` com contexto de tenant no ALS (middleware Express após `tenantContext`).
 */
export function runWithTenantRlsContext<T>(tenantId: number | null, fn: () => T): T {
  return tenantRlsAls.run({ tenantId, inRlsTx: false }, fn)
}

function prismaDelegateKey(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1)
}

async function applyTenantGuc(
  tx: { $executeRaw: PrismaClient['$executeRaw'] },
  tenantId: number | null,
): Promise<void> {
  const value = tenantId != null && Number.isInteger(tenantId) && tenantId > 0 ? String(tenantId) : ''
  await tx.$executeRaw`SELECT set_config(${TENANT_RLS_GUC}, ${value}, true)`
}

/**
 * @en Runs `fn` inside an interactive transaction with `SET LOCAL app.current_tenant_id`.
 * @es Ejecuta `fn` en una transacción interactiva con `SET LOCAL app.current_tenant_id`.
 * @pt-BR Executa `fn` numa transação interativa com `SET LOCAL app.current_tenant_id`.
 */
export async function runWithTenantRls<T>(
  prisma: PrismaClient,
  tenantId: number,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  if (!Number.isInteger(tenantId) || tenantId < 1) {
    throw new Error('runWithTenantRls requires a positive integer tenantId')
  }
  if (isTenantRlsBypassEnabled()) {
    return prisma.$transaction(async (tx) => fn(tx))
  }
  return prisma.$transaction(async (tx) => {
    await applyTenantGuc(tx, tenantId)
    return tenantRlsAls.run({ tenantId, inRlsTx: true }, () => fn(tx))
  })
}

/**
 * @en Wraps a Prisma client so tenant-RLS models set `app.current_tenant_id` (LOCAL) on the same connection.
 * @es Envuelve un cliente Prisma para que modelos RLS seteen `app.current_tenant_id` (LOCAL) en la misma conexión.
 * @pt-BR Envolve um cliente Prisma para que modelos RLS definam `app.current_tenant_id` (LOCAL) na mesma conexão.
 */
export function createTenantRlsPrisma(base: PrismaClient): PrismaClient {
  // Unit tests often pass a plain mock without `$extends` (PrismaClient mock / stub).
  if (typeof (base as { $extends?: unknown }).$extends !== 'function') {
    return base
  }
  const extended = base.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_RLS_MODEL_SET.has(model) || isTenantRlsBypassEnabled()) {
            return query(args)
          }
          const store = tenantRlsAls.getStore()
          if (store?.inRlsTx) {
            return query(args)
          }
          const tenantId = store?.tenantId ?? null
          return base.$transaction(async (tx) => {
            await applyTenantGuc(tx, tenantId)
            return tenantRlsAls.run({ tenantId, inRlsTx: true }, async () => {
              const delegate = (tx as unknown as Record<string, Record<string, (a: unknown) => Promise<unknown>>>)[
                prismaDelegateKey(model)
              ]
              return delegate[operation](args)
            })
          })
        },
      },
    },
  })

  const originalTransaction = extended.$transaction.bind(extended) as (
    ...args: unknown[]
  ) => Promise<unknown>
  ;(extended as { $transaction: (...args: unknown[]) => Promise<unknown> }).$transaction = (
    ...args: unknown[]
  ) => {
    const first = args[0]
    if (typeof first !== 'function') {
      return originalTransaction(...args)
    }
    if (isTenantRlsBypassEnabled()) {
      return originalTransaction(...args)
    }
    const tenantId = tenantRlsAls.getStore()?.tenantId ?? null
    const options = args[1]
    return originalTransaction(async (tx: { $executeRaw: PrismaClient['$executeRaw'] }) => {
      await applyTenantGuc(tx, tenantId)
      return tenantRlsAls.run({ tenantId, inRlsTx: true }, () =>
        (first as (client: unknown) => Promise<unknown>)(tx),
      )
    }, options)
  }

  return extended as unknown as PrismaClient
}
