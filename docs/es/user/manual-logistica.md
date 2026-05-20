# Manual de Usuario: Logística

## Acceso

Haga clic en **Logística** en el menú lateral izquierdo.

Requiere **`logistics.read`** o **`orders.deliver.confirm`**. Los conductores (`role: driver`) ven un listado acotado.

## Filtrar órdenes de entrega

| Filtro | Descripción |
|--------|-------------|
| Fecha | Fecha de entrega (predeterminada: hoy). |
| Estado | `pending`, `assigned`, `in_transit`, `delivered`, `failed`, o todos. |
| Zona | Zona de entrega (vista planificador). |

## Crear una orden

Con **`orders.create`**, abra el formulario de nueva orden, ingrese id de cliente, fecha, zona, conductor y nota opcionales, y guarde (`POST /api/ordenes-entrega`).

## Actualizar estado

Usuarios con **`orders.dispatch`** o **`orders.deliver.confirm`** pueden cambiar el estado de la orden según los controles de la UI (`PUT /api/ordenes-entrega/:id`).

## Órdenes de compra

Abra **Compras** (`/compras`) desde el menú lateral. La ruta depende del módulo de tenant **`logistics.purchases`** y es visible para roles como **owner**, **manager** y **warehouse_lead** (según la configuración de navegación del producto).

| Permiso | Uso |
|---------|-----|
| `suppliers.read` | Listar y ver órdenes de compra |
| `suppliers.manage` | Crear, editar borradores, enviar, cancelar y recibir |
| `inventory.adjust` | Obligatorio junto con `suppliers.manage` en **recibir** (incremento de stock) |

**Flujo de estados:** `draft` → `sent` → `received` (cuando todas las líneas se reciben por completo) o `cancelled`. Mientras el estado sea `sent`, puede **recibir cantidades parciales** por línea; cada recepción crea un `StockAjuste` con motivo `compra` y actualiza el stock del artículo en una sola transacción.

Rutas API habituales: `GET/POST /api/compras`, `GET/PUT /api/compras/{id}`, `POST /api/compras/{id}/send`, `POST /api/compras/{id}/cancel`, `POST /api/compras/{id}/receive`.

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

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rutas `/api/ordenes-entrega`, `/api/compras`, `/api/recuentos`.

**Otros idiomas:** [English](../../en/user/manual-logistics.md) · [Português](../../pt-br/user/manual-logistica.md)
