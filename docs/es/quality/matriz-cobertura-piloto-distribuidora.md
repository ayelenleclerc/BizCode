# Matriz de cobertura — piloto distribuidora (#450)

**Propósito:** Criterio de salida verificable para ejercitar BizCode con **datos ficticios** en el circuito del piloto. No afirma readiness comercial ni cierra #194 / #197 / #239.

**Relacionado:** [estrategia-pruebas.md](estrategia-pruebas.md), [flujo-operativo-pedido-entrega-cobranza.md](flujo-operativo-pedido-entrega-cobranza.md) (#391), [backup-y-restauracion.md](backup-y-restauracion.md) (#449), [ciclo-ci-cd.md](ciclo-ci-cd.md) (#451).

## Leyenda de prioridad

| Prioridad | Significado |
|---|---|
| **P0** | Bloqueante para go/no-go (integridad financiera, stock, aislamiento tenant, smoke) |
| **P1** | Importante; gap documentado si no se automatiza en este PR |
| **Futuro** | Fuera del alcance del piloto |

## Matriz (superficie → evidencia)

| Superficie | Prioridad | Evidencia (ruta / comando) | Estado |
|---|---|---|---|
| Alta / listado clientes | P0 | `e2e/critical-paths.spec.ts`, `e2e/piloto-circuit.spec.ts`, `tests/integration/api.integration.test.ts` | Cubierto |
| Artículos + precios | P0 | `e2e/critical-paths.spec.ts`, `tests/api/factura-stock.test.ts` | Cubierto |
| Stock al facturar | P0 | `tests/integration/piloto-distribuidora-circuit.integration.test.ts`, `tests/api/factura-stock.test.ts` | Cubierto |
| Pedido → confirm → invoice | P0 | Integración piloto; E2E `e2e/piloto-circuit.spec.ts` | Cubierto |
| Pedido pack/ship/deliver/collect HTTP | P1 | Unit/UI (#391); **gap** en `tests/api/pedidos.test.ts` | Gap P1 |
| Alta factura UI | P0 | `e2e/critical-paths.spec.ts` | Cubierto |
| Cuenta corriente + cobro parcial | P0 | Integración piloto (recibos) + `tests/integration/cliente-cuenta-corriente.integration.test.ts` (#232) | Cubierto |
| Anulación / NC → CC coherente | P0 | Integración piloto + `tests/api/facturas-void.test.ts` | Cubierto |
| Anulación restaura stock | P1 | `FacturaService.void` **no** restaura stock hoy | Gap P1 |
| Rechazo por falta de stock | P0 | Integración piloto + `tests/api/factura-stock.test.ts` | Cubierto |
| Superficie UI cobros | P0 | `e2e/piloto-circuit.spec.ts` | Cubierto |
| Aislamiento tenant / RLS | P0 | `tests/api/tenant-isolation.test.ts`, `tests/api/rls-isolation.test.ts`, integración API | Cubierto |
| Permisos RBAC | P0 | Tests de dominio + [matriz RBAC](matriz-rbac-roles-permisos-scopes.md) | Cubierto |
| Webhook MP / reintento | P0 (pagos) | `tests/api/mercadopago-webhook.test.ts` (#447) | Cubierto (sin E2E de red flaky) |
| Backup / restore | P0 (ops) | `pnpm run backup:postgres:drill`, SEC-015 (#449) | Cubierto |
| Fallo de red E2E | Futuro | No automatizado en CI | Futuro |
| UI multi-empresa | Futuro | — | Futuro |

## Comandos

```bash
pnpm run test
pnpm run test:integration -- tests/integration/piloto-distribuidora-circuit.integration.test.ts
pnpm run test:e2e -- e2e/piloto-circuit.spec.ts e2e/smoke.spec.ts
pnpm run backup:postgres:drill
```

La integridad de **saldos/stock** se afirma en integración PostgreSQL — no solo por “la pantalla carga”.

## Aceptación / go-no-go

**Go** solo si: filas P0 Cubierto con evidencia en el repo; circuito de integración ejecutado en verde; E2E smoke + piloto en verde (o defectos bloqueantes listados); sin datos/cobros reales.

**No-go** si: mismatch stock/CC en P0; fuga de tenant; Quality Gate / Secret scan en rojo.

## Registro de ejecución

| Fecha (UTC) | SHA / rama | Suite | Resultado | Notas |
|---|---|---|---|---|
| 2026-11-08 | `test/450-piloto-coverage-matrix` | integración piloto | PASS (3/3) | Postgres local tras migrate |
| 2026-11-08 | `test/450-piloto-coverage-matrix` | E2E piloto + smoke | PASS (6/6) | API local `:3001` + superadmin seed; rate-limit HTTP elevado en local |

## Defectos / riesgos residuales

| ID | Severidad | Descripción |
|---|---|---|
| GAP-P1-stock-void | P1 | Void crea NC y salda CC; no restaura stock |
| GAP-P1-pedido-http | P1 | Cobertura HTTP pack/ship/deliver/collect débil en API |
| RISK-e2e-env | — | E2E requiere seed + API; CI Quality Gate ya lo cablea |

## Compuertas pre-comerciales (piloto ≠ comercial)

| Compuerta | Issue | Estado piloto (2026-11-12) |
|---|---|---|
| Seguridad antes de datos reales | [#194](https://github.com/ayelenleclerc/BizCode/issues/194) | CI automatizado presente; informe externo **vacío** — ver [readiness-seguridad-precomercial.md](readiness-seguridad-precomercial.md) |
| SLA / DR operable | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) | Drill local #449 evidenciado; `/status` first-party **en el repo**; residual = monitor externo live + drill staging (`pnpm run dr:staging:check` fail-closed sin `STAGING_DEPLOY_*`) |
| FCEM MiPyME (Ley 27440) | [#239](https://github.com/ayelenleclerc/BizCode/issues/239) | **MVP mock en `develop`** ([ADR-0028](../adr/ADR-0028-fcem-mipyme-mock.md), PR #468); residual AFIP live mantiene #239 abierto |
