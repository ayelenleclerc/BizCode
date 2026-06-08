# Changelog

All notable changes to BizCode are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added

- **Purchase order supplier catalog snapshot and PDF (GitHub #323):** `OrdenCompraItem.codigoProveedor` and `descripcionProveedor` snapshot from active `ProveedorArticulo` on create/update; `GET /api/compras/{id}/pdf` printable order with supplier header and catalog columns (fallback to internal article fields); Purchasing UI line table, catalog prefill, comparator prefill extension, and **Download PDF**; OpenAPI, tests, trilingual manuals.

- **Keyboard accessibility (screens):** reusable hooks (`useListPageKeyboard`, `KeyboardHint`) and visible shortcut hints on lists, forms, finance, logistics, login, and home; policy updated in `docs/*/accessibility.md` (Enter open/edit).

### Changed

- **AFIP → ARCA rename (breaking):** `/api/arca/*` routes, `billing.arca_cae` module, `arcaAPI` client, `ArcaService`, `arca:retry-pending*` scripts; Prisma migration `20260608120000_arca_module_rename`; empresa/finanzas i18n; ADR-0014 slug `legal-arca-invoice-pdf`. Literal portal URLs (`afip.gob.ar`) kept in QR/PDF payloads.

- **Supplier price comparator (GitHub #274):** `ArticuloProveedoresComparadorService`; `GET /api/articulos/{id}/proveedores` and `GET /api/proveedores/comparar?articuloId=` (module `logistics.purchases`, `products.read` or `suppliers.read`); active supplier catalog rows with list price, stale-price flag (>30 days), and last **received** purchase-order date; **View suppliers** on the product profile with sort, cheapest-row highlight, stale-price indicator, and **[PO]** (`suppliers.manage`) pre-filling the purchase-order form; OpenAPI, tests, trilingual manuals.

- **Supplier product catalog (GitHub #273):** `ProveedorArticulo` model and migration; `GET/POST /api/proveedores/{id}/catalogo`, `PUT .../catalogo/{articuloId}`, `POST .../catalogo/import` (module `logistics.purchases`); per-supplier codes, descriptions, list prices and CSV import; **Catalog** tab on supplier profile with price-age indicators; audit `proveedor_catalogo_*`; OpenAPI, tests, trilingual manuals.

- **Supplier purchase history (GitHub #272):** `GET /api/proveedores/{id}/historial` and `GET /api/proveedores/{id}/articulos` with rolling periods (30/90/180/365 days); metrics from received purchase orders and purchase vouchers (total, frequency, top items, WAP/PPP); **History** tab on supplier profile; OpenAPI, tests, trilingual manuals.

- **Supplier payable due-date alerts (GitHub #275):**** optional `vencimiento` on `ComprobanteCompra`; `AlertaProveedorConfig` + `AlertaProveedorLog`; `GET /api/proveedores/facturas-pendientes`, `GET/PATCH /api/configuracion/alertas-proveedores`; daily job `scripts/proveedor-alertas-job.ts`; dashboard and Finanzas UI; credit-limit in-app trigger on voucher create; OpenAPI, tests, trilingual manuals.

- **Supplier payment receipts (GitHub #271):** `ReciboPago` + `ReciboPagoFactura`; `GET/POST /api/proveedores/{id}/pagos`, pending-voucher helper, void endpoint, PDF download; automatic `pago` ledger movement; UI in accounts-payable tab; module `finance.receipts`; OpenAPI, tests, trilingual manuals.

- **Supplier accounts payable ledger (GitHub #270):** `MovimientoProveedorCC` running balance; `GET/POST` under `/api/proveedores/{id}/cuenta-corriente`; automatic movement on purchase voucher create; UI tab with balance, credit-limit alert, 6-month chart, audited manual adjustment; OpenAPI, tests, trilingual manuals.
- **Supplier full profile (GitHub #269):** extended `Proveedor` model (banking, commercial, contact); `GET /api/proveedores` filters `activo`/`categoria`; `DELETE /api/proveedores/{id}` logical deactivate; CBU/CUIT validation; Suppliers UI with collapsible sections; trilingual user manuals and OpenAPI.

- **Libro IVA Compras (GitHub #306):** `ComprobanteCompra` model for supplier fiscal vouchers; `POST /api/comprobantes-compra`; `GET /api/contabilidad/libro-iva-compras` (`reports.financial.read`, module `finance.ledger`) with `format=preview|txt|xlsx` (ZIP `CBTU.txt` + `ALICUOTAS.txt`); Finanzas purchases export section; ADR-0014; OpenAPI and tests (EN/ES/PT-BR).

- **Optional POS printing (hardware opt-in):** `THERMAL_PRINTER_ENABLED` (default off) mirrors fiscal opt-in; `GET /api/printing/status` exposes `thermalPrinterEnabled`; invoice print falls back to legal PDF when devices are disabled; billing UI hides fiscal/thermal actions unless enabled; trilingual [optional-pos-printing.md](en/quality/optional-pos-printing.md). Physical drivers remain optional per customer (GitHub #153 phase 2).

- **Log sanitization hardening (GitHub #218):** extended `LOGGER_REDACT_PATHS` catalog in [`server/logRedaction.ts`](../../server/logRedaction.ts), documented log-surface audit and retention/access policy (EN/ES/PT-BR), and `npm run check:logs` guardrail integrated into `docs:validate`. Complements #151 without duplicating observability MVP scope.

- **HTTP security headers (GitHub #214):** `helmet` middleware on the REST API ([`server/middleware/securityHeaders.ts`](../../server/middleware/securityHeaders.ts)) with `X-Frame-Options: DENY`, `X-Content-Type-Options`, CSP, `Referrer-Policy`, and HSTS in production; tests in [`tests/server/security-headers.test.ts`](../../tests/server/security-headers.test.ts). CORS remains env-driven via `CORS_ORIGINS` (existing credentialed SPA behavior).

- **Observability MVP baseline (GitHub #151):** structured server logging with Pino redaction (`password`, `token`, `authorization`, `cookie`, `session`, `secret`, `privateKey`, `certificate`), request correlation via `X-Request-Id`, in-memory technical metrics endpoint `GET /api/metrics` protected with `audit.read`, additive `/api/health` diagnostics (DB check + latency, uptime, version), OpenAPI contract/tests updates, and trilingual observability documentation. External stacks (Prometheus/Grafana/Loki/Datadog/Sentry) and real alerts remain out of scope.

- **Production Docker + deploy workflow baseline (GitHub #149):** added `Dockerfile` (backend), `Dockerfile.frontend` (Vite build + Nginx runtime), `docker-compose.prod.yml` (server + frontend + PostgreSQL with health checks), internal Nginx API proxy config (`deploy/nginx/default.conf`), `.dockerignore`, deploy-ready env reference updates in `.env.example`, and GitHub Actions workflow `.github/workflows/deploy.yml` with always-on build/test + conditional GHCR publish and conditional SSH deploy (requires repository secrets). Production host/domain/certificate values remain external configuration.

- **Legal AFIP invoice PDF (GitHub #148):** `GET /api/facturas/{id}/pdf` (legal fiscal PDF, requires issued CAE), `/pdf/preview` (non-fiscal watermark), `/ticket` (80mm operational; non-fiscal without CAE); RG 4291-aligned layout, AFIP QR and Interleaved 2 of 5 barcode (`bwip-js`); `ParamEmpresa` issuer fields (`condicionIva`, `ingresosBrutos`, `fechaInicioActividades`); billing UI PDF preview/print modal; ADR-0014; OpenAPI and tests. Manual AFIP portal validation pending.

- **Libro IVA Ventas — Fase 1 (GitHub #147):** `GET /api/contabilidad/libro-iva-ventas` (`reports.financial.read`, module `finance.ledger`) exports sales book from persisted `Factura` fields; `format=preview|txt|xlsx` (ZIP with `CBTV.txt` + `ALICUOTAS.txt`); credit notes and void tipo `999` per ADR-0013; **Finanzas** accounting section; **Libro IVA Compras out of scope** (follow-up issue). OpenAPI, tests, manuals (EN/ES/PT-BR).

- **Invoice void and credit notes (GitHub #146):** `PUT /api/facturas/{id}/void` (`sales.cancel`, module `billing.credit_notes`, reason min. 10 chars) returns updated invoice, issued `NotaCredito`, and customer balance; `GET /api/notas-credito`, `GET /api/notas-credito/{id}` (`reports.financial.read` or `reports.operational.read`); AFIP credit-note flow per ADR-0012; **Finanzas** lists credit notes by date range (UI under module); **Facturación** void action gated on `billing.credit_notes`; OpenAPI, tests (`notas-credito`, `facturas-void`), manuals and specs (EN/ES/PT-BR).

- **Logistics KPIs and reports (GitHub #145):** `OrdenEntrega.dispatchedAt` / `dispatchTimestampSource` (ADR-0011); `GET /api/logistica/kpis`, `reporte-choferes`, `reporte-zonas` (`logistics.read`, module `logistics.dispatches`, DB aggregates); **Reportes** tab on `/logistica` with KPI cards, driver ranking, zone table, CSV export; i18n, OpenAPI, tests, manual (EN/ES/PT-BR).

- **Real-time GPS tracking (GitHub #144):** `RepartoUbicacion` model; `POST /api/repartos/{id}/ubicacion` (`orders.deliver.confirm`, driver on own `on_route` route, `logistics.gps` module); `GET /api/repartos/activos` and `GET .../ubicacion/ultima` (`logistics.read`, roles `owner`/`manager`/`logistics_planner`); purge locations older than 7 days; UI `/logistica/seguimiento` (Leaflet map, 60 s polling); driver app posts position every 2 min (optional if geolocation denied); `npm run reparto-ubicacion:purge` script; OpenAPI, tests, and manual (EN/ES/PT-BR).

- **Warehouse picking (GitHub #143):** `picking` / `ready` / `cancelled` on `OrdenEntrega`; `pickerUserId`, `pickingIniciadoAt`, `pickingListoAt`; `POST /api/ordenes-entrega/{id}/iniciar-picking` and `POST .../lista` (`orders.pick`, `logistics.picking` module); `GET /api/ordenes-entrega` also with `orders.pick`; routes (#140) only accept `ready` OEs; UI `/logistica/picking`; OpenAPI, tests, and manual (EN/ES/PT-BR).

- **Delivery proof (POD) on route items (GitHub #142):** `RepartoItem` fields for recipient, notes, `motivoNoEntrega`, and `podMedia` JSON; `PUT /api/repartos/{id}/items/{itemId}` (`orders.deliver.confirm`, driver on own `on_route` route) and `GET .../pod` (`logistics.read`, roles `owner`/`manager`/`logistics_planner` only); list/detail expose `hasPod` without blobs; driver UI `/logistica/repartos/chofer` (module `logistics.pod`, 4-step wizard with signature/photo limits); back-office POD badge and view dialog; OpenAPI, tests, and logistics manual (EN/ES/PT-BR).

- **Delivery routes / repartos (GitHub #140):** `Reparto` / `RepartoItem` models; API `GET/POST /api/repartos`, `GET /api/repartos/{id}`, `POST .../iniciar`, `POST .../cerrar`; read `logistics.read`, mutations `orders.dispatch`; groups pending delivery orders, start route (`on_route`), close marks pending items `not_delivered` and OEs `failed`; UI `/logistica/repartos` (module `logistics.dispatches`, drag-and-drop route sequence); OpenAPI, tests, and logistics manual (EN/ES/PT-BR).

- **Advanced dashboard analytics (GitHub #138):** `GET /api/dashboard/ventas-historico` (PostgreSQL aggregation, JSON + CSV); **Inicio** tab **Analytics** with line/bar/pie charts (recharts), date presets (30/90/365 days), seller and delivery-zone filters; requires `reports.operational.read` and module `analytics.advanced`; index `Factura_tenantId_estado_fecha_idx`; OpenAPI, tests, and reports manual (EN/ES/PT-BR).

- **Physical inventory count (GitHub #136):** `Recuento` / `RecuentoItem` models; API `GET/POST /api/recuentos`, `GET /api/recuentos/{id}`, `PUT .../items`, `POST .../close`, `GET .../pdf`; permission `inventory.count`; stock block `RECUENTO_IN_PROGRESS` on adjustments, purchase receipt, and invoice stock; UI `/recuentos` (module `inventory.count`); OpenAPI, tests, and logistics manual (EN/ES/PT-BR).

- **DBF customer migration (GitHub #51):** `npm run migrate:dbf` imports customers from `CLIENTES.DBF` when the file exists with rows (`legacyClienteDbf.ts`, `clienteBodySchema`, rejection report); placeholders `91001`–`91010` only without a populated master; see [DBF migration testing](guides/dbf-migration-testing.md) and `scripts/MIGRACION_PROGRAMA_VIEJO.md`. Bulk load in the app uses CSV import (#58).

- **SaaS plans and per-tenant limits (GitHub #181):** `Plan` / `TenantPlan` models; `GET /api/planes`, `GET /api/me/plan`, `POST /api/superadmin/tenants/:id/plan`; `requirePlanFeature`; limits on `POST /api/users` and `POST /api/facturas`; `PlanProvider`, `PlanGate`, SuperAdmin plan selector; i18n EN/ES/PT-BR.

- **SuperAdmin module pricing and trials (GitHub #226):** `GET /api/superadmin/tenants/:id/pricing`, `GET/POST/DELETE .../trials`; `TenantModuleTrial` model; `src/lib/modules/pricing.ts`, `TenantPricingService`, `TenantTrialService`; `npm run modules:trial-expire`; notification type `module_trial_expiring`; pricing/trial UI on `/superadmin/tenants/:id/modules`; OpenAPI and API tests; i18n EN/ES/PT-BR (billing sync deferred to #181).

- **SuperAdmin modules UI (GitHub #225):** `/superadmin/tenants/:id/modules` page with toggles, required change reason, presets, and history; `superadminAPI` config client and `modulesCatalogAPI` in `src/lib/api.ts`; `TenantModulesPage.test.tsx`; i18n `common.superadmin.modules.*` (EN/ES/PT-BR).

- **SuperAdmin multi-tenant panel (GitHub #137):** API `GET/POST/PATCH /api/superadmin/tenants`, `GET /api/superadmin/tenants/:id`, `GET /api/superadmin/stats` with `requireSuperAdmin` and `platform.tenants.manage`; `SuperadminTenantService`; UI `/superadmin` (list, detail, suspend/reactivate) and modules placeholder link (`#225`); OpenAPI and `tests/api/superadmin-tenants.test.ts`; i18n EN/ES/PT-BR under `common.superadmin.*`.

- **Frontend feature flags (GitHub #224):** `FeatureFlagsContext` / `useFeatureFlags`; `GET /api/me/features` via `featuresAPI`; `IfModule`, `ModuleRoute`, `FeatureFlagsGate`; conditional nav and routes (`navSections.ts`, `Layout`, `App.tsx`); accessible alert on `/inicio`; i18n `modules.*`; tests in `FeatureFlagsContext.test.tsx`, `IfModule.test.tsx`, `Layout.nav-modules.test.tsx`.

- **Per-tenant feature flags (GitHub #223):** `TenantConfig` / `TenantConfigHistory` models; `GET /api/me/features`; `requireModule` middleware (e.g. `billing.orders` on `/api/pedidos`); SuperAdmin `GET/PUT /api/superadmin/tenants/:id/config`, history, and `POST .../apply-template`; `TenantConfig` on `setup-owner` and seed; in-process cache (no Redis); i18n `errors.moduleNotEnabled`; tests in `tests/api/me-features.test.ts`, `tests/api/superadmin-tenant-config.test.ts`, `tests/server/require-module.test.ts`.

### Fixed

- **Collections filters (a11y):** `/cobros` filter inputs use visible labels plus `aria-label` / placeholder so static HTML analyzers associate controls; [`src/pages/cobros/index.tsx`](../../src/pages/cobros/index.tsx).

- **CORS + session cookie:** Express `cors` now uses `credentials: true` and an origin allowlist (`http://localhost:5173`, `http://127.0.0.1:5173`, plus comma-separated `CORS_ORIGINS`) so the SPA (Axios `withCredentials`) can receive and send session cookies across origins; [`server/createApp.ts`](../../server/createApp.ts), [`.env.example`](../../.env.example), [`tests/server/cors.test.ts`](../../tests/server/cors.test.ts); [security.md](security.md) updated.

### Added

- **Purchase orders (GitHub #135):** `OrdenCompra` + `OrdenCompraItem`; CRUD `/api/compras`, `POST .../send`, `POST .../receive` (partial receipt → `StockAjuste` motivo `compra`); UI `/compras`; RBAC `suppliers.read` / `suppliers.manage` + `inventory.adjust` on receive; i18n EN/ES/PT-BR.
- **Overdue reminders (GitHub #134):** `CobroRecordatorio` model; per-tenant reminder settings on `ParamEmpresa` (`recordatorioDiasGracia`, IANA `timezone`, business-hour window `recordatorioHoraInicio` / `recordatorioHoraFin`) editable under **Settings → Company**; `GET /api/cobranzas/vencidas` and `POST /api/cobranzas/recordatorios` (`reports.financial.read`); `CobranzasService` with tenant-local 08:00 slot and business window; multi-tenant `npm run cobranzas:recordatorios` (hourly cron `0 * * * *` recommended); enriched `invoice_overdue` notifications; overdue section on `/finanzas`; audit `cobranza_recordatorio_send`; i18n EN/ES/PT-BR.
- **AFIP CAE (GitHub #133):** `GET /api/arca/config` (metadata only), invoice PDF (`GET /api/facturas/:id/pdf`, preview with watermark), CAE badges and retry in billing UI, AFIP section on company settings (`billing.arca_cae`), homologación WSFE mock, `npm run arca:retry-pending-job` (cron `*/5`), i18n EN/ES/PT-BR.
- **Commercial orders (GitHub #132):** `Pedido` / `PedidoItem` models; `GET/POST/PUT/DELETE /api/pedidos` plus `POST .../confirm` and `POST .../invoice` (ADR-0009 English states and paths); RBAC `orders.create` / `sales.create` / `sales.cancel`; audit actions `pedido_*`; `/pedidos` list UI; i18n EN/ES/PT-BR. Module gating: `requireModule('billing.orders')` (#223).

- **Legacy DBF catalog migration (GitHub #131):** Parsers `legacyRubroDbf.ts` / `legacyArticuloDbf.ts`; `POST /api/rubros/migrate-dbf` and `POST /api/articulos/migrate-dbf` (`settings.business.manage`, upsert by codigo); `npm run migrate:dbf` imports `RUBROS.DBF` / `ARTICULOS.DBF` when present (fallback to `PVAR2`/`PVAR`); integration fixtures and tests.

- **Stock adjustments (GitHub #128):** `StockAjuste` model and migration; `POST /api/articulos/:id/stock-ajuste` (`inventory.adjust`) and `GET /api/articulos/:id/stock-historial`; invoice create decrements stock and emits `stock_below_minimum` notifications; audit `stock_adjust`; i18n EN/ES/PT-BR.

- **Documentation (ISO-ready sync):** Specs package v0.2 (FR-011–FR-015, UC/US/TC); user manuals for collections, finance, reports, logistics (EN/ES/PT-BR); operational flow MVP table updated; ISO traceability and stubs REQ-007, TST-003, TST-005, ARC-004; TypeDoc post-process [`scripts/patch-typedoc-html-noopener.mjs`](../../scripts/patch-typedoc-html-noopener.mjs) in `docs:typedoc`; [`DOCUMENT_LOCALE_MAP.md`](../DOCUMENT_LOCALE_MAP.md).
- **Company settings (GitHub #127):** Tenant-scoped `ParamEmpresa` with `GET/PUT /api/empresa`; `puntoVenta` drives 4-digit `prefijoFactura`; settings UI at `/configuracion/empresa` (`settings.business.manage` to edit); new invoice form prefills prefix and default type; i18n EN/ES/PT-BR.
- **Payment score (GitHub #130):** Automatic `Cliente.score` recalculation on `POST /api/cobros` using days past due vs oldest active invoice (+5 / −3 / −7 / −15); no change without active invoice; audit `metadata` with `scoreBefore`, `scoreAfter`, `delta`; response includes `updatedCliente`; score tooltip on customer form; i18n EN/ES/PT-BR.
- **Delivery orders (GitHub #126):** `OrdenEntrega` model and migration; `GET/POST/PUT /api/ordenes-entrega` with RBAC (`logistics.read` / `orders.create` / `orders.dispatch` / `orders.deliver.confirm`); driver-scoped list; audit on state changes including `entrega_confirmed`; `/logistica` planner and driver UI; i18n EN/ES/PT-BR.
- **Reports (GitHub #129):** Operational reports at `/reportes` — `GET /api/reportes/ventas`, `GET /api/reportes/stock-critico`, `GET /api/reportes/cobranzas` with JSON or `Accept: text/csv` export; permissions `reports.operational.read` / `reports.financial.read`; i18n EN/ES/PT-BR.
- **Finance (GitHub #125):** Real `/finanzas` module — `GET /api/reportes/aging` and `GET /api/reportes/cuenta-corriente/:clienteId` (AR aging by `creditDays`, account statement with running balance); dashboard `facturasVencidas` uses the same due-date rule; i18n EN/ES/PT-BR.

- **Collections (GitHub #124):** Customer payment registration — `Cobro` model, REST API (`POST/GET /api/cobros`), `/cobros` UI, recent payments on the customer form, dashboard `cobrosHoy` widget wired to real data; i18n EN/ES/PT-BR.

- **Backend (GitHub #79):** CSV bulk import uses the same Zod `*BodySchema` instances as REST JSON bodies (`safeParseBodySchema` in [`server/schemas/domain.ts`](../../server/schemas/domain.ts)); PostgreSQL **CHECK** constraints on `Articulo.stock`, `Articulo.minimo`, and `Cliente.creditLimit` (migration `prisma/migrations/20260505130000_nonneg_entity_checks`); developer docs in [coding-standards.md](coding-standards.md) (EN/ES/PT-BR per [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md)) and [`.cursor/rules/backend-standards.mdc`](../../.cursor/rules/backend-standards.mdc); user manuals note field-level import errors.
- **User management (issue #25):** `GET/POST /api/users`, `PUT /api/users/:id`, `POST /api/auth/change-password`; Users page (`src/pages/users/`) with DataTable + create/edit modal, keyboard shortcuts (F2/F3/F5/Esc), role hierarchy enforcement; `<CanAccess permission="..." />` utility component for permission-aware rendering; sidebar link visible only to `users.manage` holders; i18n in EN/ES/PT-BR; 17 new integration tests; OpenAPI paths and schemas updated; trilingual docs in `docs/*/quality/`.
- **Plan approval archival workflow:** new `npm run plan:approve -- --plan <file>` command archives approved plans into `.cursor/plans/{timestamp}-{slug}.plan.md` and then executes the existing `plan:sync` GitHub Issues/Project v2 flow; `plan:sync` remains available for direct/manual sync.
- **Authentication UX + secure bootstrap:** login screen with route guard/logout wired to `/api/auth/login|me|logout`, cookie session support in [`src/lib/api.ts`](../../src/lib/api.ts), auth provider in [`src/auth/AuthProvider.tsx`](../../src/auth/AuthProvider.tsx), and super-admin bootstrap command `npm run bootstrap:superadmin` (password from `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD`, no hardcoded credential) via [`scripts/bootstrap-superadmin.ts`](../../scripts/bootstrap-superadmin.ts).
- **Product vision & governance:** trilingual [product-vision-and-deployment.md](quality/product-vision-and-deployment.md) (PROD-VISION-001) · [es](../es/quality/vision-producto-y-despliegue.md) · [pt-BR](../pt-br/quality/visao-produto-e-implantacao.md); [ADR-0007](adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) (desktop/SaaS + fiscal modularity); [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) row; [AGENTS.md](../../AGENTS.md) and [`.cursor/rules/product-vision.mdc`](../../.cursor/rules/product-vision.mdc); [iso-traceability.md](certificacion-iso/iso-traceability.md) matrix; architecture cross-links
- **Documentation (ISO package):** [Certificación-ISO/README.md](../../Certificación-ISO/README.md) as repository entry point; QMS manual, ISO traceability matrix, records templates, and document lifecycle under `docs/{en,es,pt-br}/certificacion-iso/` (single source of truth); [iso-package-index.md](certificacion-iso/iso-package-index.md) (ISO-PKG-001); stubs in [`docs/quality/`](../quality/); testing strategy / CI/CD / Swagger plan remain under `docs/*/quality/`; **SBOM:** `@cyclonedx/cyclonedx-npm`, `npm run sbom:generate` → [`docs/evidence/sbom-cyclonedx.json`](../evidence/sbom-cyclonedx.json) (SBOM-001), [`docs/evidence/README.md`](../evidence/README.md)
- **API:** **Swagger UI** at `http://localhost:3001/api-docs/` (`swagger-ui-express`, [`server/createApp.ts`](../../server/createApp.ts), OpenAPI from [`openapi.yaml`](../api/openapi.yaml)); [`tests/api/swagger-ui.test.ts`](../../tests/api/swagger-ui.test.ts); `yaml` runtime dependency; `info.description` in OpenAPI updated for `/api-docs`
- **Documentation:** trilingual **Swagger / OpenAPI UI implementation plan** (version **1.0.0**): [swagger-openapi-ui-plan.md](quality/swagger-openapi-ui-plan.md) · [es](../es/quality/plan-swagger-openapi-ui.md) · [pt-BR](../pt-br/quality/plano-swagger-openapi-ui.md); [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) updated; [`.cursor/rules/bizcode.mdc`](../../.cursor/rules/bizcode.mdc) (API contract subsection), [AGENTS.md](../../AGENTS.md), [CONTRIBUTING.md](../../CONTRIBUTING.md); `.cursor/plans/` gitignored (canonical copy under `docs/`); [iso-traceability.md](certificacion-iso/iso-traceability.md) matrix row
- **Toolchain:** Node **22 LTS** in CI (`.github/workflows/*.yml`), [`.nvmrc`](../../.nvmrc), `engines` in [`package.json`](../../package.json) (**≥ 22**); [`.npmrc`](../../.npmrc) `legacy-peer-deps` so `npm ci` matches ESLint 10 + jsx-a11y
- **Generated documentation:** `npm run docs:generate` — TypeDoc → `docs/generated/typedoc/`, `@scalar/openapi-to-markdown` → [`openapi-reference.generated.md`](../api/openapi-reference.generated.md), `@adobe/jsonschema2md` (schemas extracted from OpenAPI) → `docs/generated/schema-md/`, `sbom:generate` → [`sbom-cyclonedx.json`](../evidence/sbom-cyclonedx.json); CI runs `docs:generate` then `git diff` on generated paths; trilingual [generated-documentation.md](quality/generated-documentation.md); [`.cursor/rules/doc-generation.mdc`](../../.cursor/rules/doc-generation.mdc)
- **Dependencies:** **Vite 6**, `@vitejs/plugin-react` 5.x, **Prisma 5.22**; `@types/node` 22; remaining npm audit noise limited to packages bundled inside the `npm` CLI (development tooling only)
- **ADR-0005** — [Vitest coverage for `server.ts`](adr/ADR-0005-vitest-coverage-server-bootstrap.md): refactor bootstrap (`createServerInstance`, `bindHttpServer`, `startServer`), entry `server/main.ts`, `tests/server/server.test.ts`; `coverage.include` updated
- **ADR-0006** — [Optional CI: semantic-release + Tauri self-hosted](adr/ADR-0006-release-and-tauri-ci-workflows.md): `npm audit` informational in CI; `release.config.cjs` + `release.yml`; `tauri-selfhosted.yml` (`workflow_dispatch`)
- **CI:** non-blocking `npm audit --audit-level=high` after `npm ci`
- **Trilingual JSDoc** on `calculateInvoice`, `calculateItemSubtotal`, and module header in [`src/lib/invoice.ts`](../../src/lib/invoice.ts); `createApp` in [`server/createApp.ts`](../../server/createApp.ts)
- **ADR-0004** — [Playwright E2E smoke + integration roadmap](adr/ADR-0004-e2e-playwright-integration-roadmap.md): `e2e/smoke.spec.ts`, `playwright.config.ts`, CI installs Chromium and runs `npm run test:e2e`; Vitest excludes `e2e/**`; **Phase B:** `tests/integration/`, `npm run test:integration`, `vitest.integration.config.ts`; CI runs `prisma migrate deploy` then integration tests (real Prisma; contract tests still mock Prisma)
- **Document lifecycle & validation** (quality): [document-lifecycle-and-validation.md](certificacion-iso/document-lifecycle-and-validation.md); `npm run check:docs-map` validates paths in [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); CI runs the check after i18n parity
- **Trilingual JSDoc** example on `validateCUIT` in [`src/lib/validators.ts`](../../src/lib/validators.ts) (see [coding-standards.md](coding-standards.md))
- **Documentation locale filenames (phase 3):** product/quality Markdown under `docs/en/`, `docs/es/`, and `docs/pt-br/` use **localized file names** per tree; canonical mapping in [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); ADR files keep the **same technical slug** in each locale
- **ISO-ready MVP specs** under [`specs/`](specs/index.md): technical manual index, functional/non-functional requirements, use cases, user stories and acceptance criteria, manual test cases (TC-001–TC-010), traceability matrix — content **evidence-based only**; mirrored in [`../es/specs/`](../es/specs/indice.md) and [`../pt-br/specs/`](../pt-br/specs/indice.md); [`iso-traceability.md`](certificacion-iso/iso-traceability.md) updated
- Cursor project rules: [`.cursor/rules/bizcode.mdc`](../../.cursor/rules/bizcode.mdc) (always-on), [`.cursor/rules/bizcode-documentation.mdc`](../../.cursor/rules/bizcode-documentation.mdc) (`docs/**`); [AGENTS.md](../../AGENTS.md) and [CONTRIBUTING.md](../../CONTRIBUTING.md) require compliance; trilingual JSDoc convention in [coding-standards.md](coding-standards.md)
- UI theme documentation: [theming.md](theming.md) (Tailwind `darkMode: 'class'`, classes on `<html>`, script in `index.html`, `localStorage`); references in [architecture.md](architecture.md) and [coding-standards.md](coding-standards.md)
- Product and quality documentation in **English**, **Spanish**, and **Brazilian Portuguese** under `docs/en/`, `docs/es/`, `docs/pt-br/`; hub [README.md](../README.md), policy [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md); root `docs/*.md` stubs redirect to locales
- Vitest 4 unit test infrastructure with V8 coverage (100% on `src/lib/**`)
- ESLint 10 flat config with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`
- react-i18next internationalization: Spanish (default), English, Brazilian Portuguese
- Automated i18n parity check script (`scripts/check-i18n.ts`)
- GitHub Actions CI pipeline: type-check → lint → test+coverage → i18n parity
- WCAG 2.2 AA accessibility: `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-required`, `aria-describedby`, `role="alert"`, `data-testid` on primary buttons
- Full documentation corpus: README, CONTRIBUTING, ADRs, OpenAPI spec, quality manuals, user manuals

### Changed

- **Security / developer setup:** [`.env.example`](../../.env.example) no longer ships sample database credentials or a default seed password literal; `npx prisma db seed` **requires** `BIZCODE_SEED_SUPERADMIN_PASSWORD` in `.env` (≥ 8 characters). See [security.md](security.md), [superadmin-bootstrap-and-rbac.md](quality/superadmin-bootstrap-and-rbac.md), and [README.md](../../README.md).
- Documentation: Brazilian Portuguese (`docs/pt-br/`) user manuals expanded to match English; full `certificacion-iso/records-template.md` (including manual test session table); expanded `glossary.md`; localized ADR index title
- Glossary and [privacy-data-map.md](privacy-data-map.md): Argentina’s tax authority referred to as **ARCA** (with former AFIP noted where relevant); [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md) and [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) describe **localized filenames** per locale tree (ADR slugs stay aligned across trees)

### Fixed

- Light/dark theme: removed fixed `class="dark"` on `<body>` in `index.html` (it prevented the toggle); alignment with initial script and `Layout` documented in [theming.md](theming.md)

---

## [0.1.0] — 2026-01-01

### Added

- Customer management: create, edit, search by name/CUIT; Argentine CUIT validation
- Product (articulo) management: create, edit, search; VAT condition per product; price lists; stock
- Invoicing: create Invoice A/B; line items with quantity/price/discount; automatic VAT calculation by customer tax condition (RI, Monotributo, CF, Exento); invoice list with expandable detail
- Payment methods catalogue
- Product categories (rubros) catalogue
- Keyboard-first UX: F2=search focus, F3=new record, F5=save, Ins=add item, Del=remove item, Esc=cancel/close
- Dark theme UI with Tailwind CSS slate palette
- Tauri 1.5 desktop shell for Windows/macOS/Linux
- Express 5 API with Prisma 5 + PostgreSQL 16 backend
