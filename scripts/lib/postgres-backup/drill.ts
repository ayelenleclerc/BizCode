/**
 * @en Shared constants for the isolated backup restore drill (#449).
 * @es Constantes compartidas del drill aislado de backup/restore (#449).
 * @pt-BR Constantes compartilhadas do drill isolado de backup/restore (#449).
 */

/** @en Fixed side database name for #449 drills (never the source). */
export const DRILL_SIDE_DB = 'bizcode_restore_drill_449'

/**
 * @en Critical tables compared after restore (#449). Missing tables are skipped with a note.
 * @es Tablas críticas comparadas tras restore (#449). Las ausentes se omiten con nota.
 * @pt-BR Tabelas críticas comparadas após restore (#449). Ausentes são omitidas com nota.
 */
export const DRILL_CRITICAL_TABLES = [
  'Tenant',
  'AppUser',
  'Cliente',
  'Factura',
  'PaymentTransaction',
  'MercadoPagoProcessedPayment',
  'MercadoPagoWebhookInbox',
] as const
