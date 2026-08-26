# Optimización de rutas (TSP) — MVP (#199)

**Rol del documento:** Guía de calidad del producto para el orden de paradas con haversine + nearest-neighbor + 2-opt.  
**Issue relacionado:** [#199](https://github.com/ayelenleclerc/BizCode/issues/199)

**No** afirma Google Routes, OSRM, OR-Tools, tráfico en tiempo real ni ahorro medido en flota de producción.

## Alcance (MVP)

| Ítem | Evidencia en el repo |
|------|----------------------|
| Coords de cliente | `Cliente.latitud` / `Cliente.longitud` (Prisma); escribibles vía `ClienteInput` / Zod / formulario (manual; sin geocoder) |
| Matemática | [`repartoRouteOptimizeMath.ts`](../../../apps/server/services/repartoRouteOptimizeMath.ts) |
| Servicio | `RepartoService.optimizeRoute` |
| REST | `POST /api/repartos/:id/optimizar` body `{ apply?: boolean }` (por defecto preview) |
| UI | Panel de seguimiento de reparto → diálogo (polyline Leaflet) aceptar/descartar |
| AC fixture | Tests unitarios: zigzag ≥15% mejora; 50 paradas &lt; 3s |

## Algoritmo (resumen)

1. Solo paradas cuyo cliente tenga latitud y longitud.
2. Si hay menos de dos → `422 REPARTO_ROUTE_INSUFFICIENT_COORDS`.
3. Distancia del tour abierto = suma de segmentos haversine (km).
4. Nearest-neighbor parte de la parada geocodificada con **menor `secuencia` actual** (origen proxy; `Deposito` sin GPS).
5. 2-opt mejora el tour abierto.
6. Paradas sin coordenadas se agregan al final (orden relativo original).
7. `apply: true` reescribe `RepartoItem.secuencia` 1..n y audita `reparto_route_optimized`.

## Permisos

- Igual que otras mutaciones de reparto: `orders.dispatch`.

## Fuera de alcance / residual

- Geocoder al guardar domicilio
- GPS de depósito, ventanas horarias, capacidad, multi-vehículo
- Google Routes / OSRM / OR-Tools / microservicio Python
- AC ≥15% en flota real (solo fixture sintético)

## Relacionado

- OpenAPI: `POST /api/repartos/{id}/optimizar`
- Patrón Leaflet reutilizado de seguimiento logístico
