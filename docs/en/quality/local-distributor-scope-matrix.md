# BizCode Local — distributor scope matrix (#536)

**Purpose:** Traceable matrix of requirements → UI/API → service/model → tests → status for the **BizCode Local / distributor** program ([#535](https://github.com/ayelenleclerc/BizCode/issues/535)). Extends the pilot matrix [#450](distributor-pilot-coverage-matrix.md); does **not** replace its evidence register.

**Related:** [distributor-pilot-coverage-matrix.md](distributor-pilot-coverage-matrix.md) (#450), [local-deployment-topology.md](local-deployment-topology.md) (#537 / ADR-0029), [module-catalog-and-feature-flags.md](module-catalog-and-feature-flags.md), [product-vision-and-deployment.md](product-vision-and-deployment.md) (PROD-VISION-001 / ADR-0007), [operational-flow-order-delivery-collection.md](operational-flow-order-delivery-collection.md) (#391), [backup-and-restore.md](backup-and-restore.md).

**Baseline tip (Fase 1):** `develop` @ `104172d2` (post-#560).

## Status legend

| Status | Meaning |
|---|---|
| **verificado** | Happy path covered by integration and/or dedicated API/E2E evidence in repo |
| **parcial** | Logic/tests exist but chain incomplete for Local/distributor acceptance (e.g. PG piloto stops early) |
| **simulado** | Homologation/mock only; live external network out of scope in code |
| **pendiente** | Gap tracked under a child of #535 (or paused keep-OPEN) |

## Circuit matrix (requirement → evidence → status)

| Requirement | UI / API | Service / model | Tests / evidence | Status |
|---|---|---|---|---|
| Client create / list | UI clientes; `registerClientesRoutes` | `ClienteService` | `e2e/critical-paths.spec.ts`, `e2e/piloto-circuit.spec.ts`, `tests/integration/api.integration.test.ts`, `tests/api/contract.test.ts` | verificado |
| Articles + prices | UI artículos; `registerArticulosRoutes` | `ArticuloService`; Prisma `Articulo` | `tests/server/services/articuloService.test.ts`, integration + E2E critical-paths | verificado |
| Stock on sale / invoice | Facturación UI; factura APIs | `FacturaService`, `facturaStock` | `tests/api/factura-stock.test.ts`, `tests/integration/piloto-distribuidora-circuit.integration.test.ts` | verificado |
| Order → confirm → invoice | `/pedidos`; `registerPedidosRoutes` (`/confirm`, `/invoice`) | `PedidoService`, `pedidoStateMachine` | Piloto integration; `pedidoService.test.ts`; E2E piloto (create/confirm) | verificado |
| Order pack / ship / deliver / collect | Same pedidos routes | `PedidoService` | `tests/api/pedidos.test.ts` (HTTP/RBAC/409); **not** full pack→ship chain in piloto PG / E2E piloto | parcial |
| Delivery / collection ops docs | Pedidos / cobros UI | — | [operational-flow-order-delivery-collection.md](operational-flow-order-delivery-collection.md) | verificado (doc); ops chain see pack/ship **parcial** |
| Invoices | `registerFacturasRoutes` | `FacturaService` | `factura-stock.test.ts`, `facturaService.test.ts`, E2E critical-paths | verificado |
| Collections + current account | CC / recibos / cobros routes | `ClienteCuentaCorrienteService`, `CobroService` | Piloto integration; `cliente-cuenta-corriente.integration.test.ts`; `clientes-cuenta-corriente.test.ts`; `cobros.test.ts`; E2E cobros UI | verificado |
| Void / credit note → CC (+ stock restore) | `PUT /api/facturas/:id/void`; NC routes | `FacturaService.void`, `NotaCreditoService` | `facturas-void.test.ts`, `notas-credito.test.ts`, piloto void | verificado |
| Insufficient stock reject | Invoice create | `facturaStock` | Piloto + `factura-stock.test.ts` | verificado |
| Tenant / RLS isolation | Session tenant middleware | `tenantContext` / RLS | `tenant-isolation.test.ts`, `rls-isolation.test.ts`, integration cross-tenant | verificado |
| Admin / RBAC | SuperAdmin + domain permissions | RBAC matrix docs; logistics 403 | [rbac-matrix-roles-permissions-scopes.md](rbac-matrix-roles-permissions-scopes.md); `pedidos.test.ts` | verificado |
| Replenishment suggested qty | Replenishment APIs/UI (existing) | `replenishmentForecastMath.ts`: `ceil(velocity*lead + minimo)` — **does not** subtract on-hand or open POs | Unit math + demand-forecast docs; gap → [#543](https://github.com/ayelenleclerc/BizCode/issues/543) | parcial |
| Stock min/max fields | Artículo / depósito | Prisma `Articulo.minimo`, `StockDeposito.stockMin` / `stockMax` | Schema present; product UX/rules → [#542](https://github.com/ayelenleclerc/BizCode/issues/542) | parcial |
| Inventory reservations integrity | Pedidos / stock | Reservation paths under #541 | [#541](https://github.com/ayelenleclerc/BizCode/issues/541) | pendiente |
| ARCA CAE (AFIP) | Fiscal AR modules | `apps/server/fiscal/ar/ArcaService.ts` + `arcaWsfeMock.ts` | Homologation mock only; live → [#544](https://github.com/ayelenleclerc/BizCode/issues/544) | simulado |
| Padrón A4 | Fiscal AR | `PadronA4Service.ts` + `arcaPadronMock.ts` | Mock; live SOAP out of scope in code → [#545](https://github.com/ayelenleclerc/BizCode/issues/545) | simulado |
| Local desktop runtime (Tauri) | Tauri shell loads web | `src-tauri/src/main.rs` (`ping` only); `tauri.conf.json` — no sidecar / no Express spawn | [#539](https://github.com/ayelenleclerc/BizCode/issues/539) | pendiente |
| Local security baseline | — | — | [local-security-hardening.md](local-security-hardening.md) (#538); updater/CSP → #539; pentest → #194 | verificado (doc); residuales #539/#194 |
| Local topology (Chris / multi-site) | — | — | [local-deployment-topology.md](local-deployment-topology.md) / [ADR-0029](../adr/ADR-0029-local-deployment-topology.md); multi-site A/B **owner decision pending** | verificado (doc); decisión piloto pendiente |
| Local backups operable | Ops docs | `backup:postgres:drill` / SEC-007 | [backup-and-restore.md](backup-and-restore.md); Local-specific → [#540](https://github.com/ayelenleclerc/BizCode/issues/540) | parcial |
| Purchases / costs / promos (Local scope) | Purchases modules in preset | Domain services vary | Child issues under #535 (P1+) | pendiente |

## New-install distributor profile (no migration of existing tenants)

| Item | Evidence | Rule |
|---|---|---|
| Preset `MAYORISTA_ALIMENTOS` | `packages/types/src/modules-presets.ts` | Enables `billing.orders`, logistics (dispatches/picking), inventory (stock/warehouses/fefo), purchases, driver app, commissions, data import **on top of** `DEFAULT_MODULES` |
| New tenant defaults | `packages/types/src/modules-tenant-defaults.ts` → `NEW_TENANT_MODULES`; `buildNewTenantFiscalDefaults` in `apps/server/services/tenantProvisioningDefaults.ts` | Jurisdiction from env (`BIZCODE_DEFAULT_JURISDICTION` / `BIZCODE_FISCAL_JURISDICTIONS` in `.env.example`); persisted on `TenantConfig.modules` at `POST /setup-owner` / seed |
| Apply template | SuperAdmin `POST .../apply-template` | Explicit per-tenant action — **not** a global flag migration |
| Existing tenants | `TenantConfigService.getFeaturesForTenant` | Reads DB row; **no** automatic rewrite when Local/distributor docs land |

## Module conservation (paused / non-pilot verticals)

Do **not** delete or strip these while delivering #535 children. Shared engines (auth, tenant, stock, invoicing, modules middleware) remain consumers.

| Area | Keep-OPEN / docs | Shared consumers (examples) |
|---|---|---|
| Pharmacy / OS / libro | #204, #252 (paused amplification) | `vertical.pharmacy` routes/tests; OpenAPI farmacia; Prisma OS tables |
| FCEM MiPyME | #239 | `tests/api/fcem.test.ts`; ADR-0028 mock |
| Pre-commercial security | #194 | ZAP / readiness docs |
| Export / regional verticals | #206–#211 (as listed in program) | Domain modules gated by catalog keys |
| Pilot commercial gates | #197 | SLA / DR docs |

## Decisions vs independent engineering

| Needs business / credential decision | Can proceed in-repo without live credentials |
|---|---|
| Live AFIP WSFE / Padrón (#544/#545) | Mock homologation already in tree |
| Windows installer UX / signing (#539) | Document Tauri gap; topology (#537); security local (#538) |
| Multi-site sync policy (Chris) | Document current single-process Local gap (#537) |
| Commercial go-live gates (#194/#197) | Matrix statuses + child issues |

## Next P0 children (after this matrix)

Ordered as in #535: **#537** topology → **#538** local security → **#539** Windows installer → **#540** backups → **#541** inventory reservations → **#542** min/max → …

## Commands (revalidation)

```bash
pnpm run test
pnpm run test:integration -- tests/integration/piloto-distribuidora-circuit.integration.test.ts
pnpm run test:e2e -- e2e/piloto-circuit.spec.ts e2e/smoke.spec.ts
pnpm run check:docs-map
```

## Other languages

[Español](../../es/quality/matriz-alcance-local-distribuidora.md) · [Português (Brasil)](../../pt-br/quality/matriz-escopo-local-distribuidora.md)
