/**
 * @en Shared types for the multi-organism fiscal e-invoicing module (#378, ADR-0018).
 *   `ArcaService` (apps/server/fiscal/ar/ArcaService.ts) remains the only live client
 *   (homologación mocks); other providers are capability-only stubs until a live
 *   integration is evidenced in code.
 * @es Tipos compartidos del módulo fiscal multi-organismo (#378, ADR-0018).
 *   `ArcaService` sigue siendo el único cliente real (mocks de homologación); los
 *   demás proveedores son stubs de capacidades hasta que exista integración real en el código.
 * @pt-BR Tipos compartilhados do módulo fiscal multi-organismo (#378, ADR-0018).
 *   `ArcaService` continua sendo o único cliente real (mocks de homologação); os
 *   demais provedores são stubs de capacidades até existir integração real no código.
 */

/**
 * @en Registered fiscal provider codes. Only `arca_wsfe` has a working adapter today;
 *   `uruguay_dgi`, `chile_sii` and `mexico_sat_pac` are capability-only stubs (#378, #208).
 * @es Códigos de proveedor fiscal registrados. Solo `arca_wsfe` tiene adapter funcional hoy;
 *   `uruguay_dgi`, `chile_sii` y `mexico_sat_pac` son stubs de capacidades (#378, #208).
 * @pt-BR Códigos de provedor fiscal registrados. Apenas `arca_wsfe` tem adapter funcional hoje;
 *   `uruguay_dgi`, `chile_sii` e `mexico_sat_pac` são stubs de capacidades (#378, #208).
 */
export const FISCAL_PROVIDER_CODES = [
  'arca_wsfe',
  'uruguay_dgi',
  'chile_sii',
  'mexico_sat_pac',
] as const

export type FiscalProviderCode = (typeof FISCAL_PROVIDER_CODES)[number]

export function isFiscalProviderCode(value: unknown): value is FiscalProviderCode {
  return typeof value === 'string' && (FISCAL_PROVIDER_CODES as readonly string[]).includes(value)
}

/** @en ISO-3166-1 alpha-2 country code the provider issues documents for. */
export type FiscalCountryCode = 'AR' | 'UY' | 'CL' | 'MX'

/**
 * @en Normalized environment. Mirrors ArcaService's `ambiente` vocabulary (the only
 *   evidenced provider); future providers document their own mapping in their adapter.
 * @es Ambiente normalizado. Refleja el vocabulario `ambiente` de ArcaService (único
 *   proveedor evidenciado); los futuros proveedores documentan su propio mapeo en su adapter.
 * @pt-BR Ambiente normalizado. Reflete o vocabulário `ambiente` do ArcaService (único
 *   provedor evidenciado); futuros provedores documentam seu próprio mapeamento no adapter.
 */
export type FiscalEnvironment = 'homologacion' | 'produccion'

/** @en Normalized fiscal document kind, mapped to Factura (invoice) / NotaCredito (credit_note). */
export type FiscalDocumentType = 'invoice' | 'credit_note'

/** @en Lifecycle status stored on `FiscalDocument.status` (Prisma). */
export type FiscalDocumentStatus = 'pending' | 'authorized' | 'rejected' | 'failed'

export type FiscalAuthSession = {
  token: string
  sign: string
  expiration: Date
}

export type FiscalAuthorizeRequest = {
  tenantId: number
  documentType: FiscalDocumentType
  /** @en Required when documentType === 'invoice'. */
  invoiceId?: number
  /** @en Required when documentType === 'credit_note'. */
  notaCreditoId?: number
  /** @en Idempotency key, e.g. `arca:factura:{id}` (#378). */
  idempotencyKey: string
}

export type FiscalAuthorizeResult = {
  status: FiscalDocumentStatus
  authorizationCode?: string
  authorizationExpiresAt?: Date
  documentNumber?: string
  pointOfSale?: string
  raw?: unknown
  errorCode?: string
  errorMessage?: string
}

export type FiscalDocumentStatusResult = {
  status: FiscalDocumentStatus
  authorizationCode?: string
  authorizationExpiresAt?: Date
}

/**
 * @en Declares what an adapter can actually do, so UI/routes can degrade gracefully
 *   for providers without a live implementation (#378).
 * @es Declara qué puede hacer realmente un adapter, para que UI/rutas degraden con
 *   claridad en proveedores sin implementación real (#378).
 * @pt-BR Declara o que um adapter realmente pode fazer, para que UI/rotas degradem com
 *   clareza em provedores sem implementação real (#378).
 */
export type FiscalProviderCapabilities = {
  provider: FiscalProviderCode
  countryCode: FiscalCountryCode
  displayName: string
  implemented: boolean
  supportsInvoice: boolean
  supportsCreditNote: boolean
  supportsCancel: boolean
  supportsHealthCheck: boolean
  supportsLastAuthorizedNumber: boolean
  /** @en Free-text note, e.g. "Not evidenced in current codebase — capability stub only". */
  notes?: string
}
