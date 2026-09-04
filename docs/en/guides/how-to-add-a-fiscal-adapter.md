# How to add a fiscal provider adapter (#378, ADR-0018)

This guide is for adding a new fiscal e-invoicing provider (e.g. a real Uruguay DGI or Mexico SAT/PAC client) to the multi-organism fiscal module introduced in [ADR-0018](../adr/ADR-0018-fiscal-multi-organism-e-invoicing.md). It reflects the code as implemented; it does not describe hypothetical future behavior.

## 1. Add the provider code

Add the new code to `FISCAL_PROVIDER_CODES` and `FiscalCountryCode` in [`apps/server/fiscal/types.ts`](../../../apps/server/fiscal/types.ts) if the country is new.

## 2. Implement `FiscalProviderAdapter`

Create `apps/server/fiscal/<provider>/<Provider>FiscalAdapter.ts` implementing [`FiscalProviderAdapter`](../../../apps/server/fiscal/FiscalProviderAdapter.ts):

- `validateConfiguration(tenantId)` — checks stored credentials exist; never returns secrets.
- `authenticate(tenantId)` — obtains/refreshes a session token from the real provider client.
- `authorizeDocument(request)` — requests authorization (e.g. CFE/CFDI) for an invoice or credit note; maps the provider's response to `FiscalAuthorizeResult`.
- `getDocumentStatus(tenantId, documentType, documentId)` — reads current status.
- Optional `cancel` / `getLastAuthorizedNumber` / `healthCheck` when the provider supports them.
- `getCapabilities()` — must set `implemented: true` **only once the client above talks to a real (or officially documented sandbox) endpoint**; do not flip this flag for mocked/simulated behavior.

Use `apps/server/fiscal/arca/ArcaFiscalAdapter.ts` (wraps `ArcaService`) as the reference implementation — it delegates every call to the existing service instead of inlining provider logic in the adapter.

## 3. Replace the capability stub

Until step 2 is real, the provider must keep using its stub under `apps/server/fiscal/stubs/` (e.g. `UruguayDgiFiscalAdapter.ts`, `ChileSiiFiscalAdapter.ts`), which throws [`FiscalAdapterNotImplementedError`](../../../apps/server/fiscal/stubs/FiscalAdapterNotImplementedError.ts) from every operational method. Once the real adapter exists, update the factory registration (next step) to use it instead of the stub — do not leave both registered for the same provider code.

## 4. Register the adapter factory

In [`bootstrapFiscalProviders.ts`](../../../apps/server/fiscal/bootstrapFiscalProviders.ts), call `registerFiscalProviderAdapterFactory(provider, (prisma) => new YourFiscalAdapter(prisma))`.

## 5. Prisma / config secrets

Reuse `FiscalProviderConfig` (already generic): store the new provider's config under `providerCode = '<provider>'`, `encryptedConfig` as an AES-256-GCM-encrypted JSON string (see `encryptFiscalSecret` / `decryptFiscalSecret` in [`apps/server/fiscal/ar/fiscalSecrets.ts`](../../../apps/server/fiscal/ar/fiscalSecrets.ts)). Do not add provider-specific plaintext columns.

## 6. Routes / UI / OpenAPI

No new routes are needed: `registerFiscalRoutes.ts` and `FiscalProviderSection.tsx` are already provider-agnostic and read from `getCapabilities()` / `FiscalProviderConfigService.getStatus()`. Update `docs/api/openapi.yaml`'s `FiscalProviderCode` enum if you added a new provider code in step 1.

## 7. Tests

At minimum, mirror `tests/server/fiscal/arca/arcaFiscalAdapter.test.ts` (adapter unit tests against a mocked `PrismaClient`) and remove the corresponding case from `tests/server/fiscal/stubs/fiscalStubs.test.ts` once the stub is replaced. Do not lower `vitest.config.ts` coverage thresholds.

## 8. Documentation

Update this guide's provider list below and add a note to [ADR-0018](../adr/ADR-0018-fiscal-multi-organism-e-invoicing.md) "Consequences"/"Not evidenced" section reflecting the new real integration, in all three locales (`docs/en/`, `docs/es/`, `docs/pt-br/`).

## Current provider status (evidenced in code)

| Provider | `providerCode` | `implemented` | Source |
|---|---|---|---|
| ARCA / AFIP (Argentina) | `arca_wsfe` | `true` (homologación mock) | `apps/server/fiscal/arca/ArcaFiscalAdapter.ts` → `apps/server/fiscal/ar/ArcaService.ts` |
| DGI (Uruguay) | `uruguay_dgi` | `false` (capability stub) | `apps/server/fiscal/stubs/UruguayDgiFiscalAdapter.ts` |
| SII (Chile) | `chile_sii` | `false` (capability stub) | `apps/server/fiscal/stubs/ChileSiiFiscalAdapter.ts` |
| SAT/PAC (Mexico) | `mexico_sat_pac` | `true` (homologación mock PAC; live Not evidenced) | `apps/server/fiscal/mx/MexicoSatFiscalAdapter.ts` → `MexicoSatService` + `mxSatPacMock` ([ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)) |
