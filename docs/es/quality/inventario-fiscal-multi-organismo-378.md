# Inventario AFIP/ARCA → módulo fiscal multi-organismo (#378)

| Componente actual | Acción | Componente destino |
|---|---|---|
| `ArcaService` (mock WSAA/WSFE, CAE, TA, config) | reutilizar / envolver | `ArcaFiscalAdapter` + `ArcaService` (único cliente, sin cambios) |
| `TenantFiscalConfig` | migrar + lectura dual | `FiscalProviderConfig` (`providerCode=arca_wsfe`) |
| `Factura.cae` / `caeVto` / `estadoCae` | conservar + auditar | campos legacy + `FiscalDocument` |
| `NotaCredito` CAE vía `requestCaeForNotaCredito` | encapsular | `FiscalDocumentService.authorizeDocument` |
| `POST /api/arca/*` | alias temporal | delegan en la API fiscal genérica / mismos servicios |
| UI `ArcaFiscalSection` | generalizar | sección fiscal según capacidades del proveedor |
| Job `arca:retry-pending` | generalizar | `FiscalDocumentRetryService` (alias CLI) |
| PDF/QR/código de barras AR | envolver | `ArcaFiscalDocumentRenderer` |
| DGI / SII | stubs de capacidades | adapters stub (sin emisión real) |
| SAT/PAC MX | mock homologación | `apps/server/fiscal/mx/` ([ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)); PAC live no evidenciado |

Consumidores confirmados: `FacturaService`, rutas ARCA, `PadronA4Service` (sigue siendo específico de AR), módulo `billing.arca_cae`, facturación de Pedido (#391), y facturación desde MeLi/TN/Woo.

## Alcance entregado (implementado, #378)

- **Contrato + registro:** interfaz `FiscalProviderAdapter`, `types.ts` (códigos de proveedor `arca_wsfe` / `uruguay_dgi` / `mexico_sat_pac`), `fiscalProviderRegistry.ts`, `bootstrapFiscalProviders.ts` — refleja `EcommerceConnector` / `connectorRegistry.ts`.
- **Adapter ARCA:** `ArcaFiscalAdapter` envuelve el `ArcaService` existente — no se crea un segundo cliente WSAA/WSFE. `getCapabilities()` reporta `implemented: true`.
- **Stubs de capacidades:** `UruguayDgiFiscalAdapter` / `ChileSiiFiscalAdapter` — `getCapabilities()` reporta `implemented: false`; todo método operacional lanza `FiscalAdapterNotImplementedError` (ver [ADR-0018](../adr/ADR-0018-fiscal-multi-organism-e-invoicing.md)).
- **Mock PAC México:** `MexicoSatFiscalAdapter` en `apps/server/fiscal/mx/` — mock de homologación (`implemented: true`); PAC live no evidenciado ([ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)).
- **Prisma:** se agregan los modelos `FiscalProviderConfig` y `FiscalDocument`; se conserva `TenantFiscalConfig` para lectura dual; script de backfill `scripts/migrate-fiscal-provider-config-378.ts` + script de verificación `scripts/verify-fiscal-provider-migration.ts` (`npm run fiscal:migrate-provider-config`, `npm run fiscal:verify-provider-migration`).
- **Servicios:** `FiscalProviderConfigService` (lectura/escritura dual para `arca_wsfe`), `FiscalDocumentService` (autorización idempotente, una fila `FiscalDocument` por intento), `FiscalDocumentRetryService` (generaliza `ArcaService.retryPending`).
- **Rutas:** `registerFiscalRoutes.ts` (`/api/fiscal/providers/*`, `/api/fiscal/documents/{facturaId}/authorize`); `registerArcaRoutes.ts` refactorizado para delegar en los mismos servicios, con los mismos paths/formas de respuesta.
- **UI:** `FiscalProviderSection.tsx` lista las capacidades/estado de cada proveedor registrado y monta `ArcaFiscalSection` sin cambios para las credenciales de `arca_wsfe`.
- **Renderer:** interfaz `FiscalDocumentRenderer` + `ArcaFiscalDocumentRenderer` que envuelve `buildFacturaPdfImages` (QR/código de barras); `facturaPdf.ts` ahora llama al renderer en vez del helper directamente.

## No evidenciado en el código actual

- Cliente SOAP real de AFIP, cliente real de DGI (Uruguay), cliente comercial SAT/PAC (México) — mocks de homologación evidenciados: ARCA (`arcaWsfeMock.ts`) y CFDI México (`mxSatPacMock.ts`, [ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)).
