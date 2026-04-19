import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { clientesAPI, zonasEntregaAPI } from '@/lib/api'
import { validateCUIT, formatCUIT } from '@/lib/validators'
import { useAuth } from '@/contexts/AuthContext'
import { Cliente, DeliveryZone } from '@/types'

const clienteSchema = z.object({
  codigo: z.coerce.number().int().positive('Código debe ser positivo'),
  rsocial: z.string().min(3, 'Razón social mínimo 3 caracteres').max(30),
  fantasia: z.string().max(30).optional(),
  cuit: z.string().optional().refine(
    (val) => !val || validateCUIT(val),
    'CUIT inválido'
  ),
  condIva: z.enum(['RI', 'Mono', 'CF', 'Exento']),
  domicilio: z.string().max(40).optional(),
  localidad: z.string().max(25).optional(),
  cpost: z.string().max(8).optional(),
  telef: z.string().max(25).optional(),
  email: z.string().email('Email inválido').max(50).optional().or(z.literal('')),
  activo: z.boolean(),
  // Financial fields — only sent when the user has manager/owner role
  creditLimit: z.coerce.number().positive().optional().nullable(),
  creditDays: z.coerce.number().int().min(0).optional(),
  suspended: z.boolean().optional(),
  // Logistics (Issue #32) — HTML <select value=""> must not coerce to 0 (would fail .positive() and block submit silently).
  deliveryZoneId: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined
    const n = typeof val === 'number' ? val : Number(val)
    if (!Number.isFinite(n) || n <= 0) return undefined
    return Math.trunc(n)
  }, z.number().int().positive().optional().nullable()),
})

type ClienteFormData = z.infer<typeof clienteSchema>

interface ClienteFormProps {
  cliente: Cliente | null
  onClose: () => void
  onGuardado: (cliente: Cliente) => void
}

export default function ClienteForm({ cliente, onClose, onGuardado }: ClienteFormProps) {
  const { t } = useTranslation('clientes')
  const { t: tc } = useTranslation('common')
  const { claims } = useAuth()
  const canManageFinancials = claims?.role === 'owner' || claims?.role === 'manager'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zones, setZones] = useState<DeliveryZone[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ClienteFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(clienteSchema) as any,
    defaultValues: (cliente || {
      condIva: 'RI',
      activo: true,
    }) as ClienteFormData,
  })

  useEffect(() => {
    zonasEntregaAPI.list().then((data) => setZones(data ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (cliente) {
      setValue('codigo', cliente.codigo)
      setValue('rsocial', cliente.rsocial)
      setValue('fantasia', cliente.fantasia)
      setValue('cuit', cliente.cuit)
      setValue('condIva', cliente.condIva as ClienteFormData['condIva'])
      setValue('domicilio', cliente.domicilio)
      setValue('localidad', cliente.localidad)
      setValue('cpost', cliente.cpost)
      setValue('telef', cliente.telef)
      setValue('email', cliente.email)
      setValue('activo', cliente.activo)
      setValue('creditLimit', cliente.creditLimit != null ? Number(cliente.creditLimit) : null)
      setValue('creditDays', cliente.creditDays ?? 0)
      setValue('suspended', cliente.suspended ?? false)
      setValue('deliveryZoneId', cliente.deliveryZoneId ?? null)
    }
  }, [cliente, setValue])

  useHotkeys('f5', () => {
    const form = document.querySelector('form') as HTMLFormElement
    form?.dispatchEvent(new Event('submit', { bubbles: true }))
  })

  useHotkeys('escape', onClose)

  const onSubmit = async (data: ClienteFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (data.cuit) {
        data.cuit = formatCUIT(data.cuit)
      }

      let result: Cliente
      if (cliente) {
        result = await clientesAPI.update(cliente.id, data)
      } else {
        result = await clientesAPI.create(data)
      }

      onGuardado(result)
    } catch (err: unknown) {
      setError((err as Error).message || t('form.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const dialogTitle = cliente
    ? t('form.titleEdit', { codigo: cliente.codigo })
    : t('form.titleNew')

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-cliente-title"
      data-testid="cliente-form-dialog"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-200 dark:bg-slate-700 px-6 py-4 border-b border-slate-300 dark:border-slate-600">
          <h2 id="dialog-cliente-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {dialogTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('form.hint')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" data-testid="cliente-form">
          {error && (
            <div role="alert" className="p-3 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded border border-red-300 dark:border-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="cliente-codigo" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {t('form.codigo')} *
            </label>
            <input
              id="cliente-codigo"
              type="number"
              data-testid="cliente-form-codigo"
              {...register('codigo')}
              aria-required="true"
              aria-describedby={errors.codigo ? 'cliente-codigo-error' : undefined}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              disabled={!!cliente}
            />
            {errors.codigo && (
              <p id="cliente-codigo-error" className="text-red-400 text-sm mt-1">{errors.codigo.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="cliente-rsocial" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {t('form.rsocial')} *
            </label>
            <input
              id="cliente-rsocial"
              type="text"
              data-testid="cliente-form-rsocial"
              {...register('rsocial')}
              maxLength={30}
              aria-required="true"
              aria-describedby={errors.rsocial ? 'cliente-rsocial-error' : undefined}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            {errors.rsocial && (
              <p id="cliente-rsocial-error" className="text-red-400 text-sm mt-1">{errors.rsocial.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="cliente-fantasia" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {t('form.fantasia')}
            </label>
            <input
              id="cliente-fantasia"
              type="text"
              {...register('fantasia')}
              maxLength={30}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="cliente-cuit" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {t('form.cuit')}
            </label>
            <input
              id="cliente-cuit"
              type="text"
              {...register('cuit')}
              placeholder="20-12345678-9"
              aria-describedby={errors.cuit ? 'cliente-cuit-error' : undefined}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none font-mono"
            />
            {errors.cuit && (
              <p id="cliente-cuit-error" className="text-red-400 text-sm mt-1">{errors.cuit.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="cliente-condIva" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {t('form.condIva')} *
            </label>
            <select
              id="cliente-condIva"
              {...register('condIva')}
              aria-required="true"
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="RI">{t('form.condIvaOptions.RI')}</option>
              <option value="Mono">{t('form.condIvaOptions.Mono')}</option>
              <option value="CF">{t('form.condIvaOptions.CF')}</option>
              <option value="Exento">{t('form.condIvaOptions.Exento')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="cliente-domicilio" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {t('form.domicilio')}
            </label>
            <input
              id="cliente-domicilio"
              type="text"
              {...register('domicilio')}
              maxLength={40}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cliente-localidad" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {t('form.localidad')}
              </label>
              <input
                id="cliente-localidad"
                type="text"
                {...register('localidad')}
                maxLength={25}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="cliente-cpost" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {t('form.cpost')}
              </label>
              <input
                id="cliente-cpost"
                type="text"
                {...register('cpost')}
                maxLength={8}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cliente-telef" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {t('form.telef')}
              </label>
              <input
                id="cliente-telef"
                type="text"
                {...register('telef')}
                maxLength={25}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="cliente-email" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {t('form.email')}
              </label>
              <input
                id="cliente-email"
                type="email"
                {...register('email')}
                maxLength={50}
                aria-describedby={errors.email ? 'cliente-email-error' : undefined}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.email && (
                <p id="cliente-email-error" className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input
              id="cliente-activo"
              type="checkbox"
              {...register('activo')}
              className="w-4 h-4 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 cursor-pointer"
            />
            <label htmlFor="cliente-activo" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
              {t('form.activo')}
            </label>
          </div>

          {/* ── Delivery zone ─────────────────────────────────────────────── */}
          <div>
            <label htmlFor="cliente-deliveryZoneId" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {t('form.deliveryZone')}
            </label>
            <select
              id="cliente-deliveryZoneId"
              {...register('deliveryZoneId')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">{t('form.deliveryZoneNone')}</option>
              {zones.filter((z) => z.activo).map((z) => (
                <option key={z.id} value={z.id}>{z.nombre}</option>
              ))}
            </select>
          </div>

          {/* ── Financial section ─────────────────────────────────────────── */}
          {cliente && (
            <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('form.financial.section')}
                </h3>
                {/* Score badge */}
                {cliente.score != null && (
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      (cliente.score ?? 50) >= 71
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : (cliente.score ?? 50) >= 41
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {t('form.financial.scoreLabel')}: {cliente.score}{' '}
                    {(cliente.score ?? 50) >= 71
                      ? `— ${t('form.financial.scoreHigh')}`
                      : (cliente.score ?? 50) >= 41
                        ? `— ${t('form.financial.scoreMid')}`
                        : `— ${t('form.financial.scoreLow')}`}
                  </span>
                )}
                {/* Suspended badge */}
                {cliente.suspended && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-600 text-white">
                    {t('form.financial.suspendedBadge')}
                  </span>
                )}
              </div>

              {/* Balance display (read-only for all) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('form.financial.balance')}</p>
                  <p className="font-mono text-slate-900 dark:text-slate-100">
                    {Number(cliente.balance ?? 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                  </p>
                </div>
                {cliente.creditLimit != null && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('form.financial.creditLimit')}</p>
                    <p className="font-mono text-slate-900 dark:text-slate-100">
                      {Number(cliente.creditLimit).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                    </p>
                    {/* Credit usage bar */}
                    {cliente.creditLimit != null && Number(cliente.creditLimit) > 0 && (
                      <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            Number(cliente.balance) > Number(cliente.creditLimit)
                              ? 'bg-red-500'
                              : Number(cliente.balance) / Number(cliente.creditLimit) > 0.8
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (Number(cliente.balance) / Number(cliente.creditLimit)) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Editable financial fields — manager/owner only */}
              {canManageFinancials ? (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cliente-creditLimit" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-sm">
                        {t('form.financial.creditLimit')}
                        <span className="ml-1 text-xs text-slate-400">({t('form.financial.creditLimitHint')})</span>
                      </label>
                      <input
                        id="cliente-creditLimit"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('creditLimit')}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="cliente-creditDays" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-sm">
                        {t('form.financial.creditDays')}
                      </label>
                      <input
                        id="cliente-creditDays"
                        type="number"
                        min="0"
                        {...register('creditDays')}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="cliente-suspended"
                      type="checkbox"
                      {...register('suspended')}
                      className="w-4 h-4 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 cursor-pointer accent-red-600"
                    />
                    <label htmlFor="cliente-suspended" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer text-sm">
                      {t('form.financial.suspended')}
                    </label>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">{t('form.financial.readOnly')}</p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-600">
            <button
              type="submit"
              data-testid="btn-save-cliente"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white font-semibold rounded transition"
            >
              {loading ? tc('actions.saving') : `${tc('actions.save')} (F5)`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-semibold rounded transition"
            >
              {tc('actions.cancel')} (Esc)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
