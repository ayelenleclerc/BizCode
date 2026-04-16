import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { zonasEntregaAPI } from '@/lib/api'
import type { DeliveryZone } from '@/types'
import { CanAccess } from '@/components/CanAccess'

const schema = z.object({
  nombre: z.string().min(1),
  tipo: z.enum(['barrio', 'manual', 'predefinida']).default('barrio'),
  diasEntrega: z.string().optional(),
  horario: z.string().optional(),
  activo: z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

export default function ZonasEntregaPage() {
  const { t } = useTranslation('zonasEntrega')
  const { t: tc } = useTranslation('common')
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<DeliveryZone | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const loadZones = async () => {
    setLoading(true)
    try {
      const data = await zonasEntregaAPI.list()
      setZones(data ?? [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadZones() }, [])

  const openNew = () => {
    setSelected(null)
    reset({ nombre: '', tipo: 'barrio', diasEntrega: '', horario: '', activo: true })
    setSaveError(null)
    setShowForm(true)
  }

  const openEdit = (zone: DeliveryZone) => {
    setSelected(zone)
    reset({
      nombre: zone.nombre,
      tipo: zone.tipo as FormData['tipo'],
      diasEntrega: zone.diasEntrega ?? '',
      horario: zone.horario ?? '',
      activo: zone.activo,
    })
    setSaveError(null)
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    setSaveError(null)
    try {
      if (selected) {
        await zonasEntregaAPI.update(selected.id, data)
      } else {
        await zonasEntregaAPI.create(data)
      }
      setShowForm(false)
      void loadZones()
    } catch {
      setSaveError(t('errors.saveFailed'))
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
        <CanAccess permission="logistics.manage">
          <button
            type="button"
            onClick={openNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            {t('new')}
          </button>
        </CanAccess>
      </div>

      {/* Form panel */}
      {showForm && (
        <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
            {selected ? t('edit') : t('new')}
          </h2>
          <form onSubmit={(e) => { void handleSubmit(onSubmit)(e) }} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('form.nombre')} <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  {...register('nombre')}
                  placeholder={t('form.nombrePlaceholder')}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{t('errors.nombreRequired')}</p>
                )}
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('form.tipo')}
                </label>
                <select
                  {...register('tipo')}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="barrio">{t('tipos.barrio')}</option>
                  <option value="manual">{t('tipos.manual')}</option>
                  <option value="predefinida">{t('tipos.predefinida')}</option>
                </select>
              </div>

              {/* Horario */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('form.horario')}
                </label>
                <input
                  {...register('horario')}
                  placeholder={t('form.horarioPlaceholder')}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Días de entrega */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('form.diasEntrega')}
                </label>
                <input
                  {...register('diasEntrega')}
                  placeholder="1,3,5"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('form.diasEntregaHint')}</p>
              </div>

              {/* Activo (only shown when editing) */}
              {selected && (
                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="activo-zone"
                    {...register('activo')}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <label htmlFor="activo-zone" className="text-sm text-slate-700 dark:text-slate-300">
                    {t('form.activo')}
                  </label>
                </div>
              )}
            </div>

            {saveError && (
              <p className="text-red-500 text-sm mt-3">{saveError}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded transition"
              >
                {isSubmitting ? tc('actions.saving') : tc('actions.save')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded transition"
              >
                {tc('actions.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">{tc('status.loading')}</p>
      ) : zones.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">{t('empty')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-left">
              <tr>
                <th className="px-4 py-3">{t('table.nombre')}</th>
                <th className="px-4 py-3">{t('table.tipo')}</th>
                <th className="px-4 py-3">{t('table.diasEntrega')}</th>
                <th className="px-4 py-3">{t('table.horario')}</th>
                <th className="px-4 py-3">{t('table.activo')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr
                  key={zone.id}
                  className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{zone.nombre}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t(`tipos.${zone.tipo}`, { defaultValue: zone.tipo })}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{zone.diasEntrega ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{zone.horario ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      zone.activo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {zone.activo ? tc('status.active') : tc('status.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CanAccess permission="logistics.manage">
                      <button
                        type="button"
                        onClick={() => openEdit(zone)}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                      >
                        {t('edit')}
                      </button>
                    </CanAccess>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
