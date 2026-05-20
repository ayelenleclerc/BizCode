import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'
import { ordenesEntregaAPI, repartosAPI, usersAPI, type OrdenEntrega } from '@/lib/api'
import RepartosAvailableOrders from './RepartosAvailableOrders'

type Props = {
  open: boolean
  fecha: string
  onClose: () => void
  onCreated: () => void
}

function SortableRouteItem({
  orden,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  orden: OrdenEntrega
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const { t } = useTranslation('repartos')
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: orden.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }
  const label = orden.cliente?.rsocial ?? `#${orden.clienteId}`

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800"
      data-testid={`repartos-route-item-${orden.id}`}
    >
      <button
        type="button"
        className="cursor-grab px-1 text-slate-500"
        aria-label={label}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <span className="flex-1">{label}</span>
      <button
        type="button"
        disabled={isFirst}
        onClick={onMoveUp}
        className="px-2 py-1 text-xs border rounded disabled:opacity-40"
        aria-label={t('actions.moveUp')}
      >
        ↑
      </button>
      <button
        type="button"
        disabled={isLast}
        onClick={onMoveDown}
        className="px-2 py-1 text-xs border rounded disabled:opacity-40"
        aria-label={t('actions.moveDown')}
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="px-2 py-1 text-xs border border-red-300 dark:border-red-700 rounded"
        data-testid={`repartos-remove-order-${orden.id}`}
      >
        {t('actions.removeOrder')}
      </button>
    </li>
  )
}

export default function RepartoFormDialog({ open, fecha, onClose, onCreated }: Props) {
  const { t } = useTranslation('repartos')
  const [choferId, setChoferId] = useState('')
  const [vehiculo, setVehiculo] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [routeOrders, setRouteOrders] = useState<OrdenEntrega[]>([])
  const [pendingOrders, setPendingOrders] = useState<OrdenEntrega[]>([])
  const [drivers, setDrivers] = useState<{ id: number; username: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const selectedIds = useMemo(() => new Set(routeOrders.map((o) => o.id)), [routeOrders])

  const loadData = useCallback(async () => {
    try {
      const [usersRes, ordenesRes] = await Promise.all([
        usersAPI.list(),
        ordenesEntregaAPI.list({ fecha, estado: 'pending', limit: 200 }),
      ])
      setDrivers((usersRes ?? []).filter((u) => u.role === 'driver' && u.active).map((u) => ({ id: u.id, username: u.username })))
      setPendingOrders(ordenesRes?.data ?? [])
    } catch {
      setPendingOrders([])
      setDrivers([])
    }
  }, [fecha])

  useEffect(() => {
    if (open) {
      setRouteOrders([])
      setChoferId('')
      setVehiculo('')
      setObservaciones('')
      setError(null)
      void loadData()
    }
  }, [open, loadData])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setRouteOrders((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= routeOrders.length) return
    setRouteOrders((items) => arrayMove(items, index, target))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cid = Number.parseInt(choferId, 10)
    if (!Number.isFinite(cid) || cid < 1 || routeOrders.length === 0) return
    setSaving(true)
    setError(null)
    try {
      await repartosAPI.create({
        fecha,
        choferId: cid,
        vehiculo: vehiculo.trim() || null,
        observaciones: observaciones.trim() || null,
        ordenEntregaIds: routeOrders.map((o) => o.id),
      })
      onCreated()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('ORDEN_ALREADY_IN_ACTIVE_REPARTO')) {
        setError(t('errors.alreadyInRoute'))
      } else {
        setError(t('errors.create'))
      }
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reparto-form-title"
      data-testid="reparto-form-dialog"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-slate-900 p-6 shadow-xl"
      >
        <h2 id="reparto-form-title" className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">
          {t('actions.newRoute')}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <label className="block text-sm">
            <span className="text-slate-700 dark:text-slate-300">{t('form.chofer')}</span>
            <select
              required
              value={choferId}
              onChange={(e) => setChoferId(e.target.value)}
              className="mt-1 w-full border rounded px-2 py-2 dark:bg-slate-800"
              data-testid="reparto-form-chofer"
            >
              <option value="">{t('form.selectChofer')}</option>
              {drivers.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.username}
                </option>
              ))}
            </select>
            {drivers.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">{t('form.noDrivers')}</p>
            )}
          </label>
          <label className="block text-sm">
            <span className="text-slate-700 dark:text-slate-300">{t('form.vehiculo')}</span>
            <input
              type="text"
              maxLength={60}
              value={vehiculo}
              onChange={(e) => setVehiculo(e.target.value)}
              className="mt-1 w-full border rounded px-2 py-2 dark:bg-slate-800"
              data-testid="reparto-form-vehiculo"
            />
          </label>
        </div>

        <label className="block text-sm mb-4">
          <span className="text-slate-700 dark:text-slate-300">{t('form.observaciones')}</span>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={2}
            maxLength={500}
            className="mt-1 w-full border rounded px-2 py-2 dark:bg-slate-800"
            data-testid="reparto-form-observaciones"
          />
        </label>

        <RepartosAvailableOrders
          orders={pendingOrders}
          selectedIds={selectedIds}
          onAdd={(orden) => setRouteOrders((prev) => [...prev, orden])}
        />

        <section className="mt-4" aria-labelledby="repartos-sequence-heading">
          <h3 id="repartos-sequence-heading" className="text-sm font-semibold mb-2">
            {t('form.routeSequence')}
          </h3>
          {routeOrders.length === 0 ? (
            <p className="text-sm text-slate-500">{t('list.empty')}</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={routeOrders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                  {routeOrders.map((orden, index) => (
                    <SortableRouteItem
                      key={orden.id}
                      orden={orden}
                      isFirst={index === 0}
                      isLast={index === routeOrders.length - 1}
                      onRemove={() => setRouteOrders((prev) => prev.filter((o) => o.id !== orden.id))}
                      onMoveUp={() => moveItem(index, -1)}
                      onMoveDown={() => moveItem(index, 1)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </section>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600" data-testid="reparto-form-error">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
            {t('actions.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving || routeOrders.length === 0 || !choferId}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            data-testid="reparto-form-submit"
          >
            {t('actions.create')}
          </button>
        </div>
      </form>
    </div>
  )
}
