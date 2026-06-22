import type { Prisma, PrismaClient } from '@prisma/client'

type DbClient = PrismaClient | Prisma.TransactionClient

/**
 * @en Atomic correlative numbers for withholding certificates (#276).
 * @es Números correlativos atómicos para constancias de retención (#276).
 * @pt-BR Números correlativos atômicos para certificados de retenção (#276).
 */
export class RetencionConstanciaService {
  constructor(private readonly db: DbClient) {}

  /**
   * @en Returns next certificate label, e.g. ganancias-00042 or iibb-CABA-00003.
   * @es Devuelve la etiqueta correlativa, p. ej. ganancias-00042 o iibb-CABA-00003.
   * @pt-BR Retorna o rótulo correlativo, ex. ganancias-00042 ou iibb-CABA-00003.
   */
  async nextConstanciaNum(
    tenantId: number,
    tipo: string,
    provincia: string | null | undefined,
  ): Promise<string> {
    const provKey = provincia?.trim() ?? ''
    const existing = await this.db.retencionConstanciaSequence.findUnique({
      where: { tenantId_tipo_provincia: { tenantId, tipo, provincia: provKey } },
    })
    const nextNum = (existing?.lastNum ?? 0) + 1
    await this.db.retencionConstanciaSequence.upsert({
      where: { tenantId_tipo_provincia: { tenantId, tipo, provincia: provKey } },
      create: { tenantId, tipo, provincia: provKey, lastNum: nextNum },
      update: { lastNum: nextNum },
    })
    const prefix =
      tipo === 'iibb' && provKey.length > 0 ? `iibb-${provKey}` : tipo
    return `${prefix}-${String(nextNum).padStart(5, '0')}`
  }
}
