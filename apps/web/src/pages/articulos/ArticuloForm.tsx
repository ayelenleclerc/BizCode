import { useState, useEffect, useCallback, useLayoutEffect, useRef, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHotkeys } from 'react-hotkeys-hook'
import KeyboardHint, { useFormShortcuts } from '@/components/shared/KeyboardHint'
import { useTranslation } from 'react-i18next'
import { ApiRequestFailedError, articulosAPI, catalogVariantsAPI, type StockAjusteHistorialRow } from '@/lib/api'
import { hasPermission } from '@/lib/rbac'
import { CanAccess } from '@/components/CanAccess'
import IfModule from '@/components/IfModule'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import {
  Articulo,
  MONEDAS_PRECIO,
  Rubro,
  type ArticuloInput,
  type CategoriaArticuloRow,
  type MonedaPrecio,
} from '@bizcode/types'
import ArticuloProveedoresComparadorSection from './ArticuloProveedoresComparadorSection'
import ArticuloVariantesPanel from './ArticuloVariantesPanel'
import ArticuloStockDepositosPanel from './ArticuloStockDepositosPanel'

const articuloSchema = z
  .object({
    codigo: z.coerce.number().int().positive('Código debe ser positivo'),
    descripcion: z.string().min(3, 'Mínimo 3 caracteres').max(120),
    // Rubro — HTML <select value=""> must not coerce to 0 (would fail .positive() and block submit).
    rubroId: z.preprocess((val) => {
      if (val === '' || val === null || val === undefined) return undefined
      const n = typeof val === 'number' ? val : Number(val)
      if (!Number.isFinite(n) || n <= 0) return undefined
      return Math.trunc(n)
    }, z.number().int().positive('Seleccione un rubro')),
    categoriaId: z.preprocess((val) => {
      if (val === '' || val === null || val === undefined) return null
      const n = typeof val === 'number' ? val : Number(val)
      if (!Number.isFinite(n) || n <= 0) return null
      return Math.trunc(n)
    }, z.number().int().positive().nullable()),
    condIva: z.enum(['1', '2', '3']), // 1=21%, 2=10.5%, 3=Exento
    umedida: z.string().min(2).max(6),
    tipo: z.enum(['articulo', 'servicio']).default('articulo'),
    unidadServicio: z
      .enum(['hora', 'dia', 'mes', 'proyecto', 'km', 'unidad', 'otro'])
      .nullable()
      .optional(),
    precioLista1: z.coerce.number().positive('Precio debe ser positivo'),
    precioLista2: z.coerce.number().positive('Precio debe ser positivo'),
    costo: z.coerce.number().positive('Costo debe ser positivo'),
    monedaPrecio: z.enum(MONEDAS_PRECIO).default('ARS'),
    precioEnMonedaOrigen: z.preprocess((val) => {
      if (val === '' || val === null || val === undefined) return null
      const n = typeof val === 'number' ? val : Number(val)
      return Number.isFinite(n) ? n : null
    }, z.number().min(0.0001).nullable()),
    stock: z.coerce.number().int().nonnegative('Stock no puede ser negativo'),
    minimo: z.coerce.number().int().nonnegative('Mínimo no puede ser negativo'),
    mesesGarantia: z.preprocess((val) => {
      if (val === '' || val === null || val === undefined) return null
      const n = typeof val === 'number' ? val : Number(val)
      if (!Number.isFinite(n) || n <= 0) return null
      return Math.trunc(n)
    }, z.number().int().positive().nullable()),
    controlLote: z.boolean().optional().default(false),
    activo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === 'servicio') {
      if (data.unidadServicio == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Required', path: ['unidadServicio'] })
      }
    }
    if (data.monedaPrecio !== 'ARS' && data.precioEnMonedaOrigen == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'form.errors.foreignPriceRequired',
        path: ['precioEnMonedaOrigen'],
      })
    }
  })

type ArticuloFormData = z.infer<typeof articuloSchema>

interface ArticuloFormProps {
  articulo: Articulo | null
  rubros: Rubro[]
  onClose: () => void
  onGuardado: (articulo: Articulo) => void
}

function canViewStockHistorial(role: string): boolean {
  return (
    hasPermission(role as Parameters<typeof hasPermission>[0], 'inventory.adjust') ||
    role === 'owner' ||
    role === 'manager' ||
    role === 'warehouse_lead'
  )
}

function canViewProveedoresComparador(permissions: string[]): boolean {
  return permissions.includes('products.read') || permissions.includes('suppliers.read')
}

export default function ArticuloForm({ articulo, rubros, onClose, onGuardado }: ArticuloFormProps) {
  const { t } = useTranslation('articulos')
  const { t: tc } = useTranslation('common')
  const { claims } = useAuth()
  const { hasModule } = useFeatureFlags()
  const multicurrencyEnabled = hasModule('catalog.multicurrency')
  const fefoEnabled = hasModule('inventory.fefo')
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<CategoriaArticuloRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stockDisplay, setStockDisplay] = useState(articulo?.stock ?? 0)
  const [showAdjust, setShowAdjust] = useState(false)
  const [adjustCantidad, setAdjustCantidad] = useState('')
  const [adjustMotivo, setAdjustMotivo] = useState('')
  const [adjustLoading, setAdjustLoading] = useState(false)
  const [adjustError, setAdjustError] = useState<string | null>(null)
  const [historial, setHistorial] = useState<StockAjusteHistorialRow[]>([])
  const [historialTotal, setHistorialTotal] = useState(0)
  const [historialLoading, setHistorialLoading] = useState(false)
  const [showComparador, setShowComparador] = useState(false)
  const comparadorButtonRef = useRef<HTMLButtonElement>(null)

  // Microsoft Edge Tools (webhint) flags dynamic `aria-expanded` in JSX; sync the token in the DOM instead.
  useLayoutEffect(() => {
    comparadorButtonRef.current?.setAttribute('aria-expanded', showComparador ? 'true' : 'false')
  }, [showComparador])

  const showHistorial = Boolean(articulo && claims && canViewStockHistorial(claims.role))
  const showComparadorAccess = Boolean(
    articulo && claims && canViewProveedoresComparador(claims.permissions),
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ArticuloFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(articuloSchema) as any,
    defaultValues: (articulo || {
      condIva: '1',
      // Must be length ≥2 (zod + server/createApp.ts); single "U" blocked submit without surfacing umedida in E2E.
      umedida: 'UN',
      tipo: 'articulo',
      unidadServicio: null,
      minimo: 0,
      stock: 0,
      mesesGarantia: null,
      controlLote: false,
      categoriaId: null,
      monedaPrecio: 'ARS',
      precioEnMonedaOrigen: null,
      activo: true,
    }) as ArticuloFormData,
  })

  const tipoWatch = watch('tipo')
  const categoriaWatch = watch('categoriaId')
  const monedaPrecioWatch = watch('monedaPrecio')

  useEffect(() => {
    catalogVariantsAPI
      .listCategorias({ take: 200, activo: true })
      .then((res) => setCategorias(res?.data ?? []))
      .catch(() => setCategorias([]))
  }, [])

  useEffect(() => {
    if (articulo) {
      setValue('codigo', articulo.codigo)
      setValue('descripcion', articulo.descripcion)
      setValue('rubroId', articulo.rubroId)
      setValue('categoriaId', articulo.categoriaId ?? null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue('condIva', articulo.condIva as any)
      setValue('umedida', articulo.umedida)
      setValue('tipo', (articulo.tipo as 'articulo' | 'servicio') || 'articulo')
      setValue(
        'unidadServicio',
        (articulo.unidadServicio as ArticuloFormData['unidadServicio']) ?? null,
      )
      setValue('precioLista1', Number(articulo.precioLista1))
      setValue('precioLista2', Number(articulo.precioLista2))
      setValue('costo', Number(articulo.costo))
      const articuloFx = articulo as Articulo & Pick<
        ArticuloInput,
        'monedaPrecio' | 'precioEnMonedaOrigen'
      >
      setValue('monedaPrecio', multicurrencyEnabled ? (articuloFx.monedaPrecio ?? 'ARS') : 'ARS')
      setValue(
        'precioEnMonedaOrigen',
        multicurrencyEnabled ? (articuloFx.precioEnMonedaOrigen ?? null) : null,
      )
      setValue('stock', articulo.stock)
      setValue('minimo', articulo.minimo)
      setValue('mesesGarantia', articulo.mesesGarantia ?? null)
      setValue('controlLote', articulo.controlLote ?? false)
      setValue('activo', articulo.activo)
      setStockDisplay(articulo.stock)
    }
  }, [articulo, multicurrencyEnabled, setValue])

  useEffect(() => {
    if (tipoWatch === 'servicio') {
      setValue('stock', 0)
      setValue('minimo', 0)
    }
  }, [tipoWatch, setValue])

  const loadHistorial = useCallback(async () => {
    if (!articulo) return
    setHistorialLoading(true)
    try {
      const page = await articulosAPI.stockHistorial(articulo.id, { limit: 20, offset: 0 })
      if (page) {
        setHistorial(page.data)
        setHistorialTotal(page.total)
      }
    } finally {
      setHistorialLoading(false)
    }
  }, [articulo])

  useEffect(() => {
    if (showHistorial) {
      void loadHistorial()
    }
  }, [showHistorial, loadHistorial])

  useHotkeys('f5', () => {
    const form = document.querySelector('form') as HTMLFormElement
    form?.dispatchEvent(new Event('submit', { bubbles: true }))
  })

  useHotkeys('escape', onClose)

  const onSubmit = async (data: ArticuloFormData) => {
    setLoading(true)
    setError(null)

    try {
      const normalizedBase =
        data.tipo === 'servicio'
          ? {
              ...data,
              stock: 0,
              minimo: 0,
              unidadServicio: data.unidadServicio ?? null,
            }
          : {
              ...data,
              unidadServicio: null,
            }
      const {
        monedaPrecio: _omitMonedaPrecio,
        precioEnMonedaOrigen: _omitPrecioOrigen,
        ...normalizedWithoutFx
      } = normalizedBase
      void _omitMonedaPrecio
      void _omitPrecioOrigen
      const normalized = multicurrencyEnabled
        ? {
            ...normalizedBase,
            precioEnMonedaOrigen:
              data.monedaPrecio === 'ARS' ? null : data.precioEnMonedaOrigen,
          }
        : normalizedWithoutFx
      let result: Articulo
      if (articulo) {
        const { stock: _omitStock, ...payload } = normalized
        void _omitStock
        result = await articulosAPI.update(articulo.id, payload)
      } else {
        result = await articulosAPI.create(normalized)
      }
      onGuardado(result)
    } catch (err: unknown) {
      setError((err as Error).message || t('form.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const onAdjustSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!articulo) return
    const cantidad = Number(adjustCantidad)
    if (!Number.isFinite(cantidad) || cantidad === 0) {
      setAdjustError(t('stockAdjust.errors.cantidad'))
      return
    }
    const motivo = adjustMotivo.trim()
    if (motivo.length < 1) {
      setAdjustError(t('stockAdjust.errors.motivo'))
      return
    }
    setAdjustLoading(true)
    setAdjustError(null)
    try {
      const result = await articulosAPI.stockAjuste(articulo.id, { cantidad, motivo })
      if (!result) return
      setStockDisplay(result.stockAfter)
      setValue('stock', result.stockAfter)
      setShowAdjust(false)
      setAdjustCantidad('')
      setAdjustMotivo('')
      if (showHistorial) await loadHistorial()
    } catch (err: unknown) {
      if (err instanceof ApiRequestFailedError && err.message === 'INSUFFICIENT_STOCK') {
        setAdjustError(t('stockAdjust.errors.insufficient'))
      } else {
        setAdjustError((err as Error).message || t('stockAdjust.errors.generic'))
      }
    } finally {
      setAdjustLoading(false)
    }
  }

  const dialogTitle = articulo
    ? t('form.titleEdit', { codigo: articulo.codigo })
    : t('form.titleNew')
  const formShortcuts = useFormShortcuts()

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

        <KeyboardHint shortcuts={formShortcuts} className="mx-6 mt-4" />

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
              maxLength={120}
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
            <IfModule flag="catalog.variants">
              <div>
                <label htmlFor="articulo-categoriaId" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {t('form.categoria', { defaultValue: 'Categoría' })}
                </label>
                <select
                  id="articulo-categoriaId"
                  data-testid="articulo-form-categoriaId"
                  {...register('categoriaId')}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">{t('form.selectCategoria', { defaultValue: '— Sin categoría —' })}</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </IfModule>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="articulo-tipo" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {t('form.tipo')} *
              </label>
              <select
                id="articulo-tipo"
                data-testid="articulo-form-tipo"
                {...register('tipo')}
                aria-required="true"
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="articulo">{t('form.tipoOptions.articulo')}</option>
                <option value="servicio">{t('form.tipoOptions.servicio')}</option>
              </select>
            </div>
            {tipoWatch === 'servicio' && (
              <div>
                <label
                  htmlFor="articulo-unidadServicio"
                  className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
                >
                  {t('form.unidadServicio')} *
                </label>
                <select
                  id="articulo-unidadServicio"
                  data-testid="articulo-form-unidadServicio"
                  {...register('unidadServicio')}
                  aria-required="true"
                  aria-describedby={errors.unidadServicio ? 'articulo-unidadServicio-error' : undefined}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">{t('form.selectUnidadServicio')}</option>
                  {(['hora', 'dia', 'mes', 'proyecto', 'km', 'unidad', 'otro'] as const).map((u) => (
                    <option key={u} value={u}>
                      {t(`form.unidadServicioOptions.${u}`)}
                    </option>
                  ))}
                </select>
                {errors.unidadServicio && (
                  <p id="articulo-unidadServicio-error" className="text-red-400 text-sm mt-1">
                    {errors.unidadServicio.message}
                  </p>
                )}
              </div>
            )}
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

          {multicurrencyEnabled ? (
            <section
              className="grid grid-cols-2 gap-4 rounded border border-slate-200 p-4 dark:border-slate-600"
              aria-labelledby="articulo-multicurrency-title"
              data-testid="articulo-form-multicurrency"
            >
              <h3 id="articulo-multicurrency-title" className="col-span-2 font-semibold text-slate-900 dark:text-slate-100">
                {t('form.multicurrency.title')}
              </h3>
              <div>
                <label htmlFor="articulo-monedaPrecio" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {t('form.multicurrency.currency')}
                </label>
                <select
                  id="articulo-monedaPrecio"
                  data-testid="articulo-form-monedaPrecio"
                  {...register('monedaPrecio')}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  {MONEDAS_PRECIO.map((currency: MonedaPrecio) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
              {monedaPrecioWatch !== 'ARS' ? (
                <div>
                  <label htmlFor="articulo-precioEnMonedaOrigen" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t('form.multicurrency.sourcePrice')} *
                  </label>
                  <input
                    id="articulo-precioEnMonedaOrigen"
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    data-testid="articulo-form-precioEnMonedaOrigen"
                    {...register('precioEnMonedaOrigen')}
                    aria-required="true"
                    aria-describedby={
                      errors.precioEnMonedaOrigen
                        ? 'articulo-precioEnMonedaOrigen-error'
                        : 'articulo-precioEnMonedaOrigen-hint'
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                  <p id="articulo-precioEnMonedaOrigen-hint" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t('form.multicurrency.sourcePriceHint', { currency: monedaPrecioWatch })}
                  </p>
                  {errors.precioEnMonedaOrigen ? (
                    <p id="articulo-precioEnMonedaOrigen-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {t(errors.precioEnMonedaOrigen.message ?? 'form.errors.foreignPriceRequired')}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}

          {tipoWatch !== 'servicio' ? (
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
                readOnly={Boolean(articulo)}
                key={articulo ? `stock-${stockDisplay}` : 'stock-new'}
                aria-required="true"
                aria-describedby={
                  articulo ? 'articulo-stock-readonly-hint' : errors.stock ? 'articulo-stock-error' : undefined
                }
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {articulo && (
                <p id="articulo-stock-readonly-hint" className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  {t('stockAdjust.readonlyHint')}
                </p>
              )}
              {errors.stock && (
                <p id="articulo-stock-error" className="text-red-400 text-sm mt-1">{errors.stock.message}</p>
              )}
              {articulo && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <CanAccess permission="inventory.adjust">
                    <button
                      type="button"
                      data-testid="btn-stock-adjust"
                      onClick={() => {
                        setAdjustError(null)
                        setShowAdjust(true)
                      }}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded transition"
                    >
                      {t('stockAdjust.button')}
                    </button>
                  </CanAccess>
                  {showComparadorAccess && (
                    <button
                      ref={comparadorButtonRef}
                      type="button"
                      data-testid="btn-ver-proveedores"
                      onClick={() => setShowComparador((v) => !v)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded transition"
                    >
                      {showComparador ? t('comparador.hide') : t('comparador.view')}
                    </button>
                  )}
                </div>
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
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400" data-testid="articulo-form-servicio-hint">
              {t('form.servicioNoStockHint')}
            </p>
          )}

          <div>
            <label htmlFor="articulo-meses-garantia" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {t('form.mesesGarantia')}
            </label>
            <input
              id="articulo-meses-garantia"
              type="number"
              min={0}
              {...register('mesesGarantia')}
              aria-describedby="articulo-meses-garantia-hint"
              data-testid="articulo-meses-garantia"
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            <p id="articulo-meses-garantia-hint" className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {t('form.mesesGarantiaHint')}
            </p>
            {errors.mesesGarantia && (
              <p id="articulo-meses-garantia-error" className="text-red-400 text-sm mt-1">
                {errors.mesesGarantia.message}
              </p>
            )}
          </div>

          {fefoEnabled && tipoWatch !== 'servicio' ? (
            <div className="flex items-start gap-2">
              <input
                id="articulo-control-lote"
                type="checkbox"
                {...register('controlLote')}
                data-testid="articulo-control-lote"
                className="mt-1"
              />
              <div>
                <label htmlFor="articulo-control-lote" className="block text-slate-700 dark:text-slate-300 font-semibold">
                  {t('form.controlLote')}
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('form.controlLoteHint')}</p>
              </div>
            </div>
          ) : null}

          {showComparador && articulo && showComparadorAccess && (
            <ArticuloProveedoresComparadorSection articuloId={articulo.id} />
          )}

          {showHistorial && (
            <section
              className="border border-slate-200 dark:border-slate-600 rounded-lg p-4"
              aria-labelledby="articulo-stock-history-title"
              data-testid="articulo-stock-history"
            >
              <h3 id="articulo-stock-history-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {t('stockHistory.title')}
              </h3>
              {historialLoading ? (
                <p className="text-slate-600 dark:text-slate-400 text-sm">{t('stockHistory.loading')}</p>
              ) : historial.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400 text-sm">{t('stockHistory.empty')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-600">
                        <th scope="col" className="py-2 pr-2">{t('stockHistory.columns.date')}</th>
                        <th scope="col" className="py-2 pr-2">{t('stockHistory.columns.qty')}</th>
                        <th scope="col" className="py-2 pr-2">{t('stockHistory.columns.reason')}</th>
                        <th scope="col" className="py-2">{t('stockHistory.columns.user')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100 dark:border-slate-700">
                          <td className="py-2 pr-2">{new Date(row.createdAt).toLocaleString()}</td>
                          <td className="py-2 pr-2">{row.cantidad}</td>
                          <td className="py-2 pr-2">{row.motivo}</td>
                          <td className="py-2">{row.user.username}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {t('stockHistory.total', { count: historialTotal })}
              </p>
            </section>
          )}

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

        <ArticuloVariantesPanel
          articuloId={articulo?.id ?? null}
          categoriaId={categoriaWatch}
          esPadre={articulo?.esPadre}
          padreId={articulo?.padreId}
        />
        <ArticuloStockDepositosPanel articuloId={articulo?.id ?? null} />
      </div>

      {showAdjust && articulo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stock-adjust-title"
          data-testid="stock-adjust-dialog"
        >
          <form
            onSubmit={onAdjustSubmit}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 space-y-4"
          >
            <h3 id="stock-adjust-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('stockAdjust.title')}
            </h3>
            {adjustError && (
              <div role="alert" className="p-3 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded text-sm">
                {adjustError}
              </div>
            )}
            <div>
              <label htmlFor="stock-adjust-cantidad" className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                {t('stockAdjust.cantidad')}
              </label>
              <input
                id="stock-adjust-cantidad"
                type="number"
                data-testid="stock-adjust-cantidad"
                value={adjustCantidad}
                onChange={(e) => setAdjustCantidad(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              />
              <p className="text-xs text-slate-500 mt-1">{t('stockAdjust.cantidadHint')}</p>
            </div>
            <div>
              <label htmlFor="stock-adjust-motivo" className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                {t('stockAdjust.motivo')}
              </label>
              <textarea
                id="stock-adjust-motivo"
                data-testid="stock-adjust-motivo"
                value={adjustMotivo}
                onChange={(e) => setAdjustMotivo(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                data-testid="btn-stock-adjust-submit"
                disabled={adjustLoading}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded disabled:opacity-50"
              >
                {adjustLoading ? tc('actions.saving') : t('stockAdjust.submit')}
              </button>
              <button
                type="button"
                onClick={() => setShowAdjust(false)}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 font-semibold rounded"
              >
                {tc('actions.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
