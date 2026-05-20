import { useTranslation } from 'react-i18next'
import type { OrdenEntrega } from '@/lib/api'

type Props = {
  orders: OrdenEntrega[]
  selectedIds: Set<number>
  onAdd: (orden: OrdenEntrega) => void
}

function orderLabel(orden: OrdenEntrega): string {
  const cliente = orden.cliente?.rsocial ?? `#${orden.clienteId}`
  const zona = orden.zona?.nombre ? ` · ${orden.zona.nombre}` : ''
  return `${cliente}${zona}`
}

export default function RepartosAvailableOrders({ orders, selectedIds, onAdd }: Props) {
  const { t } = useTranslation('repartos')
  const available = orders.filter((o) => !selectedIds.has(o.id))

  return (
    <section aria-labelledby="repartos-available-heading" data-testid="repartos-available-orders">
      <h3 id="repartos-available-heading" className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
        {t('form.availableOrders')}
      </h3>
      {available.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('list.empty')}</p>
      ) : (
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {available.map((orden) => (
            <li
              key={orden.id}
              className="flex items-center justify-between gap-2 rounded border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm"
            >
              <span>{orderLabel(orden)}</span>
              <button
                type="button"
                onClick={() => onAdd(orden)}
                className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-500 rounded"
                data-testid={`repartos-add-order-${orden.id}`}
              >
                {t('actions.addOrder')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
