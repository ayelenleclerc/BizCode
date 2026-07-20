import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { cajaAPI, formasPagoAPI } from '@/lib/api'
import type { CajaRow, FormaPago, TurnoCajaRow } from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

type Counts = {
  abiertos?: number
  cerradosHoy?: number
  diferenciaHoy?: number
}

function money(value: number | null | undefined): string {
  if (value == null) return '—'
  return value.toLocaleString(undefined, { style: 'currency', currency: 'ARS' })
}

export default function CajaPage() {
  const { t } = useTranslation('caja')
  const [cajas, setCajas] = useState<CajaRow[]>([])
  const [turnos, setTurnos] = useState<TurnoCajaRow[]>([])
  const [counts, setCounts] = useState<Counts>({})
  const [formas, setFormas] = useState<FormaPago[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [nombreCaja, setNombreCaja] = useState('')
  const [cajaIdOpen, setCajaIdOpen] = useState('')
  const [montoApertura, setMontoApertura] = useState('0')
  const [activeTurnoId, setActiveTurnoId] = useState<number | null>(null)
  const [movTipo, setMovTipo] = useState<'egreso' | 'ingreso_extra'>('egreso')
  const [movImporte, setMovImporte] = useState('')
  const [movConcepto, setMovConcepto] = useState('')
  const [b1000, setB1000] = useState('0')
  const [obs, setObs] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [cList, tRes, fpList] = await Promise.all([
        cajaAPI.listCajas(),
        cajaAPI.listTurnos(),
        formasPagoAPI.list(),
      ])
      setCajas(cList ?? [])
      setTurnos(tRes?.data ?? [])
      setCounts((tRes?.counts as Counts) ?? {})
      setFormas((fpList as FormaPago[]) ?? [])
      const open = (tRes?.data ?? []).find((row) => row.estado === 'abierto')
      setActiveTurnoId(open?.id ?? null)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('loadError')))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreateCaja(event: FormEvent): Promise<void> {
    event.preventDefault()
    await cajaAPI.createCaja({ nombre: nombreCaja.trim() })
    setNombreCaja('')
    await load()
  }

  async function handleOpen(event: FormEvent): Promise<void> {
    event.preventDefault()
    await cajaAPI.open({
      cajaId: Number.parseInt(cajaIdOpen, 10),
      montoApertura: Number.parseFloat(montoApertura) || 0,
    })
    await load()
  }

  async function handleMovimiento(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (activeTurnoId == null) return
    await cajaAPI.addMovimiento(activeTurnoId, {
      tipo: movTipo,
      importe: Number.parseFloat(movImporte),
      concepto: movConcepto.trim() || null,
    })
    setMovImporte('')
    setMovConcepto('')
    await load()
  }

  async function handleClose(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (activeTurnoId == null) return
    await cajaAPI.close(activeTurnoId, {
      conteo: { b1000: Number.parseInt(b1000, 10) || 0 },
      observaciones: obs.trim() || null,
    })
    setObs('')
    await load()
  }

  async function toggleEsEfectivo(fp: FormaPago): Promise<void> {
    await formasPagoAPI.patch(fp.id, { esEfectivo: !fp.esEfectivo })
    await load()
  }

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="caja-page">
        <h1 className="text-2xl font-semibold mb-4">{t('title')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6" data-testid="caja-counts">
          <div className="rounded border border-slate-700 p-3">
            <div className="text-sm text-slate-400">{t('counts.abiertos')}</div>
            <div className="text-xl font-semibold">{counts.abiertos ?? 0}</div>
          </div>
          <div className="rounded border border-slate-700 p-3">
            <div className="text-sm text-slate-400">{t('counts.cerradosHoy')}</div>
            <div className="text-xl font-semibold">{counts.cerradosHoy ?? 0}</div>
          </div>
          <div className="rounded border border-slate-700 p-3">
            <div className="text-sm text-slate-400">{t('counts.diferenciaHoy')}</div>
            <div className="text-xl font-semibold">{money(counts.diferenciaHoy)}</div>
          </div>
        </div>

        <CanAccess permission="sales.create">
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <form onSubmit={(e) => void handleCreateCaja(e)} className="grid gap-2 rounded border border-slate-700 p-3">
              <h2 className="font-semibold">{t('nuevaCaja')}</h2>
              <label className="grid gap-1 text-sm">
                {t('nombreCaja')}
                <input
                  data-testid="caja-nombre"
                  className="rounded border border-slate-600 bg-slate-900 px-2 py-1"
                  value={nombreCaja}
                  onChange={(e) => setNombreCaja(e.target.value)}
                  required
                />
              </label>
              <button type="submit" data-testid="caja-crear" className="rounded bg-sky-700 px-3 py-2">
                {t('crearCaja')}
              </button>
            </form>

            <form onSubmit={(e) => void handleOpen(e)} className="grid gap-2 rounded border border-slate-700 p-3">
              <h2 className="font-semibold">{t('abrirTurno')}</h2>
              <label className="grid gap-1 text-sm">
                {t('cajas')}
                <select
                  data-testid="caja-select"
                  className="rounded border border-slate-600 bg-slate-900 px-2 py-1"
                  value={cajaIdOpen}
                  onChange={(e) => setCajaIdOpen(e.target.value)}
                  required
                >
                  <option value="">—</option>
                  {cajas.filter((c) => c.activa).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                {t('montoApertura')}
                <input
                  data-testid="caja-monto-apertura"
                  type="number"
                  min={0}
                  step="0.01"
                  className="rounded border border-slate-600 bg-slate-900 px-2 py-1"
                  value={montoApertura}
                  onChange={(e) => setMontoApertura(e.target.value)}
                  required
                />
              </label>
              <button type="submit" data-testid="caja-abrir" className="rounded bg-emerald-700 px-3 py-2">
                {t('abrirTurno')}
              </button>
            </form>
          </div>

          {activeTurnoId != null && (
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <form onSubmit={(e) => void handleMovimiento(e)} className="grid gap-2 rounded border border-slate-700 p-3">
                <label className="grid gap-1 text-sm">
                  {t('egreso')} / {t('ingresoExtra')}
                  <select
                    data-testid="caja-mov-tipo"
                    className="rounded border border-slate-600 bg-slate-900 px-2 py-1"
                    value={movTipo}
                    onChange={(e) => setMovTipo(e.target.value as 'egreso' | 'ingreso_extra')}
                  >
                    <option value="egreso">{t('egreso')}</option>
                    <option value="ingreso_extra">{t('ingresoExtra')}</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  {t('importe')}
                  <input
                    data-testid="caja-mov-importe"
                    type="number"
                    min={0.01}
                    step="0.01"
                    className="rounded border border-slate-600 bg-slate-900 px-2 py-1"
                    value={movImporte}
                    onChange={(e) => setMovImporte(e.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  {t('concepto')}
                  <input
                    data-testid="caja-mov-concepto"
                    className="rounded border border-slate-600 bg-slate-900 px-2 py-1"
                    value={movConcepto}
                    onChange={(e) => setMovConcepto(e.target.value)}
                  />
                </label>
                <button type="submit" data-testid="caja-mov-submit" className="rounded bg-amber-700 px-3 py-2">
                  {t('registrar')}
                </button>
              </form>

              <form onSubmit={(e) => void handleClose(e)} className="grid gap-2 rounded border border-slate-700 p-3">
                <h2 className="font-semibold">{t('cerrarTurno')}</h2>
                <label className="grid gap-1 text-sm">
                  {t('conteo')} ($1000)
                  <input
                    data-testid="caja-conteo-b1000"
                    type="number"
                    min={0}
                    className="rounded border border-slate-600 bg-slate-900 px-2 py-1"
                    value={b1000}
                    onChange={(e) => setB1000(e.target.value)}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  {t('observaciones')}
                  <input
                    data-testid="caja-obs"
                    className="rounded border border-slate-600 bg-slate-900 px-2 py-1"
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                  />
                </label>
                <button type="submit" data-testid="caja-cerrar" className="rounded bg-rose-700 px-3 py-2">
                  {t('cerrarTurno')}
                </button>
              </form>
            </div>
          )}
        </CanAccess>

        <section className="mb-6" aria-labelledby="formas-pago-caja-title">
          <h2 id="formas-pago-caja-title" className="font-semibold mb-2">
            {t('formasPagoTitle')}
          </h2>
          <ul className="space-y-1" data-testid="caja-formas-pago">
            {formas.map((fp) => (
              <li key={fp.id} className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(fp.esEfectivo)}
                    onChange={() => void toggleEsEfectivo(fp)}
                    data-testid={`caja-fp-efectivo-${fp.id}`}
                  />
                  {fp.descripcion} — {t('esEfectivo')}
                </label>
              </li>
            ))}
          </ul>
        </section>

        <AsyncWrapper loading={loading} error={loadError}>
          {turnos.length === 0 ? (
            <p data-testid="caja-empty" className="text-slate-400">
              {t('empty')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm" data-testid="caja-turnos-table">
                <thead>
                  <tr className="text-left border-b border-slate-700">
                    <th className="py-2 pr-3">{t('columns.caja')}</th>
                    <th className="py-2 pr-3">{t('columns.cajero')}</th>
                    <th className="py-2 pr-3">{t('columns.estado')}</th>
                    <th className="py-2 pr-3">{t('columns.apertura')}</th>
                    <th className="py-2 pr-3">{t('columns.esperado')}</th>
                    <th className="py-2 pr-3">{t('columns.contado')}</th>
                    <th className="py-2 pr-3">{t('columns.diferencia')}</th>
                    <th className="py-2 pr-3">{t('pdf')}</th>
                  </tr>
                </thead>
                <tbody>
                  {turnos.map((row) => (
                    <tr key={row.id} className="border-b border-slate-800">
                      <td className="py-2 pr-3">{row.caja?.nombre ?? row.cajaId}</td>
                      <td className="py-2 pr-3">{row.cajero?.username ?? row.cajeroId}</td>
                      <td className="py-2 pr-3">{t(`estado.${row.estado}`)}</td>
                      <td className="py-2 pr-3">{new Date(row.fechaApertura).toLocaleString()}</td>
                      <td className="py-2 pr-3">{money(row.efectivoEsperado)}</td>
                      <td className="py-2 pr-3">{money(row.efectivoContado)}</td>
                      <td className="py-2 pr-3">{money(row.diferencia)}</td>
                      <td className="py-2 pr-3">
                        {row.estado === 'cerrado' ? (
                          <a
                            href={`/api${cajaAPI.pdfUrl(row.id)}`}
                            data-testid={`caja-pdf-${row.id}`}
                            className="text-sky-400 underline"
                          >
                            PDF
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncWrapper>
      </div>
    </ErrorBoundary>
  )
}
