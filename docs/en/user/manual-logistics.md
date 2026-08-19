# User Manual: Logistics

## Access

Click **Logística** in the left sidebar.

Requires **`logistics.read`** or **`orders.deliver.confirm`**. Drivers (`role: driver`) see a scoped list.

## Filter delivery orders

| Filter | Description |
|--------|-------------|
| Date | Delivery date (default: today). |
| Status | `pending`, `picking`, `ready`, `assigned`, `in_transit`, `delivered`, `failed`, `cancelled`, or all. |
| Zone | Delivery zone (planner view). |

## Create an order

With **`orders.create`**, open the new-order form, enter customer id, date, optional zone, driver, and note, then save (`POST /api/ordenes-entrega`).

## Update status

Users with **`orders.dispatch`** or **`orders.deliver.confirm`** can change order state per UI controls (`PUT /api/ordenes-entrega/:id`).

## Carrier shipment tracking (#193)

Select a delivery order on `/logistica` to open the **Shipment** panel.

| Action | Who | Notes |
|--------|-----|--------|
| Assign carrier + tracking number | `logistics.manage` | `POST /api/ordenes-entrega/:id/tracking` — works without courier API credentials (manual + portal link). |
| View / refresh status | `logistics.read` / `logistics.manage` | `GET /api/ordenes-entrega/:id/tracking` — 30‑minute cache; refreshes from Andreani / Correo Argentino when credentials are configured. |
| Store carrier credentials | `logistics.manage` | `PUT /api/shipping-carriers/{andreani\|correo_argentino}/config` (encrypted at rest). |

Host cron every 2 hours: `npm run shipping:tracking-refresh`. Managers receive in-app notification `shipment_delivered` when carrier status becomes delivered.

## Warehouse picking

Open **Picking** (`/logistica/picking`) from the sidebar or the logistics page link. Requires module **`logistics.picking`**, permission **`orders.pick`**, and roles such as **`warehouse_op`** or **`warehouse_lead`**.

| Step | Action |
|------|--------|
| Queue | OEs in `pending`, sorted by zone and date |
| Claim | `POST /api/ordenes-entrega/{id}/iniciar-picking` → `picking` (session user as picker) |
| Checklist | Invoice line items when linked; confirmed in UI |
| Ready | `POST /api/ordenes-entrega/{id}/lista` → `ready` |

An OE in `picking` is locked for other operators (`409 PICKING_ASSIGNED_TO_OTHER_USER`). The warehouse lead sees `ready` OEs and plans routes under **Delivery routes**.

## Delivery routes (repartos)

Open **Delivery routes** from the logistics page link or navigate to `/logistica/repartos`. The route uses module **`logistics.dispatches`**.

| Permission | Use |
|------------|-----|
| `logistics.read` | List and view routes |
| `orders.dispatch` | Create route, start (`iniciar`), close (`cerrar`) |

**Route status:** `planned` → `on_route` → `completed` (or `cancelled` in data model; no cancel API yet).

| Step | Action |
|------|--------|
| Plan | `POST /api/repartos` — select driver, optional vehicle/notes, assign **`ready`** delivery orders in sequence (UI supports drag-and-drop and keyboard reorder); OEs become `assigned` with `driverId` |
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

## Delivery returns (#163)

App Driver registers `rechazo` / `producto_dañado` with `POST /api/repartos/{id}/items/{itemId}/devolucion` (`orders.deliver.confirm` + field). That does not adjust stock or issue a credit note. Remittance `POST /api/repartos/{id}/devoluciones/rendir` applies `StockAjuste` motivo `devolucion_entrega` and a partial credit note when the OE has a factura. Without factura: stock yes, NC no. FEFO + `controlLote` without lot → `422 LOTE_REQUIRED` (leave pending). Role `driver` is not given `inventory.adjust`.

## Live GPS tracking (#144)

Module **`logistics.gps`** (requires **`logistics.dispatches`**). Planners with roles **`owner`**, **`manager`**, or **`logistics_planner`** open **`/logistica/seguimiento`** (OpenStreetMap + Leaflet map, list of `on_route` routes, refresh every **60 s**).

| API | Permission / role |
|-----|-------------------|
| `GET /api/repartos/activos` | `logistics.read` + planner role (`GPS_VIEW_ROLES`) |
| `GET /api/repartos/{id}/ubicacion/ultima` | `logistics.read` + planner; driver only on own route |
| `POST /api/repartos/{id}/ubicacion` | `orders.deliver.confirm`; owning driver, route `on_route` |

On **`/logistica/repartos/chofer`**, the driver posts coordinates every **2 min** when the browser allows geolocation (POD is not blocked if denied). Retention: **7 days** (purge on each record and `npm run reparto-ubicacion:purge`). Customer coordinates are not on the map; detail shows address as text.

## KPIs and reports (#145)

Module **`logistics.dispatches`**. Planners (`owner`, `manager`, `logistics_planner`) open **`/logistica`** → tab **Reports**.

| API | Notes |
|-----|--------|
| `GET /api/logistica/kpis?from&to&choferId?` | First-visit rate, avg delivery minutes, returns by reason, overdue OEs |
| `GET /api/logistica/reporte-choferes?from&to&choferId?` | Driver/day productivity; `Accept: text/csv` |
| `GET /api/logistica/reporte-zonas?from&to&choferId?` | Coverage by zone; optional driver filter; `Accept: text/csv` |

**Dispatch timestamp:** `OrdenEntrega.dispatchedAt` is set when the OE becomes `in_transit` (route start or manual). Legacy rows may have `dispatchTimestampSource = estimated` after migration (see ADR-0011).

## Purchase orders

Open **Purchasing** (`/compras`) from the sidebar. The route is gated by the tenant module **`logistics.purchases`** and is visible to roles such as **owner**, **manager**, and **warehouse_lead** (see navigation configuration in the product).

| Permission | Use |
|------------|-----|
| `suppliers.read` | List and view purchase orders |
| `suppliers.manage` | Create, edit draft orders, send, cancel, and receive |
| `inventory.adjust` | Required together with `suppliers.manage` on **receive** (stock increment) |

**Status flow:** `draft` → `sent` → `received` (when all lines are fully received) or `cancelled`. While status remains `sent`, you may **receive partial quantities** per line; each receipt creates a `StockAjuste` with motivo `compra` and updates article stock in a single transaction.

When you create or update a draft order, BizCode resolves the active **supplier catalog** entry (`ProveedorArticulo`, GitHub #273) for each line and stores a **snapshot** on `OrdenCompraItem` (`codigoProveedor`, `descripcionProveedor`). The purchase-order detail table and printable PDF show supplier code and description; if no catalog row exists, the UI and PDF fall back to the internal article code and description. Creating a line from the product **supplier comparator** (GitHub #274) pre-fills supplier, article, unit cost, and catalog fields. **Download PDF** uses `GET /api/compras/{id}/pdf` (GitHub #323).

Typical API paths: `GET/POST /api/compras`, `GET/PUT /api/compras/{id}`, `GET /api/compras/{id}/pdf`, `POST /api/compras/{id}/send`, `POST /api/compras/{id}/cancel`, `POST /api/compras/{id}/receive`.

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
