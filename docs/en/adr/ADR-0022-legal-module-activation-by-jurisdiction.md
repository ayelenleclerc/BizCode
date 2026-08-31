# ADR-0022: Legal module activation by fiscal jurisdiction

**Status:** Accepted  
**Date:** 2026-08-31  
**ISO reference:** ISO/IEC 12207:2017 §6.3.2 (software design)

---

## Context

Issue [#207](https://github.com/ayelenleclerc/BizCode/issues/207) added a per-tenant fiscal jurisdiction (`TenantConfig.jurisdiccionFiscal`), which drives VAT rates, tax-id validation and fiscal adapter selection. Provisioning, however, stayed Argentine by construction:

- The four Argentine legal modules (`billing.arca_cae`, `finance.retenciones`, `fiscal.remito`, `fiscal.cheques`) are part of `DEFAULT_MODULES`, so every new tenant received them regardless of its jurisdiction.
- None of the tenant creation paths wrote `jurisdiccionFiscal`; all relied on the `'AR'` column default.
- The public SaaS registration validated a CUIT and queried the ARCA registry unconditionally.
- The catalog only knew where a module was **mandatory** (`requiredInProdForCountries`), never where it was **applicable**.

The evidence for those four modules being Argentine is in the code: `remitoPdf.ts` and the SICORE/SIFERE retention exports live under `apps/server/fiscal/ar/`, `billing.arca_cae` targets ARCA, and the `Cheque` model persists `cbuOrigen`, `libradorCuit` and the `echeq` modality.

Issue [#437](https://github.com/ayelenleclerc/BizCode/issues/437) generalizes this before adding further countries, so that each new jurisdiction is declarative rather than a new set of conditionals.

Options considered:

1. Add per-country conditionals where each Argentine module is used — spreads fiscal logic across unrelated files, which [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md) point 3 explicitly rejects.
2. Infer applicability from the existing `requiredInProdForCountries` — conflates "mandatory in production" with "legally applicable at all"; a module can be applicable yet optional.
3. **Declare applicability in the catalog and resolve the installation jurisdiction from the server environment** — chosen.

## Decision

1. `ModuleDef.availableForCountries?: readonly string[]` declares where a module is legally applicable. **Absent means applicable everywhere**, so no pre-existing module changes behaviour; only the four Argentine modules are narrowed to `['AR']`.
2. A tenant's starting module set is derived from its jurisdiction via `getDefaultModulesForJurisdiction`. `NEW_TENANT_MODULES` is now that function applied to the default jurisdiction, which preserves the current Argentine set exactly.
3. `validateModuleSet` rejects a non-applicable module with `not_available_in_country:<code>`, and both the catalog payload and the module presets omit those modules so the UI never offers them.
4. The installation declares its jurisdictions through two server environment variables, read by `resolveInstallationJurisdictions` in `apps/web/src/lib/modules/jurisdictionEnv.ts`, following the `resolveDeploymentEnv` pattern — **server environment only, never tenant configuration**:
   - `BIZCODE_FISCAL_JURISDICTIONS`: jurisdictions this installation offers.
   - `BIZCODE_DEFAULT_JURISDICTION`: jurisdiction assigned to tenants created without an explicit choice.
   Unset, the behaviour is exactly the pre-#437 one: every catalog jurisdiction enabled, `AR` as default. The resolved default is always part of the enabled list, so no tenant can be created in a jurisdiction the installation rejects.
5. Every tenant creation path writes `jurisdiccionFiscal` explicitly instead of relying on the column default, through `buildNewTenantFiscalDefaults`.
6. `upsertConfig` rejects a jurisdiction outside the enabled list with `jurisdiction_not_enabled` rather than silently downgrading it, and `applyPreset` trims the preset to what is applicable in the tenant jurisdiction.
7. The public registration form picks the country among the enabled ones (`GET /api/saas/jurisdictions`), validates the tax id with `validateTaxId` for that jurisdiction, and the ARCA registry lookup runs only for `AR`.

## Consequences

- **Positive:** Adding a country becomes declarative — catalog entry, validator, provider adapter — with no new conditionals in unrelated modules.
- **Positive:** An installation deployed for a single country stops offering the rest, in both the public registration and the super-admin selector.
- **Positive:** No data migration: `jurisdiccionFiscal` already exists with default `'AR'` and existing tenants keep their value.
- **Negative:** Tenant provisioning now depends on server environment variables; a misconfigured `BIZCODE_DEFAULT_JURISDICTION` changes which modules new tenants receive. Mitigated by falling back to the previous behaviour on unset or invalid values.
- **Not evidenced:** Per-jurisdiction licensing (ADR-0007 mentions license as an activation axis; only configuration is implemented), and any real filing against a foreign tax authority — DGI, SII, SAT and NF-e remain stubs that fail explicitly.

## References

- Issue #437, Issue #207
- [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md) — dual deployment and fiscal modularity
- [legal-module-activation-by-jurisdiction.md](../quality/legal-module-activation-by-jurisdiction.md)
- [multi-country-fiscal-base.md](../quality/multi-country-fiscal-base.md)
