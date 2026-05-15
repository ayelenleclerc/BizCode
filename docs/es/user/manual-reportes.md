# Manual de Usuario: Reportes

## Acceso

Haga clic en **Reportes** en el menú lateral izquierdo.

Las pestañas dependen de los permisos:

| Pestaña | Permiso |
|---------|---------|
| Ventas | `reports.operational.read` |
| Stock crítico | `reports.operational.read` |
| Cobranzas | `reports.financial.read` |

## Período y agrupación

En **Ventas** y **Cobranzas**, elija fechas **desde** y **hasta** y un preset si la UI lo ofrece. Ventas admite agrupación (`dia` / `semana` / `mes`) según la API.

Use el control para **cargar** los datos de la pestaña activa.

## Exportar CSV

Cuando esté disponible, use **Exportar CSV** para descargar con `Accept: text/csv` en:

- `GET /api/reportes/ventas`
- `GET /api/reportes/stock-critico`
- `GET /api/reportes/cobranzas`

## Referencia API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — etiqueta `reportes`.

**Otros idiomas:** [English](../../en/user/manual-reports.md) · [Português](../../pt-br/user/manual-relatorios.md)
