# Changelog

Todos los cambios notables de BizCode se documentan aquí.
Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).
Versionado: [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Agregado

- **Impresión POS opcional (hardware opt-in):** `THERMAL_PRINTER_ENABLED` (apagado por defecto) alineado al fiscal; `GET /api/printing/status` expone `thermalPrinterEnabled`; impresión de factura con fallback a PDF legal; UI de facturación oculta acciones fiscal/térmica si no están habilitadas; doc trilingüe [impresion-pos-opcional.md](es/quality/impresion-pos-opcional.md). Drivers físicos siguen optativos por cliente (#153 Fase 2).

- **Endurecimiento de sanitización de logs (GitHub #218):** catálogo ampliado `LOGGER_REDACT_PATHS` en [`server/logRedaction.ts`](../../server/logRedaction.ts), auditoría de superficies de log y política de retención/acceso (EN/ES/PT-BR), y guardrail `npm run check:logs` integrado en `docs:validate`. Complementa #151 sin duplicar el MVP de observabilidad.

- **Headers HTTP de seguridad (GitHub #214):** middleware `helmet` en la API REST ([`server/middleware/securityHeaders.ts`](../../server/middleware/securityHeaders.ts)) con `X-Frame-Options: DENY`, `X-Content-Type-Options`, CSP, `Referrer-Policy` y HSTS en producción; pruebas en [`tests/server/security-headers.test.ts`](../../tests/server/security-headers.test.ts). CORS sigue por entorno vía `CORS_ORIGINS`.

- **Línea base de observabilidad MVP (GitHub #151):** logs estructurados del servidor con redacción en Pino (`password`, `token`, `authorization`, `cookie`, `session`, `secret`, `privateKey`, `certificate`), correlación de requests vía `X-Request-Id`, endpoint técnico en memoria `GET /api/metrics` protegido con `audit.read`, diagnóstico aditivo en `/api/health` (check DB + latencia, uptime, versión), actualización de OpenAPI/pruebas y documentación trilingüe de observabilidad. Prometheus/Grafana/Loki/Datadog/Sentry y alertas reales quedan fuera de alcance.

- **Baseline Docker productivo + workflow de deploy (GitHub #149):** se agregan `Dockerfile` (backend), `Dockerfile.frontend` (build Vite + runtime Nginx), `docker-compose.prod.yml` (server + frontend + PostgreSQL con health checks), configuración de proxy interno Nginx para API (`deploy/nginx/default.conf`), `.dockerignore`, actualización de referencia de variables en `.env.example` y workflow `.github/workflows/deploy.yml` con build/test siempre, publicación condicional a GHCR y deploy condicional por SSH (requiere secrets). Los valores reales de host/dominio/certificados quedan fuera del repositorio.

- **PDF legal AFIP (GitHub #148):** `GET /api/facturas/{id}/pdf` (PDF fiscal con CAE emitido), `/pdf/preview` (no fiscal), `/ticket` (80 mm operativo); layout alineado RG 4291, QR y código de barras I2of5; campos emisor en `ParamEmpresa`; modal vista previa/imprimir en Facturación; ADR-0014. Validación manual en portal AFIP pendiente.

- **Libro IVA Ventas — Fase 1 (GitHub #147):** `GET /api/contabilidad/libro-iva-ventas` (`reports.financial.read`, módulo `finance.ledger`) exporta ventas desde campos fiscales de `Factura`; `format=preview|txt|xlsx` (ZIP `CBTV.txt` + `ALICUOTAS.txt`); NC y anulaciones tipo `999` según ADR-0013; sección **Contabilidad** en **Finanzas**; **Libro IVA Compras fuera de alcance** (issue posterior). OpenAPI, pruebas, manuales (EN/ES/PT-BR).

- **Anulación de factura y notas de crédito (GitHub #146):** `PUT /api/facturas/{id}/void` (`sales.cancel`, módulo `billing.credit_notes`, motivo mín. 10 caracteres) devuelve factura actualizada, `NotaCredito` emitida y saldo del cliente; `GET /api/notas-credito`, `GET /api/notas-credito/{id}` (`reports.financial.read` u `reports.operational.read`); flujo AFIP de nota de crédito según ADR-0012; **Finanzas** lista notas por rango de fechas (UI con módulo); **Facturación** acción anular condicionada a `billing.credit_notes`; OpenAPI, pruebas (`notas-credito`, `facturas-void`), manuales y specs (EN/ES/PT-BR).

- **KPIs y reportes logísticos (GitHub #145):** `dispatchedAt` / `dispatchTimestampSource` en `OrdenEntrega` (ADR-0011); `GET /api/logistica/kpis`, `reporte-choferes`, `reporte-zonas` (`logistics.read`, módulo `logistics.dispatches`, agregados en DB); pestaña **Reportes** en `/logistica` con tarjetas KPI, ranking de choferes, tabla por zona, export CSV; i18n, OpenAPI, pruebas y manual (EN/ES/PT-BR).

- **Seguimiento GPS en tiempo real (GitHub #144):** modelo `RepartoUbicacion`; `POST /api/repartos/{id}/ubicacion` (`orders.deliver.confirm`, chofer en reparto propio `on_route`, módulo `logistics.gps`); `GET /api/repartos/activos` y `GET .../ubicacion/ultima` (`logistics.read`, roles `owner`/`manager`/`logistics_planner`); purga de ubicaciones con más de 7 días; UI `/logistica/seguimiento` (mapa Leaflet, polling 60 s); app chofer envía posición cada 2 min (opcional si geolocalización denegada); script `npm run reparto-ubicacion:purge`; OpenAPI, pruebas y manual (EN/ES/PT-BR).

- **Picking en depósito (GitHub #143):** estados `picking` / `ready` / `cancelled` en `OrdenEntrega`; campos `pickerUserId`, `pickingIniciadoAt`, `pickingListoAt`; `POST /api/ordenes-entrega/{id}/iniciar-picking` y `POST .../lista` (`orders.pick`, módulo `logistics.picking`); `GET /api/ordenes-entrega` también con `orders.pick`; repartos (#140) solo aceptan OEs `ready`; UI `/logistica/picking`; OpenAPI, pruebas y manual (EN/ES/PT-BR).

- **Comprobante de entrega (POD) en ítems de reparto (GitHub #142):** campos en `RepartoItem` (receptor, notas, `motivoNoEntrega`, `podMedia` JSON); `PUT /api/repartos/{id}/items/{itemId}` (`orders.deliver.confirm`, chofer en reparto propio `on_route`) y `GET .../pod` (`logistics.read`, roles `owner`/`manager`/`logistics_planner`); listados con `hasPod` sin blobs; UI chofer `/logistica/repartos/chofer` (módulo `logistics.pod`, wizard 4 pasos); badge y diálogo en back-office; OpenAPI, pruebas y manual (EN/ES/PT-BR).

- **Repartos / rutas de entrega (GitHub #140):** modelos `Reparto` / `RepartoItem`; API `GET/POST /api/repartos`, `GET /api/repartos/{id}`, `POST .../iniciar`, `POST .../cerrar`; lectura `logistics.read`, mutaciones `orders.dispatch`; agrupa OEs pendientes, inicia ruta (`on_route`), al cerrar ítems pendientes `not_delivered` y OEs `failed`; UI `/logistica/repartos` (módulo `logistics.dispatches`, reorden por arrastre); OpenAPI, pruebas y manual de logística (EN/ES/PT-BR).

- **Analítica avanzada del dashboard (GitHub #138):** `GET /api/dashboard/ventas-historico` (agregación en PostgreSQL, JSON + CSV); pestaña **Análisis** en **Inicio** con gráficos línea/barras/torta (recharts), presets 30/90/365 días, filtros vendedor y zona; requiere `reports.operational.read` y módulo `analytics.advanced`; índice `Factura_tenantId_estado_fecha_idx`; OpenAPI, pruebas y manual de reportes (EN/ES/PT-BR).

- **Recuento físico de inventario (GitHub #136):** modelos `Recuento` / `RecuentoItem`; API `GET/POST /api/recuentos`, `GET /api/recuentos/{id}`, `PUT .../items`, `POST .../close`, `GET .../pdf`; permiso `inventory.count`; bloqueo de stock `RECUENTO_IN_PROGRESS` en ajustes, recepción de compras y facturación; UI `/recuentos` (módulo `inventory.count`); OpenAPI, pruebas y manual de logística (EN/ES/PT-BR).

- **Migración DBF de clientes (GitHub #51):** `npm run migrate:dbf` importa clientes desde `CLIENTES.DBF` cuando el archivo existe con filas (`legacyClienteDbf.ts`, `clienteBodySchema`, informe de rechazos); placeholders `91001`–`91010` solo sin maestro poblado; ver [Pruebas de migración DBF](guides/pruebas-migracion-dbf.md) y `scripts/MIGRACION_PROGRAMA_VIEJO.md`. Carga masiva en la app vía importación CSV (#58).

- **Planes SaaS y límites por tenant (GitHub #181):** modelos `Plan` / `TenantPlan`; `GET /api/planes`, `GET /api/me/plan`, `POST /api/superadmin/tenants/:id/plan`; `requirePlanFeature`; límites en `POST /api/users` y `POST /api/facturas`; `PlanProvider`, `PlanGate`, selector en detalle SuperAdmin; i18n EN/ES/PT-BR.

- **Pricing y trials de módulos SuperAdmin (GitHub #226):** `GET /api/superadmin/tenants/:id/pricing`, `GET/POST/DELETE .../trials`; modelo `TenantModuleTrial`; `src/lib/modules/pricing.ts`, `TenantPricingService`, `TenantTrialService`; `npm run modules:trial-expire`; notificación `module_trial_expiring`; UI pricing/trial en `/superadmin/tenants/:id/modules`; OpenAPI y tests API; i18n EN/ES/PT-BR (sync billing diferido a #181).

- **UI módulos SuperAdmin (GitHub #225):** página `/superadmin/tenants/:id/modules` con toggles, motivo obligatorio, plantillas y historial; clientes `superadminAPI` (config) y `modulesCatalogAPI` en `src/lib/api.ts`; pruebas `TenantModulesPage.test.tsx`; i18n `common.superadmin.modules.*` (EN/ES/PT-BR).

- **Panel SuperAdmin multi-tenant (GitHub #137):** API `GET/POST/PATCH /api/superadmin/tenants`, `GET /api/superadmin/tenants/:id`, `GET /api/superadmin/stats` con `requireSuperAdmin` y `platform.tenants.manage`; servicio `SuperadminTenantService`; UI `/superadmin` (listado, detalle, suspender/reactivar) y enlace placeholder a módulos (`#225`); OpenAPI y `tests/api/superadmin-tenants.test.ts`; i18n EN/ES/PT-BR en `common.superadmin.*`.

- **Feature flags en frontend (GitHub #224):** `FeatureFlagsContext` / `useFeatureFlags`; `GET /api/me/features` vía `featuresAPI`; `IfModule`, `ModuleRoute`, `FeatureFlagsGate`; nav y rutas condicionales (`navSections.ts`, `Layout`, `App.tsx`); alerta accesible en `/inicio`; i18n `modules.*`; pruebas en `FeatureFlagsContext.test.tsx`, `IfModule.test.tsx`, `Layout.nav-modules.test.tsx`.

- **Feature flags por tenant (GitHub #223):** modelos `TenantConfig` / `TenantConfigHistory`; `GET /api/me/features`; middleware `requireModule` (p. ej. `billing.orders` en `/api/pedidos`); API SuperAdmin `GET/PUT /api/superadmin/tenants/:id/config`, historial y `POST .../apply-template`; `TenantConfig` en `setup-owner` y seed; caché en memoria (sin Redis); i18n `errors.moduleNotEnabled`; pruebas en `tests/api/me-features.test.ts`, `tests/api/superadmin-tenant-config.test.ts`, `tests/server/require-module.test.ts`.

### Corregido

- **Filtros de cobros (a11y):** entradas de filtro en `/cobros` con etiqueta visible y `aria-label` / `placeholder`; [`src/pages/cobros/index.tsx`](../../src/pages/cobros/index.tsx).

- **CORS + cookie de sesión:** `cors` en Express usa `credentials: true` y lista blanca de orígenes (`http://localhost:5173`, `http://127.0.0.1:5173`, más `CORS_ORIGINS` en CSV) para que el SPA (Axios `withCredentials`) pueda recibir y enviar cookies de sesión entre orígenes; [`server/createApp.ts`](../../server/createApp.ts), [`.env.example`](../../.env.example), [`tests/server/cors.test.ts`](../../tests/server/cors.test.ts); [seguridad.md](seguridad.md) actualizado.

### Agregado

- **Órdenes de compra (GitHub #135):** `OrdenCompra` + `OrdenCompraItem`; CRUD `/api/compras`, `POST .../send`, `POST .../receive` (recepción parcial → `StockAjuste` motivo `compra`); UI `/compras`; RBAC `suppliers.read` / `suppliers.manage` + `inventory.adjust` en recepción; i18n EN/ES/PT-BR.
- **Recordatorios de mora (GitHub #134):** modelo `CobroRecordatorio`; configuración por tenant en `ParamEmpresa` (`recordatorioDiasGracia`, `timezone` IANA, ventana comercial `recordatorioHoraInicio` / `recordatorioHoraFin`) editable en **Configuración → Empresa**; `GET /api/cobranzas/vencidas` y `POST /api/cobranzas/recordatorios` (`reports.financial.read`); `CobranzasService` con slot 08:00 y horario en hora local del tenant; job multi-tenant `npm run cobranzas:recordatorios` (cron horario `0 * * * *` recomendado); notificaciones `invoice_overdue` enriquecidas; sección en `/finanzas`; auditoría `cobranza_recordatorio_send`; i18n EN/ES/PT-BR.
- **AFIP CAE (GitHub #133):** `GET /api/afip/config` (solo metadatos), PDF de factura (`GET /api/facturas/:id/pdf`, vista previa con marca de agua), badges CAE y reintento en UI de facturación, sección AFIP en empresa (`billing.afip_cae`), mock WSFE homologación, `npm run afip:retry-pending-job` (cron `*/5`), i18n EN/ES/PT-BR.
- **Pedidos comerciales (GitHub #132):** modelos `Pedido` / `PedidoItem`; `GET/POST/PUT/DELETE /api/pedidos` y `POST .../confirm` / `POST .../invoice` (estados y rutas en inglés, ADR-0009); RBAC `orders.create` / `sales.create` / `sales.cancel`; auditoría `pedido_*`; UI listado `/pedidos`; i18n EN/ES/PT-BR. Gating modular: `requireModule('billing.orders')` (#223).

- **Migración DBF catálogo (GitHub #131):** parsers `legacyRubroDbf.ts` / `legacyArticuloDbf.ts`; `POST /api/rubros/migrate-dbf` y `POST /api/articulos/migrate-dbf` (`settings.business.manage`, upsert por código); `npm run migrate:dbf` importa `RUBROS.DBF` / `ARTICULOS.DBF` si existen (fallback `PVAR2`/`PVAR`); fixtures y pruebas de integración.

- **Ajustes de stock (GitHub #128):** modelo `StockAjuste` y migración; `POST /api/articulos/:id/stock-ajuste` (`inventory.adjust`) y `GET /api/articulos/:id/stock-historial`; al crear factura se decrementa stock y se notifica `stock_below_minimum`; auditoría `stock_adjust`; i18n EN/ES/PT-BR.

- **Documentación (sincronización ISO-ready):** paquete specs v0.2 (RF-011–RF-015); manuales de cobros, finanzas, reportes y logística (EN/ES/PT-BR); flujo operativo MVP; trazabilidad ISO y stubs REQ-007, TST-003, TST-005, ARC-004; post-proceso TypeDoc [`scripts/patch-typedoc-html-noopener.mjs`](../../scripts/patch-typedoc-html-noopener.mjs); [`DOCUMENT_LOCALE_MAP.md`](../DOCUMENT_LOCALE_MAP.md).
- **Configuración de empresa (GitHub #127):** `ParamEmpresa` por tenant con `GET/PUT /api/empresa`; `puntoVenta` define `prefijoFactura` de 4 dígitos; UI en `/configuracion/empresa` (edición con `settings.business.manage`); formulario de nueva factura precarga prefijo y tipo por defecto; i18n EN/ES/PT-BR.
- **Score de pago (GitHub #130):** Recálculo automático de `Cliente.score` en `POST /api/cobros` según días de mora vs factura activa más antigua (+5 / −3 / −7 / −15); sin cambio sin factura activa; `metadata` de auditoría con `scoreBefore`, `scoreAfter`, `delta`; respuesta incluye `updatedCliente`; tooltip en ficha de cliente; i18n EN/ES/PT-BR.
- **Órdenes de entrega (GitHub #126):** modelo `OrdenEntrega` y migración; API `GET/POST/PUT /api/ordenes-entrega` con RBAC; listado restringido para repartidor; auditoría en cambios de estado (`entrega_confirmed`); UI `/logistica` planner y repartidor; i18n EN/ES/PT-BR.
- **Reportes (GitHub #129):** Reportes operativos en `/reportes` — `GET /api/reportes/ventas`, `GET /api/reportes/stock-critico`, `GET /api/reportes/cobranzas` con exportación JSON o `Accept: text/csv`; permisos `reports.operational.read` / `reports.financial.read`; i18n EN/ES/PT-BR.
- **Finanzas (GitHub #125):** Módulo real en `/finanzas` — `GET /api/reportes/aging` y `GET /api/reportes/cuenta-corriente/:clienteId` (aging por `creditDays`, cuenta corriente con saldo acumulado); `facturasVencidas` del dashboard con la misma regla de vencimiento; i18n EN/ES/PT-BR.

- **Cobros (GitHub #124):** Registro de pagos de clientes — modelo `Cobro`, API REST (`POST/GET /api/cobros`), UI `/cobros`, cobros recientes en la ficha del cliente, widget `cobrosHoy` del dashboard con datos reales; i18n EN/ES/PT-BR.

- **Backend (GitHub #79):** la importación CSV usa los mismos esquemas Zod `*BodySchema` que el cuerpo JSON del REST (`safeParseBodySchema` en [`server/schemas/domain.ts`](../../server/schemas/domain.ts)); restricciones **CHECK** en PostgreSQL para `Articulo.stock`, `Articulo.minimo` y `Cliente.creditLimit` (migración `prisma/migrations/20260505130000_nonneg_entity_checks`); documentación para desarrolladores en [estandares-codigo.md](estandares-codigo.md) y [`.cursor/rules/backend-standards.mdc`](../../.cursor/rules/backend-standards.mdc); los manuales de usuario mencionan mensajes de error por campo en la importación.
- **Gestión de usuarios (issue #25):** `GET/POST /api/users`, `PUT /api/users/:id`, `POST /api/auth/change-password`; página Usuarios (`src/pages/users/`) con DataTable + modal creación/edición, atajos de teclado (F2/F3/F5/Esc), restricción de jerarquía de roles; componente `<CanAccess permission="..." />` para renderizado condicional por permiso; link en sidebar visible solo para titulares de `users.manage`; i18n en EN/ES/PT-BR; 17 tests de integración nuevos; OpenAPI actualizado; docs trilingues en `docs/*/quality/`.

### Added

- **Flujo de archivado en aprobación de planes:** nuevo comando `npm run plan:approve -- --plan <archivo>` que guarda planes aprobados en `.cursor/plans/{timestamp}-{slug}.plan.md` y después ejecuta el flujo existente `plan:sync` (Issues/Project v2 en GitHub); `plan:sync` se mantiene para sincronización manual/directa.
- **UX de autenticación + bootstrap seguro:** pantalla de login con guard de rutas/logout conectada a `/api/auth/login|me|logout`, soporte de cookie de sesión en [`src/lib/api.ts`](../../src/lib/api.ts), provider en [`src/auth/AuthProvider.tsx`](../../src/auth/AuthProvider.tsx), y comando `npm run bootstrap:superadmin` para alta de super admin (contraseña desde `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD`, sin credenciales hardcodeadas) mediante [`scripts/bootstrap-superadmin.ts`](../../scripts/bootstrap-superadmin.ts).
- **Visión de producto y gobernanza:** documento trilingüe [vision-producto-y-despliegue.md](quality/vision-producto-y-despliegue.md) (PROD-VISION-001) · [en](../en/quality/product-vision-and-deployment.md) · [pt-BR](../pt-br/quality/visao-produto-e-implantacao.md); [ADR-0007](adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) (escritorio/SaaS + modularidad fiscal); fila en [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); [AGENTS.md](../../AGENTS.md) y [`.cursor/rules/product-vision.mdc`](../../.cursor/rules/product-vision.mdc); matriz [trazabilidad-iso.md](certificacion-iso/trazabilidad-iso.md); enlaces en arquitectura
- **Documentación (paquete ISO):** [Certificación-ISO/README.md](../../Certificación-ISO/README.md) como punto de entrada; manual del SGQ, matriz de trazabilidad ISO, plantillas de registros y ciclo de vida documental bajo `docs/{en,es,pt-br}/certificacion-iso/` (fuente única); [indice-paquete-iso.md](certificacion-iso/indice-paquete-iso.md) (ISO-PKG-001); stubs en [`docs/quality/`](../quality/); estrategia de pruebas / CI/CD / plan Swagger siguen en `docs/*/quality/`; **SBOM:** `@cyclonedx/cyclonedx-npm`, `npm run sbom:generate` → [`docs/evidence/sbom-cyclonedx.json`](../evidence/sbom-cyclonedx.json) (SBOM-001), [`docs/evidence/README.md`](../evidence/README.md)
- **API:** **Swagger UI** en `http://localhost:3001/api-docs/` (`swagger-ui-express`, [`server/createApp.ts`](../../server/createApp.ts), OpenAPI desde [`openapi.yaml`](../api/openapi.yaml)); [`tests/api/swagger-ui.test.ts`](../../tests/api/swagger-ui.test.ts); dependencia runtime `yaml`; `info.description` del OpenAPI actualizado
- **Documentación:** plan trilingüe **Swagger / OpenAPI UI** (versión **1.0.0**): [plan-swagger-openapi-ui.md](quality/plan-swagger-openapi-ui.md) · [en](../en/quality/swagger-openapi-ui-plan.md) · [pt-BR](../pt-br/quality/plano-swagger-openapi-ui.md); [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) actualizado; [`.cursor/rules/bizcode.mdc`](../../.cursor/rules/bizcode.mdc) (subsección contrato API), [AGENTS.md](../../AGENTS.md), [CONTRIBUTING.md](../../CONTRIBUTING.md); `.cursor/plans/` en `.gitignore` (copia canónica en `docs/`); fila en [trazabilidad-iso.md](certificacion-iso/trazabilidad-iso.md)
- **Toolchain:** Node **22 LTS** en CI, [`.nvmrc`](../../.nvmrc), `engines` en [`package.json`](../../package.json) (**≥ 22**); [`.npmrc`](../../.npmrc) `legacy-peer-deps` para `npm ci` con ESLint 10 + jsx-a11y
- **Documentación generada:** `npm run docs:generate` — TypeDoc → `docs/generated/typedoc/`, `@scalar/openapi-to-markdown` → [`openapi-reference.generated.md`](../api/openapi-reference.generated.md), `@adobe/jsonschema2md` (esquemas extraídos del OpenAPI) → `docs/generated/schema-md/`, `sbom:generate` → [`sbom-cyclonedx.json`](../evidence/sbom-cyclonedx.json); CI ejecuta `docs:generate` y luego `git diff` sobre rutas generadas; guía trilingüe [documentacion-generada.md](quality/documentacion-generada.md); [`.cursor/rules/doc-generation.mdc`](../../.cursor/rules/doc-generation.mdc)
- **Dependencias:** **Vite 6**, `@vitejs/plugin-react` 5.x, **Prisma 5.22**; `@types/node` 22; avisos de audit restantes ligados al CLI `npm` empaquetado (solo herramientas de desarrollo)
- **ADR-0005** — [Cobertura Vitest para `server.ts`](adr/ADR-0005-vitest-coverage-server-bootstrap.md): refactor de arranque, entrada `server/main.ts`, `tests/server/server.test.ts`
- **ADR-0006** — [CI opcional: semantic-release y Tauri self-hosted](adr/ADR-0006-release-and-tauri-ci-workflows.md): `npm audit` informativo en CI; `release.config.cjs`, `release.yml`, `tauri-selfhosted.yml`
- **CI:** `npm audit --audit-level=high` no bloqueante tras `npm ci`
- **JSDoc trilingüe** en `calculateInvoice`, `calculateItemSubtotal` y cabecera de módulo en [`src/lib/invoice.ts`](../../src/lib/invoice.ts); `createApp` en [`server/createApp.ts`](../../server/createApp.ts)
- **ADR-0004** — [smoke E2E Playwright y hoja de ruta de integración](adr/ADR-0004-e2e-playwright-integration-roadmap.md): `e2e/smoke.spec.ts`, `playwright.config.ts`, CI instala Chromium y ejecuta `npm run test:e2e`; Vitest excluye `e2e/**`; **fase B:** `tests/integration/`, `npm run test:integration`, `vitest.integration.config.ts`; CI ejecuta `prisma migrate deploy` y luego integración (Prisma real; el contrato API sigue con mock)
- **Ciclo de vida documental y validación** (calidad): [ciclo-vida-y-validacion-documental.md](certificacion-iso/ciclo-vida-y-validacion-documental.md); `npm run check:docs-map` comprueba rutas del [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); CI ejecuta la comprobación tras la paridad i18n
- **JSDoc trilingüe** de ejemplo en `validateCUIT` en [`src/lib/validators.ts`](../../src/lib/validators.ts) (véase [estandares-codigo.md](estandares-codigo.md))
- **Nombres de archivo localizados por idioma (fase 3):** la documentación de producto y calidad en `docs/en/`, `docs/es/` y `docs/pt-br/` usa **nombres distintos por árbol**; mapa canónico en [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); los ADR conservan el **mismo slug técnico** en cada idioma
- **Especificaciones MVP ISO-ready** en [`specs/`](specs/indice.md): índice de manual técnico, RF/RNF, casos de uso, historias y criterios, casos de prueba manual (TC-001–TC-010), matriz de trazabilidad — solo contenido **basado en evidencia**; equivalentes en [inglés](../en/specs/index.md) y [portugués](../pt-br/specs/indice.md); actualizado [trazabilidad-iso.md](certificacion-iso/trazabilidad-iso.md)
- Reglas del proyecto en Cursor: [`.cursor/rules/bizcode.mdc`](../../.cursor/rules/bizcode.mdc), [`.cursor/rules/bizcode-documentation.mdc`](../../.cursor/rules/bizcode-documentation.mdc); [AGENTS.md](../../AGENTS.md) y [CONTRIBUTING.md](../../CONTRIBUTING.md) exigen cumplimiento; convención JSDoc trilingüe en [estandares-codigo.md](estandares-codigo.md)
- Documentación del tema UI: [temas-interfaz.md](temas-interfaz.md) (Tailwind `darkMode: 'class'`, clases en `<html>`, script en `index.html`, `localStorage`); referencias en [arquitectura.md](arquitectura.md) y [estandares-codigo.md](estandares-codigo.md)
- Documentación de producto y calidad en **inglés**, **español** y **portugués brasileño** (`docs/en/`, `docs/es/`, `docs/pt-br/`); hub [README.md](../README.md); política [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md); stubs en la raíz de `docs/` que redirigen a cada idioma
- Infraestructura de tests unitarios Vitest 4 con cobertura V8 (100% en `src/lib/**`)
- ESLint 10 flat config con `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`
- Internacionalización react-i18next: español (predeterminado), inglés, portugués brasileño
- Script de paridad i18n (`scripts/check-i18n.ts`)
- Pipeline GitHub Actions: type-check → lint → test+coverage → paridad i18n
- Accesibilidad WCAG 2.2 AA: `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-required`, `aria-describedby`, `role="alert"`, `data-testid` en botones principales
- Corpus de documentación: README, CONTRIBUTING, ADRs, especificación OpenAPI, manuales de calidad y de usuario

### Changed

- **Seguridad / puesta en marcha:** [`.env.example`](../../.env.example) ya no incluye credenciales de ejemplo para la base ni un literal de contraseña de seed por defecto; `npx prisma db seed` **exige** `BIZCODE_SEED_SUPERADMIN_PASSWORD` en `.env` (≥ 8 caracteres). Ver [seguridad.md](seguridad.md), [superadmin-bootstrap-y-rbac.md](quality/superadmin-bootstrap-y-rbac.md) y [README.md](../../README.md).
- Documentación: manuales de usuario en portugués brasileño (`docs/pt-br/user/`) ampliados al nivel del inglés; `certificacion-iso/plantillas-registros.md` completo (incl. tabla de prueba manual); `glosario.md` ampliado; título del índice ADR localizado
- Glosario y [mapa-datos-personales.md](mapa-datos-personales.md): organismo fiscal argentino como **ARCA** (con mención a la ex AFIP); [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md) y [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) describen **nombres de archivo localizados** por árbol (los ADR mantienen el mismo slug en los tres idiomas)

### Fixed

- Tema claro/oscuro: eliminado `class="dark"` fijo en `<body>` del `index.html` (anulaba el conmutador); alineación con script inicial y `Layout` documentada en [temas-interfaz.md](temas-interfaz.md)

---

## [0.1.0] — 2026-01-01

### Added

- Gestión de clientes: alta, edición, búsqueda por nombre/CUIT; validación de CUIT argentina
- Gestión de artículos: alta, edición, búsqueda; condición IVA por producto; listas de precio; stock
- Facturación: Factura A/B; ítems con cantidad/precio/descuento; cálculo automático de IVA según condición fiscal del cliente (RI, Monotributo, CF, Exento); listado con detalle expandible
- Catálogo de formas de pago
- Catálogo de rubros
- UX teclado primero: F2=búsqueda, F3=nuevo, F5=guardar, Ins=ítem, Del=quitar ítem, Esc=cancelar/cerrar
- UI tema oscuro con paleta slate de Tailwind
- Shell escritorio Tauri 1.5 para Windows/macOS/Linux
- API Express 5 con Prisma 5 y backend PostgreSQL 16
