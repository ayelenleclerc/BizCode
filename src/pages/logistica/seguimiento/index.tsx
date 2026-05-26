import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useAuth } from '@/contexts/AuthContext'
import { repartosAPI, type RepartoActivo } from '@/lib/api'

const POLL_MS = 60_000
const DEFAULT_CENTER: L.LatLngExpression = [-34.6037, -58.3816]
const DEFAULT_ZOOM = 11

const GPS_VIEW_ROLES = ['owner', 'manager', 'logistics_planner'] as const

// @en Default Leaflet marker assets for Vite bundling. @es Iconos por defecto de Leaflet en Vite. @pt-BR Ícones padrão do Leaflet no Vite.
const defaultIcon = L.icon({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = defaultIcon

function formatRecordedAt(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

function MapBounds({ activos }: { activos: RepartoActivo[] }) {
  const map = useMap()
  const points = useMemo(
    () =>
      activos
        .filter((a) => a.ultimaUbicacion != null)
        .map((a) => [a.ultimaUbicacion!.lat, a.ultimaUbicacion!.lng] as [number, number]),
    [activos],
  )

  useEffect(() => {
    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
      return
    }
    if (points.length === 1) {
      map.setView(points[0], 14)
      return
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
  }, [map, points])

  return null
}

export default function SeguimientoPage() {
  const { t } = useTranslation('seguimiento')
  const { claims } = useAuth()
  const canView =
    (claims?.permissions.includes('logistics.read') ?? false) &&
    GPS_VIEW_ROLES.includes(claims?.role as (typeof GPS_VIEW_ROLES)[number])

  if (!canView) {
    return (
      <div className="p-8" data-testid="seguimiento-forbidden">
        <p className="text-slate-600 dark:text-slate-300">{t('forbidden')}</p>
      </div>
    )
  }

  return (
    <CanAccess
      permission="logistics.read"
      fallback={
        <div className="p-8" data-testid="seguimiento-forbidden">
          <p className="text-slate-600 dark:text-slate-300">{t('forbidden')}</p>
        </div>
      }
    >
      <ErrorBoundary>
        <SeguimientoPageContent />
      </ErrorBoundary>
    </CanAccess>
  )
}

function SeguimientoPageContent() {
  const { t } = useTranslation('seguimiento')
  const [activos, setActivos] = useState<RepartoActivo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [liveMessage, setLiveMessage] = useState('')

  const selected = useMemo(
    () => activos.find((a) => a.id === selectedId) ?? null,
    [activos, selectedId],
  )

  const loadActivos = useCallback(async () => {
    setError(null)
    try {
      const data = await repartosAPI.listActivos()
      setActivos(data ?? [])
      setLiveMessage(t('liveRegion'))
      if (selectedId != null && !(data ?? []).some((a) => a.id === selectedId)) {
        setSelectedId((data ?? [])[0]?.id ?? null)
      } else if (selectedId == null && (data ?? []).length > 0) {
        setSelectedId((data ?? [])[0]?.id ?? null)
      }
    } catch {
      setError(t('errors.load'))
      setActivos([])
    } finally {
      setLoading(false)
    }
  }, [selectedId, t])

  useEffect(() => {
    let cancelled = false
    const pull = () => {
      if (cancelled) return
      void loadActivos()
    }
    pull()
    const interval = setInterval(pull, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [loadActivos])

  const markers = activos.filter((a) => a.ultimaUbicacion != null)

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4 min-h-[70vh]" data-testid="seguimiento-page">
      <div>
        <Link to="/logistica" className="text-sm text-blue-600 underline">
          Logística
        </Link>
        <h1 className="text-2xl font-bold mt-2">{t('title')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
      </div>

      <p className="sr-only" aria-live="polite">
        {liveMessage}
      </p>

      {loading && (
        <p role="status" aria-busy="true">
          {t('loading')}
        </p>
      )}
      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}
      {!loading && !error && activos.length === 0 && (
        <p data-testid="seguimiento-empty">{t('empty')}</p>
      )}

      {!loading && activos.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          <aside
            className="lg:w-80 shrink-0 border border-slate-200 dark:border-slate-700 rounded-lg p-3 overflow-y-auto max-h-[40vh] lg:max-h-none"
            aria-label={t('listAria')}
            data-testid="seguimiento-sidebar"
          >
            <h2 className="font-semibold text-sm mb-2">{t('sidebarTitle')}</h2>
            <ul className="space-y-2">
              {activos.map((activo) => (
                <li key={activo.id}>
                  <button
                    type="button"
                    className={`w-full text-left rounded-md p-2 text-sm border ${
                      selectedId === activo.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    data-testid={`seguimiento-reparto-${activo.id}`}
                    onClick={() => setSelectedId(activo.id)}
                  >
                    {selectedId === activo.id ? (
                      <span className="sr-only">{t('selected')}</span>
                    ) : null}
                    <span className="font-medium block">{activo.chofer.username}</span>
                    <span className="text-slate-600 dark:text-slate-400 block">
                      {t('progress', {
                        delivered: activo.progress.delivered,
                        total: activo.progress.total,
                      })}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {activo.ultimaUbicacion
                        ? t('lastUpdate', {
                            time: formatRecordedAt(activo.ultimaUbicacion.recordedAt),
                          })
                        : t('noLocation')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex-1 flex flex-col gap-3 min-h-[320px]">
            <div
              className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 h-[50vh] min-h-[280px]"
              data-testid="seguimiento-map"
              role="region"
              aria-label={t('mapAria')}
            >
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                className="h-full w-full"
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapBounds activos={activos} />
                {markers.map((activo) => (
                  <Marker
                    key={activo.id}
                    position={[activo.ultimaUbicacion!.lat, activo.ultimaUbicacion!.lng]}
                    eventHandlers={{
                      click: () => setSelectedId(activo.id),
                    }}
                  >
                    <Popup>
                      {activo.chofer.username} —{' '}
                      {t('progress', {
                        delivered: activo.progress.delivered,
                        total: activo.progress.total,
                      })}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {selected && (
              <section
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                tabIndex={-1}
                aria-labelledby="seguimiento-detail-title"
                data-testid="seguimiento-detail"
              >
                <h2 id="seguimiento-detail-title" className="font-semibold">
                  {t('detailTitle', { id: selected.id })}
                </h2>
                <dl className="mt-2 text-sm grid gap-1">
                  <div>
                    <dt className="inline font-medium">{t('driver')}: </dt>
                    <dd className="inline">{selected.chofer.username}</dd>
                  </div>
                  {selected.currentStop && (
                    <>
                      <div>
                        <dt className="inline font-medium">{t('currentClient')}: </dt>
                        <dd className="inline">{selected.currentStop.cliente.rsocial}</dd>
                      </div>
                      {selected.currentStop.cliente.domicilio && (
                        <div>
                          <dt className="inline font-medium">{t('address')}: </dt>
                          <dd className="inline">{selected.currentStop.cliente.domicilio}</dd>
                        </div>
                      )}
                      {selected.currentStop.zona && (
                        <div>
                          <dt className="inline font-medium">{t('zone')}: </dt>
                          <dd className="inline">{selected.currentStop.zona.nombre}</dd>
                        </div>
                      )}
                    </>
                  )}
                </dl>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
