/**
 * @en `FiscalDocumentRenderer` implementation for `arca_wsfe` (#378, ADR-0018). Wraps the
 *   existing `buildFacturaPdfImages` helper (I2of5 barcode + AFIP FE QR) unchanged;
 *   `facturaPdf.ts` calls through this renderer instead of importing the AR helper directly.
 * @es Implementación de `FiscalDocumentRenderer` para `arca_wsfe` (#378, ADR-0018). Envuelve
 *   el helper existente `buildFacturaPdfImages` (código de barras I2of5 + QR FE AFIP) sin
 *   cambios; `facturaPdf.ts` llama a través de este renderer en vez de importar el helper AR directo.
 * @pt-BR Implementação de `FiscalDocumentRenderer` para `arca_wsfe` (#378, ADR-0018). Envolve
 *   o helper existente `buildFacturaPdfImages` (código de barras I2of5 + QR FE AFIP) sem
 *   mudanças; `facturaPdf.ts` chama através deste renderer em vez de importar o helper AR direto.
 */

import type { ArcaFacturaPdfInput } from '../ar/arcaFiscalPdfTypes'
import { buildFacturaPdfImages } from '../ar/facturaPdfImages'
import type { FiscalDocumentAuthorizationArtifacts, FiscalDocumentRenderer } from '../FiscalDocumentRenderer'
import type { FiscalProviderCode } from '../types'

export class ArcaFiscalDocumentRenderer implements FiscalDocumentRenderer<ArcaFacturaPdfInput> {
  readonly provider: FiscalProviderCode = 'arca_wsfe'

  async renderAuthorizationArtifacts(input: ArcaFacturaPdfInput): Promise<FiscalDocumentAuthorizationArtifacts> {
    return buildFacturaPdfImages(input)
  }
}
