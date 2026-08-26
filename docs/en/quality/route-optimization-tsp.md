# Route optimization (TSP) — MVP (#199)

**Document role:** Product quality guide for the haversine nearest-neighbor + 2-opt stop-order feature.  
**Related issue:** [#199](https://github.com/ayelenleclerc/BizCode/issues/199)

Does **not** claim Google Routes, OSRM, OR-Tools, traffic-aware routing, or measured fleet savings in production.

## Scope (MVP)

| Item | Evidence in repo |
|------|------------------|
| Customer coords | `Cliente.latitud` / `Cliente.longitud` (Prisma); writable via `ClienteInput` / Zod / UI form (manual; no geocoder) |
| Math | [`repartoRouteOptimizeMath.ts`](../../../apps/server/services/repartoRouteOptimizeMath.ts) |
| Service | `RepartoService.optimizeRoute` |
| REST | `POST /api/repartos/:id/optimizar` body `{ apply?: boolean }` (default preview) |
| UI | Reparto tracking panel → optimize dialog (Leaflet polyline) accept/reject |
| AC fixture | Unit tests: zigzag ≥15% improvement; 50 stops &lt; 3s |

## Algorithm (summary)

1. Include only stops whose customer has both latitude and longitude.
2. If fewer than two such stops → `422 REPARTO_ROUTE_INSUFFICIENT_COORDS`.
3. Open-tour distance = sum of consecutive haversine segments (km).
4. Nearest-neighbor starts at the geocoded stop with the **lowest current `secuencia`** (proxy origin; `Deposito` has no GPS).
5. 2-opt improves the open tour.
6. Stops without coordinates are appended after the optimized geocoded set (original relative order).
7. `apply: true` rewrites `RepartoItem.secuencia` 1..n and audits `reparto_route_optimized`.

## Permissions

- Same as other reparto mutations: `orders.dispatch` (planner / owner / manager matrix unchanged).

## Out of scope / residual

- External geocoder when saving address
- Depot GPS, time windows, vehicle capacity, multi-vehicle
- Google Routes / OSRM / OR-Tools / Python microservice
- Production fleet ≥15% AC (validated on synthetic fixture only)

## Related

- OpenAPI: `POST /api/repartos/{id}/optimizar`
- Leaflet pattern reused from logistics tracking (`seguimiento`)
