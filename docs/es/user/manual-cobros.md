# Manual de Usuario: Cobros

## Acceso

Haga clic en **Cobros** en el menú lateral izquierdo, o abra un cliente y use los enlaces de **Registrar cobro** / cobros recientes cuando estén disponibles.

Requiere el permiso **`sales.create`** para registrar un cobro.

## Listado de cobros

La tabla muestra fecha, cliente, importe y referencia. Use los filtros:

| Filtro | Descripción |
|--------|-------------|
| Cliente | Id numérico de cliente (opcional). |
| Desde / Hasta | Rango de fechas (`AAAA-MM-DD`). |
| Filtrar | Aplica los filtros y recarga el listado. |

Enlace profundo: `/cobros?clienteId=<id>` abre el listado con ese filtro de cliente y el diálogo de nuevo cobro.

## Registrar un cobro

1. Haga clic en **Nuevo cobro** (visible con `sales.create`).
2. Seleccione **Cliente**, **Fecha** e **Importe** (obligatorio, mayor que cero).
3. Opcionalmente elija **Forma de pago**, **Referencia** y **Nota**.
4. Haga clic en **Guardar**.

Si la operación es exitosa, el saldo del cliente disminuye por el importe del cobro. Si el cliente tiene al menos una factura activa, el **score de cobranza** puede cambiar según las reglas del servidor (véase OpenAPI `POST /api/cobros`).

### Errores

| Situación | Comportamiento |
|-----------|----------------|
| Cliente suspendido o inactivo | HTTP 422; mensaje en la UI |
| Sin permiso | Control oculto o API 403 |
| Importe inválido | Validación antes de enviar |

## Cobros App Repartidor (#162)

El chofer **no** recibe `sales.create`. Desde App Driver, **Cobrar** en una parada abre `/cobros?clienteId=` y llama el mismo `POST /api/cobros` con `orders.deliver.confirm`, header `x-bizcode-channel: field` y un cliente de `mi-reparto` de hoy. Los checkboxes de facturas solo arman el monto default (sin imputación ReciboCobro). WhatsApp es un enlace local `wa.me` con texto editable (sin Twilio, sin PDF). El cobro aparece en este listado web de inmediato (`reports.operational.read`).

## Referencia API

Contrato: [`docs/api/openapi.yaml`](../../api/openapi.yaml) — etiqueta `cobros`. Swagger UI: `/api-docs` cuando la API está en ejecución.

**Otros idiomas:** [English](../../en/user/manual-collections.md) · [Português](../../pt-br/user/manual-cobrancas.md)
