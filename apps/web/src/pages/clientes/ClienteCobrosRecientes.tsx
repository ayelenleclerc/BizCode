import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cobrosAPI } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import type { Cobro } from '@bizcode/types'

type Props = {
  clienteId: number
}

/**
 * @en Recent payments for a customer with link to register a new one.
 * @es Cobros recientes del cliente con enlace para registrar uno nuevo.
 * @pt-BR Recebimentos recentes do cliente com link para registrar novo pagamento.
 */
export default function ClienteCobrosRecientes({ clienteId }: Props) {
  const { t } = useTranslation('cobros')
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      try {
        const res = await cobrosAPI.list({ clienteId, limit: 5 })
        if (!cancelled) {
          setCobros(res?.data ?? [])
        }
      } catch {
        if (!cancelled) setCobros([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [clienteId])

  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 mt-2" data-testid="cliente-cobros-recientes">
      <ClienteCobrosHeader t={t} clienteId={clienteId} />
      {loading ? (
        <p className="text-xs text-slate-400">{t('empty')}</p>
      ) : cobros.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('empty')}</p>
      ) : (
        <ul className="text-sm space-y-1 mt-2">
          {cobros.map((c) => (
            <li key={c.id} className="flex justify-between gap-2 font-mono text-slate-800 dark:text-slate-200">
              <span>{new Date(c.fecha).toLocaleDateString('es-AR')}</span>
              <span>{Number(c.monto).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ClienteCobrosHeader({ t, clienteId }: { t: (key: string) => string; clienteId: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{t('recentTitle')}</h4>
      <CanAccess permission="sales.create">
        <Link
          to={`/cobros?clienteId=${clienteId}`}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          data-testid="cliente-register-cobro-link"
        >
          {t('registerForClient')}
        </Link>
      </CanAccess>
    </div>
  )
}
