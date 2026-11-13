# Detecção de anomalias no faturamento — MVP (#200)

**Papel do documento:** Guia de qualidade do produto para regras estatísticas / heurísticas de anomalias de fatura (Fase 1).  
**Issue relacionado:** [#200](https://github.com/ayelenleclerc/BizCode/issues/200)

**Não** afirma Isolation Forest, microsserviço Python nem taxa de falsos positivos &lt;5% medida em frota de produção.

## Escopo (MVP)

| Item | Evidência no repositório |
|------|--------------------------|
| Persistência | Prisma `AnomaliaDetectada` (migração `20260826120000_anomalia_detectada_200`) |
| Math | [`facturaAnomalyMath.ts`](../../../apps/server/services/facturaAnomalyMath.ts) |
| Serviço | [`FacturaAnomalyService.ts`](../../../apps/server/services/FacturaAnomalyService.ts) a partir de `FacturaService.create` |
| Limiares por tenant | Prisma `ConfigAnomaliaFactura`; `GET/PUT /api/anomalias/config` (`settings.business.manage`); seção em Empresa |
| Listagem API / painel Admin | `GET /api/anomalias` (`audit.read`); página Admin `/admin/anomalias` |
| REST | `POST /api/facturas` — body opcional `confirmAnomalies`; resposta pode incluir `warnings[]`; `422 DUPLICATE_INVOICE_CONFIRM_REQUIRED` |
| UI | Banner em `NuevaFacturaForm` + confirmar/cancelar duplicata; limiares em Empresa; listagem Admin de anomalias |
| Auditoria | `factura_anomaly_detected` (além de `factura_create`); `anomalia_config_update`; também no Audit Log |
| Fixture AC | Testes em `tests/server/facturaAnomalyMath.test.ts`, `tests/api/factura-anomaly.test.ts` (incl. OpenAPI Ajv para `POST /api/facturas` 422/200+warnings), `tests/api/anomalia-config.test.ts`, `tests/api/anomalia-list.test.ts` |

## Regras (Fase 1)

1. **`factura_duplicada`** — mesmo `clienteId` + mesmo `total` + mesma data de calendário + `estado='A'`. Bloqueio suave sem `confirmAnomalies: true` → `422` + `warnings`. Com confirm → cria e persiste `confirmada=true`.
2. **`monto_inusual`** — cliente com **&gt; `minHistory`** (default 20) faturas ativas; alerta se `|Z| &gt; zScoreThreshold` (default 3). Soft warning.
3. **`descuento_excesivo`** — média ponderada de `dscto` das linhas &gt; `discountThresholdPct` (default 30). Soft warning.
4. **`cliente_nuevo_compra_grande`** — ≤ 1 fatura prévia ativa e `total &gt; newCustomerCreditFraction` (default 0.5) de `creditLimit` não nulo. Soft warning.

## Permissões

- `sales.create` em `POST /api/facturas`.
- `settings.business.manage` em `GET/PUT /api/anomalias/config`.
- `audit.read` em `GET /api/anomalias` e painel Admin de anomalias.

## Fora de escopo / residual

- Isolation Forest / ML Fase 2
- Pico de vendas por vendedor (sem `vendedorId` em `Factura`)
- Cobrança fora de horário comercial enforceable
- FP &lt;5% em frota real
- Gates de aprovação de manager para disposição de anomalias

## Relacionado

- OpenAPI: `confirmAnomalies`, `warnings`, `FacturaAnomalyWarning`, `ConfigAnomaliaFactura*`, `AnomaliaDetectada*`
- Defaults em `facturaAnomalyMath.ts`; overrides por tenant via `ConfigAnomaliaFactura`
