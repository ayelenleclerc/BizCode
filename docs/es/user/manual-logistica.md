# Manual de Usuario: Logística

## Acceso

Haga clic en **Logística** en el menú lateral izquierdo.

Requiere **`logistics.read`** o **`orders.deliver.confirm`**. Los conductores (`role: driver`) ven un listado acotado.

## Filtrar órdenes de entrega

| Filtro | Descripción |
|--------|-------------|
| Fecha | Fecha de entrega (predeterminada: hoy). |
| Estado | `pending`, `picking`, `ready`, `assigned`, `in_transit`, `delivered`, `failed`, `cancelled`, o todos. |
| Zona | Zona de entrega (vista planificador). |

## Crear una orden

Con **`orders.create`**, abra el formulario de nueva orden, ingrese id de cliente, fecha, zona, conductor y nota opcionales, y guarde (`POST /api/ordenes-entrega`).

## Actualizar estado

Usuarios con **`orders.dispatch`** o **`orders.deliver.confirm`** pueden cambiar el estado de la orden según los controles de la UI (`PUT /api/ordenes-entrega/:id`).

## Tracking de envío por transportista (#193)

Seleccioná una orden en `/logistica` para abrir el panel **Envío**.

| Acción | Quién | Notas |
|--------|-------|--------|
| Asignar transportista + nº seguimiento | `logistics.manage` | `POST /api/ordenes-entrega/:id/tracking` — funciona sin credenciales de API (manual + link al portal). |
| Ver / actualizar estado | `logistics.read` / `logistics.manage` | `GET /api/ordenes-entrega/:id/tracking` — caché 30 min; refresca Andreani / Correo Argentino si hay credenciales. |
| Guardar credenciales | `logistics.manage` | `PUT /api/shipping-carriers/{andreani\|correo_argentino}/config` (cifradas en reposo). |

Cron en host cada 2 h: `npm run shipping:tracking-refresh`. Los managers reciben la notificación in-app `shipment_delivered` al pasar a entregado.

## Picking en depósito

Abra **Picking** (`/logistica/picking`) desde el menú lateral o el enlace en la página de logística. Requiere el módulo **`logistics.picking`**, permiso **`orders.pick`** y roles como **`warehouse_op`** o **`warehouse_lead`**.

| Paso | Acción |
|------|--------|
| Cola | OEs en estado `pending`, ordenadas por zona y fecha |
| Tomar | `POST /api/ordenes-entrega/{id}/iniciar-picking` → `picking` (asigna al operario de sesión) |
| Checklist | Ítems de la factura vinculada (si existe); confirmación en UI |
| Lista | `POST /api/ordenes-entrega/{id}/lista` → `ready` |

Una OE en `picking` queda bloqueada para otros operarios (`409 PICKING_ASSIGNED_TO_OTHER_USER`). El líder de depósito ve las OEs `ready` y planifica el reparto en **Repartos**.

## Repartos

Abra **Repartos** desde el enlace en la página de logística o navegue a `/logistica/repartos`. La ruta usa el módulo **`logistics.dispatches`**.

| Permiso | Uso |
|---------|-----|
| `logistics.read` | Listar y ver detalle de repartos |
| `orders.dispatch` | Crear reparto, iniciar (`iniciar`) y cerrar (`cerrar`) |

**Estados del reparto:** `planned` → `on_route` → `completed` (en el modelo también `cancelled`; sin API de cancelación por ahora).

| Paso | Acción |
|------|--------|
| Planificar | `POST /api/repartos` — chofer, vehículo/notas opcionales, OEs en estado **`ready`** en secuencia (UI con arrastre y teclado); las OEs pasan a `assigned` con `driverId`; push `reparto_assigned` al chofer |
| Editar paradas | `POST /api/repartos/{id}/items` agrega OEs **`ready`** en repartos `planned`/`on_route`; `DELETE /api/repartos/{id}/items/{itemId}` quita parada **`pending`** y revierte OE a `ready` — push al chofer |
| Iniciar | `POST /api/repartos/{id}/iniciar` — `planned` → `on_route`; OEs de ítems pendientes → `in_transit` |
| Cerrar | `POST /api/repartos/{id}/cerrar` — `on_route` → `completed`; ítems `pending` → `not_delivered` y OEs vinculadas → `failed` |

Una OE no puede estar en dos repartos activos (`planned` u `on_route`) a la vez (`422 ORDEN_ALREADY_IN_ACTIVE_REPARTO`).

## Comprobante de entrega (POD)

Módulo **`logistics.pod`** (depende de **`logistics.dispatches`**). Choferes con **`orders.deliver.confirm`** usan **`/logistica/repartos/chofer`** (mobile-first) cuando su reparto está **`on_route`**.

| Paso | Acción |
|------|--------|
| Receptor | Nombre obligatorio; DNI opcional |
| Firma | Canvas; obligatoria para confirmar entrega |
| Foto | Opcional; compresión en cliente |
| Confirmar | Notas; o **no entregado** con motivo (`ausente`, `rechazo`, `domicilio_incorrecto`, `producto_dañado`, `otro`) |

| API | Permiso / rol |
|-----|----------------|
| `PUT /api/repartos/{id}/items/{itemId}` | `orders.deliver.confirm`; chofer solo en su reparto `on_route` |
| `GET /api/repartos/{id}/items/{itemId}/pod` | `logistics.read` + `owner`, `manager` o `logistics_planner` (no `driver`) |

Listados/detalle exponen **`hasPod`** sin blobs. Límites decodificados: firma ~50KB, foto ~200KB. Firma vacía no confirma entrega.

Back-office: en **`/logistica/repartos`**, panel de seguimiento con badge **POD disponible** y **Ver comprobante** si `hasPod`.

## Devoluciones en entrega (#163)

App Repartidor registra `rechazo` / `producto_dañado` con `POST /api/repartos/{id}/items/{itemId}/devolucion` (`orders.deliver.confirm` + field). Eso no ajusta stock ni emite NC. La rendición `POST /api/repartos/{id}/devoluciones/rendir` aplica `StockAjuste` motivo `devolucion_entrega` y NC parcial si la OE tiene factura. Sin factura: stock sí, NC no. FEFO + `controlLote` sin lote → `422 LOTE_REQUIRED` (queda pendiente). El rol `driver` no recibe `inventory.adjust`.

## App Repartidor offline (#164)

Con la ruta del día descargada, App Driver puede confirmar POD, registrar cobros y devoluciones sin señal (outbox FIFO). La rendición de devoluciones sigue solo online. Si el sync recibe `422` porque la parada ya cambió en el servidor, los roles de depósito (`owner`, `manager`, `logistics_planner`) reciben notificación in-app `reparto_sync_conflict`.

## Seguimiento GPS en vivo (#144)

Módulo **`logistics.gps`** (depende de **`logistics.dispatches`**). Planificadores con roles **`owner`**, **`manager`** o **`logistics_planner`** abren **`/logistica/seguimiento`** (mapa OpenStreetMap + Leaflet, lista de repartos `on_route`, actualización cada **60 s**).

| API | Permiso / rol |
|-----|----------------|
| `GET /api/repartos/activos` | `logistics.read` + rol planificador (`GPS_VIEW_ROLES`) |
| `GET /api/repartos/{id}/ubicacion/ultima` | `logistics.read` + planificador; chofer solo en su reparto |
| `POST /api/repartos/{id}/ubicacion` | `orders.deliver.confirm`; chofer dueño, reparto `on_route` |

El chofer en **`/logistica/repartos/chofer`** envía coordenadas cada **2 min** si el navegador permite geolocalización (no bloquea POD si se deniega). Retención: **7 días** (purga en cada registro y `npm run reparto-ubicacion:purge`). No hay coordenadas de cliente en el mapa; el detalle muestra domicilio como texto.

## KPIs y reportes (#145)

Módulo **`logistics.dispatches`**. Planificadores (`owner`, `manager`, `logistics_planner`) abren **`/logistica`** → pestaña **Reportes**.

| API | Notas |
|-----|--------|
| `GET /api/logistica/kpis?from&to&choferId?` | Tasa 1ª visita, tiempo prom. entrega, devoluciones por motivo, OEs vencidas |
| `GET /api/logistica/reporte-choferes?from&to&choferId?` | Productividad por chofer/día; `Accept: text/csv` |
| `GET /api/logistica/reporte-zonas?from&to&choferId?` | Cobertura por zona; filtro chofer opcional; `Accept: text/csv` |

**Despacho:** `OrdenEntrega.dispatchedAt` se setea al pasar a `in_transit`. Filas legacy pueden tener `dispatchTimestampSource = estimated` (ADR-0011).

## Órdenes de compra

Abra **Compras** (`/compras`) desde el menú lateral. La ruta depende del módulo de tenant **`logistics.purchases`** y es visible para roles como **owner**, **manager** y **warehouse_lead** (según la configuración de navegación del producto).

| Permiso | Uso |
|---------|-----|
| `suppliers.read` | Listar y ver órdenes de compra |
| `suppliers.manage` | Crear, editar borradores, enviar, cancelar y recibir |
| `inventory.adjust` | Obligatorio junto con `suppliers.manage` en **recibir** (incremento de stock) |

**Flujo de estados:** `draft` → `sent` → `received` (cuando todas las líneas se reciben por completo) o `cancelled`. Mientras el estado sea `sent`, puede **recibir cantidades parciales** por línea; cada recepción crea un `StockAjuste` con motivo `compra` y actualiza el stock del artículo en una sola transacción.

Al crear o actualizar un borrador, BizCode resuelve la fila activa del **catálogo del proveedor** (`ProveedorArticulo`, GitHub #273) por línea y guarda un **snapshot** en `OrdenCompraItem` (`codigoProveedor`, `descripcionProveedor`). El detalle de la OC y el PDF imprimible muestran código y descripción del proveedor; si no hay catálogo, la UI y el PDF usan el código y la descripción internos del artículo. Crear una línea desde el **comparador de proveedores** del artículo (GitHub #274) precarga proveedor, artículo, costo unitario y campos de catálogo. **Descargar PDF** usa `GET /api/compras/{id}/pdf` (GitHub #323).

Rutas API habituales: `GET/POST /api/compras`, `GET/PUT /api/compras/{id}`, `GET /api/compras/{id}/pdf`, `POST /api/compras/{id}/send`, `POST /api/compras/{id}/cancel`, `POST /api/compras/{id}/receive`.

## Recuento físico de inventario

Abra **Recuentos** (`/recuentos`) desde el menú lateral. La ruta depende del módulo de tenant **`inventory.count`** y requiere el permiso `inventory.count` (roles como **owner**, **manager**, **warehouse_lead**).

| Paso | Acción |
|------|--------|
| Inicio | `POST /api/recuentos` — snapshot del stock de artículos activos (`cantSistema`); un solo recuento `in_progress` por tenant |
| Conteo | `PUT /api/recuentos/{id}/items` — registrar `cantFisica` por artículo (actualizaciones parciales) |
| Cierre | `POST /api/recuentos/{id}/close` — todos los ítems deben estar contados; diferencias distintas de cero actualizan stock y crean `StockAjuste` con motivo `recuento`; diferencia cero no genera ajuste |
| Informe | `GET /api/recuentos/{id}/pdf` — PDF de diferencias (solo recuentos cerrados) |

Mientras un recuento está `in_progress`, las mutaciones de stock quedan bloqueadas (`422 RECUENTO_IN_PROGRESS`) en ajustes, recepción de compras y decremento por facturación.

## Referencia API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rutas `/api/ordenes-entrega`, `/api/repartos`, `/api/compras`, `/api/recuentos`.

**Otros idiomas:** [English](../../en/user/manual-logistics.md) · [Português](../../pt-br/user/manual-logistica.md)
