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

## Delivery routes (repartos)

Open **Delivery routes** from the logistics page link or navigate to `/logistica/repartos`. The route uses module **`logistics.dispatches`**.

| Permission | Use |
|------------|-----|
| `logistics.read` | List and view routes |
| `orders.dispatch` | Create route, start (`iniciar`), close (`cerrar`) |

**Route status:** `planned` → `on_route` → `completed` (or `cancelled` in data model; no cancel API yet).

| Step | Action |
|------|--------|
| Plan | `POST /api/repartos` — select driver, optional vehicle/notes, assign pending delivery orders in sequence (UI supports drag-and-drop and keyboard reorder); OEs become `assigned` with `driverId` |
| Start | `POST /api/repartos/{id}/iniciar` — `planned` → `on_route`; pending items' OEs → `in_transit` |
| Close | `POST /api/repartos/{id}/cerrar` — `on_route` → `completed`; items still `pending` → `not_delivered` and linked OEs → `failed` |

A delivery order cannot belong to two active routes (`planned` or `on_route`) at once (`422 ORDEN_ALREADY_IN_ACTIVE_REPARTO`).

## Delivery proof (POD)

Module **`logistics.pod`** (depends on **`logistics.dispatches`**). Drivers with **`orders.deliver.confirm`** open **`/logistica/repartos/chofer`** (mobile-first) when their route is **`on_route`**.

| Step | Action |
|------|--------|
| Receptor | Name required; optional ID |
| Signature | Canvas capture; required to confirm delivery |
| Photo | Optional (`capture="environment"`); client compression |
| Confirm | Notes; or mark **not delivered** with reason (`ausente`, `rechazo`, `domicilio_incorrecto`, `producto_dañado`, `otro`) |

| API | Permission / role |
|-----|-------------------|
| `PUT /api/repartos/{id}/items/{itemId}` | `orders.deliver.confirm`; driver only on own route while `on_route` |
| `GET /api/repartos/{id}/items/{itemId}/pod` | `logistics.read` + `owner`, `manager`, or `logistics_planner` (not `driver`) |

List/detail responses include **`hasPod`** only (no signature/photo blobs). Decoded size limits: signature ~50KB, photo ~200KB. Empty signature cannot confirm delivery.

Back-office: on **`/logistica/repartos`**, tracking panel shows **POD available** and **View proof** when `hasPod` is true.

## Purchase orders

Open **Purchasing** (`/compras`) from the sidebar. The route is gated by the tenant module **`logistics.purchases`** and is visible to roles such as **owner**, **manager**, and **warehouse_lead** (see navigation configuration in the product).

| Permission | Use |
|------------|-----|
| `suppliers.read` | List and view purchase orders |
| `suppliers.manage` | Create, edit draft orders, send, cancel, and receive |
| `inventory.adjust` | Required together with `suppliers.manage` on **receive** (stock increment) |

**Status flow:** `draft` → `sent` → `received` (when all lines are fully received) or `cancelled`. While status remains `sent`, you may **receive partial quantities** per line; each receipt creates a `StockAjuste` with motivo `compra` and updates article stock in a single transaction.

Typical API paths: `GET/POST /api/compras`, `GET/PUT /api/compras/{id}`, `POST /api/compras/{id}/send`, `POST /api/compras/{id}/cancel`, `POST /api/compras/{id}/receive`.

## Physical inventory count

Open **Inventory count** (`/recuentos`) from the sidebar. The route is gated by the tenant module **`inventory.count`** and is visible to roles such as **owner**, **manager**, and **warehouse_lead** with permission `inventory.count`.

| Step | Action |
|------|--------|
| Start | `POST /api/recuentos` — snapshots system stock for all active articles (`cantSistema`); only one `in_progress` count per tenant |
| Count | `PUT /api/recuentos/{id}/items` — record `cantFisica` per article (partial updates allowed) |
| Close | `POST /api/recuentos/{id}/close` — all items must be counted; non-zero variances update stock and create `StockAjuste` with motivo `recuento`; zero variance skips adjustment |
| Report | `GET /api/recuentos/{id}/pdf` — variance PDF (closed counts only) |

While a count is `in_progress`, stock mutations are blocked (`422 RECUENTO_IN_PROGRESS`) on stock adjustments, purchase receipt, and invoicing stock decrement.

## API reference

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — paths `/api/ordenes-entrega`, `/api/repartos`, `/api/compras`, `/api/recuentos`.

**Other languages:** [Español](../../es/user/manual-logistica.md) · [Português](../../pt-br/user/manual-logistica.md)
