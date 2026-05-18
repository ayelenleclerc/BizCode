import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ApiRequestFailedError,
  modulesCatalogAPI,
  superadminAPI,
  type ModuleCatalogDataDTO,
  type ModuleCatalogEntryDTO,
  type TenantConfigDTO,
  type TenantConfigHistoryEntry,
  type TenantModuleTrialDTO,
  type TenantPricingData,
} from '@/lib/api'
import {
  MODULE_KEYS,
  MODULE_PRESET_KEYS,
  estimateTenantMonthlyPrice,
  moduleI18nKey,
  type ModuleKey,
} from '@/lib/modules'

function isModuleKey(value: string): value is ModuleKey {
  return (MODULE_KEYS as readonly string[]).includes(value)
}

function parseTenantId(raw: string | undefined): number | null {
  if (!raw) return null
  const id = parseInt(raw, 10)
  return Number.isInteger(id) && id > 0 ? id : null
}

/**
 * @en Super-admin UI to enable/disable tenant modules (#225).
 * @es UI de super-admin para habilitar/deshabilitar módulos por tenant (#225).
 * @pt-BR UI de super-admin para habilitar/desabilitar módulos por tenant (#225).
 */
export default function TenantModulesPage() {
  const { tenantId: tenantIdParam } = useParams()
  const tenantId = parseTenantId(tenantIdParam)
  const { t, i18n } = useTranslation('common')
  const reasonFieldId = useId()
  const presetFieldId = useId()
  const trialModuleFieldId = useId()
  const trialDaysFieldId = useId()

  const [tenantName, setTenantName] = useState<string | null>(null)
  const [tenantPlan, setTenantPlan] = useState<string>('starter')
  const [catalog, setCatalog] = useState<ModuleCatalogDataDTO | null>(null)
  const [activeModules, setActiveModules] = useState<Set<string>>(new Set())
  const [trials, setTrials] = useState<TenantModuleTrialDTO[]>([])
  const [trialModuleKey, setTrialModuleKey] = useState('')
  const [trialDays, setTrialDays] = useState(30)
  const [activatingTrial, setActivatingTrial] = useState(false)
  const [reason, setReason] = useState('')
  const [selectedPreset, setSelectedPreset] = useState('')
  const [history, setHistory] = useState<TenantConfigHistoryEntry[]>([])
  const [historyTotal, setHistoryTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [applyingPreset, setApplyingPreset] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationDetail, setValidationDetail] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const applyConfigToState = useCallback((config: TenantConfigDTO) => {
    setActiveModules(new Set(config.modules))
    setTenantPlan(config.plan)
  }, [])

  const trialsByModule = useMemo(() => {
    const map = new Map<string, TenantModuleTrialDTO>()
    for (const trial of trials) {
      if (trial.active) {
        map.set(trial.moduleKey, trial)
      }
    }
    return map
  }, [trials])

  const pricingEstimate: TenantPricingData = useMemo(
    () => estimateTenantMonthlyPrice(tenantPlan, [...activeModules]),
    [tenantPlan, activeModules],
  )

  const formatMoney = useCallback(
    (amount: number) =>
      new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      }).format(amount),
    [i18n.language],
  )

  const loadHistory = useCallback(async (id: number) => {
    const data = await superadminAPI.getConfigHistory(id, { take: 20, skip: 0 })
    setHistory(data.items)
    setHistoryTotal(data.total)
  }, [])

  const load = useCallback(async () => {
    if (tenantId === null) {
      setError(t('superadmin.errors.invalidId'))
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    setValidationDetail(null)
    setSaveSuccess(false)
    try {
      const [tenant, config, catalogData, trialList] = await Promise.all([
        superadminAPI.getTenant(tenantId),
        superadminAPI.getConfig(tenantId),
        modulesCatalogAPI.get(),
        superadminAPI.listTrials(tenantId),
      ])
      setTenantName(tenant.name)
      setCatalog(catalogData)
      applyConfigToState(config)
      setTrials(trialList)
      await loadHistory(tenantId)
    } catch {
      setError(t('superadmin.modules.errors.loadFailed'))
      setCatalog(null)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [tenantId, t, applyConfigToState, loadHistory])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const getCatalogEntry = (key: string): ModuleCatalogEntryDTO | undefined =>
    catalog?.modules.find((m) => m.key === key)

  const missingDependencies = (key: string): string[] => {
    const entry = getCatalogEntry(key)
    if (!entry) return []
    return entry.dependencies.filter((dep) => !activeModules.has(dep))
  }

  const toggleModule = (key: string) => {
    const entry = getCatalogEntry(key)
    if (!entry) return

    setActiveModules((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (!entry.canDeactivate) return prev
        next.delete(key)
      } else {
        const missing = entry.dependencies.filter((dep) => !next.has(dep))
        if (missing.length > 0) return prev
        next.add(key)
      }
      return next
    })
    setSaveSuccess(false)
    setValidationDetail(null)
  }

  const handleSave = async () => {
    if (tenantId === null) return
    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      setValidationDetail(t('superadmin.modules.errors.reasonRequired'))
      return
    }
    setSaving(true)
    setError(null)
    setValidationDetail(null)
    setSaveSuccess(false)
    try {
      const updated = await superadminAPI.putConfig(tenantId, {
        modules: [...activeModules],
        reason: trimmedReason,
      })
      applyConfigToState(updated)
      setReason('')
      setSaveSuccess(true)
      await loadHistory(tenantId)
    } catch (e) {
      if (e instanceof ApiRequestFailedError && e.message === 'invalid_module_set') {
        setValidationDetail(formatValidationErrors(e.validation, t))
      } else {
        setError(t('superadmin.modules.errors.saveFailed'))
      }
    } finally {
      setSaving(false)
    }
  }

  const handleActivateTrial = async () => {
    if (tenantId === null || !trialModuleKey) return
    const confirmed = window.confirm(t('superadmin.modules.trial.confirmActivate'))
    if (!confirmed) return

    setActivatingTrial(true)
    setError(null)
    setValidationDetail(null)
    try {
      const created = await superadminAPI.activateTrial(tenantId, {
        moduleKey: trialModuleKey,
        days: trialDays,
        reason: t('superadmin.modules.trial.activateReason', { module: trialModuleKey }),
      })
      setTrials((prev) => {
        const next = prev.filter((tr) => tr.moduleKey !== created.moduleKey)
        return [...next, created]
      })
      const config = await superadminAPI.getConfig(tenantId)
      applyConfigToState(config)
      setTrialModuleKey('')
      setSaveSuccess(true)
    } catch (e) {
      if (e instanceof ApiRequestFailedError && e.message === 'invalid_module_set') {
        setValidationDetail(formatValidationErrors(e.validation, t))
      } else {
        setError(t('superadmin.modules.trial.errors.activateFailed'))
      }
    } finally {
      setActivatingTrial(false)
    }
  }

  const handleDeactivateTrial = async (moduleKey: string) => {
    if (tenantId === null) return
    const confirmed = window.confirm(t('superadmin.modules.trial.confirmDeactivate'))
    if (!confirmed) return
    try {
      await superadminAPI.deactivateTrial(tenantId, moduleKey)
      setTrials((prev) => prev.filter((tr) => tr.moduleKey !== moduleKey))
    } catch {
      setError(t('superadmin.modules.trial.errors.deactivateFailed'))
    }
  }

  const handleApplyPreset = async () => {
    if (tenantId === null || !selectedPreset) return
    const presetLabel = t(`superadmin.modules.presets.${selectedPreset}`, {
      defaultValue: selectedPreset,
    })
    const confirmed = window.confirm(
      t('superadmin.modules.confirmApplyPreset', { preset: presetLabel }),
    )
    if (!confirmed) return

    setApplyingPreset(true)
    setError(null)
    setValidationDetail(null)
    setSaveSuccess(false)
    try {
      const updated = await superadminAPI.applyConfigTemplate(tenantId, {
        preset: selectedPreset,
        reason: t('superadmin.modules.presetReason', { preset: selectedPreset }),
      })
      applyConfigToState(updated)
      setSaveSuccess(true)
      await loadHistory(tenantId)
    } catch (e) {
      if (e instanceof ApiRequestFailedError && e.message === 'invalid_module_set') {
        setValidationDetail(formatValidationErrors(e.validation, t))
      } else {
        setError(t('superadmin.modules.errors.presetFailed'))
      }
    } finally {
      setApplyingPreset(false)
    }
  }

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(
      i18n.language === 'en' ? 'en-US' : i18n.language === 'pt-BR' ? 'pt-BR' : 'es-AR',
      { dateStyle: 'medium', timeStyle: 'short' },
    ).format(new Date(iso))

  if (loading) {
    return (
      <div className="p-8" role="status" aria-busy="true" data-testid="superadmin-modules-loading">
        <p className="text-slate-700 dark:text-slate-300">{t('status.loading')}</p>
      </div>
    )
  }

  if (error && !catalog) {
    return (
      <ModulesErrorPage
        message={error}
        backHref={tenantId ? `/superadmin/tenants/${tenantId}` : '/superadmin'}
        backLabel={t('superadmin.backToDetail')}
        retryLabel={t('actions.retry')}
        onRetry={() => void load()}
      />
    )
  }

  return (
    <div className="p-8 max-w-4xl" data-testid="superadmin-modules-page">
      <p className="mb-4">
        <Link
          to={tenantId ? `/superadmin/tenants/${tenantId}` : '/superadmin'}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {t('superadmin.backToDetail')}
        </Link>
      </p>

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {t('superadmin.modules.title')}
        </h1>
        {tenantName ? (
          <p className="mt-1 text-slate-600 dark:text-slate-400">{tenantName}</p>
        ) : null}
        {catalog ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
            {t('superadmin.modules.deploymentEnv', { env: catalog.deploymentEnv })}
          </p>
        ) : null}
      </header>

      {error ? (
        <div role="alert" className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {validationDetail ? (
        <ValidationAlert message={validationDetail} />
      ) : null}

      <section
        className="mb-8 rounded border border-slate-200 p-4 dark:border-slate-700"
        aria-labelledby="superadmin-pricing-heading"
        data-testid="superadmin-pricing-panel"
        role="status"
        aria-live="polite"
      >
        <h2 id="superadmin-pricing-heading" className="text-lg font-semibold mb-2">
          {t('superadmin.modules.pricing.title')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('superadmin.modules.pricing.plan', { plan: pricingEstimate.plan })}
        </p>
        <p className="text-sm">
          {t('superadmin.modules.pricing.base', { amount: formatMoney(pricingEstimate.basePrice) })}
        </p>
        {pricingEstimate.addons.length > 0 ? (
          <ul className="mt-2 text-sm list-disc pl-5">
            {pricingEstimate.addons.map((addon) => (
              <li key={addon.moduleKey}>
                {isModuleKey(addon.moduleKey) ? t(moduleI18nKey(addon.moduleKey)) : addon.moduleKey}:{' '}
                {formatMoney(addon.price)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-slate-500">{t('superadmin.modules.pricing.noAddons')}</p>
        )}
        <p className="mt-3 text-lg font-semibold" data-testid="superadmin-pricing-total">
          {t('superadmin.modules.pricing.total', {
            amount: formatMoney(pricingEstimate.totalMonthly),
          })}
        </p>
        <p className="mt-1 text-xs text-slate-500">{t('superadmin.modules.pricing.disclaimer')}</p>
      </section>

      {saveSuccess ? (
        <div
          role="status"
          className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-green-900 dark:border-green-700 dark:bg-green-950 dark:text-green-200"
          data-testid="superadmin-config-save-success"
        >
          {t('superadmin.modules.saveSuccess')}
        </div>
      ) : null}

      <section className="mb-8" aria-labelledby="superadmin-modules-list-heading">
        <h2 id="superadmin-modules-list-heading" className="text-lg font-semibold mb-3">
          {t('superadmin.modules.modulesSection')}
        </h2>
        <ul className="space-y-2 list-none p-0" data-testid="superadmin-modules-list">
          {catalog?.modules.map((entry) => {
            const key = entry.key
            const checked = activeModules.has(key)
            const disabled = !checked && missingDependencies(key).length > 0
            const lockToggle = checked && !entry.canDeactivate
            const i18nKey = isModuleKey(key) ? moduleI18nKey(key) : undefined
            const label = i18nKey ? t(i18nKey) : key
            const missing = missingDependencies(key)
            const trial = trialsByModule.get(key)
            const hint =
              missing.length > 0
                ? t('superadmin.modules.missingDeps', {
                    deps: missing
                      .map((dep) => (isModuleKey(dep) ? t(moduleI18nKey(dep)) : dep))
                      .join(', '),
                  })
                : lockToggle
                  ? t('superadmin.modules.cannotDeactivate')
                  : undefined

            return (
              <li
                key={key}
                className="flex items-start gap-3 rounded border border-slate-200 p-3 dark:border-slate-700"
              >
                <input
                  type="checkbox"
                  id={`module-toggle-${key}`}
                  checked={checked}
                  disabled={disabled || lockToggle}
                  onChange={() => toggleModule(key)}
                  className="mt-1"
                  data-testid={`superadmin-module-toggle-${key}`}
                  aria-describedby={hint ? `module-hint-${key}` : undefined}
                />
                <div className="flex-1">
                  <label htmlFor={`module-toggle-${key}`} className="font-medium cursor-pointer">
                    {label}
                  </label>
                  {trial ? (
                    <span
                      className="ml-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900 dark:bg-amber-900 dark:text-amber-100"
                      data-testid={`superadmin-trial-badge-${key}`}
                    >
                      {t('superadmin.modules.trial.badge', { days: trial.daysRemaining })}
                    </span>
                  ) : null}
                  {entry.dependencies.length > 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('superadmin.modules.dependsOn', {
                        deps: entry.dependencies
                          .map((dep) => (isModuleKey(dep) ? t(moduleI18nKey(dep)) : dep))
                          .join(', '),
                      })}
                    </p>
                  ) : null}
                  {hint ? (
                    <p id={`module-hint-${key}`} className="text-xs text-amber-700 dark:text-amber-300">
                      {hint}
                    </p>
                  ) : null}
                  {trial ? (
                    <button
                      type="button"
                      className="mt-2 text-xs text-red-700 underline dark:text-red-300"
                      onClick={() => void handleDeactivateTrial(key)}
                      data-testid={`superadmin-trial-deactivate-${key}`}
                    >
                      {t('superadmin.modules.trial.deactivate')}
                    </button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mb-8" aria-labelledby="superadmin-trial-heading">
        <h2 id="superadmin-trial-heading" className="text-lg font-semibold mb-3">
          {t('superadmin.modules.trial.section')}
        </h2>
        <div className="flex flex-wrap items-end gap-3 max-w-lg">
          <label htmlFor={trialModuleFieldId} className="flex flex-col gap-1 text-sm font-medium">
            {t('superadmin.modules.trial.moduleLabel')}
            <select
              id={trialModuleFieldId}
              value={trialModuleKey}
              onChange={(e) => setTrialModuleKey(e.target.value)}
              className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              data-testid="superadmin-trial-module-select"
            >
              <option value="">{t('superadmin.modules.trial.modulePlaceholder')}</option>
              {catalog?.modules
                .filter((m) => m.price > 0)
                .map((m) => (
                  <option key={m.key} value={m.key}>
                    {isModuleKey(m.key) ? t(moduleI18nKey(m.key)) : m.key}
                  </option>
                ))}
            </select>
          </label>
          <label htmlFor={trialDaysFieldId} className="flex flex-col gap-1 text-sm font-medium">
            {t('superadmin.modules.trial.daysLabel')}
            <input
              id={trialDaysFieldId}
              type="number"
              min={1}
              max={365}
              value={trialDays}
              onChange={(e) => setTrialDays(Number.parseInt(e.target.value, 10) || 30)}
              className="w-24 rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              data-testid="superadmin-trial-days"
            />
          </label>
          <button
            type="button"
            disabled={!trialModuleKey || activatingTrial}
            onClick={() => void handleActivateTrial()}
            className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
            data-testid="superadmin-trial-activate"
          >
            {activatingTrial ? t('actions.saving') : t('superadmin.modules.trial.activate')}
          </button>
        </div>
      </section>

      <section className="mb-8" aria-labelledby="superadmin-save-heading">
        <h2 id="superadmin-save-heading" className="text-lg font-semibold mb-3">
          {t('superadmin.modules.saveSection')}
        </h2>
        <div className="flex flex-col gap-3 max-w-md">
          <label htmlFor={reasonFieldId} className="text-sm font-medium">
            {t('superadmin.modules.reasonLabel')}
          </label>
          <textarea
            id={reasonFieldId}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            maxLength={500}
            className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            data-testid="superadmin-config-reason"
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="w-fit rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            data-testid="superadmin-config-save"
          >
            {saving ? t('actions.saving') : t('superadmin.modules.save')}
          </button>
        </div>
      </section>

      <section className="mb-8" aria-labelledby="superadmin-preset-heading">
        <h2 id="superadmin-preset-heading" className="text-lg font-semibold mb-3">
          {t('superadmin.modules.presetSection')}
        </h2>
        <PresetRow
          presetFieldId={presetFieldId}
          selectedPreset={selectedPreset}
          onPresetChange={setSelectedPreset}
          applyingPreset={applyingPreset}
          onApply={() => void handleApplyPreset()}
          t={t}
        />
      </section>

      <section aria-labelledby="superadmin-history-heading">
        <h2 id="superadmin-history-heading" className="text-lg font-semibold mb-3">
          {t('superadmin.modules.historySection')}
        </h2>
        {history.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400" data-testid="superadmin-config-history-empty">
            {t('superadmin.modules.historyEmpty')}
          </p>
        ) : (
          <div className="overflow-auto" data-testid="superadmin-config-history">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2">{t('superadmin.modules.historyDate')}</th>
                  <th className="p-2">{t('superadmin.modules.historyReason')}</th>
                  <th className="p-2">{t('superadmin.modules.historyUser')}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-2 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                    <td className="p-2">{row.reason ?? '—'}</td>
                    <td className="p-2">{row.changedById}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {historyTotal > history.length ? (
              <p className="mt-2 text-xs text-slate-500">
                {t('superadmin.modules.historyTruncated', {
                  shown: history.length,
                  total: historyTotal,
                })}
              </p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}

function formatValidationErrors(
  validation: ApiRequestFailedError['validation'],
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  if (!validation?.errors?.length) {
    return t('superadmin.modules.errors.invalidModuleSet')
  }
  return validation.errors
    .map((err) => {
      const mod = isModuleKey(err.module) ? t(moduleI18nKey(err.module)) : err.module
      return `${mod}: ${err.reason}`
    })
    .join('\n')
}

function ValidationAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-4 whitespace-pre-wrap rounded border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
      data-testid="superadmin-config-validation-error"
    >
      {message}
    </div>
  )
}

function PresetRow({
  presetFieldId,
  selectedPreset,
  onPresetChange,
  applyingPreset,
  onApply,
  t,
}: {
  presetFieldId: string
  selectedPreset: string
  onPresetChange: (v: string) => void
  applyingPreset: boolean
  onApply: () => void
  t: (key: string, opts?: Record<string, unknown>) => string
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 max-w-lg">
      <label htmlFor={presetFieldId} className="flex flex-col gap-1 text-sm font-medium">
        {t('superadmin.modules.presetLabel')}
        <select
          id={presetFieldId}
          value={selectedPreset}
          onChange={(e) => onPresetChange(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          data-testid="superadmin-preset-select"
        >
          <option value="">{t('superadmin.modules.presetPlaceholder')}</option>
          {MODULE_PRESET_KEYS.map((preset) => (
            <option key={preset} value={preset}>
              {t(`superadmin.modules.presets.${preset}`, { defaultValue: preset })}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        disabled={!selectedPreset || applyingPreset}
        onClick={onApply}
        className="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-600"
        data-testid="superadmin-preset-apply"
      >
        {applyingPreset ? t('actions.saving') : t('superadmin.modules.applyPreset')}
      </button>
    </div>
  )
}

function ModulesErrorPage({
  message,
  backHref,
  backLabel,
  retryLabel,
  onRetry,
}: {
  message: string
  backHref: string
  backLabel: string
  retryLabel: string
  onRetry: () => void
}) {
  return (
    <div className="p-8" role="alert" data-testid="superadmin-modules-error">
      <p className="text-red-700 dark:text-red-300">{message}</p>
      <button type="button" className="mt-4 mr-4 underline" onClick={onRetry}>
        {retryLabel}
      </button>
      <Link to={backHref} className="text-blue-600 hover:underline dark:text-blue-400">
        {backLabel}
      </Link>
    </div>
  )
}
