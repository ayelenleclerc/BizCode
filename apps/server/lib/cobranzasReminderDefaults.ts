import { DEFAULT_TENANT_TIMEZONE } from './tenantLocalTime'

export const DEFAULT_RECORDATORIO_DIAS_GRACIA = 0
export const DEFAULT_RECORDATORIO_HORA_INICIO = 8
export const DEFAULT_RECORDATORIO_HORA_FIN = 18

export type CobranzasReminderSettings = {
  recordatorioDiasGracia: number
  timezone: string
  recordatorioHoraInicio: number
  recordatorioHoraFin: number
}

export function reminderSettingsFromParamEmpresa(
  row: {
    recordatorioDiasGracia: number
    timezone: string
    recordatorioHoraInicio: number
    recordatorioHoraFin: number
  } | null,
): CobranzasReminderSettings {
  if (!row) {
    return {
      recordatorioDiasGracia: DEFAULT_RECORDATORIO_DIAS_GRACIA,
      timezone: DEFAULT_TENANT_TIMEZONE,
      recordatorioHoraInicio: DEFAULT_RECORDATORIO_HORA_INICIO,
      recordatorioHoraFin: DEFAULT_RECORDATORIO_HORA_FIN,
    }
  }
  return {
    recordatorioDiasGracia: row.recordatorioDiasGracia,
    timezone: row.timezone,
    recordatorioHoraInicio: row.recordatorioHoraInicio,
    recordatorioHoraFin: row.recordatorioHoraFin,
  }
}
