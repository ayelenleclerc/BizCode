# Predicción de demanda / reposición — Fase 1 (#198)

**Rol del documento:** Guía de calidad del MVP de reposición por media móvil.  
**Issue:** [#198](https://github.com/ayelenleclerc/BizCode/issues/198)

No afirma machine learning, Holt-Winters, Prophet ni seis meses de precisión en producción.

## Alcance (Fase 1)

| Ítem | Evidencia en el repo |
|------|----------------------|
| Unidades vendidas | `FacturaItem.cantidad` en facturas `estado='A'` |
| Stock / seguridad | `Articulo.stock`, `Articulo.minimo` |
| Lead time | `ProveedorArticulo` preferido → `Proveedor.plazoHabitual` |
| Matemática | [`replenishmentForecastMath.ts`](../../../apps/server/services/replenishmentForecastMath.ts) |
| Servicio | [`ReplenishmentForecastService.ts`](../../../apps/server/services/ReplenishmentForecastService.ts) |
| REST | `GET /api/articulos/:id/reposicion-forecast`, `GET /api/catalogo/reposicion`, `POST /api/catalogo/reposicion/orden-compra-sugerida` |
| UI | Sección en ficha + `/catalogo/reposicion` → prefill OC multi-línea |

## Algoritmo (resumen)

1. Suma unidades en ventanas 90 / 60 / 30 días; prioriza la más larga con ventas.
2. Si unidades en la ventana &lt; 30 → `insufficient_data`.
3. `velocidad = unidades / días`; `diasRestantes = floor(stock / velocidad)`.
4. `qtySugerida = ceil(velocidad × leadTime + minimo)`.
5. Lista si `diasRestantes ≤ horizonte` (30) o `stock ≤ minimo`.

Umbral de error Fase 1: MAPE &lt; 20% sobre **fixture sintético** en tests unitarios.

## Permisos

- Lectura: `products.read` + módulo `logistics.purchases`
- OC sugerida: `suppliers.manage` + módulo `logistics.purchases`

## Fuera de alcance / residual

- Holt-Winters / Prophet (fases posteriores de #198)
- Dataset beta real para MAPE en producción
- Cierre de #198 si quedan AC de ops/beta

## Relacionado

- Órdenes de compra: #135 (cerrado)
- OpenAPI: [`docs/api/openapi.yaml`](../../api/openapi.yaml)
