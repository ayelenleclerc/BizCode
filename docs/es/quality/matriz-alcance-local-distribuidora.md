# BizCode Local — matriz de alcance distribuidora (#536)

**Propósito:** Matriz trazable requisito → UI/API → servicio/modelo → prueba → estado para el programa **BizCode Local / distribuidora** ([#535](https://github.com/ayelenleclerc/BizCode/issues/535)). Extiende la matriz piloto [#450](matriz-cobertura-piloto-distribuidora.md); **no** reemplaza su registro de evidencia.

**Relacionado:** [matriz-cobertura-piloto-distribuidora.md](matriz-cobertura-piloto-distribuidora.md) (#450), [topologia-despliegue-local.md](topologia-despliegue-local.md) (#537 / ADR-0029), [catalogo-modulos-y-feature-flags.md](catalogo-modulos-y-feature-flags.md), [vision-producto-y-despliegue.md](vision-producto-y-despliegue.md) (PROD-VISION-001 / ADR-0007), [flujo-operativo-pedido-entrega-cobranza.md](flujo-operativo-pedido-entrega-cobranza.md) (#391), [backup-y-restauracion.md](backup-y-restauracion.md).

**Baseline (Fase 1):** `develop` @ `104172d2` (post-#560).

## Leyenda de estado

| Estado | Significado |
|---|---|
| **verificado** | Camino feliz cubierto por integración y/o API/E2E dedicada en el repo |
| **parcial** | Hay lógica/pruebas pero la cadena no alcanza la aceptación Local/distribuidora |
| **simulado** | Solo homologación/mock; red externa live fuera de alcance en código |
| **pendiente** | Brecha bajo un hijo de #535 (o keep-OPEN en pausa) |

## Matriz de circuito (requisito → evidencia → estado)

| Requisito | UI / API | Servicio / modelo | Pruebas / evidencia | Estado |
|---|---|---|---|---|
| Alta / listado clientes | UI clientes; `registerClientesRoutes` | `ClienteService` | `e2e/critical-paths.spec.ts`, `e2e/piloto-circuit.spec.ts`, integración API, `contract.test.ts` | verificado |
| Artículos + precios | UI artículos; `registerArticulosRoutes` | `ArticuloService`; Prisma `Articulo` | `articuloService.test.ts`, integración + E2E critical-paths | verificado |
| Stock en venta / factura | UI facturación; APIs factura | `FacturaService`, `facturaStock` | `factura-stock.test.ts`, `piloto-distribuidora-circuit.integration.test.ts` | verificado |
| Pedido → confirm → invoice | `/pedidos`; `registerPedidosRoutes` (`/confirm`, `/invoice`) | `PedidoService`, `pedidoStateMachine` | Piloto integración; `pedidoService.test.ts`; E2E piloto | verificado |
| Pedido pack / ship / deliver / collect | Mismas rutas pedidos | `PedidoService` | `tests/api/pedidos.test.ts` (HTTP/RBAC/409); **sin** cadena pack→ship completa en piloto PG / E2E piloto | parcial |
| Entrega / cobro (flujo doc) | UI pedidos / cobros | — | [flujo-operativo-pedido-entrega-cobranza.md](flujo-operativo-pedido-entrega-cobranza.md) | verificado (doc); cadena ops ver pack/ship **parcial** |
| Facturas | `registerFacturasRoutes` | `FacturaService` | `factura-stock.test.ts`, `facturaService.test.ts`, E2E critical-paths | verificado |
| Cobros + cuenta corriente | Rutas CC / recibos / cobros | `ClienteCuentaCorrienteService`, `CobroService` | Piloto; integración CC; tests API cobros/CC; E2E cobros | verificado |
| Void / NC → CC (+ stock) | `PUT /api/facturas/:id/void`; rutas NC | `FacturaService.void`, `NotaCreditoService` | `facturas-void.test.ts`, `notas-credito.test.ts`, piloto void | verificado |
| Rechazo stock insuficiente | Alta factura | `facturaStock` | Piloto + `factura-stock.test.ts` | verificado |
| Aislamiento tenant / RLS | Middleware de tenant | `tenantContext` / RLS | `tenant-isolation.test.ts`, `rls-isolation.test.ts`, integración cross-tenant | verificado |
| Admin / RBAC | SuperAdmin + permisos de dominio | Matriz RBAC; 403 logística | [matriz-rbac-roles-permisos-scopes.md](matriz-rbac-roles-permisos-scopes.md); `pedidos.test.ts` | verificado |
| Cantidad sugerida reposición | APIs/UI reposición existentes | `replenishmentForecastMath.ts`: `ceil(velocity*lead + minimo)` — **no** resta stock ni OC abiertas | Math unitario + docs demanda; brecha → [#543](https://github.com/ayelenleclerc/BizCode/issues/543) | parcial |
| Campos mínimo / máximo stock | Artículo / depósito | Prisma `Articulo.minimo`, `StockDeposito.stockMin` / `stockMax` | Schema presente; UX/reglas → [#542](https://github.com/ayelenleclerc/BizCode/issues/542) | parcial |
| Integridad reservas inventario | Pedidos / stock | Caminos de reserva bajo #541 | [#541](https://github.com/ayelenleclerc/BizCode/issues/541) | pendiente |
| ARCA CAE (AFIP) | Módulos fiscales AR | `ArcaService.ts` + `arcaWsfeMock.ts` | Solo mock homologación; live → [#544](https://github.com/ayelenleclerc/BizCode/issues/544) | simulado |
| Padrón A4 | Fiscal AR | `PadronA4Service.ts` + `arcaPadronMock.ts` | Mock; SOAP live fuera de alcance → [#545](https://github.com/ayelenleclerc/BizCode/issues/545) | simulado |
| Runtime escritorio local (Tauri) | Shell Tauri carga web | `main.rs` solo `ping`; sin sidecar / sin spawn Express | [#539](https://github.com/ayelenleclerc/BizCode/issues/539) | pendiente |
| Seguridad baseline Local | — | — | [endurecimiento-seguridad-local.md](endurecimiento-seguridad-local.md) (#538); updater/CSP → #539; pentest → #194 | verificado (doc); residuales #539/#194 |
| Topología Local (Chris / multi-sitio) | — | — | [topologia-despliegue-local.md](topologia-despliegue-local.md) / [ADR-0029](../adr/ADR-0029-local-deployment-topology.md); multisitio A/B **decisión propietaria pendiente** | verificado (doc); decisión piloto pendiente |
| Backups Local operables | Docs ops | `backup:postgres:drill` / SEC-007 | [backup-y-restauracion.md](backup-y-restauracion.md); específico Local → [#540](https://github.com/ayelenleclerc/BizCode/issues/540) | parcial |
| Compras / costos / promos (alcance Local) | Módulos compras del preset | Servicios de dominio | Issues hijas bajo #535 (P1+) | pendiente |

## Perfil instalación nueva distribuidora (sin migrar tenants existentes)

| Ítem | Evidencia | Regla |
|---|---|---|
| Preset `MAYORISTA_ALIMENTOS` | `packages/types/src/modules-presets.ts` | Activa pedidos, logística, inventario FEFO, compras, driver, comisiones, import **sobre** `DEFAULT_MODULES` |
| Defaults nuevo tenant | `modules-tenant-defaults.ts` → `NEW_TENANT_MODULES`; `buildNewTenantFiscalDefaults` | Jurisdicción vía env; persiste en `TenantConfig.modules` en setup-owner / seed |
| Aplicar plantilla | SuperAdmin `POST .../apply-template` | Acción **explícita** por tenant — no migración global de flags |
| Tenants existentes | `TenantConfigService.getFeaturesForTenant` | Lee fila DB; **sin** reescritura automática al aterrizar docs Local |

## Conservación de módulos (verticales en pausa)

No borrar ni vaciar estos módulos al entregar hijos de #535. Motores compartidos (auth, tenant, stock, facturación, middleware de módulos) siguen siendo consumidores.

| Área | Keep-OPEN / docs | Consumidores compartidos (ejemplos) |
|---|---|---|
| Farmacia / OS / libro | #204, #252 (ampliación pausada) | Rutas/tests `vertical.pharmacy`; OpenAPI farmacia; tablas OS |
| FCEM MiPyME | #239 | `fcem.test.ts`; ADR-0028 mock |
| Seguridad precomercial | #194 | ZAP / docs readiness |
| Export / regionales | #206–#211 (según programa) | Módulos de catálogo |
| Gates piloto comerciales | #197 | Docs SLA / DR |

## Decisiones vs ingeniería independiente

| Requiere decisión de negocio / credencial | Puede avanzar in-repo sin credenciales live |
|---|---|
| AFIP WSFE / Padrón live (#544/#545) | Mock de homologación ya en el árbol |
| Instalador Windows / firma (#539) | Documentar gap Tauri; topología (#537); seguridad (#538) |
| Política sync multi-sitio (Chris) | Documentar gap proceso único (#537) |
| Gates go-live comerciales (#194/#197) | Estados de matriz + issues hijas |

## Próximos hijos P0 (después de esta matriz)

Orden #535: **#537** topología → **#538** seguridad local → **#539** instalador Windows → **#540** backups → **#541** reservas → **#542** mín/máx → …

## Comandos (revalidación)

```bash
pnpm run test
pnpm run test:integration -- tests/integration/piloto-distribuidora-circuit.integration.test.ts
pnpm run test:e2e -- e2e/piloto-circuit.spec.ts e2e/smoke.spec.ts
pnpm run check:docs-map
```

## Otros idiomas

[English](../../en/quality/local-distributor-scope-matrix.md) · [Português (Brasil)](../../pt-br/quality/matriz-escopo-local-distribuidora.md)
