# Legal module activation by fiscal jurisdiction (#437)

**Scope:** how BizCode decides which legal modules a tenant may use, and how an installation declares the countries it serves.

**Related:** [ADR-0022](../adr/ADR-0022-legal-module-activation-by-jurisdiction.md) · [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) · [multi-country-fiscal-base.md](multi-country-fiscal-base.md)

---

## Two independent decisions

| Decision | Where it lives | Who sets it |
|---|---|---|
| Which countries this installation serves | `BIZCODE_FISCAL_JURISDICTIONS`, `BIZCODE_DEFAULT_JURISDICTION` (server environment) | Whoever deploys the installation |
| Which country a tenant is taxed in | `TenantConfig.jurisdiccionFiscal` | Registration form, or super-admin |
| Which modules that tenant may enable | `ModuleDef.availableForCountries` (catalog) | The catalog, per module |

Jurisdiction is read from the server environment only, never from tenant configuration, following the same rule as `resolveDeploymentEnv`.

## Declaring applicability in the catalog

`ModuleDef.availableForCountries` lists the jurisdictions where a module is legally applicable. **Omitting it means the module applies everywhere**, so declaring the property is what narrows a module:

```ts
'billing.arca_cae': {
  label: 'ARCA CAE',
  required: false,
  requiredInProd: false,
  requiredInProdForCountries: ['AR'],
  availableForCountries: ['AR'],
  dependencies: ['core.invoicing'],
  plan: 'starter',
  price: 0,
},
```

Today four modules are narrowed to `['AR']`: `billing.arca_cae`, `finance.retenciones`, `fiscal.remito` and `fiscal.cheques`.

Note the difference from `requiredInProdForCountries`, introduced in #207: that one says where a module is **mandatory in production**, this one says where it is **applicable at all**. A module can be applicable and still optional.

### What applicability enforces

- `getDefaultModulesForJurisdiction(code)` filters `DEFAULT_MODULES`, so a tenant taxed outside Argentina does not start with the Argentine modules.
- `validateModuleSet` returns `not_available_in_country:<code>` when a non-applicable module is active.
- `buildModuleCatalogPayload` omits those modules, and trims the presets, so the super-admin UI never offers them.
- A non-applicable module is never treated as required, so production validation does not demand a module the tenant cannot use.

## Declaring the jurisdictions of an installation

```bash
# Jurisdictions this installation offers. Unset: every catalog jurisdiction.
BIZCODE_FISCAL_JURISDICTIONS=AR,UY
# Jurisdiction for tenants created without an explicit choice. Unset: AR.
BIZCODE_DEFAULT_JURISDICTION=AR
```

`resolveInstallationJurisdictions` (`apps/web/src/lib/modules/jurisdictionEnv.ts`) applies these rules:

- Values are trimmed, upper-cased and de-duplicated; unknown codes are ignored.
- If nothing valid survives, every catalog jurisdiction is enabled — the behaviour prior to #437.
- An explicit default is always forced into the enabled list; when `AR` is not enabled, the default becomes the first enabled jurisdiction. The resolved default is therefore always enabled.

Supported codes come from `FISCAL_JURISDICTION_CODES`: `AR`, `UY`.

## Effect on tenant creation

Every path that creates a tenant writes `jurisdiccionFiscal` explicitly through `buildNewTenantFiscalDefaults` (`apps/server/services/tenantProvisioningDefaults.ts`) instead of relying on the `'AR'` column default:

| Path | File |
|---|---|
| Public SaaS registration | `apps/server/saas/SaasOnboardingService.ts` |
| First owner setup | `apps/server/auth.ts` (`setup-owner`) |
| Super-admin tenant creation | `apps/server/services/SuperadminTenantService.ts` |
| Config created on demand | `apps/server/services/TenantConfigService.ts`, `apps/server/services/SellerAlertService.ts` |
| Seeds | `prisma/seedSuperAdmin.ts`, `scripts/seed-staging.ts` |

## Effect on the interfaces

- **Public registration** (`apps/web/src/pages/saas/RegistroPage.tsx`): country selector fed by `GET /api/saas/jurisdictions`, hidden when the installation offers a single jurisdiction. The tax-id label follows the jurisdiction's `taxIdKind` and the field carries `data-tax-id-kind`.
- **Registration backend**: validates with `validateTaxId` for the chosen jurisdiction, rejects a disabled one with `JURISDICTION_NOT_ENABLED`, and performs the ARCA registry lookup only for `AR`.
- **Super-admin** (`TenantModulesPage.tsx`): the jurisdiction selector offers the enabled ones, plus the tenant's current value so an existing configuration is never silently rewritten. `GET /api/me/features` reports them in `jurisdiccionesHabilitadas`.
- **`upsertConfig`**: rejects a disabled jurisdiction with `jurisdiction_not_enabled`; `applyPreset` trims the preset to what is applicable.

## Out of scope

No real filing against any tax authority is implemented. DGI (Uruguay), SII (Chile), SAT (Mexico) and NF-e (Brazil) require a digital certificate and homologation, and remain stubs that fail explicitly. Per-jurisdiction licensing, mentioned as an activation axis in ADR-0007, is not implemented: activation is by configuration only.

## Evidence

| Aspect | Test |
|---|---|
| Catalog applicability, derived defaults, rejection and payload filtering | `tests/lib/modules-availability.test.ts` |
| Environment resolution and its fallbacks | `tests/lib/jurisdictionEnv.test.ts` |
| Registration by jurisdiction | `tests/server/saasOnboardingService.test.ts` |
