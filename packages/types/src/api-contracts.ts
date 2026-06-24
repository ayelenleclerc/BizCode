export type ApiErrorPayload = {
  error?: string
  validation?: { valid: boolean; errors: Array<{ module: string; reason: string }> }
}

export type PaginatedResponse<T> = {
  success: boolean
  data: T[]
  total: number
  take: number
  skip: number
}

export type JsonRecord = Record<string, unknown>
