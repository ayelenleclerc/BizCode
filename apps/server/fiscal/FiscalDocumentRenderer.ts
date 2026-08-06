/**
 * @en Contract for rendering provider-specific fiscal artifacts (barcode/QR images) that
 *   get embedded in an invoice PDF, so `facturaPdf.ts` does not depend on AR-specific
 *   helpers directly (#378, ADR-0018). Only wraps the existing AR QR/barcode builders;
 *   does NOT move the PDF layout/rendering code itself.
 * @es Contrato para renderizar artefactos fiscales específicos del proveedor
 *   (código de barras/QR) embebidos en el PDF de factura, para que `facturaPdf.ts` no
 *   dependa directamente de helpers AR (#378, ADR-0018). Solo envuelve los builders
 *   QR/barcode AR existentes; NO mueve el código de layout/render del PDF.
 * @pt-BR Contrato para renderizar artefatos fiscais específicos do provedor
 *   (código de barras/QR) embutidos no PDF da fatura, para que `facturaPdf.ts` não
 *   dependa diretamente de helpers AR (#378, ADR-0018). Apenas envolve os builders
 *   QR/barcode AR existentes; NÃO move o código de layout/renderização do PDF.
 */

import type { FiscalProviderCode } from './types'

export type FiscalDocumentAuthorizationArtifacts = {
  barcodePng: Buffer | null
  qrPng: Buffer | null
}

export interface FiscalDocumentRenderer<TInput> {
  readonly provider: FiscalProviderCode
  renderAuthorizationArtifacts(input: TInput): Promise<FiscalDocumentAuthorizationArtifacts>
}
