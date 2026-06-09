import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { NotFoundAppError } from '../errors/AppError'
import type { RegimenRetencionInput, RegimenRetencionUpdateInput } from '../createApp.types'

export type RegimenRetencionDto = {
  id: number
  tenantId: number
  tipo: string
  subtipo: string
  nombre: string
  alicuota: string
  alicuotaMin: string | null
  provincia: string | null
  activo: boolean
  createdAt: string
  updatedAt: string
}

function toDto(row: {
  id: number
  tenantId: number
  tipo: string
  subtipo: string
  nombre: string
  alicuota: Decimal
  alicuotaMin: Decimal | null
  provincia: string | null
  activo: boolean
  createdAt: Date
  updatedAt: Date
}): RegimenRetencionDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    tipo: row.tipo,
    subtipo: row.subtipo,
    nombre: row.nombre,
    alicuota: row.alicuota.toString(),
    alicuotaMin: row.alicuotaMin?.toString() ?? null,
    provincia: row.provincia,
    activo: row.activo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

/**
 * @en CRUD for tenant withholding/perception regimes (#228).
 * @es CRUD de regímenes de retención/percepción por tenant (#228).
 * @pt-BR CRUD de regimes de retenção/percepção por tenant (#228).
 */
export class RegimenRetencionService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(tenantId: number, activo?: boolean): Promise<RegimenRetencionDto[]> {
    const where: Prisma.RegimenRetencionWhereInput = { tenantId }
    if (activo != null) where.activo = activo
    const rows = await this.prisma.regimenRetencion.findMany({
      where,
      orderBy: [{ tipo: 'asc' }, { subtipo: 'asc' }, { nombre: 'asc' }],
    })
    return rows.map(toDto)
  }

  async create(tenantId: number, input: RegimenRetencionInput): Promise<RegimenRetencionDto> {
    const row = await this.prisma.regimenRetencion.create({
      data: {
        tenantId,
        tipo: input.tipo,
        subtipo: input.subtipo,
        nombre: input.nombre,
        alicuota: new Decimal(input.alicuota),
        alicuotaMin: input.alicuotaMin != null ? new Decimal(input.alicuotaMin) : null,
        provincia: input.provincia ?? null,
        activo: input.activo ?? true,
      },
    })
    return toDto(row)
  }

  async update(
    tenantId: number,
    id: number,
    input: RegimenRetencionUpdateInput,
  ): Promise<RegimenRetencionDto> {
    const existing = await this.prisma.regimenRetencion.findFirst({
      where: { id, tenantId },
    })
    if (existing == null) {
      throw new NotFoundAppError('Regimen retencion not found')
    }
    const data: Prisma.RegimenRetencionUpdateInput = {}
    if (input.nombre != null) data.nombre = input.nombre
    if (input.alicuota != null) data.alicuota = new Decimal(input.alicuota)
    if (input.alicuotaMin !== undefined) {
      data.alicuotaMin = input.alicuotaMin != null ? new Decimal(input.alicuotaMin) : null
    }
    if (input.provincia !== undefined) data.provincia = input.provincia
    if (input.activo != null) data.activo = input.activo
    const row = await this.prisma.regimenRetencion.update({ where: { id }, data })
    return toDto(row)
  }
}
