# Otimização de rotas (TSP) — MVP (#199)

**Papel do documento:** Guia de qualidade do produto para ordem de paradas com haversine + nearest-neighbor + 2-opt.  
**Issue relacionado:** [#199](https://github.com/ayelenleclerc/BizCode/issues/199)

**Não** afirma Google Routes, OSRM, OR-Tools, tráfego em tempo real nem economia medida em frota de produção.

## Escopo (MVP)

| Item | Evidência no repositório |
|------|--------------------------|
| Coords do cliente | `Cliente.latitud` / `Cliente.longitud` (Prisma); graváveis via `ClienteInput` / Zod / formulário (manual; sem geocoder) |
| Matemática | [`repartoRouteOptimizeMath.ts`](../../../apps/server/services/repartoRouteOptimizeMath.ts) |
| Serviço | `RepartoService.optimizeRoute` |
| REST | `POST /api/repartos/:id/optimizar` body `{ apply?: boolean }` (padrão = preview) |
| UI | Painel de acompanhamento do reparto → diálogo (polyline Leaflet) aceitar/descartar |
| AC fixture | Testes unitários: zigzag ≥15% melhoria; 50 paradas &lt; 3s |

## Algoritmo (resumo)

1. Inclui apenas paradas cujo cliente tenha latitude e longitude.
2. Se houver menos de duas → `422 REPARTO_ROUTE_INSUFFICIENT_COORDS`.
3. Distância do tour aberto = soma de segmentos haversine (km).
4. Nearest-neighbor parte da parada geocodificada com a **menor `secuencia` atual** (origem proxy; `Deposito` sem GPS).
5. 2-opt melhora o tour aberto.
6. Paradas sem coordenadas são anexadas no final (ordem relativa original).
7. `apply: true` reescreve `RepartoItem.secuencia` 1..n e audita `reparto_route_optimized`.

## Permissões

- Iguais às outras mutações de reparto: `orders.dispatch`.

## Fora de escopo / residual

- Geocoder ao salvar endereço
- GPS do depósito, janelas horárias, capacidade, multi-veículo
- Google Routes / OSRM / OR-Tools / microsserviço Python
- AC ≥15% em frota real (apenas fixture sintético)

## Relacionado

- OpenAPI: `POST /api/repartos/{id}/optimizar`
- Padrão Leaflet reutilizado do acompanhamento logístico
