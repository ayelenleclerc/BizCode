# User stories and acceptance criteria (MVP)

| Field | Value |
|-------|--------|
| Document version | 0.2 |
| Revision | 2 |
| Date | 2026-05-15 |
| Product reference | BizCode 0.1.0 MVP |

Format: **Given / When / Then** acceptance checks are **manual** unless linked automated tests exist.

## US-01 — Customer CRUD

- **Story:** As an operator, I want to create, search, and edit customers so that I can manage the customer master.
- **Acceptance (Given/When/Then):**
  - Given I am on the Customers page, when I search by text/code, then the list filters per API behaviour.
  - Given I save a valid customer, when the API succeeds, then the list reflects the change (or I can reopen the record).
- **Evidence:** `src/pages/clientes/`, `GET/POST/PUT /api/clientes`.

## US-02 — Product CRUD

- **Story:** As an operator, I want to maintain products with rubro and VAT condition so that I can use them on invoices.
- **Acceptance:**
  - Given I edit a product, when I select a rubro from the dropdown, then it is one of the rubros returned by `GET /api/rubros`.
- **Evidence:** `src/pages/articulos/`, `GET /api/articulos`, `GET /api/rubros`.

## US-03 — Invoice issuance

- **Story:** As an operator, I want to issue invoices with line items and totals so that sales are recorded.
- **Acceptance:**
  - Given I create an invoice, when I add at least one line and select a customer, then save is enabled per UI rules documented in user manual.
- **Evidence:** `src/pages/facturacion/`, `GET/POST /api/facturas`, `GET /api/formas-pago`.

## US-04 — Theme

- **Story:** As an operator, I want to switch light/dark theme and keep the choice on this device.
- **Acceptance:**
  - Given I toggle theme, when I reload the app, then the theme matches `localStorage` and `<html>` class behaviour in [theming.md](../theming.md).
- **Evidence:** `Layout.tsx`, `index.html`.

## US-05 — Language

- **Story:** As an operator, I want to use the UI in Spanish, English, or Brazilian Portuguese.
- **Acceptance:**
  - Given I change language, when I navigate modules, then no user-visible strings bypass `t()` (policy).
- **Evidence:** [i18n-strategy.md](../i18n-strategy.md).

## US-06 — Customer payments

- **Story:** As an operator, I want to register and list customer payments so that balances and collections are tracked.
- **Acceptance:**
  - Given I have `sales.create`, when I save a valid payment, then `POST /api/cobros` succeeds and the list refreshes.
  - Given a suspended or inactive customer, when I post a payment, then the API returns 422 per OpenAPI.
- **Evidence:** `src/pages/cobros/`, `tests/api/cobros.test.ts`.

## US-07 — AR and account statement

- **Story:** As a finance user, I want aging and per-customer statements so that I can follow receivables.
- **Acceptance:**
  - Given `reports.financial.read`, when I open Finanzas, then aging buckets load from `GET /api/reportes/aging`.
  - Given a valid customer id, when I request a statement, then lines show running balance from `GET /api/reportes/cuenta-corriente/:clienteId`.
- **Evidence:** `src/pages/finanzas/`.

## US-08 — Reports

- **Story:** As a manager, I want sales, stock, and collections reports for a period, with CSV export when needed.
- **Acceptance:**
  - Given operational permission, when I open the ventas or stock tab, then data loads from the matching `/api/reportes/*` endpoint.
  - Given financial permission, when I export cobranzas with CSV accept header, then a file download is triggered per UI.
- **Evidence:** `src/pages/reportes/`.

## US-09 — Delivery orders

- **Story:** As logistics staff, I want to plan and update delivery orders for a date and zone.
- **Acceptance:**
  - Given `logistics.read`, when I filter by date/estado, then orders list from `GET /api/ordenes-entrega`.
  - Given `orders.create`, when I submit a new order, then `POST /api/ordenes-entrega` creates a row.
- **Evidence:** `src/pages/logistica/`, `registerOrdenesEntregaRoutes.ts`.

## US-10 — Warehouse picking

- **Story:** As warehouse staff, I want to pick orders from a queue and mark them ready for dispatch.
- **Acceptance:**
  - Given `orders.pick` and `logistics.picking`, when I take an OE and complete the checklist, then estado becomes `ready`.
- **Evidence:** `src/pages/logistica/picking/`, picking endpoints on `registerOrdenesEntregaRoutes.ts`.

## US-11 — Delivery routes

- **Story:** As a planner, I want to group ready OEs into a route, start it, and close it when done.
- **Acceptance:**
  - Given `orders.dispatch` and `logistics.dispatches`, when I create and start a route, then reparto is `on_route` and OEs are linked.
- **Evidence:** `src/pages/logistica/repartos/`, `registerRepartosRoutes.ts`.

## US-12 — Proof of delivery

- **Story:** As a driver, I want to confirm each stop with a signature so dispatch has proof.
- **Acceptance:**
  - Given `orders.deliver.confirm` and `logistics.pod`, when I submit POD for an item, then item is `delivered` and proof is retrievable.
- **Evidence:** `src/pages/logistica/repartos/chofer/`, `PUT .../items/{itemId}`, `GET .../pod`.

## US-13 — Live GPS tracking

- **Story:** As a planner, I want to see active routes on a map; as a driver, I want my location sent while on route.
- **Acceptance:**
  - Given `logistics.gps`, when a route is `on_route`, then planner map shows last position; driver posts location periodically.
- **Evidence:** `src/pages/logistica/seguimiento/`, `RepartoUbicacionService.ts`, `GET /api/repartos/activos`.

**Other languages:** [Español](../../es/specs/historias-usuario-criterios-aceptacion.md) · [Português](../../pt-br/specs/historias-usuario-criterios-aceptacao.md)
