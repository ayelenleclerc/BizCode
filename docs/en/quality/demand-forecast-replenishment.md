# Demand forecast / replenishment — Phase 1 (#198)

**Document role:** Product quality guide for the MVP moving-average replenishment feature.  
**Related issue:** [#198](https://github.com/ayelenleclerc/BizCode/issues/198)

Does **not** claim machine learning, Holt-Winters, Prophet, or six months of production accuracy.

## Scope (Phase 1)

| Item | Evidence in repo |
|------|------------------|
| Sales units | `FacturaItem.cantidad` on invoices with `estado='A'` |
| Stock / safety | `Articulo.stock`, `Articulo.minimo` |
| Lead time | Preferred `ProveedorArticulo` → `Proveedor.plazoHabitual` |
| Math | [`replenishmentForecastMath.ts`](../../../apps/server/services/replenishmentForecastMath.ts) |
| Service | [`ReplenishmentForecastService.ts`](../../../apps/server/services/ReplenishmentForecastService.ts) |
| REST | `GET /api/articulos/:id/reposicion-forecast`, `GET /api/catalogo/reposicion`, `POST /api/catalogo/reposicion/orden-compra-sugerida` |
| UI | Article form section + `/catalogo/reposicion` → OC prefill (`comprasOcPrefill` multi-line) |

## Algorithm (summary)

1. Sum sold units in 90 / 60 / 30 day windows; prefer the longest window with sales.
2. If units in the chosen window &lt; 30 → `insufficient_data` (no invented velocity).
3. `velocity = units / windowDays`; `daysRemaining = floor(stock / velocity)`.
4. `suggestedOrderQty = ceil(velocity × leadTime + minimo)`.
5. List candidates when `daysRemaining ≤ horizon` (default 30) or `stock ≤ minimo`.

Accuracy gate for Phase 1: MAPE &lt; 20% on a **synthetic fixture** in unit tests (not a live beta dataset).

## Permissions

- Read list / article forecast: `products.read` + module `logistics.purchases`
- Suggested OC: `suppliers.manage` + module `logistics.purchases`

## Out of scope / residual

- Holt-Winters / Prophet (later phases of #198)
- Real customer beta dataset for MAPE in production
- Closing issue #198 until remaining AC (if any ops/beta) are met

## Related

- Purchase orders: #135 (closed)
- OpenAPI: [`docs/api/openapi.yaml`](../../api/openapi.yaml)
