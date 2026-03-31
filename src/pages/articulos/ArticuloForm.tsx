import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHotkeys } from 'react-hotkeys-hook'
import { articulosAPI } from '@/lib/api'
import { validatePrice, validateCode } from '@/lib/validators'
import { Articulo, Rubro } from '@/types'

const articuloSchema = z.object({
  codigo: z.coerce.number().int().positive('Código debe ser positivo'),
  descripcion: z.string().min(3, 'Mínimo 3 caracteres').max(30),
  rubroId: z.coerce.number().int().positive('Seleccione un rubro'),
  condIva: z.enum(['1', '2', '3']), // 1=21%, 2=10.5%, 3=Exento
  umedida: z.string().min(2).max(6),
  precioLista1: z.coerce.number().positive('Precio debe ser positivo'),
  precioLista2: z.coerce.number().positive('Precio debe ser positivo'),
  costo: z.coerce.number().positive('Costo debe ser positivo'),
  stock: z.coerce.number().int().nonnegative('Stock no puede ser negativo'),
  minimo: z.coerce.number().int().nonnegative('Mínimo no puede ser negativo'),
  activo: z.boolean().default(true),
})

type ArticuloFormData = z.infer<typeof articuloSchema>

interface ArticuloFormProps {
  articulo: Articulo | null
  rubros: Rubro[]
  onClose: () => void
  onGuardado: (articulo: Articulo) => void
}

export default function ArticuloForm({ articulo, rubros, onClose, onGuardado }: ArticuloFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<ArticuloFormData>({
    resolver: zodResolver(articuloSchema),
    defaultValues: articulo || {
      condIva: '1',
      umedida: 'U',
      minimo: 0,
      activo: true,
    },
  })

  useEffect(() => {
    if (articulo) {
      setValue('codigo', articulo.codigo)
      setValue('descripcion', articulo.descripcion)
      setValue('rubroId', articulo.rubroId)
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

  // Hotkeys
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
    } catch (err: any) {
      setError(err.message || 'Error al guardar artículo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
          <h2 className="text-xl font-bold text-slate-100">
            {articulo ? `Editar Artículo #${articulo.codigo}` : 'Nuevo Artículo'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">F5=guardar, Esc=cancelar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-900 text-red-100 rounded border border-red-700">
              {error}
            </div>
          )}

          {/* Código */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Código *</label>
            <input
              type="number"
              {...register('codigo')}
              className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              disabled={!!articulo}
            />
            {errors.codigo && (
              <p className="text-red-400 text-sm mt-1">{errors.codigo.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Descripción *</label>
            <input
              type="text"
              {...register('descripcion')}
              maxLength={30}
              className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            {errors.descripcion && (
              <p className="text-red-400 text-sm mt-1">{errors.descripcion.message}</p>
            )}
          </div>

          {/* Rubro y U. Medida */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Rubro *</label>
              <select
                {...register('rubroId')}
                className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Seleccionar...</option>
                {rubros.map((rubro) => (
                  <option key={rubro.id} value={rubro.id}>
                    {rubro.nombre}
                  </option>
                ))}
              </select>
              {errors.rubroId && (
                <p className="text-red-400 text-sm mt-1">{errors.rubroId.message}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">U. Medida *</label>
              <input
                type="text"
                {...register('umedida')}
                maxLength={6}
                placeholder="U, kg, l, etc."
                className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.umedida && (
                <p className="text-red-400 text-sm mt-1">{errors.umedida.message}</p>
              )}
            </div>
          </div>

          {/* Condición IVA */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Condición IVA *</label>
            <select
              {...register('condIva')}
              className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="1">21%</option>
              <option value="2">10.5%</option>
              <option value="3">Exento</option>
            </select>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">P. Lista 1 *</label>
              <input
                type="number"
                step="0.01"
                {...register('precioLista1')}
                className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.precioLista1 && (
                <p className="text-red-400 text-sm mt-1">{errors.precioLista1.message}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">P. Lista 2 *</label>
              <input
                type="number"
                step="0.01"
                {...register('precioLista2')}
                className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.precioLista2 && (
                <p className="text-red-400 text-sm mt-1">{errors.precioLista2.message}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Costo *</label>
              <input
                type="number"
                step="0.01"
                {...register('costo')}
                className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.costo && (
                <p className="text-red-400 text-sm mt-1">{errors.costo.message}</p>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stock *</label>
              <input
                type="number"
                {...register('stock')}
                className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.stock && (
                <p className="text-red-400 text-sm mt-1">{errors.stock.message}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mínimo *</label>
              <input
                type="number"
                {...register('minimo')}
                className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.minimo && (
                <p className="text-red-400 text-sm mt-1">{errors.minimo.message}</p>
              )}
            </div>
          </div>

          {/* Activo */}
          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              {...register('activo')}
              className="w-4 h-4 rounded bg-slate-700 border border-slate-600 cursor-pointer"
            />
            <label className="text-slate-300 font-semibold cursor-pointer">Activo</label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-600">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded transition"
            >
              {loading ? 'Guardando...' : 'Guardar (F5)'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded transition"
            >
              Cancelar (Esc)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
