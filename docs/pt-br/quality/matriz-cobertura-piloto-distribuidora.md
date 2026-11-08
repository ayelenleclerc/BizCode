# Matriz de cobertura — piloto distribuidora (#450)

**Propósito:** Critério de saída verificável para exercitar o BizCode com **dados fictícios** no circuito do piloto. Não afirma readiness comercial nem fecha #194 / #197 / #239.

**Relacionado:** [estrategia-testes.md](estrategia-testes.md), [fluxo-operacional-pedido-entrega-cobranca.md](flujo-operacional-pedido-entrega-cobranca.md) (#391), [backup-e-restauracao.md](backup-e-restauracao.md) (#449), [ciclo-ci-cd.md](ciclo-ci-cd.md) (#451).

## Legenda de prioridade

| Prioridade | Significado |
|---|---|
| **P0** | Bloqueante para go/no-go (integridade financeira, estoque, isolamento de tenant, smoke) |
| **P1** | Importante; gap documentado se não automatizado neste PR |
| **Futuro** | Fora do escopo do piloto |

## Matriz (superfície → evidência)

| Superfície | Prioridade | Evidência (caminho / comando) | Status |
|---|---|---|---|
| Alta / lista de clientes | P0 | `e2e/critical-paths.spec.ts`, `e2e/piloto-circuit.spec.ts`, `tests/integration/api.integration.test.ts` | Coberto |
| Artigos + preços | P0 | `e2e/critical-paths.spec.ts`, `tests/api/factura-stock.test.ts` | Coberto |
| Estoque na fatura | P0 | `tests/integration/piloto-distribuidora-circuit.integration.test.ts`, `tests/api/factura-stock.test.ts` | Coberto |
| Pedido → confirm → invoice | P0 | Integração piloto; E2E `e2e/piloto-circuit.spec.ts` | Coberto |
| Pedido pack/ship/deliver/collect HTTP | P1 | Unit/UI (#391); **gap** em `tests/api/pedidos.test.ts` | Gap P1 |
| Alta fatura UI | P0 | `e2e/critical-paths.spec.ts` | Coberto |
| Conta corrente + cobrança parcial | P0 | Integração piloto (recibos) + `tests/integration/cliente-cuenta-corriente.integration.test.ts` (#232) | Coberto |
| Anulação / NC → CC coerente | P0 | Integração piloto + `tests/api/facturas-void.test.ts` | Coberto |
| Anulação restaura estoque | P1 | `FacturaService.void` **não** restaura estoque hoje | Gap P1 |
| Rejeição por falta de estoque | P0 | Integração piloto + `tests/api/factura-stock.test.ts` | Coberto |
| Superfície UI cobranças | P0 | `e2e/piloto-circuit.spec.ts` | Coberto |
| Isolamento tenant / RLS | P0 | `tests/api/tenant-isolation.test.ts`, `tests/api/rls-isolation.test.ts`, integração API | Coberto |
| Permissões RBAC | P0 | Testes de domínio + [matriz RBAC](matriz-rbac-funcoes-permissoes-scopes.md) | Coberto |
| Webhook MP / retry | P0 (pagamentos) | `tests/api/mercadopago-webhook.test.ts` (#447) | Coberto (sem E2E de rede flaky) |
| Backup / restore | P0 (ops) | `pnpm run backup:postgres:drill`, SEC-015 (#449) | Coberto |
| Falha de rede E2E | Futuro | Não automatizado no CI | Futuro |
| UI multi-empresa | Futuro | — | Futuro |

## Comandos

```bash
pnpm run test
pnpm run test:integration -- tests/integration/piloto-distribuidora-circuit.integration.test.ts
pnpm run test:e2e -- e2e/piloto-circuit.spec.ts e2e/smoke.spec.ts
pnpm run backup:postgres:drill
```

A integridade de **saldos/estoque** é afirmada em integração PostgreSQL — não só por “a tela carrega”.

## Aceitação / go-no-go

**Go** somente se: linhas P0 Cobertas com evidência no repo; circuito de integração em verde; E2E smoke + piloto em verde (ou defeitos bloqueantes listados); sem dados/cobranças reais.

**No-go** se: mismatch estoque/CC em P0; vazamento de tenant; Quality Gate / Secret scan vermelho.

## Registro de execução

| Data (UTC) | SHA / branch | Suite | Resultado | Notas |
|---|---|---|---|---|
| 2026-11-08 | `test/450-piloto-coverage-matrix` | integração piloto | PASS (3/3) | Postgres local após migrate |
| 2026-11-08 | `test/450-piloto-coverage-matrix` | E2E piloto + smoke | PASS (6/6) | API local `:3001` + seed superadmin; rate-limit HTTP elevado no local |

## Defeitos / riscos residuais

| ID | Severidade | Descrição |
|---|---|---|
| GAP-P1-stock-void | P1 | Void cria NC e zera CC; não restaura estoque |
| GAP-P1-pedido-http | P1 | Cobertura HTTP pack/ship/deliver/collect fraca na API |
| RISK-e2e-env | — | E2E exige seed + API; CI Quality Gate já configura |

## Gates pré-comerciais (piloto ≠ comercial)

| Gate | Issue | Status do piloto (2026-11-08) |
|---|---|---|
| Segurança antes de dados reais | [#194](https://github.com/ayelenleclerc/BizCode/issues/194) | CI automatizado presente; relatório externo **vazio** — ver [prontidao-seguranca-precomercial.md](prontidao-seguranca-precomercial.md) |
| SLA / DR operável | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) | Drill local #449 evidenciado; drill staging + status page **pendentes** |
| FCEM MiPyME (Lei 27440) | [#239](https://github.com/ayelenleclerc/BizCode/issues/239) | **Diferido** — pendente decisão de negócio; sem código WSFECM; não implementar até **sim** explícito |
