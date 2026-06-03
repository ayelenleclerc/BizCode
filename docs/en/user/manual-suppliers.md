# User manual — Suppliers

**Permissions:** `suppliers.read` (list and view), `suppliers.manage` (create, edit, deactivate, CSV import).

## Supplier list

- Search by code or business name (F2 focuses the search field).
- Filter by **status** (all / active / inactive) and **category** (raw materials, supplies, services, logistics).
- Table badges show **active** vs **inactive**.

## Full supplier profile (GitHub #269)

Open **New** (F3) or select a row and **Edit**. The form has four sections:

1. **General** — code, category, business name, trade name, tax ID (CUIT validated), VAT condition, phone, email, active flag.
2. **Banking** — CBU (check digit validated), alias, bank, account type, currency (default ARS).
3. **Commercial** — payment terms, usual term (days), discount %, credit limit.
4. **Contact and notes** — contact name, email, phone, free-text notes.

Shortcuts: **F5** save, **Esc** cancel.

## Deactivate (logical delete)

Select a row and **Deactivate**. The record stays in the database (`activo: false`) for purchase orders and purchase vouchers already linked. Use the inactive filter to review deactivated suppliers.

## CSV import

**Import CSV** uses the fixed template (`codigo`, `rsocial`, `condIva`, `activo`, optional `fantasia`, `cuit`, `telef`, `email`). Extended banking/commercial fields are entered via the UI or API after import.

**API:** `GET/POST /api/proveedores`, `GET/PUT/DELETE /api/proveedores/{id}` — see [OpenAPI](../../api/openapi.yaml).

**Other languages:** [Español](../../es/user/manual-proveedores.md) · [Português](../../pt-br/user/manual-fornecedores.md)
