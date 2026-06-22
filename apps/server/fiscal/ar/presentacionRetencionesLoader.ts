import type { Prisma, PrismaClient } from '@prisma/client'

export type PresentacionRetencionSourceRow = {
  id: number
  fecha: Date
  cuitRetenido: string
  denominacion: string
  regimenTipo: string
  regimenNombre: string
  operacionTipo: 'retencion' | 'percepcion'
  provincia: string | null
  baseImponible: number
  alicuota: number
  importe: number
}

export function periodToDateRange(periodo: string): { from: Date; to: Date } {
  const match = /^(\d{4})-(\d{2})$/.exec(periodo.trim())
  if (!match) {
    throw new Error('periodo must be YYYY-MM')
  }
  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) {
    throw new Error('periodo month invalid')
  }
  const from = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const to = new Date(year, month, 0, 23, 59, 59, 999)
  return { from, to }
}

function resolveFecha(row: {
  createdAt: Date
  reciboPago: { fecha: Date } | null
  reciboCobro: { fecha: Date } | null
  cobro: { fecha: Date } | null
}): Date {
  return row.reciboPago?.fecha ?? row.reciboCobro?.fecha ?? row.cobro?.fecha ?? row.createdAt
}

/**
 * @en Loads applied withholdings/perceptions for monthly presentation (#242).
 * @es Carga retenciones/percepciones aplicadas para presentación mensual (#242).
 * @pt-BR Carrega retenções/percepções aplicadas para apresentação mensal (#242).
 */
export async function loadPresentacionRetencionRows(
  prisma: PrismaClient,
  tenantId: number,
  formato: 'sicore' | 'sifere',
  from: Date,
  to: Date,
): Promise<PresentacionRetencionSourceRow[]> {
  const where: Prisma.RetencionAplicadaWhereInput = {
    tenantId,
    createdAt: { gte: from, lte: to },
    AND: [
      {
        OR: [{ reciboPagoId: null }, { reciboPago: { estado: 'emitido' } }],
      },
      {
        OR: [{ reciboCobroId: null }, { reciboCobro: { estado: 'emitido' } }],
      },
    ],
  }

  const rows = await prisma.retencionAplicada.findMany({
    where,
    include: {
      regimen: { select: { tipo: true, provincia: true, nombre: true } },
      reciboPago: { select: { fecha: true } },
      reciboCobro: { select: { fecha: true } },
      cobro: { select: { fecha: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const proveedorIds = [
    ...new Set(rows.filter((r) => r.entidadTipo === 'proveedor').map((r) => r.entidadId)),
  ]
  const clienteIds = [
    ...new Set(rows.filter((r) => r.entidadTipo === 'cliente').map((r) => r.entidadId)),
  ]

  const [proveedores, clientes] = await Promise.all([
    proveedorIds.length
      ? prisma.proveedor.findMany({
          where: { tenantId, id: { in: proveedorIds } },
          select: { id: true, cuit: true, rsocial: true },
        })
      : Promise.resolve([]),
    clienteIds.length
      ? prisma.cliente.findMany({
          where: { tenantId, id: { in: clienteIds } },
          select: { id: true, cuit: true, rsocial: true },
        })
      : Promise.resolve([]),
  ])

  const contraparteByKey = new Map<string, { cuit: string; rsocial: string }>()
  for (const p of proveedores) {
    contraparteByKey.set(`proveedor:${p.id}`, {
      cuit: (p.cuit ?? '').replace(/\D/g, ''),
      rsocial: p.rsocial,
    })
  }
  for (const c of clientes) {
    contraparteByKey.set(`cliente:${c.id}`, {
      cuit: (c.cuit ?? '').replace(/\D/g, ''),
      rsocial: c.rsocial,
    })
  }

  return rows
    .filter((r) => (formato === 'sicore' ? r.regimen.tipo !== 'iibb' : r.regimen.tipo === 'iibb'))
    .map((r) => {
      const cp = contraparteByKey.get(`${r.entidadTipo}:${r.entidadId}`)
      const operacionTipo = r.tipo === 'percepcion' ? 'percepcion' : 'retencion'
      return {
        id: r.id,
        fecha: resolveFecha(r),
        cuitRetenido: cp?.cuit ?? '',
        denominacion: cp?.rsocial ?? '',
        regimenTipo: r.regimen.tipo,
        regimenNombre: r.regimen.nombre,
        operacionTipo,
        provincia: r.regimen.provincia,
        baseImponible: r.baseImponible.toNumber(),
        alicuota: r.alicuota.toNumber(),
        importe: r.importe.toNumber(),
      }
    })
}
