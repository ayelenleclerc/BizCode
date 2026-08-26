/**
 * @en Pure haversine + nearest-neighbor + 2-opt route order math for repartos (#199).
 * @es Matemática pura haversine + nearest-neighbor + 2-opt para orden de repartos (#199).
 * @pt-BR Matemática pura haversine + nearest-neighbor + 2-opt para ordem de repartos (#199).
 */

export type RouteStopCoord = {
  /** RepartoItem id */
  id: number
  lat: number
  lng: number
  /** Current secuencia (used to pick NN start). */
  secuencia: number
}

export type OptimizeStopOrderResult = {
  orderedIds: number[]
  distanceBeforeKm: number
  distanceAfterKm: number
  /** (before - after) / before when before > 0; else 0. */
  improvementRatio: number
}

const EARTH_RADIUS_KM = 6371

/**
 * @en Great-circle distance in kilometres between two WGS84 points.
 * @es Distancia ortodrómica en kilómetros entre dos puntos WGS84.
 * @pt-BR Distância ortodrômica em quilômetros entre dois pontos WGS84.
 */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * @en Sum of consecutive haversine segments (open tour, no return to start).
 * @es Suma de segmentos haversine consecutivos (tour abierta, sin retorno al inicio).
 * @pt-BR Soma de segmentos haversine consecutivos (tour aberta, sem retorno ao início).
 */
export function tourDistanceKm(stops: Array<{ lat: number; lng: number }>): number {
  if (stops.length < 2) return 0
  let total = 0
  for (let i = 0; i < stops.length - 1; i += 1) {
    total += haversineKm(stops[i]!, stops[i + 1]!)
  }
  return total
}

/**
 * @en Nearest-neighbor tour starting from the stop with lowest secuencia.
 * @es Tour nearest-neighbor partiendo de la parada con menor secuencia.
 * @pt-BR Tour nearest-neighbor partindo da parada com menor sequência.
 */
export function nearestNeighborOrder(stops: RouteStopCoord[]): RouteStopCoord[] {
  if (stops.length <= 1) return [...stops]

  let start = stops[0]!
  for (const s of stops) {
    if (s.secuencia < start.secuencia) start = s
  }

  const remaining = new Map(stops.map((s) => [s.id, s]))
  remaining.delete(start.id)
  const ordered: RouteStopCoord[] = [start]
  let current = start

  while (remaining.size > 0) {
    let best: RouteStopCoord | null = null
    let bestDist = Number.POSITIVE_INFINITY
    for (const candidate of remaining.values()) {
      const d = haversineKm(current, candidate)
      if (d < bestDist) {
        bestDist = d
        best = candidate
      }
    }
    if (!best) break
    ordered.push(best)
    remaining.delete(best.id)
    current = best
  }

  return ordered
}

/**
 * @en 2-opt local search improving an open tour (swap segments when shorter).
 * @es Búsqueda local 2-opt que mejora un tour abierto (intercambia segmentos si acorta).
 * @pt-BR Busca local 2-opt que melhora um tour aberto (troca segmentos se encurtar).
 */
export function twoOptImprove(stops: RouteStopCoord[]): RouteStopCoord[] {
  if (stops.length < 4) return [...stops]

  const route = [...stops]
  let improved = true
  while (improved) {
    improved = false
    for (let i = 0; i < route.length - 2; i += 1) {
      for (let k = i + 1; k < route.length - 1; k += 1) {
        const a = route[i]!
        const b = route[i + 1]!
        const c = route[k]!
        const d = route[k + 1]!
        const before = haversineKm(a, b) + haversineKm(c, d)
        const after = haversineKm(a, c) + haversineKm(b, d)
        if (after + 1e-9 < before) {
          const reversed = route.slice(i + 1, k + 1).reverse()
          route.splice(i + 1, k - i, ...reversed)
          improved = true
        }
      }
    }
  }
  return route
}

/**
 * @en Optimize stop order: NN from lowest-secuencia start, then 2-opt; compare to input order.
 * @es Optimiza el orden: NN desde la menor secuencia, luego 2-opt; compara con el orden de entrada.
 * @pt-BR Otimiza a ordem: NN a partir da menor sequência, depois 2-opt; compara com a ordem de entrada.
 */
export function optimizeStopOrder(stops: RouteStopCoord[]): OptimizeStopOrderResult {
  const bySecuencia = [...stops].sort((a, b) => a.secuencia - b.secuencia)
  const distanceBeforeKm = tourDistanceKm(bySecuencia)

  if (stops.length < 2) {
    return {
      orderedIds: bySecuencia.map((s) => s.id),
      distanceBeforeKm,
      distanceAfterKm: distanceBeforeKm,
      improvementRatio: 0,
    }
  }

  const nn = nearestNeighborOrder(bySecuencia)
  const optimized = twoOptImprove(nn)
  const distanceAfterKm = tourDistanceKm(optimized)
  const improvementRatio =
    distanceBeforeKm > 0 ? Math.max(0, (distanceBeforeKm - distanceAfterKm) / distanceBeforeKm) : 0

  return {
    orderedIds: optimized.map((s) => s.id),
    distanceBeforeKm,
    distanceAfterKm,
    improvementRatio,
  }
}
