/**
 * @en Rebuilds MovimientoClienteCC from historical data per tenant (#232).
 * @es Reconstruye MovimientoClienteCC desde datos históricos por tenant (#232).
 * @pt-BR Reconstrói MovimientoClienteCC a partir de dados históricos por tenant (#232).
 *
 * Usage: tsx scripts/backfill-cliente-cc.ts [--tenant-id=N] [--dry-run]
 */
import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { ClienteCuentaCorrienteService } from '../apps/server/services/ClienteCuentaCorrienteService'

const prisma = new PrismaClient()

function parseArgs(): { tenantId?: number; dryRun: boolean } {
  let tenantId: number | undefined
  let dryRun = false
  for (const arg of process.argv.slice(2)) {
    if (arg === '--dry-run') dryRun = true
    else if (arg.startsWith('--tenant-id=')) {
      tenantId = Number.parseInt(arg.split('=')[1] ?? '', 10)
    }
  }
  return { tenantId, dryRun }
}

async function backfillTenant(tenantId: number, dryRun: boolean): Promise<void> {
  const systemUser = await prisma.appUser.findFirst({
    where: { tenantId, active: true },
    orderBy: { id: 'asc' },
    select: { id: true },
  })
  if (!systemUser) {
    console.warn(`Tenant ${tenantId}: no active user, skipping`)
    return
  }

  const clientes = await prisma.cliente.findMany({
    where: { tenantId },
    select: { id: true, balance: true, balanceInicial: true },
  })

  for (const cliente of clientes) {
    const existingCount = await prisma.movimientoClienteCC.count({
      where: { tenantId, clienteId: cliente.id },
    })
    if (existingCount > 0) continue

    if (dryRun) {
      console.log(`[dry-run] Would backfill cliente ${cliente.id} tenant ${tenantId}`)
      continue
    }

    await prisma.$transaction(async (tx) => {
      const cc = new ClienteCuentaCorrienteService(tx)
      const balanceInicial = cliente.balanceInicial.toNumber()
      if (balanceInicial !== 0) {
        await cc.recordMovimiento({
          tenantId,
          clienteId: cliente.id,
          tipo: 'saldo_inicial',
          monto: balanceInicial,
          referencia: 'balance_inicial',
          fecha: new Date(0),
          usuarioId: systemUser.id,
          skipBalanceSync: true,
        })
      }

      const facturas = await tx.factura.findMany({
        where: { tenantId, clienteId: cliente.id, estado: 'A' },
        orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
      })
      for (const f of facturas) {
        await cc.recordFromFactura(tenantId, f, systemUser.id)
      }

      const notasCredito = await tx.notaCredito.findMany({
        where: { tenantId, facturaOrigen: { clienteId: cliente.id } },
        include: { facturaOrigen: { select: { tipo: true, prefijo: true, numero: true } } },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      })
      for (const nc of notasCredito) {
        const ref = `${nc.facturaOrigen.tipo}-${nc.facturaOrigen.prefijo}-${nc.facturaOrigen.numero}`
        await cc.recordFromNotaCredito(tenantId, nc, cliente.id, ref, systemUser.id)
      }

      const cobros = await tx.cobro.findMany({
        where: { tenantId, clienteId: cliente.id },
        include: { retencionesAplicadas: { select: { importe: true } } },
        orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
      })
      for (const c of cobros) {
        const retTotal = c.retencionesAplicadas.reduce(
          (sum, r) => sum.add(r.importe),
          new Decimal(0),
        )
        const montoBruto = c.monto.add(retTotal)
        await cc.recordFromCobro(tenantId, c, montoBruto, systemUser.id)
      }

      const chequesRechazados = await tx.cheque.findMany({
        where: {
          tenantId,
          clienteId: cliente.id,
          tipo: 'recibido',
          estado: 'rechazado',
        },
        orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }],
      })
      for (const cheque of chequesRechazados) {
        const existingMov = await tx.movimientoClienteCC.findFirst({
          where: { tenantId, clienteId: cliente.id, chequeId: cheque.id },
          select: { id: true },
        })
        if (existingMov) continue

        const linkedCobro = await tx.cobro.findFirst({
          where: { tenantId, chequeId: cheque.id, clienteId: cliente.id },
          select: {
            monto: true,
            retencionesAplicadas: { select: { importe: true } },
          },
        })
        let compensatory = cheque.monto
        if (linkedCobro) {
          const retTotal = linkedCobro.retencionesAplicadas.reduce(
            (sum, r) => sum.add(r.importe),
            new Decimal(0),
          )
          compensatory = linkedCobro.monto.add(retTotal)
        }
        await cc.recordChequeRechazado(
          tenantId,
          cliente.id,
          cheque.id,
          compensatory,
          `cheque-${cheque.numero}`,
          systemUser.id,
        )
      }

      const saldoPost = await cc.getLastSaldo(tenantId, cliente.id)
      await tx.cliente.update({
        where: { id: cliente.id },
        data: { balance: saldoPost },
      })

      const diff = saldoPost.minus(cliente.balance).abs()
      if (diff.greaterThan(new Decimal('0.01'))) {
        console.warn(
          `Tenant ${tenantId} cliente ${cliente.id}: ledger saldo ${saldoPost.toFixed(2)} vs balance ${cliente.balance.toFixed(2)}`,
        )
      }
    })
  }
}

async function main(): Promise<void> {
  const { tenantId, dryRun } = parseArgs()
  const tenants = tenantId
    ? [{ id: tenantId }]
    : await prisma.tenant.findMany({ where: { active: true }, select: { id: true } })

  for (const t of tenants) {
    await backfillTenant(t.id, dryRun)
  }
}

main()
  .catch((err: unknown) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
