# ADR-0012: Invoice void with mandatory credit note (`PUT /void`)

**Status:** Accepted  
**Date:** 2026-05-26  
**GitHub:** #146

---

## Context

Issue #146 describes `POST /api/facturas/:id/anular`. The repository already exposes **`PUT /api/facturas/:id/void`** (OpenAPI, [`registerFacturasRoutes.ts`](../../../server/routes/registerFacturasRoutes.ts), UI, tests). Adding a second route would duplicate behavior and break existing clients.

For #146, **fiscal void** means: void the invoice, reverse customer balance, create a **`NotaCredito`** row, and audit the operation. This requires tenant module **`billing.credit_notes`**. Administrative void without a credit note is **out of scope** for this issue; if needed later, it must be a separate decision and endpoint.

Global [`writeAuditEvent`](../../../server/audit.ts) swallows errors so other flows are not blocked. Void is financially critical: audit failure must roll back the transaction.

## Decision

1. **Canonical API:** extend **`PUT /api/facturas/:id/void`** only (no `POST /anular`, no deprecation of `PUT /void`).
2. **Module:** `requireModule('billing.credit_notes')` on `PUT /void` and on `GET /api/notas-credito*`.
3. **Permission:** keep **`sales.cancel`** (manager, owner, billing).
4. **Transaction** (single `$transaction`): set `Factura.estado` to `N`, decrement `Cliente.balance`, create `NotaCredito`, create `AuditEvent` (`factura_void`, metadata `motivo`, `notaCreditoId`). Any step failure rolls back all.
5. **Response envelope:** `{ success, data: { factura, notaCredito, updatedCliente } }` — update API client, OpenAPI, tests, and UI in the same delivery phase.
6. **`NotaCredito.estadoCae` on create:**
   - If origin `Factura.estadoCae === 'issued'`: set **`pending`**, then async `AfipService.requestCaeForNotaCredito` when `billing.afip_cae` is enabled (homologación mock, #133).
   - Otherwise: set **`not_required`** (no AFIP attempt; avoids NC stuck in `pending` forever).
   - Values align with invoice CAE: `pending` | `issued` | `failed` | `not_required`.
7. **Invoice estado:** keep `A` (active) / `N` (voided); do not add a third `Factura.estado` value — the credit note is a separate entity.
8. **Motivo:** minimum 10 characters (Zod + OpenAPI).

## Consequences

- **Positive:** One contract; NC and balance always consistent with audit; clear CAE lifecycle for fiscal vs non-fiscal invoices.
- **Negative:** Tenants without `billing.credit_notes` cannot void via API until the module is enabled.
- **Out of scope:** Full WSFE credit-note production flow beyond mock; global refactor of `writeAuditEvent`.

## References

- [docs/api/openapi.yaml](../../api/openapi.yaml) — `PUT /api/facturas/{id}/void`, `/api/notas-credito`
- Issues #146, #133
