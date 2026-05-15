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

## Referencia API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rutas `/api/ordenes-entrega`.

**Otros idiomas:** [English](../../en/user/manual-logistics.md) · [Português](../../pt-br/user/manual-logistica.md)
