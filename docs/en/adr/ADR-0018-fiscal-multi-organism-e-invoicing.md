# ADR-0018: Multi-organism fiscal e-invoicing module (ARCA as first adapter)

**Status:** Accepted  
**Date:** 2026-08-06  
**ISO reference:** ISO/IEC 12207:2017 §6.3.2 (software design); ISO 9001:2015 §8.3.3 (design outputs)

---

## Context

BizCode issues mock CAE (Argentina AFIP/ARCA) through `ArcaService` (`apps/server/fiscal/ar/ArcaService.ts`, homologación mock only — `arcaWsfeMock.ts`), consumed directly by `FacturaService`, `registerArcaRoutes.ts`, and `arca:retry-pending`. Product strategy (issue #378, [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md), [product-vision-and-deployment.md](../quality/product-vision-and-deployment.md)) targets additional countries/authorities (Uruguay DGI, Mexico SAT via a PAC) without duplicating fiscal logic per jurisdiction outside dedicated modules.

Options considered:

1. **Keep ARCA as a standalone, ad-hoc implementation** and bolt on country-specific code paths later — fast now, but reproduces the "duplicated fiscal logic" anti-pattern ADR-0007 already rules out.
2. **Extract a provider-agnostic contract (adapter pattern), with ARCA as the first and only implemented adapter, and capability-only stubs for future providers** — more upfront structure, one source of truth, matches the `EcommerceConnector` pattern already used for e-commerce integrations (`apps/server/integrations/ecommerce/`).

## Decision

1. **`FiscalProviderAdapter` contract** (`apps/server/fiscal/FiscalProviderAdapter.ts`): `validateConfiguration`, `authenticate`, `authorizeDocument`, `getDocumentStatus`, optional `cancel` / `getLastAuthorizedNumber` / `healthCheck`, and `getCapabilities()`. Provider codes (`FiscalProviderCode`, `apps/server/fiscal/types.ts`): `arca_wsfe`, `uruguay_dgi`, `chile_sii`, `mexico_sat_pac`, `brazil_sefaz_nfe`.
2. **Registry + bootstrap** (`fiscalProviderRegistry.ts`, `bootstrapFiscalProviders.ts`) mirror `connectorRegistry.ts` / `bootstrapEcommerceConnectors.ts`: adapter factories keyed by provider code, idempotent bootstrap, test-only reset helpers.
3. **`ArcaFiscalAdapter`** (`apps/server/fiscal/arca/ArcaFiscalAdapter.ts`) wraps the existing `ArcaService` unchanged — **no second WSAA/WSFE client is created**; every call delegates to `ArcaService`'s homologación mock. `getCapabilities()` reports `implemented: true`.
4. **Homologación mocks** for `uruguay_dgi` ([ADR-0025](ADR-0025-uruguay-dgi-cfe-mock.md)), `chile_sii` ([ADR-0026](ADR-0026-chile-sii-dte-mock.md)), `mexico_sat_pac` ([ADR-0024](ADR-0024-mexico-sat-cfdi-mock-pac.md)) and `brazil_sefaz_nfe` ([ADR-0027](ADR-0027-brazil-sefaz-nfe-mock.md)): `getCapabilities()` reports `implemented: true`; live DGI/SII/PAC/SEFAZ REST/SOAP/XML remains **Not evidenced**.
5. **Prisma:** `FiscalProviderConfig` (per-tenant provider config, `@@unique([tenantId, providerCode])`, `encryptedConfig` as an AES-256-GCM-encrypted JSON bundle) and `FiscalDocument` (one auditable row per authorization attempt, `@@unique([tenantId, idempotencyKey])`, idempotency key `{provider}:{factura|nota_credito}:{id}`). The legacy `TenantFiscalConfig` table is **kept** for dual-read; a backfill script (`scripts/migrate-fiscal-provider-config-378.ts`) populates `FiscalProviderConfig` for tenants with an existing `arca_wsfe` config, verified by `scripts/verify-fiscal-provider-migration.ts`.
6. **Services:** `FiscalProviderConfigService` (dual-read/dual-write between `TenantFiscalConfig` and `FiscalProviderConfig` for `arca_wsfe`, capability listing, default-provider resolution), `FiscalDocumentService` (idempotent authorization orchestration, resolves the adapter and persists one `FiscalDocument` attempt), `FiscalDocumentRetryService` (generalizes `ArcaService.retryPending` through `FiscalDocumentService`). `FacturaService` now calls `FiscalDocumentService.authorizeInvoice` / `authorizeCreditNote` instead of `ArcaService` directly (the `skipArcaCae` flag name is unchanged for compatibility).
7. **Routes:** `registerFiscalRoutes.ts` exposes the provider-agnostic contract (`GET`/`PUT /api/fiscal/providers/config`, `POST /api/fiscal/providers/validate`, `GET /api/fiscal/providers/capabilities`, `POST /api/fiscal/documents/{facturaId}/authorize`). `registerArcaRoutes.ts` is refactored to **delegate** to the same services (`FiscalProviderConfigService`, `ArcaFiscalAdapter`, `FiscalDocumentService`) while keeping identical `/api/arca/*` paths and response shapes for backward compatibility; AR-specific `padron` stays out of the generic fiscal contract.
8. **Renderer abstraction:** `FiscalDocumentRenderer<T>` interface + `ArcaFiscalDocumentRenderer` wrapping the existing `buildFacturaPdfImages` (QR/barcode); `facturaPdf.ts` calls the renderer instead of the helper directly, without moving the rest of the AR-specific PDF layout code.
9. **UI:** `FiscalProviderSection.tsx` lists every registered provider's capabilities and tenant status (module gating per jurisdiction) and mounts provider-specific credential/config sections (e.g. `ArcaFiscalSection` for `arca_wsfe`; UY/CL/MX config sections for their mocks). Homologación mocks report `implemented: true`; live DGI/SII/PAC clients remain Not evidenced.

## Consequences

- **Positive:** ARCA behaves as one interchangeable adapter instead of a parallel, hardcoded implementation; adding a real DGI/SAT client later means implementing `FiscalProviderAdapter` and registering a factory, without touching `FacturaService`, routes, or UI wiring; capability stubs let the UI and routes degrade gracefully (`implemented: false`, HTTP 501) instead of silently failing or inventing data; existing `/api/arca/*` consumers and tests (`tests/api/arca.test.ts`) keep working unchanged.
- **Negative:** One extra indirection layer (`FiscalDocumentService` → adapter → `ArcaService`) for every CAE request; two config sources (`TenantFiscalConfig` and `FiscalProviderConfig`) must be kept consistent until every tenant is migrated and the legacy table is deprecated in a future ADR.
- **Not evidenced in current codebase:** live SOAP AFIP client, live DGI (Uruguay) client, live SII (Chile) client, live SAT/PAC (Mexico) client, live SEFAZ (Brazil) client. Homologación **mocks** are evidenced for `arca_wsfe`, `uruguay_dgi`, `chile_sii`, `mexico_sat_pac`, and `brazil_sefaz_nfe` (`implemented: true` in the fiscal provider registry). Mocks must not be treated as live authority integrations.
- **Follow-up:** a future ADR is required before removing `TenantFiscalConfig` (dual-read) or before implementing live DGI/SII/PAC clients. Uruguay CFE mock: [ADR-0025](ADR-0025-uruguay-dgi-cfe-mock.md); Chile DTE mock: [ADR-0026](ADR-0026-chile-sii-dte-mock.md); Mexico mock PAC: [ADR-0024](ADR-0024-mexico-sat-cfdi-mock-pac.md); live commercial PAC / DGI / SII remain Not evidenced.

## References

- Issue #378
- [ADR-0007: Dual deployment and fiscal modularity](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [Fiscal multi-organism inventory (#378)](../quality/fiscal-multi-organism-inventory-378.md)
- [How to add a fiscal provider adapter](../guides/how-to-add-a-fiscal-adapter.md)
- [product-vision-and-deployment.md](../quality/product-vision-and-deployment.md) (PROD-VISION-001)

## Revision

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-08-06 | Accepted with #378 |
| 1.1 | 2026-11-11 | Provider codes + consequences: `chile_sii`; UY/CL/MX mocks vs live (#210 hygiene) |
| 1.3 | 2026-11-11 | Register `brazil_sefaz_nfe` mock (#211) |
