export type ServiceFailure = {
  ok: false
  status: number
  error: string
}

export type ServiceSuccess<T> = {
  ok: true
  data: T
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure

export type ImportRowError = {
  row: number
  message: string
}

export type ImportPersistResult = {
  created: number
  errors: ImportRowError[]
}
