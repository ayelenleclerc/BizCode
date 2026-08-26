import { describe, expect, it } from 'vitest'
import {
  haversineKm,
  nearestNeighborOrder,
  optimizeStopOrder,
  tourDistanceKm,
  twoOptImprove,
  type RouteStopCoord,
} from '../../apps/server/services/repartoRouteOptimizeMath'

describe('repartoRouteOptimizeMath (#199)', () => {
  it('haversineKm returns ~0 for identical points', () => {
    expect(haversineKm({ lat: -34.6, lng: -58.4 }, { lat: -34.6, lng: -58.4 })).toBeCloseTo(0, 6)
  })

  it('tourDistanceKm sums consecutive segments', () => {
    const stops = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 1, lng: 1 },
    ]
    const d = tourDistanceKm(stops)
    expect(d).toBeCloseTo(
      haversineKm(stops[0]!, stops[1]!) + haversineKm(stops[1]!, stops[2]!),
      6,
    )
  })

  it('nearestNeighborOrder starts at lowest secuencia', () => {
    const stops: RouteStopCoord[] = [
      { id: 2, lat: 0, lng: 1, secuencia: 2 },
      { id: 1, lat: 0, lng: 0, secuencia: 1 },
      { id: 3, lat: 0, lng: 2, secuencia: 3 },
    ]
    const ordered = nearestNeighborOrder(stops)
    expect(ordered[0]?.id).toBe(1)
    expect(ordered.map((s) => s.id)).toEqual([1, 2, 3])
  })

  it('twoOptImprove does not increase tour length', () => {
    const stops: RouteStopCoord[] = [
      { id: 1, lat: 0, lng: 0, secuencia: 1 },
      { id: 2, lat: 1, lng: 0, secuencia: 2 },
      { id: 3, lat: 0, lng: 0.05, secuencia: 3 },
      { id: 4, lat: 1, lng: 0.05, secuencia: 4 },
    ]
    const improved = twoOptImprove(stops)
    expect(tourDistanceKm(improved)).toBeLessThanOrEqual(tourDistanceKm(stops) + 1e-9)
  })

  it('optimizeStopOrder improves zigzag fixture by ≥15%', () => {
    // Alternating north/south along longitude creates a long open tour; NN+2-opt recovers a short path.
    const stops: RouteStopCoord[] = []
    for (let i = 0; i < 12; i += 1) {
      stops.push({
        id: i + 1,
        lat: i % 2 === 0 ? -34.6 : -34.5,
        lng: -58.5 + i * 0.02,
        secuencia: i + 1,
      })
    }
    const result = optimizeStopOrder(stops)
    expect(result.distanceBeforeKm).toBeGreaterThan(0)
    expect(result.distanceAfterKm).toBeLessThan(result.distanceBeforeKm)
    expect(result.improvementRatio).toBeGreaterThanOrEqual(0.15)
    expect(result.orderedIds).toHaveLength(12)
    expect(new Set(result.orderedIds).size).toBe(12)
  })

  it('optimizeStopOrder handles 50 stops in under 3s with ≥15% improvement on zigzag', () => {
    const stops: RouteStopCoord[] = []
    for (let i = 0; i < 50; i += 1) {
      stops.push({
        id: i + 1,
        lat: i % 2 === 0 ? -34.6 : -34.5,
        lng: -58.5 + i * 0.01,
        secuencia: i + 1,
      })
    }
    const t0 = performance.now()
    const result = optimizeStopOrder(stops)
    const elapsedMs = performance.now() - t0
    expect(elapsedMs).toBeLessThan(3000)
    expect(result.improvementRatio).toBeGreaterThanOrEqual(0.15)
    expect(result.orderedIds).toHaveLength(50)
  })
})
