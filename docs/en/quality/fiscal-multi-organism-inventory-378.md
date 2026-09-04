# Inventory: AFIP/ARCA → multi-organism fiscal module (#378)

| Current component | Action | Target component |
|---|---|---|
| `ArcaService` (WSAA/WSFE mock, CAE, TA, config) | reuse / wrap | `ArcaFiscalAdapter` + `ArcaService` (single client, unchanged) |
| `TenantFiscalConfig` | migrate + dual-read | `FiscalProviderConfig` (`providerCode=arca_wsfe`) |
| `Factura.cae` / `caeVto` / `estadoCae` | keep + audit | legacy fields + `FiscalDocument` |
| `NotaCredito` CAE via `requestCaeForNotaCredito` | encapsulate | `FiscalDocumentService.authorizeDocument` |
| `POST /api/arca/*` | temporary alias | delegates to the generic fiscal API / same services |
| `ArcaFiscalSection` UI | generalize | fiscal section driven by provider capabilities |
| `arca:retry-pending` job | generalize | `FiscalDocumentRetryService` (CLI alias) |
| AR PDF/QR/barcode | wrap | `ArcaFiscalDocumentRenderer` |
| DGI / SII | capability stubs | stub adapters (no live issuance) |
| SAT/PAC MX | mock homologación | `apps/server/fiscal/mx/` ([ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)); live PAC Not evidenced |

Confirmed consumers: `FacturaService`, ARCA routes, `PadronA4Service` (stays AR-specific), `billing.arca_cae` module, Pedido invoicing (#391), and invoicing from MeLi/TN/Woo.

## Delivered scope (implemented, #378)

- **Contract + registry:** `FiscalProviderAdapter` interface, `types.ts` (provider codes `arca_wsfe` / `uruguay_dgi` / `mexico_sat_pac`), `fiscalProviderRegistry.ts`, `bootstrapFiscalProviders.ts` — mirrors `EcommerceConnector` / `connectorRegistry.ts`.
- **ARCA adapter:** `ArcaFiscalAdapter` wraps the existing `ArcaService` — no second WSAA/WSFE client. `getCapabilities()` reports `implemented: true`.
- **Capability stubs:** `UruguayDgiFiscalAdapter` / `ChileSiiFiscalAdapter` — `getCapabilities()` reports `implemented: false`; every operational method throws `FiscalAdapterNotImplementedError` (see [ADR-0018](../adr/ADR-0018-fiscal-multi-organism-e-invoicing.md)).
- **Mexico mock PAC:** `MexicoSatFiscalAdapter` under `apps/server/fiscal/mx/` — homologación mock (`implemented: true`); live PAC Not evidenced ([ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)).
- **Prisma:** `FiscalProviderConfig` and `FiscalDocument` models added; `TenantFiscalConfig` kept for dual-read; backfill script `scripts/migrate-fiscal-provider-config-378.ts` + verification script `scripts/verify-fiscal-provider-migration.ts` (`npm run fiscal:migrate-provider-config`, `npm run fiscal:verify-provider-migration`).
- **Services:** `FiscalProviderConfigService` (dual-read/dual-write for `arca_wsfe`), `FiscalDocumentService` (idempotent authorization, one `FiscalDocument` row per attempt), `FiscalDocumentRetryService` (generalizes `ArcaService.retryPending`).
- **Routes:** `registerFiscalRoutes.ts` (`/api/fiscal/providers/*`, `/api/fiscal/documents/{facturaId}/authorize`); `registerArcaRoutes.ts` refactored to delegate to the same services, same paths/response shapes.
- **UI:** `FiscalProviderSection.tsx` lists every registered provider's capabilities/status and mounts `ArcaFiscalSection` unchanged for `arca_wsfe` credentials.
- **Renderer:** `FiscalDocumentRenderer` interface + `ArcaFiscalDocumentRenderer` wrapping `buildFacturaPdfImages` (QR/barcode); `facturaPdf.ts` now calls the renderer instead of the helper directly.

## Not evidenced in current codebase

- Live SOAP AFIP client, live DGI (Uruguay) client, live SAT/PAC commercial client (Mexico) — homologación mocks evidenced: ARCA (`arcaWsfeMock.ts`) and Mexico CFDI (`mxSatPacMock.ts`, [ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)).
