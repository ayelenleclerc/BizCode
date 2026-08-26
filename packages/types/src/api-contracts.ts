export type FacturaAnomalyWarningPayload = {
  tipo: string
  severidad: string
  descripcion: string
  detalle?: Record<string, number | string | boolean | null>
}

export type ApiErrorPayload = {
  error?: string
  validation?: { valid: boolean; errors: Array<{ module: string; reason: string }> }
  /** @en Optional anomaly warnings (e.g. DUPLICATE_INVOICE_CONFIRM_REQUIRED #200). */
  warnings?: FacturaAnomalyWarningPayload[]
}

export type PaginatedResponse<T> = {
  success: boolean
  data: T[]
  total: number
  take: number
  skip: number
}

export type JsonRecord = Record<string, unknown>
