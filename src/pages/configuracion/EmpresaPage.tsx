import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { empresaAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import { validateCUIT } from '@/lib/validators'
import type { EmpresaConfig } from '@/types'
import AfipFiscalSection from './AfipFiscalSection'
import PrintDevicesSection from './PrintDevicesSection'
import ProveedorAlertasConfigSection from './ProveedorAlertasConfigSection'

const EMPRESA_TIMEZONE_OPTIONS = [
  'America/Argentina/Buenos_Aires',
  'America/Argentina/Cordoba',
  'America/Argentina/Mendoza',
  'America/Sao_Paulo',
  'America/Montevideo',
  'America/Santiago',
  'America/Bogota',
  'America/Mexico_City',
  'UTC',
] as const

const empresaFormSchema = z
  .object({
    nombre: z.string().trim().min(1).max(40),
    cuit: z.string().trim().refine((v) => validateCUIT(v), { message: 'cuitInvalid' }),
    domicilio: z.string().max(40).optional(),
    puntoVenta: z.coerce.number().int().min(1).max(9999),
    tipoFactura: z.enum(['A', 'B', 'C']),
    logoUrl: z.string().max(255).optional(),
    recordatorioDiasGracia: z.coerce.number().int().min(0).max(365),
    timezone: z.string().min(1).max(64),
    recordatorioHoraInicio: z.coerce.number().int().min(0).max(23),
    recordatorioHoraFin: z.coerce.number().int().min(1).max(24),
    condicionIva: z.enum(['RI', 'Mono', 'CF', 'Exento']),
    ingresosBrutos: z.string().max(30).optional(),
    fechaInicioActividades: z
      .string()
      .optional()
      .refine((v) => !v || v.trim() === '' || /^\d{4}-\d{2}-\d{2}$/.test(v.trim()), {
        message: 'fechaInicioInvalid',
      }),
  })
  .refine((data) => data.recordatorioHoraInicio < data.recordatorioHoraFin, {
    message: 'reminderWindowInvalid',
    path: ['recordatorioHoraFin'],
  })

type EmpresaFormData = z.infer<typeof empresaFormSchema>

function configToFormValues(data: EmpresaConfig): EmpresaFormData {
  return {
    nombre: data.nombre,
    cuit: data.cuit,
    domicilio: data.domicilio ?? '',
    puntoVenta: data.puntoVenta,
    tipoFactura: data.tipoFactura,
    logoUrl: data.logoUrl ?? '',
    recordatorioDiasGracia: data.recordatorioDiasGracia,
    timezone: data.timezone,
    recordatorioHoraInicio: data.recordatorioHoraInicio,
    recordatorioHoraFin: data.recordatorioHoraFin,
    condicionIva: data.condicionIva,
    ingresosBrutos: data.ingresosBrutos ?? '',
    fechaInicioActividades: data.fechaInicioActividades ?? '',
  }
}

export default function EmpresaPage() {
  const { t } = useTranslation('empresa')
  const { t: tc } = useTranslation('common')
  const { claims } = useAuth()
  const canEdit =
    claims?.role != null && hasPermission(claims.role, 'settings.business.manage')

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [prefijoPreview, setPrefijoPreview] = useState('0001')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      nombre: '',
      cuit: '',
      domicilio: '',
      puntoVenta: 1,
      tipoFactura: 'B',
      logoUrl: '',
      recordatorioDiasGracia: 0,
      timezone: 'America/Argentina/Buenos_Aires',
      recordatorioHoraInicio: 8,
      recordatorioHoraFin: 18,
      condicionIva: 'RI',
      ingresosBrutos: '',
      fechaInicioActividades: '',
    },
  })

  const puntoVentaWatch = watch('puntoVenta')

  useEffect(() => {
    const n = Number(puntoVentaWatch)
    if (Number.isFinite(n) && n >= 1 && n <= 9999) {
      setPrefijoPreview(String(n).padStart(4, '0'))
    }
  }, [puntoVentaWatch])

  const loadConfig = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await empresaAPI.get()
      if (!data) {
        setLoadError(t('errors.loadFailed'))
        return
      }
      reset(configToFormValues(data))
      setPrefijoPreview(data.prefijoFactura)
    } catch {
      setLoadError(t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [reset, t])

  useEffect(() => {
    void loadConfig()
  }, [loadConfig])

  const onSubmit = async (data: EmpresaFormData) => {
    if (!canEdit) return
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const dom = data.domicilio?.trim()
      const logo = data.logoUrl?.trim()
      const saved = await empresaAPI.update({
        nombre: data.nombre.trim(),
        cuit: data.cuit.trim(),
        domicilio: dom && dom.length > 0 ? dom : null,
        puntoVenta: data.puntoVenta,
        tipoFactura: data.tipoFactura,
        logoUrl: logo && logo.length > 0 ? logo : null,
        recordatorioDiasGracia: data.recordatorioDiasGracia,
        timezone: data.timezone,
        recordatorioHoraInicio: data.recordatorioHoraInicio,
        recordatorioHoraFin: data.recordatorioHoraFin,
        condicionIva: data.condicionIva,
        ingresosBrutos: data.ingresosBrutos?.trim() ? data.ingresosBrutos.trim() : null,
        fechaInicioActividades: data.fechaInicioActividades?.trim()
          ? data.fechaInicioActividades.trim()
          : null,
      })
      if (!saved) {
        setSaveError(t('errors.saveFailed'))
        return
      }
      reset(configToFormValues(saved))
      setPrefijoPreview(saved.prefijoFactura)
      setSaveSuccess(true)
    } catch {
      setSaveError(t('errors.saveFailed'))
    }
  }

  const fieldError = (key: keyof EmpresaFormData, fallback: string) => {
    const err = errors[key]
    if (!err?.message) return null
    if (err.message === 'cuitInvalid') return t('errors.cuitInvalid')
    if (err.message === 'reminderWindowInvalid') return t('errors.reminderWindowInvalid')
    if (err.message === 'fechaInicioInvalid') return t('errors.fechaInicioInvalid')
    return fallback
  }

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <p className="text-slate-600 dark:text-slate-400" role="status">
          {tc('status.loading')}
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </header>

      {loadError && (
        <p className="mb-4 text-red-600 dark:text-red-400" role="alert">
          {loadError}
        </p>
      )}

      {!canEdit && (
        <p className="mb-4 text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded px-3 py-2">
          {t('readOnlyHint')}
        </p>
      )}

      <form
        data-testid="form-empresa"
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e)
        }}
        noValidate
        className="space-y-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="empresa-nombre" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('form.nombre')}
              <span className="text-red-500" aria-hidden="true">
                {' '}
                *
              </span>
            </label>
            <input
              id="empresa-nombre"
              data-testid="input-empresa-nombre"
              {...register('nombre')}
              readOnly={!canEdit}
              aria-required="true"
              {...(errors.nombre ? { 'aria-invalid': 'true' as const } : {})}
              aria-describedby={errors.nombre ? 'empresa-nombre-error' : undefined}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
              disabled={!canEdit}
            />
            {errors.nombre && (
              <p id="empresa-nombre-error" className="text-red-500 text-xs mt-1" role="alert">
                {t('errors.nombreRequired')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="empresa-cuit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('form.cuit')}
              <span className="text-red-500" aria-hidden="true">
                {' '}
                *
              </span>
            </label>
            <input
              id="empresa-cuit"
              data-testid="input-empresa-cuit"
              {...register('cuit')}
              readOnly={!canEdit}
              aria-required="true"
              {...(errors.cuit ? { 'aria-invalid': 'true' as const } : {})}
              aria-describedby="empresa-cuit-hint empresa-cuit-error"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
              disabled={!canEdit}
            />
            <p id="empresa-cuit-hint" className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('form.cuitHint')}
            </p>
            {errors.cuit && (
              <p id="empresa-cuit-error" className="text-red-500 text-xs mt-1" role="alert">
                {fieldError('cuit', t('errors.cuitInvalid'))}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="empresa-domicilio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('form.domicilio')}
            </label>
            <input
              id="empresa-domicilio"
              data-testid="input-empresa-domicilio"
              {...register('domicilio')}
              readOnly={!canEdit}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
              disabled={!canEdit}
            />
          </div>

          <div>
            <label htmlFor="empresa-condicion-iva" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('form.condicionIva')}
            </label>
            <select
              id="empresa-condicion-iva"
              data-testid="select-empresa-condicion-iva"
              {...register('condicionIva')}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
            >
              <option value="RI">{t('form.condicionRi')}</option>
              <option value="Mono">{t('form.condicionMono')}</option>
              <option value="CF">{t('form.condicionCf')}</option>
              <option value="Exento">{t('form.condicionExento')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="empresa-ingresos-brutos" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('form.ingresosBrutos')}
            </label>
            <input
              id="empresa-ingresos-brutos"
              data-testid="input-empresa-ingresos-brutos"
              {...register('ingresosBrutos')}
              readOnly={!canEdit}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
              disabled={!canEdit}
            />
          </div>

          <div>
            <label
              htmlFor="empresa-fecha-inicio"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t('form.fechaInicioActividades')}
            </label>
            <input
              id="empresa-fecha-inicio"
              type="date"
              data-testid="input-empresa-fecha-inicio"
              {...register('fechaInicioActividades')}
              readOnly={!canEdit}
              {...(errors.fechaInicioActividades ? { 'aria-invalid': 'true' as const } : {})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
              disabled={!canEdit}
            />
            {errors.fechaInicioActividades && (
              <p className="text-red-500 text-xs mt-1" role="alert">
                {fieldError('fechaInicioActividades', t('errors.fechaInicioInvalid'))}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="empresa-punto-venta" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('form.puntoVenta')}
              <span className="text-red-500" aria-hidden="true">
                {' '}
                *
              </span>
            </label>
            <input
              id="empresa-punto-venta"
              type="number"
              min={1}
              max={9999}
              data-testid="input-empresa-punto-venta"
              {...register('puntoVenta')}
              readOnly={!canEdit}
              aria-required="true"
              {...(errors.puntoVenta ? { 'aria-invalid': 'true' as const } : {})}
              aria-describedby="empresa-pv-hint empresa-pv-error"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
              disabled={!canEdit}
            />
            <p id="empresa-pv-hint" className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('form.puntoVentaHint')}
            </p>
            {errors.puntoVenta && (
              <p id="empresa-pv-error" className="text-red-500 text-xs mt-1" role="alert">
                {t('errors.puntoVentaInvalid')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="empresa-tipo-factura" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('form.tipoFactura')}
            </label>
            <select
              id="empresa-tipo-factura"
              data-testid="select-empresa-tipo-factura"
              {...register('tipoFactura')}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
              disabled={!canEdit}
            >
              <option value="A">{t('form.tipoA')}</option>
              <option value="B">{t('form.tipoB')}</option>
              <option value="C">{t('form.tipoC')}</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form.prefijoPreview')}</p>
            <p className="text-lg font-mono text-slate-900 dark:text-slate-100" data-testid="empresa-prefijo-preview">
              {prefijoPreview}
            </p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="empresa-logo-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('form.logoUrl')}
            </label>
            <input
              id="empresa-logo-url"
              type="url"
              data-testid="input-empresa-logo-url"
              {...register('logoUrl')}
              readOnly={!canEdit}
              aria-describedby="empresa-logo-hint"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
              disabled={!canEdit}
            />
            <p id="empresa-logo-hint" className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('form.logoUrlHint')}
            </p>
          </div>
        </div>

        <fieldset className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 space-y-4">
          <legend className="px-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            {t('form.remindersLegend')}
          </legend>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('form.remindersHint')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="empresa-recordatorio-dias-gracia"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t('form.recordatorioDiasGracia')}
              </label>
              <input
                id="empresa-recordatorio-dias-gracia"
                type="number"
                min={0}
                max={365}
                data-testid="input-empresa-recordatorio-dias-gracia"
                {...register('recordatorioDiasGracia')}
                readOnly={!canEdit}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
                disabled={!canEdit}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('form.recordatorioDiasGraciaHint')}</p>
            </div>
            <div>
              <label htmlFor="empresa-timezone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('form.timezone')}
              </label>
              <select
                id="empresa-timezone"
                data-testid="select-empresa-timezone"
                {...register('timezone')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
                disabled={!canEdit}
              >
                {EMPRESA_TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="empresa-recordatorio-hora-inicio"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t('form.recordatorioHoraInicio')}
              </label>
              <select
                id="empresa-recordatorio-hora-inicio"
                data-testid="select-empresa-recordatorio-hora-inicio"
                {...register('recordatorioHoraInicio')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
                disabled={!canEdit}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="empresa-recordatorio-hora-fin"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t('form.recordatorioHoraFin')}
              </label>
              <select
                id="empresa-recordatorio-hora-fin"
                data-testid="select-empresa-recordatorio-hora-fin"
                {...register('recordatorioHoraFin')}
                {...(errors.recordatorioHoraFin ? { 'aria-invalid': 'true' as const } : {})}
                aria-describedby={errors.recordatorioHoraFin ? 'empresa-recordatorio-hora-fin-error' : undefined}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-70"
                disabled={!canEdit}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h + 1} value={h + 1}>
                    {String(h + 1).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
              {errors.recordatorioHoraFin && (
                <p id="empresa-recordatorio-hora-fin-error" className="text-red-500 text-xs mt-1" role="alert">
                  {fieldError('recordatorioHoraFin', t('errors.reminderWindowInvalid'))}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('form.recordatorioHoraFinHint')}</p>
            </div>
          </div>
        </fieldset>

        {saveError && (
          <p className="text-red-600 dark:text-red-400 text-sm" role="alert">
            {saveError}
          </p>
        )}
        {saveSuccess && (
          <p className="text-green-700 dark:text-green-400 text-sm" role="status">
            {t('success.saved')}
          </p>
        )}

        {canEdit && (
          <button
            type="submit"
            data-testid="btn-save-empresa"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
          >
            {t('actions.save')}
          </button>
        )}
      </form>

      <AfipFiscalSection />
      <PrintDevicesSection />
      <ProveedorAlertasConfigSection />
    </div>
  )
}
