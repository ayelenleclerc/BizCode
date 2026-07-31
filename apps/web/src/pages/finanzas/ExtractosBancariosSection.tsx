/**
 * @en Bank accounts, statement import, and CSV mappings UI (#190).
 * @es UI de cuentas bancarias, importación de extractos y mapeos CSV (#190).
 * @pt-BR UI de contas bancárias, importação de extratos e mapeamentos CSV (#190).
 */
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import {
  bancosAPI,
  type BancoCsvMappingDTO,
  type CuentaBancariaDTO,
  type MovimientoBancarioDTO,
} from '@/lib/api'

function formatMoney(value: string | number): string {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-AR')
}

export default function ExtractosBancariosSection() {
  const { t } = useTranslation('finanzas')
  const [cuentas, setCuentas] = useState<CuentaBancariaDTO[]>([])
  const [mappings, setMappings] = useState<BancoCsvMappingDTO[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoBancarioDTO[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [banco, setBanco] = useState('galicia')
  const [tipoCuenta, setTipoCuenta] = useState('corriente')
  const [cbu, setCbu] = useState('')
  const [alias, setAlias] = useState('')
  const [bancoCodeImport, setBancoCodeImport] = useState('galicia')

  const [mapCode, setMapCode] = useState('')
  const [mapFecha, setMapFecha] = useState('Fecha')
  const [mapDesc, setMapDesc] = useState('Descripcion')
  const [mapImporte, setMapImporte] = useState('Importe')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [c, m] = await Promise.all([bancosAPI.listCuentas(), bancosAPI.listMappings()])
      setCuentas(c ?? [])
      setMappings(m ?? [])
      setSelectedId((prev) => (prev == null && c?.[0] ? c[0].id : prev))
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMovimientos = useCallback(async (cuentaId: number) => {
    try {
      const res = await bancosAPI.listMovimientos(cuentaId, { limit: 50, offset: 0 })
      setMovimientos(res?.data ?? [])
    } catch {
      setMovimientos([])
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (selectedId != null) void loadMovimientos(selectedId)
  }, [selectedId, loadMovimientos])

  const createCuenta = async () => {
    setBusy(true)
    setNotice(null)
    setError(null)
    try {
      const row = await bancosAPI.createCuenta({
        banco: banco.trim(),
        tipoCuenta,
        cbu: cbu.trim(),
        alias: alias.trim() || null,
      })
      setNotice(t('bancos.cuentaCreated'))
      setCbu('')
      setAlias('')
      await load()
      setSelectedId(row.id)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setBusy(false)
    }
  }

  const onImportFile = async (file: File | null) => {
    if (!file || selectedId == null) return
    setBusy(true)
    setNotice(null)
    setError(null)
    try {
      const result = await bancosAPI.importar(selectedId, file, {
        bancoCode: bancoCodeImport,
        fileName: file.name,
      })
      setNotice(
        t('bancos.importOk', {
          imported: result.imported,
          skipped: result.skippedDuplicates,
          format: result.format,
        }),
      )
      await loadMovimientos(selectedId)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setBusy(false)
    }
  }

  const createMapping = async () => {
    setBusy(true)
    setNotice(null)
    setError(null)
    try {
      await bancosAPI.createMapping({
        bancoCode: mapCode.trim().toLowerCase(),
        columnaFecha: mapFecha.trim(),
        columnaDescripcion: mapDesc.trim(),
        columnaImporte: mapImporte.trim(),
        columnaReferencia: null,
        columnaSaldo: null,
        separadorDecimal: ',',
        formatoFecha: 'dd/MM/yyyy',
        delimiter: ';',
        signoDebitoCredito: 'signed_importe',
      })
      setNotice(t('bancos.mappingCreated'))
      setMapCode('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-8" aria-labelledby="finanzas-bancos-heading" data-testid="bancos-section">
      <h2 id="finanzas-bancos-heading" className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {t('bancos.title')}
      </h2>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{t('bancos.intro')}</p>

      {notice && (
        <div role="status" className="mb-3 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-900 dark:border-green-700 dark:bg-green-950 dark:text-green-100" data-testid="bancos-notice">
          {notice}
        </div>
      )}

      {error && (
        <div role="alert" className="mb-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100" data-testid="bancos-error">
          {error.message}
          <button type="button" className="ml-2 underline" onClick={() => void load()}>
            {t('bancos.retry')}
          </button>
        </div>
      )}

      <AsyncWrapper loading={loading} error={null}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded border border-slate-200 p-4 dark:border-slate-600" data-testid="bancos-cuentas-panel">
            <h3 className="text-sm font-semibold">{t('bancos.cuentasTitle')}</h3>
            <label className="block text-sm" htmlFor="bancos-banco">
              {t('bancos.form.banco')}
              <input
                id="bancos-banco"
                data-testid="bancos-banco"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
              />
            </label>
            <label className="block text-sm" htmlFor="bancos-tipo">
              {t('bancos.form.tipoCuenta')}
              <select
                id="bancos-tipo"
                data-testid="bancos-tipo"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
                value={tipoCuenta}
                onChange={(e) => setTipoCuenta(e.target.value)}
              >
                <option value="corriente">{t('bancos.tipo.corriente')}</option>
                <option value="caja_ahorro">{t('bancos.tipo.caja_ahorro')}</option>
                <option value="otra">{t('bancos.tipo.otra')}</option>
              </select>
            </label>
            <label className="block text-sm" htmlFor="bancos-cbu">
              {t('bancos.form.cbu')}
              <input
                id="bancos-cbu"
                data-testid="bancos-cbu"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 font-mono dark:border-slate-600 dark:bg-slate-800"
                value={cbu}
                maxLength={22}
                onChange={(e) => setCbu(e.target.value.replace(/\D/g, '').slice(0, 22))}
              />
            </label>
            <label className="block text-sm" htmlFor="bancos-alias">
              {t('bancos.form.alias')}
              <input
                id="bancos-alias"
                data-testid="bancos-alias"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </label>
            <button
              type="button"
              data-testid="bancos-create-cuenta"
              disabled={busy || cbu.length !== 22}
              onClick={() => void createCuenta()}
              className="rounded bg-blue-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {t('bancos.form.create')}
            </button>

            {cuentas.length === 0 ? (
              <p className="text-sm text-slate-500" data-testid="bancos-cuentas-empty">
                {t('bancos.cuentasEmpty')}
              </p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-700" data-testid="bancos-cuentas-list">
                {cuentas.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      data-testid={`bancos-cuenta-${c.id}`}
                      className={`w-full px-2 py-2 text-left text-sm ${selectedId === c.id ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                      onClick={() => setSelectedId(c.id)}
                    >
                      <span className="font-medium">{c.banco}</span> — {c.cbu}
                      {c.alias ? ` (${c.alias})` : ''}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4 rounded border border-slate-200 p-4 dark:border-slate-600" data-testid="bancos-import-panel">
            <h3 className="text-sm font-semibold">{t('bancos.importTitle')}</h3>
            <label className="block text-sm" htmlFor="bancos-import-code">
              {t('bancos.form.bancoCode')}
              <select
                id="bancos-import-code"
                data-testid="bancos-import-code"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
                value={bancoCodeImport}
                onChange={(e) => setBancoCodeImport(e.target.value)}
              >
                {mappings.map((m) => (
                  <option key={m.id} value={m.bancoCode}>
                    {m.bancoCode}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm" htmlFor="bancos-file">
              {t('bancos.form.file')}
              <input
                id="bancos-file"
                data-testid="bancos-file"
                type="file"
                accept=".csv,.txt,.ofx,.qfx,.mt940,.sta,.swi"
                className="mt-1 block w-full text-sm"
                disabled={busy || selectedId == null}
                onChange={(e) => void onImportFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {selectedId == null && (
              <p className="text-xs text-amber-700 dark:text-amber-300">{t('bancos.selectAccountFirst')}</p>
            )}

            <h3 className="pt-2 text-sm font-semibold">{t('bancos.movimientosTitle')}</h3>
            {movimientos.length === 0 ? (
              <p className="text-sm text-slate-500" data-testid="bancos-movimientos-empty">
                {t('bancos.movimientosEmpty')}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm" data-testid="bancos-movimientos-table">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-1 pr-2">{t('bancos.col.fecha')}</th>
                      <th className="py-1 pr-2">{t('bancos.col.descripcion')}</th>
                      <th className="py-1 pr-2">{t('bancos.col.tipo')}</th>
                      <th className="py-1 pr-2">{t('bancos.col.importe')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((m) => (
                      <tr key={m.id} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="py-1 pr-2 whitespace-nowrap">{formatDate(m.fecha)}</td>
                        <td className="py-1 pr-2">{m.descripcion}</td>
                        <td className="py-1 pr-2">{t(`bancos.movTipo.${m.tipo}`)}</td>
                        <td className="py-1 pr-2 whitespace-nowrap">{formatMoney(m.importe)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded border border-slate-200 p-4 dark:border-slate-600" data-testid="bancos-mappings-panel">
          <h3 className="text-sm font-semibold">{t('bancos.mappingsTitle')}</h3>
          <p className="text-xs text-slate-500">{t('bancos.mappingsHint')}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-sm" htmlFor="bancos-map-code">
              {t('bancos.form.bancoCode')}
              <input id="bancos-map-code" data-testid="bancos-map-code" className="mt-1 w-full rounded border px-2 py-1 dark:border-slate-600 dark:bg-slate-800" value={mapCode} onChange={(e) => setMapCode(e.target.value)} />
            </label>
            <label className="block text-sm" htmlFor="bancos-map-fecha">
              {t('bancos.form.colFecha')}
              <input id="bancos-map-fecha" data-testid="bancos-map-fecha" className="mt-1 w-full rounded border px-2 py-1 dark:border-slate-600 dark:bg-slate-800" value={mapFecha} onChange={(e) => setMapFecha(e.target.value)} />
            </label>
            <label className="block text-sm" htmlFor="bancos-map-desc">
              {t('bancos.form.colDesc')}
              <input id="bancos-map-desc" data-testid="bancos-map-desc" className="mt-1 w-full rounded border px-2 py-1 dark:border-slate-600 dark:bg-slate-800" value={mapDesc} onChange={(e) => setMapDesc(e.target.value)} />
            </label>
            <label className="block text-sm" htmlFor="bancos-map-importe">
              {t('bancos.form.colImporte')}
              <input id="bancos-map-importe" data-testid="bancos-map-importe" className="mt-1 w-full rounded border px-2 py-1 dark:border-slate-600 dark:bg-slate-800" value={mapImporte} onChange={(e) => setMapImporte(e.target.value)} />
            </label>
          </div>
          <button
            type="button"
            data-testid="bancos-create-mapping"
            disabled={busy || !mapCode.trim()}
            onClick={() => void createMapping()}
            className="rounded bg-slate-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {t('bancos.form.createMapping')}
          </button>
          <ul className="text-sm text-slate-600 dark:text-slate-300" data-testid="bancos-mappings-list">
            {mappings.map((m) => (
              <li key={m.id}>
                <code>{m.bancoCode}</code>: {m.columnaFecha} / {m.columnaDescripcion} / {m.columnaImporte}
              </li>
            ))}
          </ul>
        </div>
      </AsyncWrapper>
    </section>
  )
}
