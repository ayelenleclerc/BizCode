# Manual de Usuario: Reportes

## Acceso

Haga clic en **Reportes** en el menú lateral para reportes tabulares.

Para **gráficos** (tendencia de ventas, top productos, ventas por vendedor), abra **Inicio** → pestaña **Análisis**. Requiere `reports.operational.read` y módulo **`analytics.advanced`** (depende de `analytics.dashboard`).

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
- `GET /api/dashboard/ventas-historico` (pestaña Análisis en **Inicio**, `Accept: text/csv` para la serie por período)

## Analítica del dashboard (Inicio)

1. Abra **Inicio** y seleccione la pestaña **Análisis**.
2. Defina **desde** / **hasta**, **agrupar por** (`day` / `week` / `month`) y filtros opcionales de **vendedor** o **zona**.
3. Use presets (**30** / **90** / **365** días) y **Cargar datos**.
4. **Exportar CSV** descarga la serie del período seleccionado.

## Referencia API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — etiquetas `reportes` y `dashboard`.

**Otros idiomas:** [English](../../en/user/manual-reports.md) · [Português](../../pt-br/user/manual-relatorios.md)
