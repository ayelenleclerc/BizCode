# BizCode Local — matriz de escopo distribuidora (#536)

**Propósito:** Matriz rastreável requisito → UI/API → serviço/modelo → teste → status para o programa **BizCode Local / distribuidora** ([#535](https://github.com/ayelenleclerc/BizCode/issues/535)). Estende a matriz piloto [#450](matriz-cobertura-piloto-distribuidora.md); **não** substitui o registro de evidência dela.

**Relacionado:** [matriz-cobertura-piloto-distribuidora.md](matriz-cobertura-piloto-distribuidora.md) (#450), [topologia-implantacao-local.md](topologia-implantacao-local.md) (#537 / ADR-0029), [catalogo-modulos-e-feature-flags.md](catalogo-modulos-e-feature-flags.md), [visao-produto-e-implantacao.md](visao-produto-e-implantacao.md) (PROD-VISION-001 / ADR-0007), [fluxo-operacional-pedido-entrega-cobranca.md](fluxo-operacional-pedido-entrega-cobranca.md) (#391), [backup-e-restauracao.md](backup-e-restauracao.md).

**Baseline (Fase 1):** `develop` @ `104172d2` (pós-#560).

## Legenda de status

| Status | Significado |
|---|---|
| **verificado** | Caminho feliz coberto por integração e/ou API/E2E dedicada no repositório |
| **parcial** | Há lógica/testes, mas a cadeia não atinge a aceitação Local/distribuidora |
| **simulado** | Apenas homologação/mock; rede externa live fora de escopo no código |
| **pendiente** | Lacuna sob um filho de #535 (ou keep-OPEN em pausa) |

## Matriz de circuito (requisito → evidência → status)

| Requisito | UI / API | Serviço / modelo | Testes / evidência | Status |
|---|---|---|---|---|
| Alta / listagem clientes | UI clientes; `registerClientesRoutes` | `ClienteService` | E2E critical-paths + piloto; integração API; `contract.test.ts` | verificado |
| Artigos + preços | UI artigos; `registerArticulosRoutes` | `ArticuloService`; Prisma `Articulo` | `articuloService.test.ts`, integração + E2E | verificado |
| Estoque na venda / fatura | UI faturamento; APIs fatura | `FacturaService`, `facturaStock` | `factura-stock.test.ts`, piloto integração | verificado |
| Pedido → confirm → invoice | `/pedidos`; `registerPedidosRoutes` | `PedidoService`, `pedidoStateMachine` | Piloto; `pedidoService.test.ts`; E2E piloto | verificado |
| Pedido pack / ship / deliver / collect | Mesmas rotas | `PedidoService` | `tests/api/pedidos.test.ts`; **sem** cadeia pack→ship completa no piloto PG / E2E piloto | parcial |
| Entrega / cobrança (doc de fluxo) | UI pedidos / cobranças | — | [fluxo-operacional-pedido-entrega-cobranca.md](fluxo-operacional-pedido-entrega-cobranca.md) | verificado (doc); cadeia ops ver pack/ship **parcial** |
| Faturas | `registerFacturasRoutes` | `FacturaService` | Testes fatura/stock + E2E | verificado |
| Cobranças + conta corrente | Rotas CC / recibos / cobros | `ClienteCuentaCorrienteService`, `CobroService` | Piloto; integração CC; testes API; E2E cobros | verificado |
| Void / NC → CC (+ estoque) | `PUT /api/facturas/:id/void`; rotas NC | `FacturaService.void`, `NotaCreditoService` | `facturas-void.test.ts`, `notas-credito.test.ts`, piloto | verificado |
| Rejeição estoque insuficiente | Alta fatura | `facturaStock` | Piloto + `factura-stock.test.ts` | verificado |
| Isolamento tenant / RLS | Middleware de tenant | `tenantContext` / RLS | Testes isolation + integração | verificado |
| Admin / RBAC | SuperAdmin + permissões | Matriz RBAC; 403 logística | [matriz-rbac-funcoes-permissoes-scopes.md](matriz-rbac-funcoes-permissoes-scopes.md); `pedidos.test.ts` | verificado |
| Qtd. sugerida reposição | APIs/UI reposição | `replenishmentForecastMath.ts`: `ceil(velocity*lead + minimo)` — **não** subtrai estoque nem OC abertas | Math + docs; lacuna → [#543](https://github.com/ayelenleclerc/BizCode/issues/543) | parcial |
| Campos mín/máx estoque | Artigo / depósito | Prisma `Articulo.minimo`, `StockDeposito.stockMin` / `stockMax` | Schema presente; UX/regras → [#542](https://github.com/ayelenleclerc/BizCode/issues/542) | parcial |
| Integridade reservas inventário | Pedidos / estoque | Caminhos sob #541 | [#541](https://github.com/ayelenleclerc/BizCode/issues/541) | pendiente |
| ARCA CAE (AFIP) | Módulos fiscais AR | `ArcaService.ts` + `arcaWsfeMock.ts` | Só mock; live → [#544](https://github.com/ayelenleclerc/BizCode/issues/544) | simulado |
| Padrón A4 | Fiscal AR | `PadronA4Service.ts` + `arcaPadronMock.ts` | Mock; SOAP live fora de escopo → [#545](https://github.com/ayelenleclerc/BizCode/issues/545) | simulado |
| Runtime desktop local (Tauri) | Shell Tauri carrega web | `main.rs` só `ping`; sem sidecar | [#539](https://github.com/ayelenleclerc/BizCode/issues/539) | pendiente |
| Segurança baseline Local | — | — | [endurecimento-seguranca-local.md](endurecimento-seguranca-local.md) (#538); updater/CSP → #539; pentest → #194 | verificado (doc); residuais #539/#194 |
| Topologia Local (Chris / multi-site) | — | — | [topologia-implantacao-local.md](topologia-implantacao-local.md) / [ADR-0029](../adr/ADR-0029-local-deployment-topology.md); multi-site A/B **decisão da proprietária pendente** | verificado (doc); decisão piloto pendente |
| Backups Local operáveis | Docs ops | `backup:postgres:drill` / SEC-007 | [backup-e-restauracao.md](backup-e-restauracao.md); Local → [#540](https://github.com/ayelenleclerc/BizCode/issues/540) | parcial |
| Compras / custos / promos (escopo Local) | Módulos do preset | Serviços de domínio | Issues filhas sob #535 (P1+) | pendiente |

## Perfil instalação nova distribuidora (sem migrar tenants existentes)

| Item | Evidência | Regra |
|---|---|---|
| Preset `MAYORISTA_ALIMENTOS` | `packages/types/src/modules-presets.ts` | Ativa pedidos, logística, inventário FEFO, compras, driver, comissões, import **sobre** `DEFAULT_MODULES` |
| Defaults novo tenant | `NEW_TENANT_MODULES`; `buildNewTenantFiscalDefaults` | Jurisdição via env; persiste em `TenantConfig.modules` no setup-owner / seed |
| Aplicar template | SuperAdmin `POST .../apply-template` | Ação **explícita** por tenant — sem migração global de flags |
| Tenants existentes | `TenantConfigService.getFeaturesForTenant` | Lê linha DB; **sem** reescrita automática ao publicar docs Local |

## Conservação de módulos (verticais em pausa)

Não apagar nem esvaziar estes módulos ao entregar filhos de #535. Motores compartilhados (auth, tenant, estoque, faturamento, middleware de módulos) continuam consumidores.

| Área | Keep-OPEN / docs | Consumidores compartilhados (exemplos) |
|---|---|---|
| Farmácia / OS / livro | #204, #252 (ampliação pausada) | Rotas/testes `vertical.pharmacy`; OpenAPI; tabelas OS |
| FCEM MiPyME | #239 | `fcem.test.ts`; ADR-0028 mock |
| Segurança pré-comercial | #194 | ZAP / docs readiness |
| Export / regionais | #206–#211 (conforme programa) | Módulos do catálogo |
| Gates piloto comerciais | #197 | Docs SLA / DR |

## Decisões vs engenharia independente

| Precisa decisão de negócio / credencial | Pode avançar in-repo sem credenciais live |
|---|---|
| AFIP WSFE / Padrón live (#544/#545) | Mock de homologação já na árvore |
| Instalador Windows / assinatura (#539) | Documentar gap Tauri; topologia (#537); segurança (#538) |
| Política sync multi-site (Chris) | Documentar gap processo único (#537) |
| Gates go-live comerciais (#194/#197) | Status da matriz + issues filhas |

## Próximos filhos P0 (após esta matriz)

Ordem #535: **#537** topologia → **#538** segurança local → **#539** instalador Windows → **#540** backups → **#541** reservas → **#542** mín/máx → …

## Comandos (revalidação)

```bash
pnpm run test
pnpm run test:integration -- tests/integration/piloto-distribuidora-circuit.integration.test.ts
pnpm run test:e2e -- e2e/piloto-circuit.spec.ts e2e/smoke.spec.ts
pnpm run check:docs-map
```

## Outros idiomas

[English](../../en/quality/local-distributor-scope-matrix.md) · [Español](../../es/quality/matriz-alcance-local-distribuidora.md)
