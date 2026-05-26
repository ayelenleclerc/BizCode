# ADR-0012: Anulação de fatura com nota de crédito obrigatória (`PUT /void`)

**Status:** Aceito  
**Data:** 2026-05-26  
**GitHub:** #146

---

## Contexto

A issue #146 cita `POST /api/facturas/:id/anular`. O repositório já expõe **`PUT /api/facturas/:id/void`** (OpenAPI, rotas, UI, testes). Uma segunda rota duplicaria comportamento e quebraria clientes.

Para #146, **anulação fiscal** = anular fatura, reverter saldo do cliente, criar **`NotaCredito`** e auditar. Exige módulo **`billing.credit_notes`**. Anulação administrativa sem NC fica **fora de escopo**.

[`writeAuditEvent`](../../../server/audit.ts) engole erros no restante do sistema. No void, falha de auditoria deve reverter a transação.

## Decisão

1. **API canônica:** estender apenas **`PUT /api/facturas/:id/void`** (sem `POST /anular`, sem deprecar `PUT /void`).
2. **Módulo:** `requireModule('billing.credit_notes')` em `PUT /void` e `GET /api/notas-credito*`.
3. **Permissão:** manter **`sales.cancel`**.
4. **Transação única:** `Factura.estado` → `N`, decremento de `Cliente.balance`, `NotaCredito`, `AuditEvent` (`factura_void`). Qualquer falha → rollback.
5. **Resposta:** `{ success, data: { factura, notaCredito, updatedCliente } }` — atualizar API client, OpenAPI, testes e UI na mesma fase.
6. **`NotaCredito.estadoCae` na criação:**
   - Fatura origem com `estadoCae === 'issued'`: **`pending`** e CAE async com `billing.afip_cae` (mock #133).
   - Caso contrário: **`not_required`** (sem AFIP; evita NC presa em `pending`).
   - Valores: `pending` | `issued` | `failed` | `not_required`.
7. **Estado da fatura:** `A` / `N`; NC é entidade separada.
8. **Motivo:** mínimo 10 caracteres.

## Consequências

- **Positivo:** contrato único; NC, saldo e auditoria consistentes.
- **Negativo:** sem `billing.credit_notes` não há void pela API.
- **Fora de escopo:** WSFE NC completo; refactor global de auditoria.

## Referências

- [docs/api/openapi.yaml](../../api/openapi.yaml)
- Issues #146, #133
