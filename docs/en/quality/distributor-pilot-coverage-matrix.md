# Distributor pilot coverage matrix (#450)

**Purpose:** Verifiable exit criteria for exercising BizCode with **fictional data** on the distributor pilot circuit. Does not claim commercial readiness or close #194 / #197 / #239.

**Related:** [testing-strategy.md](testing-strategy.md), [operational-flow-order-delivery-collection.md](operational-flow-order-delivery-collection.md) (#391), [backup-and-restore.md](backup-and-restore.md) (#449), [ci-cd.md](ci-cd.md) (#451).

## Priority legend

| Priority | Meaning |
|---|---|
| **P0** | Blocking for pilot go/no-go (financial integrity, stock, tenant isolation, smoke) |
| **P1** | Important; documented gap if not automated in this PR |
| **Future** | Out of pilot scope |

## Matrix (surface → evidence)

| Surface | Priority | Evidence (path / command) | Status |
|---|---|---|---|
| Clientes create / list | P0 | `e2e/critical-paths.spec.ts`, `e2e/piloto-circuit.spec.ts`, `tests/integration/api.integration.test.ts` | Covered |
| Artículos + prices | P0 | `e2e/critical-paths.spec.ts`, `tests/api/factura-stock.test.ts` | Covered |
| Stock on invoice | P0 | `tests/integration/piloto-distribuidora-circuit.integration.test.ts`, `tests/api/factura-stock.test.ts` | Covered |
| Pedido → confirm → invoice | P0 | Integration piloto circuit; E2E `e2e/piloto-circuit.spec.ts` (UI create/confirm) | Covered |
| Pedido pack/ship/deliver/collect HTTP | P1 | Unit/UI (#391); API pack/ship/deliver/collect + illegal 409 in `tests/api/pedidos.test.ts` | Covered |
| Factura UI create | P0 | `e2e/critical-paths.spec.ts` | Covered |
| Cuenta corriente + cobro parcial | P0 | Integration piloto (recibos) + `tests/integration/cliente-cuenta-corriente.integration.test.ts` (#232) | Covered |
| Void / NC → CC coherent | P0 | Integration piloto + `tests/api/facturas-void.test.ts` | Covered |
| Void restores stock | P1 | `FacturaService.void` restores `Articulo.stock` / depósito (mirror of create; skip marketplace `Pedido.origen`) — `tests/api/facturas-void.test.ts`, piloto integration | Covered |
| Insufficient stock reject | P0 | Integration piloto + `tests/api/factura-stock.test.ts` | Covered |
| Cobros UI surface | P0 | `e2e/piloto-circuit.spec.ts` (`cobros-page`, `cobro-form`) | Covered |
| Tenant / RLS isolation | P0 | `tests/api/tenant-isolation.test.ts`, `tests/api/rls-isolation.test.ts`, `tests/integration/api.integration.test.ts` | Covered |
| RBAC permissions | P0 | Domain API tests + [rbac-matrix](rbac-matrix-roles-permissions-scopes.md) | Covered |
| Mercado Pago webhook / retry | P0 (payments) | `tests/api/mercadopago-webhook.test.ts`, inbox services (#447) | Covered (unit/API; not E2E network flaky) |
| Backup / restore integrity | P0 (ops) | `pnpm run backup:postgres:drill`, SEC-015 (#449) | Covered |
| Network failure E2E | Future | Not automated in CI (flaky) | Future |
| Multi-company UI | Future | — | Future |

## Commands (isolated / develop tip)

```bash
pnpm run test                 # unit + API (default Vitest)
pnpm run test:integration -- tests/integration/piloto-distribuidora-circuit.integration.test.ts
pnpm run test:e2e -- e2e/piloto-circuit.spec.ts e2e/smoke.spec.ts
pnpm run backup:postgres:drill   # requires BACKUP_ENCRYPTION_KEY + test Postgres
```

Integrity of **saldos/stock** is asserted in PostgreSQL integration tests — not by “page visible” alone.

## Acceptance / go-no-go (pilot)

**Go** only if all are true:

1. P0 matrix rows marked Covered have evidence paths that exist in the repo.
2. Integration piloto circuit executed on an isolated DB against current `develop` (or PR branch) with pass.
3. E2E smoke + piloto-circuit executed with pass (or failures listed as blocking defects).
4. No unknown P0 defect open without owner decision.
5. No real customer data / real Mercado Pago charges used.

**No-go** if: stock/CC mismatch under the circuito P0; tenant leak; required CI (`Quality Gate` / `Secret scan`) red on the validation PR.

## Execution register

| Date (UTC) | SHA / branch | Suite | Result | Notes |
|---|---|---|---|---|
| 2026-11-08 | `test/450-piloto-coverage-matrix` | `test:integration` piloto-distribuidora-circuit | PASS (3/3) | Local Docker Postgres after `migrate deploy` |
| 2026-11-08 | `test/450-piloto-coverage-matrix` | `test:e2e` piloto-circuit + smoke | PASS (6/6) | Local API `:3001` + seeded superadmin; raised HTTP rate-limit envs for local runs |
| 2026-11-12 | `test/450-pedido-http-transitions` | `vitest` `tests/api/pedidos.test.ts` | PASS (10/10) | Closed GAP-P1-pedido-http (pack/ship/deliver/collect + 409) |

## Defects / residual risks

| ID | Severity | Description |
|---|---|---|
| RISK-e2e-env | — | E2E needs seeded superadmin + running API; CI already wires this in Quality Gate |

## Pre-commercial gates (pilot exit ≠ commercial)

| Gate | Issue | Pilot status (2026-11-12) |
|---|---|---|
| Security before real data | [#194](https://github.com/ayelenleclerc/BizCode/issues/194) | Automated CI present; external report **empty** — see [pre-commercial-security-readiness.md](pre-commercial-security-readiness.md) |
| SLA / DR operable | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) | Local drill #449 evidenced; first-party `/status` **in repo**; residual = external monitor live + staging DR drill (`pnpm run dr:staging:check` fail-closed without `STAGING_DEPLOY_*`) |
| FCEM MiPyME (Ley 27440) | [#239](https://github.com/ayelenleclerc/BizCode/issues/239) | **MVP mock in `develop`** ([ADR-0028](../adr/ADR-0028-fcem-mipyme-mock.md), PR #468); API emit/accept/reject/tacit covered in `tests/api/fcem.test.ts`; live AFIP residual keeps #239 open |
