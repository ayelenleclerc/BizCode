import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { articulosAPI } from '@/lib/api'
import { Articulo, Rubro } from '@/types'

const articuloSchema = z.object({
  codigo: z.coerce.number().int().positive('Código debe ser positivo'),
  descripcion: z.string().min(3, 'Mínimo 3 caracteres').max(30),
  // Rubro — HTML <select value=""> must not coerce to 0 (would fail .positive() and block submit).
  rubroId: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined
    const n = typeof val === 'number' ? val : Number(val)
    if (!Number.isFinite(n) || n <= 0) return undefined
    return Math.trunc(n)
  }, z.number().int().positive('Seleccione un rubro')),
  condIva: z.enum(['1', '2', '3']), // 1=21%, 2=10.5%, 3=Exento
  umedida: z.string().min(2).max(6),
  precioLista1: z.coerce.number().positive('Precio debe ser positivo'),
  precioLista2: z.coerce.number().positive('Precio debe ser positivo'),
  costo: z.coerce.number().positive('Costo debe ser positivo'),
  stock: z.coerce.number().int().nonnegative('Stock no puede ser negativo'),
  minimo: z.coerce.number().int().nonnegative('Mínimo no puede ser negativo'),
  activo: z.boolean(),
})

type ArticuloFormData = z.infer<typeof articuloSchema>

interface ArticuloFormProps {
  articulo: Articulo | null
  rubros: Rubro[]
  onClose: () => void
  onGuardado: (articulo: Articulo) => void
}

export default function ArticuloForm({ articulo, rubros, onClose, onGuardado }: ArticuloFormProps) {
  const { t } = useTranslation('articulos')
  const { t: tc } = useTranslation('common')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ArticuloFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(articuloSchema) as any,
    defaultValues: (articulo || {
      condIva: '1',
      // Must be length ≥2 (zod + server/createApp.ts); single "U" blocked submit without surfacing umedida in E2E.
      umedida: 'UN',
      minimo: 0,
      activo: true,
    }) as ArticuloFormData,
  })

  useEffect(() => {
    if (articulo) {
      setValue('codigo', articulo.codigo)
      setValue('descripcion', articulo.descripcion)
      setValue('rubroId', articulo.rubroId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue('condIva', articulo.condIva as any)
      setValue('umedida', articulo.umedida)
      setValue('precioLista1', Number(articulo.precioLista1))
      setValue('precioLista2', Number(articulo.precioLista2))
      setValue('costo', Number(articulo.costo))
      setValue('stock', articulo.stock)
      setValue('minimo', articulo.minimo)
      setValue('activo', articulo.activo)
    }
  }, [articulo, setValue])

  useHotkeys('f5', () => {
    const form = document.querySelector('form') as HTMLFormElement
    form?.dispatchEvent(new Event('submit', { bubbles: true }))
  })

  useHotkeys('escape', onClose)

  const onSubmit = async (data: ArticuloFormData) => {
    setLoading(true)
    setError(null)

    try {
      let result: Articulo
      if (articulo) {
        result = await articulosAPI.update(articulo.id, data)
      } else {
        result = await articulosAPI.create(data)
      }
      onGuardado(result)
    } catch (err: unknown) {
      setError((err as Error).message || t('form.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const dialogTitle = articulo
    ? t('form.titleEdit', { codigo: articulo.codigo })
    : t('form.titleNew')

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-articulo-title"
      data-testid="articulo-form-dialog"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-200 dark:bg-slate-700 px-6 py-4 border-b border-slate-300 dark:border-slate-600">
          <h2 id="dialog-articulo-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {dialogTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('form.hint')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" data-testid="articulo-form">
          {error && (
            <div role="alert" className="p-3 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded border border-red-300 dark:border-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="articulo-codigo" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {t('form.codigo')} *
            </label>
            <input
              id="articulo-codigo"
              type="number"
              data-testid="articulo-form-codigo"
              {...register('codigo')}
              aria-required="true"
              aria-describedby={errors.codigo ? 'articulo-codigo-error' : undefined}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              disabled={!!articulo}
            />
            {errors.codigo && (
              <p id="articulo-codigo-error" className="text-red-400 text-sm mt-1">{errors.codigo.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="articulo-descripcion" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {t('form.descripcion')} *
            </label>
            <input
              id="articulo-descripcion"
              type="text"
              data-testid="articulo-form-descripcion"
              {...register('descripcion')}
              maxLength={30}
              aria-required="true"
              aria-describedby={errors.descripcion ? 'articulo-descripcion-error' : undefined}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            {errors.descripcion && (
              <p id="articulo-descripcion-error" className="text-red-400 text-sm mt-1">{errors.descripcion.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="articulo-rubroId" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {t('form.rubro')} *
              </label>
              <select
                id="articulo-rubroId"
                data-testid="articulo-form-rubroId"
                {...register('rubroId')}
                aria-required="true"
                aria-describedby={errors.rubroId ? 'articulo-rubroId-error' : undefined}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">{t('form.selectRubro')}</option>
                {rubros.map((rubro) => (
                  <option key={rubro.id} value={rubro.id}>
                    {rubro.nombre}
                  </option>
                ))}
              </select>
              {errors.rubroId && (
                <p id="articulo-rubroId-error" className="text-red-400 text-sm mt-1">{errors.rubroId.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="articulo-umedida" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {t('form.umedida')} *
              </label>
              <input
                id="articulo-umedida"
                type="text"
                {...register('umedida')}
                maxLength={6}
                placeholder={t('form.umedidaPlaceholder')}
                aria-required="true"
                aria-describedby={errors.umedida ? 'articulo-umedida-error' : undefined}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.umedida && (
                <p id="articulo-umedida-error" className="text-red-400 text-sm mt-1">{errors.umedida.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="articulo-condIva" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {t('form.condIva')} *
            </label>
            <select
              id="articulo-condIva"
              {...register('condIva')}
              aria-required="true"
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="1">{t('form.condIvaOptions.1')}</option>
              <option value="2">{t('form.condIvaOptions.2')}</option>
              <option value="3">{t('form.condIvaOptions.3')}</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="articulo-precioLista1" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {t('form.precioLista1')} *
              </label>
              <input
                id="articulo-precioLista1"
                type="number"
                step="0.01"
                data-testid="articulo-form-precioLista1"
                {...register('precioLista1')}
                aria-required="true"
                aria-describedby={errors.precioLista1 ? 'articulo-precioLista1-error' : undefined}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.precioLista1 && (
                <p id="articulo-precioLista1-error" className="text-red-400 text-sm mt-1">{errors.precioLista1.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="articulo-precioLista2" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {t('form.precioLista2')} *
              </label>
              <input
                id="articulo-precioLista2"
                type="number"
                step="0.01"
                data-testid="articulo-form-precioLista2"
                {...register('precioLista2')}
                aria-required="true"
                aria-describedby={errors.precioLista2 ? 'articulo-precioLista2-error' : undefined}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.precioLista2 && (
                <p id="articulo-precioLista2-error" className="text-red-400 text-sm mt-1">{errors.precioLista2.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="articulo-costo" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {t('form.costo')} *
              </label>
              <input
                id="articulo-costo"
                type="number"
                step="0.01"
                data-testid="articulo-form-costo"
                {...register('costo')}
                aria-required="true"
                aria-describedby={errors.costo ? 'articulo-costo-error' : undefined}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.costo && (
                <p id="articulo-costo-error" className="text-red-400 text-sm mt-1">{errors.costo.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="articulo-stock" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {t('form.stock')} *
              </label>
              <input
                id="articulo-stock"
                type="number"
                data-testid="articulo-form-stock"
                {...register('stock')}
                aria-required="true"
                aria-describedby={errors.stock ? 'articulo-stock-error' : undefined}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.stock && (
                <p id="articulo-stock-error" className="text-red-400 text-sm mt-1">{errors.stock.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="articulo-minimo" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {t('form.minimo')} *
              </label>
              <input
                id="articulo-minimo"
                type="number"
                {...register('minimo')}
                aria-required="true"
                aria-describedby={errors.minimo ? 'articulo-minimo-error' : undefined}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.minimo && (
                <p id="articulo-minimo-error" className="text-red-400 text-sm mt-1">{errors.minimo.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input
              id="articulo-activo"
              type="checkbox"
              {...register('activo')}
              className="w-4 h-4 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 cursor-pointer"
            />
            <label htmlFor="articulo-activo" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
              {t('form.activo')}
            </label>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-600">
            <button
              type="submit"
              data-testid="btn-save-articulo"
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
