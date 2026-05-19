import type { ParamEmpresa, PrismaClient } from '@prisma/client'
import { formatCUIT } from '../../src/lib/validators'
import {
  DEFAULT_RECORDATORIO_DIAS_GRACIA,
  DEFAULT_RECORDATORIO_HORA_FIN,
  DEFAULT_RECORDATORIO_HORA_INICIO,
} from '../lib/cobranzasReminderDefaults'
import { DEFAULT_TENANT_TIMEZONE } from '../lib/tenantLocalTime'
import type { EmpresaInput } from '../createApp.types'

export type EmpresaConfigDto = {
  id: number | null
  nombre: string
  cuit: string
  domicilio: string | null
  puntoVenta: number
  tipoFactura: 'A' | 'B' | 'C'
  logoUrl: string | null
  prefijoFactura: string
  recordatorioDiasGracia: number
  timezone: string
  recordatorioHoraInicio: number
  recordatorioHoraFin: number
}

/**
 * @en Formats point-of-sale number as a 4-digit invoice prefix.
 * @es Formatea el número de punto de venta como prefijo de factura de 4 dígitos.
 * @pt-BR Formata o número do ponto de venda como prefixo de fatura de 4 dígitos.
 */
export function formatPrefijoFromPuntoVenta(puntoVenta: number): string {
  return String(puntoVenta).padStart(4, '0')
}

function rowToDto(row: ParamEmpresa): EmpresaConfigDto {
  return {
    id: row.id,
    nombre: row.nombre,
    cuit: row.cuit,
    domicilio: row.domicilio,
    puntoVenta: row.puntoVenta,
    tipoFactura: row.tipoFactura as EmpresaConfigDto['tipoFactura'],
    logoUrl: row.logoUrl,
    prefijoFactura: formatPrefijoFromPuntoVenta(row.puntoVenta),
    recordatorioDiasGracia: row.recordatorioDiasGracia,
    timezone: row.timezone,
    recordatorioHoraInicio: row.recordatorioHoraInicio,
    recordatorioHoraFin: row.recordatorioHoraFin,
  }
}

const defaultReminderFields = {
  recordatorioDiasGracia: DEFAULT_RECORDATORIO_DIAS_GRACIA,
  timezone: DEFAULT_TENANT_TIMEZONE,
  recordatorioHoraInicio: DEFAULT_RECORDATORIO_HORA_INICIO,
  recordatorioHoraFin: DEFAULT_RECORDATORIO_HORA_FIN,
}

/**
 * @en Tenant company parameters (read defaults or persisted row).
 * @es Parámetros de empresa por tenant (defaults o fila persistida).
 * @pt-BR Parâmetros da empresa por tenant (padrões ou registro persistido).
 */
export class EmpresaService {
  constructor(private readonly prisma: PrismaClient) {}

  async getByTenant(tenantId: number): Promise<EmpresaConfigDto> {
    const [row, tenant] = await Promise.all([
      this.prisma.paramEmpresa.findUnique({ where: { tenantId } }),
      this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
    ])

    if (row) {
      return rowToDto(row)
    }

    const nombre = tenant?.name?.slice(0, 40) ?? ''
    return {
      id: null,
      nombre,
      cuit: '',
      domicilio: null,
      puntoVenta: 1,
      tipoFactura: 'B',
      logoUrl: null,
      prefijoFactura: formatPrefijoFromPuntoVenta(1),
      ...defaultReminderFields,
    }
  }

  async upsert(tenantId: number, input: EmpresaInput): Promise<EmpresaConfigDto> {
    const cuitFormatted = formatCUIT(input.cuit.replace(/[-\s]/g, ''))
    const data = {
      nombre: input.nombre.trim(),
      cuit: cuitFormatted.length === 13 ? cuitFormatted : input.cuit.trim(),
      domicilio: input.domicilio ?? null,
      puntoVenta: input.puntoVenta,
      tipoFactura: input.tipoFactura,
      logoUrl: input.logoUrl ?? null,
      recordatorioDiasGracia: input.recordatorioDiasGracia ?? DEFAULT_RECORDATORIO_DIAS_GRACIA,
      timezone: input.timezone ?? DEFAULT_TENANT_TIMEZONE,
      recordatorioHoraInicio: input.recordatorioHoraInicio ?? DEFAULT_RECORDATORIO_HORA_INICIO,
      recordatorioHoraFin: input.recordatorioHoraFin ?? DEFAULT_RECORDATORIO_HORA_FIN,
    }

    const row = await this.prisma.paramEmpresa.upsert({
      where: { tenantId },
      create: { tenantId, ...data },
      update: data,
    })

    return rowToDto(row)
  }
}
