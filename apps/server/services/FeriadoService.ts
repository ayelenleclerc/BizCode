import type { Prisma, PrismaClient } from '@prisma/client'
import type { FeriadoCreateInput, FeriadoRow, FeriadoTipo } from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseFecha(value: string): Date | null {
  const trimmed = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null
  }
  const d = new Date(`${trimmed}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) {
    return null
  }
  return d
}

function mapFeriado(row: {
  id: number
  tenantId: number
  fecha: Date
  nombre: string
  tipo: string
  provincia: string | null
  createdAt: Date
  updatedAt: Date
}): FeriadoRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    fecha: toIsoDate(row.fecha),
    nombre: row.nombre,
    tipo: row.tipo as FeriadoTipo,
    provincia: row.provincia,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

/**
 * @en Tenant holiday calendar for seller routes (#267).
 * @es Calendario de feriados del tenant para rutas (#267).
 * @pt-BR Calendário de feriados do tenant para rotas (#267).
 */
export class FeriadoService {
  constructor(private readonly prisma: PrismaClient) {}

  async listByYear(
    tenantId: number,
    year: number,
  ): Promise<ServiceResult<{ total: number; feriados: FeriadoRow[] }>> {
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return { ok: false, status: 400, error: 'year must be an integer between 2000 and 2100' }
    }
    const from = new Date(`${year}-01-01T00:00:00.000Z`)
    const to = new Date(`${year}-12-31T00:00:00.000Z`)
    const where: Prisma.FeriadoWhereInput = {
      tenantId,
      fecha: { gte: from, lte: to },
    }
    const [total, rows] = await Promise.all([
      this.prisma.feriado.count({ where }),
      this.prisma.feriado.findMany({ where, orderBy: [{ fecha: 'asc' }, { id: 'asc' }] }),
    ])
    return { ok: true, data: { total, feriados: rows.map(mapFeriado) } }
  }

  async listOnDate(tenantId: number, fechaYmd: string): Promise<ServiceResult<FeriadoRow[]>> {
    const fecha = parseFecha(fechaYmd)
    if (!fecha) {
      return { ok: false, status: 400, error: 'fecha must be YYYY-MM-DD' }
    }
    const rows = await this.prisma.feriado.findMany({
      where: { tenantId, fecha },
      orderBy: { id: 'asc' },
    })
    return { ok: true, data: rows.map(mapFeriado) }
  }

  async isHoliday(tenantId: number, fecha: Date): Promise<boolean> {
    const count = await this.prisma.feriado.count({
      where: { tenantId, fecha },
    })
    return count > 0
  }

  /**
   * @en Next calendar day that is not a tenant holiday (skips Sundays only when also marked? Plan: skip Feriado only).
   * @es Próximo día calendario que no es feriado del tenant (salta solo Feriado).
   * @pt-BR Próximo dia de calendário que não é feriado do tenant (pula só Feriado).
   */
  async nextBusinessDay(tenantId: number, fromExclusiveYmd: string): Promise<ServiceResult<string>> {
    const start = parseFecha(fromExclusiveYmd)
    if (!start) {
      return { ok: false, status: 400, error: 'fecha must be YYYY-MM-DD' }
    }
    for (let i = 1; i <= 366; i++) {
      const candidate = new Date(start)
      candidate.setUTCDate(start.getUTCDate() + i)
      const holiday = await this.isHoliday(tenantId, candidate)
      if (!holiday) {
        return { ok: true, data: toIsoDate(candidate) }
      }
    }
    return { ok: false, status: 500, error: 'Could not find next business day within 366 days' }
  }

  async create(tenantId: number, input: FeriadoCreateInput): Promise<ServiceResult<FeriadoRow>> {
    const fecha = parseFecha(input.fecha)
    if (!fecha) {
      return { ok: false, status: 400, error: 'fecha must be YYYY-MM-DD' }
    }
    const nombre = input.nombre.trim()
    if (nombre.length < 1 || nombre.length > 120) {
      return { ok: false, status: 400, error: 'nombre must be 1–120 characters' }
    }
    const tipo = input.tipo ?? 'nacional'
    if (!['nacional', 'provincial', 'local'].includes(tipo)) {
      return { ok: false, status: 400, error: 'tipo must be nacional|provincial|local' }
    }
    try {
      const row = await this.prisma.feriado.create({
        data: {
          tenantId,
          fecha,
          nombre,
          tipo,
          provincia: input.provincia?.trim() || null,
        },
      })
      return { ok: true, data: mapFeriado(row) }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'P2002') {
        return { ok: false, status: 409, error: 'Feriado already exists for this date and name' }
      }
      throw err
    }
  }

  async upsertMany(
    tenantId: number,
    items: Array<{ fecha: string; nombre: string; tipo?: FeriadoTipo; provincia?: string | null }>,
  ): Promise<{ created: number; skipped: number }> {
    let created = 0
    let skipped = 0
    for (const item of items) {
      const fecha = parseFecha(item.fecha)
      if (!fecha) {
        skipped += 1
        continue
      }
      const nombre = item.nombre.trim()
      if (!nombre) {
        skipped += 1
        continue
      }
      try {
        await this.prisma.feriado.create({
          data: {
            tenantId,
            fecha,
            nombre,
            tipo: item.tipo ?? 'nacional',
            provincia: item.provincia?.trim() || null,
          },
        })
        created += 1
      } catch (err: unknown) {
        if ((err as { code?: string }).code === 'P2002') {
          skipped += 1
        } else {
          throw err
        }
      }
    }
    return { created, skipped }
  }
}
