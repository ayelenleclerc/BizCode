import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { comisionesAPI } from '@/lib/api'
import type { ComisionTipo, ConfigComisionRow } from '@bizcode/types'
import { COMISION_TIPOS } from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

/**
 * @en Manager UI for commission rate configs and tenant accrual mode (#237).
 * @es UI de manager para configs de alícuota y modo de devengo del tenant (#237).
 * @pt-BR UI de gestor para configs de alíquota e modo de apropriação do tenant (#237).
 */
export default function ComisionesConfigPage() {
  const { t } = useTranslation('comisiones')
  const { t: tc } = useTranslation('common')
  const [rows, setRows] = useState<ConfigComisionRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [modoDevengo, setModoDevengo] = useState<ComisionTipo>('porcentaje_cobrado')
  const [vendedorId, setVendedorId] = useState('')
  const [tipo, setTipo] = useState<ComisionTipo>('porcentaje_cobrado')
  const [alicuota, setAlicuota] = useState('3')
  const [vigenciaDesde, setVigenciaDesde] = useState(new Date().toISOString().slice(0, 10))

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [list, settings] = await Promise.all([
        comisionesAPI.listConfigs({ take: 200 }),
        comisionesAPI.getSettings(),
      ])
      setRows(list?.data ?? [])
      setModoDevengo(settings.modoDevengo)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('errors.load')))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const onSaveSettings = async () => {
    setActionError(null)
    try {
      await comisionesAPI.updateSettings({ modoDevengo })
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.save'))
    }
  }

  const onCreate = async (e: FormEvent) => {
    e.preventDefault()
    setActionError(null)
    try {
      await comisionesAPI.createConfig({
        vendedorId: Number(vendedorId),
        tipo,
        alicuota: Number(alicuota),
        vigenciaDesde: new Date(vigenciaDesde).toISOString(),
      })
      setVendedorId('')
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.save'))
    }
  }

  const onDelete = async (id: number) => {
    if (!window.confirm(t('confirmDelete'))) return
    setActionError(null)
    try {
      await comisionesAPI.removeConfig(id)
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('errors.save'))
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4 p-4" data-testid="comisiones-config-page">
        <header>
          <h1 className="text-xl font-semibold">{t('configTitle')}</h1>
          <p className="text-sm text-slate-600">{t('configSubtitle')}</p>
        </header>

        {actionError ? (
          <p role="alert" className="text-sm text-red-700" data-testid="comisiones-action-error">
            {actionError}
          </p>
        ) : null}

        <CanAccess permission="commissions.manage">
          <div className="flex flex-wrap items-end gap-2" data-testid="comisiones-settings">
            <label className="text-sm">
              {t('modoDevengo')}
              <select
                className="mt-1 block rounded border px-2 py-1"
                value={modoDevengo}
                onChange={(e) => setModoDevengo(e.target.value as ComisionTipo)}
                data-testid="comisiones-modo"
              >
                {COMISION_TIPOS.map((tp) => (
                  <option key={tp} value={tp}>
                    {t(`tipos.${tp}`)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="rounded bg-slate-700 px-3 py-2 text-white"
              onClick={() => void onSaveSettings()}
              data-testid="comisiones-save-settings"
            >
              {t('saveSettings')}
            </button>
          </div>

          <form onSubmit={(e) => void onCreate(e)} className="grid max-w-xl gap-2 md:grid-cols-2" data-testid="comision-config-form">
            <label className="text-sm">
              {t('vendedorId')}
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                type="number"
                min={1}
                required
                value={vendedorId}
                onChange={(e) => setVendedorId(e.target.value)}
                data-testid="comision-vendedor"
              />
            </label>
            <label className="text-sm">
              {t('tipo')}
              <select
                className="mt-1 w-full rounded border px-2 py-1"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as ComisionTipo)}
                data-testid="comision-tipo"
              >
                {COMISION_TIPOS.map((tp) => (
                  <option key={tp} value={tp}>
                    {t(`tipos.${tp}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              {t('alicuota')}
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                type="number"
                min={0}
                step="0.01"
                required
                value={alicuota}
                onChange={(e) => setAlicuota(e.target.value)}
                data-testid="comision-alicuota"
              />
            </label>
            <label className="text-sm">
              {t('vigenciaDesde')}
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                type="date"
                required
                value={vigenciaDesde}
                onChange={(e) => setVigenciaDesde(e.target.value)}
                data-testid="comision-desde"
              />
            </label>
            <button type="submit" className="rounded bg-slate-800 px-3 py-2 text-white md:col-span-2" data-testid="comision-create">
              {t('create')}
            </button>
          </form>
        </CanAccess>

        <AsyncWrapper loading={loading} error={loadError}>
          {rows.length === 0 ? (
            <p data-testid="comisiones-configs-empty">{t('emptyConfigs')}</p>
          ) : (
            <table className="min-w-full text-left text-sm" data-testid="comisiones-configs-table">
              <thead>
                <tr>
                  <th>{t('vendedorId')}</th>
                  <th>{t('tipo')}</th>
                  <th>{t('alicuota')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} data-testid={`comision-config-row-${row.id}`}>
                    <td>{row.vendedorUsername ?? row.vendedorId}</td>
                    <td>{t(`tipos.${row.tipo}`)}</td>
                    <td>{row.alicuota}</td>
                    <td>
                      <CanAccess permission="commissions.manage">
                        <button
                          type="button"
                          className="text-red-700 underline"
                          onClick={() => void onDelete(row.id)}
                          data-testid={`comision-config-delete-${row.id}`}
                        >
                          {tc('delete', 'Eliminar')}
                        </button>
                      </CanAccess>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </AsyncWrapper>
      </div>
    </ErrorBoundary>
  )
}
