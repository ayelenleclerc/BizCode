import { useEffect, useRef } from 'react'
import { repartosAPI } from '@/lib/api'

const POST_INTERVAL_MS = 120_000
const WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 120_000,
}

/**
 * @en Posts driver GPS to the API every 2 minutes while on route (#144); optional if denied.
 * @es Envía GPS del chofer cada 2 min en ruta (#144); opcional si se deniega geolocalización.
 * @pt-BR Envia GPS do motorista a cada 2 min em rota (#144); opcional se negado.
 */
export function useDriverLocationTracking(repartoId: number | null, enabled: boolean): void {
  const coordsRef = useRef<GeolocationCoordinates | null>(null)

  useEffect(() => {
    if (!enabled || repartoId == null) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) return

    let watchId: number | null = null
    let intervalId: ReturnType<typeof setInterval> | null = null

    const flush = () => {
      const coords = coordsRef.current
      if (!coords || document.hidden) return
      void repartosAPI
        .recordUbicacion(repartoId, { lat: coords.latitude, lng: coords.longitude })
        .catch(() => {
          /* tracking is optional; do not block POD */
        })
    }

    const startWatch = () => {
      if (document.hidden || watchId != null) return
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          coordsRef.current = pos.coords
        },
        () => {
          /* permission denied or unavailable — silent */
        },
        WATCH_OPTIONS,
      )
    }

    const stopWatch = () => {
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId)
        watchId = null
      }
    }

    const startInterval = () => {
      if (document.hidden || intervalId != null) return
      intervalId = setInterval(flush, POST_INTERVAL_MS)
    }

    const stopInterval = () => {
      if (intervalId != null) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        stopWatch()
        stopInterval()
      } else {
        startWatch()
        startInterval()
        flush()
      }
    }

    startWatch()
    startInterval()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stopWatch()
      stopInterval()
      document.removeEventListener('visibilitychange', onVisibility)
      coordsRef.current = null
    }
  }, [enabled, repartoId])
}
