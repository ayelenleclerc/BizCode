import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  fiscalRetencionesAPI,
  type FiscalRetencionesConfigDTO,
  type RegimenRetencionDTO,
  type RegimenRetencionInputDTO,
} from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import IfModule from '@/components/IfModule'

const EMPTY_REGIMEN: RegimenRetencionInputDTO = {
  tipo: 'ganancias',
  subtipo: 'retencion',
  nombre: '',
  alicuota: 0,
}

/**
 * @en Withholding/perception regime configuration (#228).
 * @es Configuración de regímenes de retención/percepción (#228).
 * @pt-BR Configuração de regimes de retenção/percepção (#228).
 */
export default function FiscalRetencionesSection() {
  const { t } = useTranslation('empresa')
  const { claims } = useAuth()
  const canEdit =
    claims?.role != null && hasPermission(claims.role, 'settings.fiscal.manage')

  const [config, setConfig] = useState<FiscalRetencionesConfigDTO | null>(null)
  const [regimenes, setRegimenes] = useState<RegimenRetencionDTO[]>([])
  const [newRegimen, setNewRegimen] = useState<RegimenRetencionInputDTO>({ ...EMPTY_REGIMEN })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [savingConfig, setSavingConfig] = useState(false)
  const [creatingRegimen, setCreatingRegimen] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [cfg, regs] = await Promise.all([
        fiscalRetencionesAPI.getConfig(),
        fiscalRetencionesAPI.listRegimenes(),
      ])
      setConfig(cfg)
      setRegimenes(regs)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const updateConfigField = <K extends keyof FiscalRetencionesConfigDTO>(
    key: K,
    value: FiscalRetencionesConfigDTO[K],
  ) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
    setSaveSuccess(false)
  }

  const handleSaveConfig = async () => {
    if (!config || !canEdit) return
    setSavingConfig(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const updated = await fiscalRetencionesAPI.updateConfig(config)
      setConfig(updated)
      setSaveSuccess(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err))
    } finally {
      setSavingConfig(false)
    }
  }

  const handleCreateRegimen = async () => {
    if (!canEdit || newRegimen.nombre.trim().length === 0) return
    setCreatingRegimen(true)
    setSaveError(null)
    try {
      const created = await fiscalRetencionesAPI.createRegimen({
        ...newRegimen,
        nombre: newRegimen.nombre.trim(),
      })
      setRegimenes((prev) => [...prev, created])
      setNewRegimen({ ...EMPTY_REGIMEN })
      setSaveSuccess(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err))
    } finally {
      setCreatingRegimen(false)
    }
  }

  const toggleRegimenActivo = async (regimen: RegimenRetencionDTO) => {
    if (!canEdit) return
    setSaveError(null)
    try {
      const updated = await fiscalRetencionesAPI.updateRegimen(regimen.id, {
        activo: !regimen.activo,
      })
      setRegimenes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <IfModule flag="finance.retenciones">
      <section
        className="mt-8 border border-slate-200 dark:border-slate-600 rounded-lg p-4"
        aria-labelledby="fiscal-retenciones-heading"
        data-testid="fiscal-retenciones-section"
      >
        <h2
          id="fiscal-retenciones-heading"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1"
        >
          {t('retenciones.title')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('retenciones.hint')}</p>

        {loading && (
          <p role="status" aria-busy="true" className="text-sm text-slate-500">
            {t('retenciones.loading')}
          </p>
        )}
        {loadError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {loadError}
          </p>
        )}

        {!loading && !loadError && config && (
          <>
            <fieldset className="mb-6">
              <legend className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">
                {t('retenciones.agentFlagsLegend')}
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(
                  [
                    ['esAgenteRetencionGanancias', 'agentGanancias'],
                    ['esAgenteRetencionIVA', 'agentIva'],
                    ['esAgenteRetencionIIBB', 'agentIibb'],
                  ] as const
                ).map(([key, labelKey]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      id={`retenciones-${key}`}
                      type="checkbox"
                      data-testid={`checkbox-${key}`}
                      checked={config[key]}
                      disabled={!canEdit}
                      onChange={(e) => updateConfigField(key, e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor={`retenciones-${key}`}
                      className="text-sm text-slate-700 dark:text-slate-300"
                    >
                      {t(`retenciones.${labelKey}`)}
                    </label>
                  </div>
                ))}
              </div>
              {canEdit && (
                <button
                  type="button"
                  data-testid="btn-save-retenciones-config"
                  disabled={savingConfig}
                  onClick={() => void handleSaveConfig()}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
                >
                  {t('retenciones.saveConfig')}
                </button>
              )}
            </fieldset>

            <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-2">
              {t('retenciones.regimenesTitle')}
            </h3>
            {regimenes.length === 0 ? (
              <p className="text-sm text-slate-500 mb-4" data-testid="retenciones-empty">
                {t('retenciones.regimenesEmpty')}
              </p>
            ) : (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full text-sm" data-testid="retenciones-regimenes-table">
                  <thead>
                    <tr className="text-left text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-600">
                      <th scope="col" className="py-2 pr-4">
                        {t('retenciones.colNombre')}
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        {t('retenciones.colTipo')}
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        {t('retenciones.colAlicuota')}
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        {t('retenciones.colActivo')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {regimenes.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 dark:border-slate-700">
                        <td className="py-2 pr-4">{r.nombre}</td>
                        <td className="py-2 pr-4">
                          {t(`retenciones.tipo.${r.tipo}`)} / {t(`retenciones.subtipo.${r.subtipo}`)}
                        </td>
                        <td className="py-2 pr-4">{r.alicuota}%</td>
                        <td className="py-2 pr-4">
                          {r.activo ? (
                            <button
                              type="button"
                              data-testid={`btn-toggle-regimen-${r.id}`}
                              disabled={!canEdit}
                              onClick={() => void toggleRegimenActivo(r)}
                              className="text-blue-600 dark:text-blue-400 underline disabled:no-underline disabled:opacity-70"
                              aria-pressed="true"
                            >
                              {t('retenciones.activo')}
                            </button>
                          ) : (
                            <button
                              type="button"
                              data-testid={`btn-toggle-regimen-${r.id}`}
                              disabled={!canEdit}
                              onClick={() => void toggleRegimenActivo(r)}
                              className="text-blue-600 dark:text-blue-400 underline disabled:no-underline disabled:opacity-70"
                              aria-pressed="false"
                            >
                              {t('retenciones.inactivo')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {canEdit && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-slate-200 dark:border-slate-600 pt-4">
                <div>
                  <label htmlFor="regimen-tipo" className="block text-sm font-medium mb-1">
                    {t('retenciones.fieldTipo')}
                  </label>
                  <select
                    id="regimen-tipo"
                    data-testid="select-regimen-tipo"
                    value={newRegimen.tipo}
                    onChange={(e) =>
                      setNewRegimen((p) => ({
                        ...p,
                        tipo: e.target.value as RegimenRetencionInputDTO['tipo'],
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  >
                    <option value="ganancias">{t('retenciones.tipo.ganancias')}</option>
                    <option value="iva">{t('retenciones.tipo.iva')}</option>
                    <option value="iibb">{t('retenciones.tipo.iibb')}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="regimen-subtipo" className="block text-sm font-medium mb-1">
                    {t('retenciones.fieldSubtipo')}
                  </label>
                  <select
                    id="regimen-subtipo"
                    data-testid="select-regimen-subtipo"
                    value={newRegimen.subtipo}
                    onChange={(e) =>
                      setNewRegimen((p) => ({
                        ...p,
                        subtipo: e.target.value as RegimenRetencionInputDTO['subtipo'],
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  >
                    <option value="retencion">{t('retenciones.subtipo.retencion')}</option>
                    <option value="percepcion">{t('retenciones.subtipo.percepcion')}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="regimen-nombre" className="block text-sm font-medium mb-1">
                    {t('retenciones.fieldNombre')}
                  </label>
                  <input
                    id="regimen-nombre"
                    type="text"
                    data-testid="input-regimen-nombre"
                    value={newRegimen.nombre}
                    onChange={(e) => setNewRegimen((p) => ({ ...p, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label htmlFor="regimen-alicuota" className="block text-sm font-medium mb-1">
                    {t('retenciones.fieldAlicuota')}
                  </label>
                  <input
                    id="regimen-alicuota"
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    data-testid="input-regimen-alicuota"
                    value={newRegimen.alicuota}
                    onChange={(e) =>
                      setNewRegimen((p) => ({
                        ...p,
                        alicuota: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                  <button
                    type="button"
                    data-testid="btn-create-regimen"
                    disabled={creatingRegimen || newRegimen.nombre.trim().length === 0}
                    onClick={() => void handleCreateRegimen()}
                    className="px-4 py-2 bg-slate-800 dark:bg-slate-600 hover:bg-slate-900 text-white rounded transition disabled:opacity-50"
                  >
                    {t('retenciones.createRegimen')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {!canEdit && !loading && (
          <p className="text-xs text-slate-500">{t('retenciones.readOnlyHint')}</p>
        )}

        {saveError && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {saveError}
          </p>
        )}
        {saveSuccess && (
          <p role="status" className="mt-3 text-sm text-green-700 dark:text-green-400">
            {t('retenciones.saved')}
          </p>
        )}
      </section>
    </IfModule>
  )
}
