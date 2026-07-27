/**
 * @en Lightweight timing smoke for Cliente count with/without RLS GUC path (#215 AC checklist).
 * @es Smoke de timing ligero para count de Cliente con/sin camino GUC RLS (#215 checklist AC).
 * @pt-BR Smoke de timing leve para count de Cliente com/sem caminho GUC RLS (#215 checklist AC).
 *
 * Run: npx tsx scripts/rls-perf-smoke.ts
 * Requires DATABASE_URL on :5432 with migration 20260727210000 applied.
 */
import { PrismaClient } from '@prisma/client'
import { TENANT_RLS_GUC, createTenantRlsPrisma, runWithTenantRls } from '../apps/server/lib/tenantRls'

async function timeMs(label: string, fn: () => Promise<unknown>): Promise<number> {
  const t0 = performance.now()
  await fn()
  const ms = performance.now() - t0
  console.log(`${label}: ${ms.toFixed(2)}ms`)
  return ms
}

async function main(): Promise<void> {
  const base = new PrismaClient()
  const rls = createTenantRlsPrisma(base)
  try {
    const tenant = await base.tenant.findFirst({ select: { id: true } })
    if (!tenant) {
      console.log('No tenant row — skip smoke')
      return
    }
    const tenantId = tenant.id

    // Warm-up
    await base.cliente.count()
    await runWithTenantRls(rls, tenantId, async (tx) => tx.cliente.count())

    const baseline = await timeMs('baseline count (superuser / no RLS path)', () => base.cliente.count())
    const withRls = await timeMs('RLS path count (SET LOCAL + tx)', () =>
      runWithTenantRls(rls, tenantId, async (tx) => tx.cliente.count()),
    )
    const deltaPct = baseline > 0 ? ((withRls - baseline) / baseline) * 100 : 0
    console.log(`delta: ${deltaPct.toFixed(1)}% (AC checklist target <10% when noise is low)`)
    console.log(`GUC: ${TENANT_RLS_GUC}`)
  } finally {
    await base.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
