import { vi } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * @en Minimal Prisma mock for MovimientoClienteCC ledger hooks in API/service tests.
 * @es Mock mínimo de Prisma para hooks del ledger MovimientoClienteCC en pruebas.
 * @pt-BR Mock mínimo do Prisma para hooks do ledger MovimientoClienteCC em testes.
 */
export function createMovimientoClienteCCPrismaMock() {
  return {
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: 1,
      createdAt: new Date(),
      ...data,
    })),
  }
}

export function extendClientePrismaForCc(
  cliente: Record<string, unknown> = {},
  balance = new Decimal(1000),
) {
  return {
    findFirstOrThrow: vi.fn().mockResolvedValue({
      id: 1,
      rsocial: 'ACME SA',
      balance,
      creditLimit: null,
    }),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    update: vi.fn().mockResolvedValue({
      id: 1,
      rsocial: 'ACME SA',
      balance,
      creditLimit: null,
      score: 50,
    }),
    ...cliente,
  }
}

export function createCcTxLayer(extra: Record<string, unknown> = {}) {
  const extraCliente =
    extra.cliente != null && typeof extra.cliente === 'object'
      ? (extra.cliente as Record<string, unknown>)
      : {}
  const { cliente: _cliente, ...rest } = extra
  return {
    movimientoClienteCC: createMovimientoClienteCCPrismaMock(),
    retencionAplicada: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    articulo: {
      findMany: vi.fn().mockResolvedValue([{ id: 1, stock: 100, minimo: 0 }]),
      update: vi.fn().mockResolvedValue({ id: 1, stock: 99 }),
    },
    factura: {
      create: vi.fn().mockResolvedValue({
        id: 99,
        tenantId: 1,
        clienteId: 1,
        estado: 'A',
        tipo: 'B',
        prefijo: '0001',
        numero: 1,
        total: new Decimal(1000),
        fecha: new Date(),
        items: [],
        cliente: { id: 1 },
      }),
    },
    cobro: {
      create: vi.fn().mockResolvedValue({
        id: 10,
        tenantId: 1,
        clienteId: 1,
        monto: new Decimal(250.5),
        montoBruto: new Decimal(250.5),
        fecha: new Date(),
      }),
    },
    cheque: { create: vi.fn().mockResolvedValue({ id: 99 }) },
    chequeMov: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    cliente:
      extraCliente.updateMany != null
        ? extraCliente
        : extendClientePrismaForCc(extraCliente),
    ...rest,
  }
}
