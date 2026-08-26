import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { repartosAPI, type Reparto, type RepartoRouteOptimizeResult } from '@/lib/api'

const DEFAULT_CENTER: L.LatLngExpression = [-34.6037, -58.3816]
const DEFAULT_ZOOM = 11

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

function FitStops({ positions }: { positions: L.LatLngExpression[] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0]!, DEFAULT_ZOOM)
      return
    }
    const bounds = L.latLngBounds(positions)
    map.fitBounds(bounds, { padding: [24, 24] })
  }, [map, positions])
  return null
}

type Props = {
  open: boolean
  repartoId: number
  onClose: () => void
  onApplied: (reparto: Reparto) => void
}

/**
 * @en Preview Leaflet map for TSP optimize accept/reject (#199).
 * @es Preview Leaflet para aceptar/descartar optimización TSP (#199).
 * @pt-BR Preview Leaflet para aceitar/descartar otimização TSP (#199).
 */
export default function RepartoOptimizeDialog({ open, repartoId, onClose, onApplied }: Props) {
  const { t } = useTranslation('repartos')
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<RepartoRouteOptimizeResult | null>(null)

  useEffect(() => {
    if (!open) {
      setPreview(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    void repartosAPI
      .optimizar(repartoId, { apply: false })
      .then((data) => {
        if (!cancelled && data) setPreview(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('REPARTO_ROUTE_INSUFFICIENT_COORDS')) {
          setError(t('optimize.errors.insufficientCoords'))
        } else if (msg.includes('REPARTO_INVALID_STATE')) {
          setError(t('errors.invalidState'))
        } else {
          setError(t('optimize.errors.preview'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, repartoId, t])

  const positions = useMemo(
    () =>
      (preview?.stops ?? []).map(
        (s) => [s.latitud, s.longitud] as L.LatLngExpression,
      ),
    [preview],
  )

  const handleAccept = async () => {
    setApplying(true)
    setError(null)
    try {
      const data = await repartosAPI.optimizar(repartoId, { apply: true })
      if (data?.reparto) {
        onApplied(data.reparto)
        onClose()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg.includes('REPARTO_ROUTE_INSUFFICIENT_COORDS')
        ? t('optimize.errors.insufficientCoords')
        : t('optimize.errors.apply'))
    } finally {
      setApplying(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reparto-optimize-title"
      data-testid="reparto-optimize-dialog"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-4 shadow-lg dark:bg-slate-900">
        <h2 id="reparto-optimize-title" className="text-lg font-semibold mb-2">
          {t('optimize.title')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{t('optimize.subtitle')}</p>

        {loading && <p data-testid="reparto-optimize-loading">{t('optimize.loading')}</p>}
        {error && (
          <p className="text-red-600 mb-3" role="alert" data-testid="reparto-optimize-error">
            {error}
          </p>
        )}

        {preview && !error && (
          <>
            <dl className="grid grid-cols-2 gap-2 text-sm mb-3" data-testid="reparto-optimize-stats">
              <div>
                <dt className="text-slate-500">{t('optimize.distanceBefore')}</dt>
                <dd className="font-medium">{preview.distanceBeforeKm.toFixed(2)} km</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('optimize.distanceAfter')}</dt>
                <dd className="font-medium">{preview.distanceAfterKm.toFixed(2)} km</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('optimize.improvement')}</dt>
                <dd className="font-medium">{preview.improvementPercent.toFixed(1)}%</dd>
              </div>
              {preview.skippedWithoutCoords > 0 && (
                <div>
                  <dt className="text-slate-500">{t('optimize.skipped')}</dt>
                  <dd className="font-medium">{preview.skippedWithoutCoords}</dd>
                </div>
              )}
            </dl>

            <ol className="mb-3 max-h-32 overflow-y-auto text-sm list-decimal list-inside" data-testid="reparto-optimize-stop-list">
              {preview.stops.map((s) => (
                <li key={s.repartoItemId}>
                  {s.secuencia}. {s.clienteRsocial ?? `#${s.repartoItemId}`}
                </li>
              ))}
            </ol>

            {positions.length > 0 && (
              <div className="h-64 mb-3 rounded border border-slate-200 dark:border-slate-600 overflow-hidden" data-testid="reparto-optimize-map">
                <MapContainer
                  center={DEFAULT_CENTER}
                  zoom={DEFAULT_ZOOM}
                  className="h-full w-full"
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitStops positions={positions} />
                  <Polyline positions={positions} pathOptions={{ color: '#2563eb', weight: 3 }} />
                  {preview.stops.map((s) => (
                    <Marker key={s.repartoItemId} position={[s.latitud, s.longitud]}>
                      <Popup>
                        {s.secuencia}. {s.clienteRsocial ?? `#${s.repartoItemId}`}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-sm border rounded"
            data-testid="reparto-optimize-reject"
          >
            {t('optimize.reject')}
          </button>
          <button
            type="button"
            onClick={() => void handleAccept()}
            disabled={!preview || !!error || applying || loading}
            className="px-3 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-40"
            data-testid="reparto-optimize-accept"
          >
            {applying ? t('optimize.applying') : t('optimize.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
