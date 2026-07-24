/**
 * @en Types for bulk Excel/CSV import jobs (#238).
 * @es Tipos para trabajos de importación masiva Excel/CSV (#238).
 * @pt-BR Tipos para trabalhos de importação em massa Excel/CSV (#238).
 */

export const IMPORT_ENTITIES = ['articulos', 'clientes', 'proveedores', 'saldos'] as const
export type ImportEntity = (typeof IMPORT_ENTITIES)[number]

export const IMPORT_MODOS = ['mejores_esfuerzos', 'todo_o_nada'] as const
export type ImportModo = (typeof IMPORT_MODOS)[number]

export const IMPORT_DUPLICATE_MODES = ['update', 'skip'] as const
export type ImportDuplicateMode = (typeof IMPORT_DUPLICATE_MODES)[number]

export const IMPORT_JOB_ESTADOS = [
  'validating',
  'ready',
  'running',
  'completed',
  'failed',
  'cancelled',
] as const
export type ImportJobEstado = (typeof IMPORT_JOB_ESTADOS)[number]

export type ImportRowIssue = {
  row: number
  code: string
  message: string
  kind: 'error' | 'duplicate'
}

export type BulkImportValidateSummary = {
  entity: ImportEntity
  totalRows: number
  okCount: number
  errorCount: number
  duplicateCount: number
  issues: ImportRowIssue[]
}

export type ImportJobRow = {
  id: number
  tenantId: number
  entity: ImportEntity
  estado: ImportJobEstado
  modo: ImportModo
  duplicateMode: ImportDuplicateMode
  totalRows: number
  processedRows: number
  okCount: number
  errorCount: number
  duplicateCount: number
  createdCount: number
  updatedCount: number
  skippedCount: number
  createdById: number
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export type ImportJobExecuteInput = {
  entity: ImportEntity
  modo?: ImportModo
  duplicateMode?: ImportDuplicateMode
}

export type ImportJobProgressEvent = {
  jobId: number
  estado: ImportJobEstado
  processedRows: number
  totalRows: number
  createdCount: number
  updatedCount: number
  skippedCount: number
  errorCount: number
  message?: string
}
