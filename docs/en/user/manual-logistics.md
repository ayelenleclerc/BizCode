# User Manual: Logistics

## Access

Click **Logística** in the left sidebar.

Requires **`logistics.read`** or **`orders.deliver.confirm`**. Drivers (`role: driver`) see a scoped list.

## Filter delivery orders

| Filter | Description |
|--------|-------------|
| Date | Delivery date (default: today). |
| Status | `pending`, `assigned`, `in_transit`, `delivered`, `failed`, or all. |
| Zone | Delivery zone (planner view). |

## Create an order

With **`orders.create`**, open the new-order form, enter customer id, date, optional zone, driver, and note, then save (`POST /api/ordenes-entrega`).

## Update status

Users with **`orders.dispatch`** or **`orders.deliver.confirm`** can change order state per UI controls (`PUT /api/ordenes-entrega/:id`).

## Purchase orders

Open **Purchasing** (`/compras`) from the sidebar. The route is gated by the tenant module **`logistics.purchases`** and is visible to roles such as **owner**, **manager**, and **warehouse_lead** (see navigation configuration in the product).

| Permission | Use |
|------------|-----|
| `suppliers.read` | List and view purchase orders |
| `suppliers.manage` | Create, edit draft orders, send, cancel, and receive |
| `inventory.adjust` | Required together with `suppliers.manage` on **receive** (stock increment) |

**Status flow:** `draft` → `sent` → `received` (when all lines are fully received) or `cancelled`. While status remains `sent`, you may **receive partial quantities** per line; each receipt creates a `StockAjuste` with motivo `compra` and updates article stock in a single transaction.

Typical API paths: `GET/POST /api/compras`, `GET/PUT /api/compras/{id}`, `POST /api/compras/{id}/send`, `POST /api/compras/{id}/cancel`, `POST /api/compras/{id}/receive`.

## API reference

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — paths `/api/ordenes-entrega`, `/api/compras`.

**Other languages:** [Español](../../es/user/manual-logistica.md) · [Português](../../pt-br/user/manual-logistica.md)
