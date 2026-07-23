import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { depositosAPI } from '@/lib/api'
import type { ArticuloStockPorDepositoResponse } from '@bizcode/types'
import IfModule from '@/components/IfModule'

type Props = {
  articuloId: number | null
}

/**
 * @en Shows stock breakdown by deposit for an article (#236).
 * @es Muestra desglose de stock por depósito para un artículo (#236).
 * @pt-BR Mostra detalhamento de estoque por depósito para um artigo (#236).
 */
export default function ArticuloStockDepositosPanel({ articuloId }: Props) {
  const { t } = useTranslation('articulos')
  const [data, setData] = useState<ArticuloStockPorDepositoResponse | null>(null)

  useEffect(() => {
    if (articuloId == null) {
      setData(null)
      return
    }
    depositosAPI
      .stockPorArticulo(articuloId)
      .then(setData)
      .catch(() => setData(null))
  }, [articuloId])

  if (articuloId == null) return null

  return (
    <IfModule flag="inventory.warehouses">
      <section className="mt-4 rounded border border-slate-200 p-3" data-testid="stock-depositos-panel">
        <h3 className="text-sm font-semibold">{t('stockByDeposit', 'Stock por depósito')}</h3>
        {data ? (
          <div className="mt-2 space-y-1 text-sm">
            <p data-testid="stock-total">
              {t('stockTotal', 'Stock total')}: {data.stockTotal}
            </p>
            <p data-testid="stock-en-transito">
              {t('stockInTransit', 'En tránsito')}: {data.enTransito}
            </p>
            <ul>
              {data.depositos.map((d) => (
                <li key={d.id} data-testid={`stock-dep-${d.depositoId}`}>
                  {d.depositoCodigo ?? d.depositoId}: {d.cantidad}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">{t('stockByDepositEmpty', 'Sin datos de depósitos')}</p>
        )}
      </section>
    </IfModule>
  )
}
