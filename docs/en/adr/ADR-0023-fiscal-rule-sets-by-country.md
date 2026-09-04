# ADR-0023: Per-country fiscal rule registry

**Status:** Accepted  
**Date:** 2026-09-03  
**ISO reference:** ISO/IEC 12207:2017 §6.3.2 (software design)

---

## Context

Issues [#207](https://github.com/ayelenleclerc/BizCode/issues/207), [#437](https://github.com/ayelenleclerc/BizCode/issues/437) and [#208](https://github.com/ayelenleclerc/BizCode/issues/208) made the tenant jurisdiction drive VAT rates, tax-id algorithms, module applicability and fiscal adapter selection. An audit for [#440](https://github.com/ayelenleclerc/BizCode/issues/440) showed that the rest of Argentine legislation was still hardcoded in layers that present themselves as country-agnostic:

- Server Zod schemas always required Argentine CUIT/CBU and `RI|Mono|CF|Exento`.
- The invoice engine decided who pays VAT by comparing against `CF` and `Exento`.
- Article VAT labels (`21%`, `10.5%`) and invoice letters `A|B|C` were written in JSX and locale files.
- Libro IVA exports hung under `finance.ledger` (not AR-only), and `echeq` was a generic receipt payment method despite `fiscal.cheques` being AR-only.

[ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md) point 3 and [ADR-0022](ADR-0022-legal-module-activation-by-jurisdiction.md) require fiscal behaviour as layers per country, not scattered conditionals.

Options considered:

1. Add `if (jurisdiction === 'AR')` around every Argentine code — spreads legislation across unrelated files.
2. Keep algorithms in `apps/web` and have the server import them by relative path — already an inverted dependency (`apps/server` → `apps/web`).
3. **Declare a `FiscalRuleSet` per country under `packages/types/src/fiscal/` and make the core read the registry** — chosen.

## Decision

1. Each country owns a `FiscalRuleSet` in `packages/types/src/fiscal/countries/` (tax id, bank account or `null`, subject tax conditions with `paysVat`, VAT rate codes, document kinds or `null`, VAT rates, provider code).
2. `registry.ts` exposes `getFiscalRules`, `subjectPaysVat`, `getVatRateCodes`, `getDocumentKinds`. `fiscal-jurisdictions.ts` is derived from the registry so there is one source of truth.
3. Pure identifier algorithms live in `packages/types/src/fiscal/identifiers/` and are re-exported from `apps/web/src/lib/validators.ts`.
4. `validateBodyForTenant(prisma, buildSchema)` resolves the tenant jurisdiction and builds Zod schemas per request. Customer and supplier body schemas are factories.
5. UI selects for tax conditions, VAT rates and invoice letters are derived from the registry (`apps/web/src/lib/fiscal/uiOptions.ts`). `calculateInvoice` takes the jurisdiction and uses `subjectPaysVat`.
6. `fiscal.libro_iva` is AR-only and gates Libro IVA routes/UI; `echeq` is accepted on supplier receipts only when `fiscal.cheques` is enabled.
7. Subject tax conditions for UY and CL are a **product model** (who pays VAT), not an official DGI/SII catalog — documented in each country file's JSDoc until a tax adviser validates them.

## Consequences

- Adding a jurisdiction is mostly declarative (new country file + registry entry + i18n keys). Mexico (#210) builds on this.
- Existing Argentine persisted codes stay valid; Prisma columns remain `String`.
- Coverage include adds `packages/types/src/fiscal/**` (Tier 1 pure modules).
- Existing AR tenants that only had `finance.ledger` need `fiscal.libro_iva` enabled to keep Libro IVA exports (new AR tenants get it via `DEFAULT_MODULES` filtered by jurisdiction).

## Related

- Issue [#440](https://github.com/ayelenleclerc/BizCode/issues/440)
- [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md), [ADR-0022](ADR-0022-legal-module-activation-by-jurisdiction.md)
- Quality guide: [fiscal-rule-sets-by-country.md](../quality/fiscal-rule-sets-by-country.md)
