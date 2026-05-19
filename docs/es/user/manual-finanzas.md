# Manual de Usuario: Finanzas

## Acceso

Haga clic en **Finanzas** en el menú lateral izquierdo.

Requiere el permiso **`reports.financial.read`**. Sin él, la página muestra un mensaje de acceso denegado.

## Antigüedad de saldos (CxC)

Al cargar, la página consulta **`GET /api/reportes/aging`** y muestra buckets (etiquetas, cantidad de facturas, totales). Puede ordenar por columnas cuando la UI lo implemente.

## Cuenta corriente

1. Ingrese un **id de cliente** (entero positivo).
2. Ejecute la acción para cargar la cuenta corriente (`GET /api/reportes/cuenta-corriente/:clienteId`).
3. Revise las líneas con fecha, tipo, referencia, débito, crédito y saldo acumulado.

Si el cliente no existe, la API devuelve 404.

## Facturas vencidas y recordatorios

La misma página **Finanzas** incluye una sección de facturas vencidas (`GET /api/cobranzas/vencidas`):

1. Opcionalmente filtre por **días mínimos de mora**.
2. Revise la tabla (cliente, total, fecha, días de mora).
3. Use **Enviar recordatorio** en una fila para disparar `POST /api/cobranzas/recordatorios` (permiso `reports.financial.read`). No se envía más de un recordatorio por factura el mismo día.

La configuración del job automático (días de gracia, zona horaria IANA, horario comercial) está en **Configuración → Empresa**. El job operativo `npm run cobranzas:recordatorios` recorre todos los tenants con parámetros de empresa y envía a las **08:00 hora local** dentro de la ventana configurada (véase [ciclo CI/CD](../quality/ciclo-ci-cd.md)).

## Referencia API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rutas `/api/reportes/aging` y `/api/reportes/cuenta-corriente/{clienteId}`.

**Otros idiomas:** [English](../../en/user/manual-finance.md) · [Português](../../pt-br/user/manual-financas.md)
