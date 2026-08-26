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
| REST | `POST /api/facturas` — body opcional `confirmAnomalies`; resposta pode incluir `warnings[]`; `422 DUPLICATE_INVOICE_CONFIRM_REQUIRED` |
| UI | Banner em `NuevaFacturaForm` + confirmar/cancelar duplicata |
| Auditoria | `factura_anomaly_detected` (além de `factura_create`); visível no Audit Log |
| Fixture AC | Testes em `tests/server/facturaAnomalyMath.test.ts` e `tests/api/factura-anomaly.test.ts` |

## Regras (Fase 1)

1. **`factura_duplicada`** — mesmo `clienteId` + mesmo `total` + mesma data de calendário + `estado='A'`. Bloqueio suave sem `confirmAnomalies: true` → `422` + `warnings`. Com confirm → cria e persiste `confirmada=true`.
2. **`monto_inusual`** — cliente com **&gt; 20** faturas ativas; alerta se `|Z| &gt; 3`. Soft warning.
3. **`descuento_excesivo`** — média ponderada de `dscto` das linhas &gt; **30%**. Soft warning.
4. **`cliente_nuevo_compra_grande`** — ≤ 1 fatura prévia ativa e `total &gt; 50%` de `creditLimit` não nulo. Soft warning.

## Permissões

- Sem mudança: `sales.create` em `POST /api/facturas`.

## Fora de escopo / residual

- Isolation Forest / ML Fase 2
- Pico de vendas por vendedor (sem `vendedorId` em `Factura`)
- Cobrança fora de horário comercial enforceable
- Painel dedicado (usar Audit Log + `AnomaliaDetectada`)
- FP &lt;5% em frota real
- Limiar de desconto configurável por tenant

## Relacionado

- OpenAPI: `confirmAnomalies`, `warnings`, `FacturaAnomalyWarning`
- Constantes em `facturaAnomalyMath.ts`
