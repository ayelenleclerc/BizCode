/**
 * @en Contract every fiscal e-invoicing provider adapter must implement (#378, ADR-0018).
 *   Mirrors the `EcommerceConnector` pattern (apps/server/integrations/ecommerce/EcommerceConnector.ts).
 * @es Contrato que debe implementar cada adapter de proveedor fiscal (#378, ADR-0018).
 *   Refleja el patrón `EcommerceConnector` (apps/server/integrations/ecommerce/EcommerceConnector.ts).
 * @pt-BR Contrato que cada adapter de provedor fiscal deve implementar (#378, ADR-0018).
 *   Reflete o padrão `EcommerceConnector` (apps/server/integrations/ecommerce/EcommerceConnector.ts).
 */

import type { ServiceResult } from '../services/serviceResults'
import type {
  FiscalAuthorizeRequest,
  FiscalAuthorizeResult,
  FiscalAuthSession,
  FiscalCancelOptions,
  FiscalCountryCode,
  FiscalDocumentStatusResult,
  FiscalDocumentType,
  FiscalProviderCapabilities,
  FiscalProviderCode,
} from './types'

export interface FiscalProviderAdapter {
  readonly provider: FiscalProviderCode
  readonly countryCode: FiscalCountryCode

  /** @en Whether the tenant has usable provider credentials (no secrets returned). */
  validateConfiguration(tenantId: number): Promise<ServiceResult<{ configured: boolean }>>

  /** @en Obtains/refreshes an auth session (e.g. AFIP WSAA ticket) for the tenant. */
  authenticate(tenantId: number): Promise<ServiceResult<FiscalAuthSession>>

  /** @en Requests authorization (e.g. CAE) for one invoice or credit note. */
  authorizeDocument(request: FiscalAuthorizeRequest): Promise<ServiceResult<FiscalAuthorizeResult>>

  /** @en Reads the current authorization status of a previously requested document. */
  getDocumentStatus(
    tenantId: number,
    documentType: FiscalDocumentType,
    documentId: number,
  ): Promise<ServiceResult<FiscalDocumentStatusResult>>

  /**
   * @en Voids/cancels a previously authorized document, when the provider supports it.
   *   Mexico SAT CFDI requires `options.reasonCode` (01-04) (#210).
   * @es Anula/cancela un documento previamente autorizado, cuando el proveedor lo soporta.
   *   CFDI SAT México exige `options.reasonCode` (01-04) (#210).
   * @pt-BR Anula/cancela um documento previamente autorizado, quando o provedor suporta.
   *   CFDI SAT México exige `options.reasonCode` (01-04) (#210).
   */
  cancel?(
    tenantId: number,
    documentType: FiscalDocumentType,
    documentId: number,
    options?: FiscalCancelOptions,
  ): Promise<ServiceResult<void>>

  /** @en Last authorized document number for a point of sale, when the provider supports it. */
  getLastAuthorizedNumber?(
    tenantId: number,
    pointOfSale: string,
    documentType: FiscalDocumentType,
  ): Promise<ServiceResult<{ number: number }>>

  /** @en Lightweight connectivity/credential check, when the provider supports it. */
  healthCheck?(tenantId: number): Promise<ServiceResult<{ healthy: boolean }>>

  /** @en Static capability declaration (does not require tenant context). */
  getCapabilities(): FiscalProviderCapabilities
}
