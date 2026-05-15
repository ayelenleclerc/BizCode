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

## API reference

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — paths `/api/ordenes-entrega`.

**Other languages:** [Español](../../es/user/manual-logistica.md) · [Português](../../pt-br/user/manual-logistica.md)
