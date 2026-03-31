# User stories and acceptance criteria (MVP)

| Field | Value |
|-------|--------|
| Document version | 0.1 |
| Revision | 1 |
| Date | 2026-03-31 |
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

**Other languages:** [Español](../../es/specs/user-stories-and-acceptance.md) · [Português](../../pt-br/specs/user-stories-and-acceptance.md)
