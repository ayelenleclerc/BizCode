import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { clientesAPI } from '@/lib/api'
import { validateCUIT, formatCUIT } from '@/lib/validators'
import { Cliente } from '@/types'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-200 dark:bg-slate-700 px-6 py-4 border-b border-slate-300 dark:border-slate-600">
          <h2 id="dialog-cliente-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {dialogTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('form.hint')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
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
