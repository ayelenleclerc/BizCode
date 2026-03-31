import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHotkeys } from 'react-hotkeys-hook'
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
  activo: z.boolean().default(true),
})

type ClienteFormData = z.infer<typeof clienteSchema>

interface ClienteFormProps {
  cliente: Cliente | null
  onClose: () => void
  onGuardado: (cliente: Cliente) => void
}

export default function ClienteForm({ cliente, onClose, onGuardado }: ClienteFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente || {
      condIva: 'RI',
      activo: true,
    },
  })

  useEffect(() => {
    if (cliente) {
      setValue('codigo', cliente.codigo)
      setValue('rsocial', cliente.rsocial)
      setValue('fantasia', cliente.fantasia)
      setValue('cuit', cliente.cuit)
      setValue('condIva', cliente.condIva as any)
      setValue('domicilio', cliente.domicilio)
      setValue('localidad', cliente.localidad)
      setValue('cpost', cliente.cpost)
      setValue('telef', cliente.telef)
      setValue('email', cliente.email)
      setValue('activo', cliente.activo)
    }
  }, [cliente, setValue])

  // Hotkeys
  useHotkeys('f5', () => {
    const form = document.querySelector('form') as HTMLFormElement
    form?.dispatchEvent(new Event('submit', { bubbles: true }))
  })

  useHotkeys('escape', onClose)

  const onSubmit = async (data: ClienteFormData) => {
    setLoading(true)
    setError(null)

    try {
      // Formatear CUIT si existe
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
    } catch (err: any) {
      setError(err.message || 'Error al guardar cliente')
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
            {cliente ? `Editar Cliente #${cliente.codigo}` : 'Nuevo Cliente'}
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
              disabled={!!cliente}
            />
            {errors.codigo && (
              <p className="text-red-400 text-sm mt-1">{errors.codigo.message}</p>
            )}
          </div>

          {/* Razón Social */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Razón Social *</label>
            <input
              type="text"
              {...register('rsocial')}
              maxLength={30}
              className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            {errors.rsocial && (
              <p className="text-red-400 text-sm mt-1">{errors.rsocial.message}</p>
            )}
          </div>

          {/* Fantasía */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nombre Fantasía</label>
            <input
              type="text"
              {...register('fantasia')}
              maxLength={30}
              className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* CUIT */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">CUIT</label>
            <input
              type="text"
              {...register('cuit')}
              placeholder="20-12345678-9"
              className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none font-mono"
            />
            {errors.cuit && (
              <p className="text-red-400 text-sm mt-1">{errors.cuit.message}</p>
            )}
          </div>

          {/* Condición IVA */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Condición IVA *</label>
            <select
              {...register('condIva')}
              className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="RI">RI - Responsable Inscrito</option>
              <option value="Mono">Monotributista</option>
              <option value="CF">CF - Consumidor Final</option>
              <option value="Exento">Exento</option>
            </select>
          </div>

          {/* Domicilio */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Domicilio</label>
            <input
              type="text"
              {...register('domicilio')}
              maxLength={40}
              className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Localidad y Código Postal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Localidad</label>
              <input
                type="text"
                {...register('localidad')}
                maxLength={25}
                className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Código Postal</label>
              <input
                type="text"
                {...register('cpost')}
                maxLength={8}
                className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Teléfono y Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Teléfono</label>
              <input
                type="text"
                {...register('telef')}
                maxLength={25}
                className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                {...register('email')}
                maxLength={50}
                className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
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
