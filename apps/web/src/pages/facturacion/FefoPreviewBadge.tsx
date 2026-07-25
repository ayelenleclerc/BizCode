import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { lotesAPI } from '@/lib/api'
import type { FefoAllocation } from '@bizcode/types'

type Props = {
  articuloId: number
  depositoId: number | null
  cantidad: number
}

type PreviewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; allocations: FefoAllocation[] }
  | { status: 'error' }

/**
 * @en Read-only preview of the FEFO lot allocation suggested for an invoice line; never blocks saving (#202).
 * @es Vista previa de solo lectura de la asignación FEFO sugerida para una línea de factura; nunca bloquea el guardado (#202).
 * @pt-BR Prévia somente leitura da alocação FEFO sugerida para uma linha de fatura; nunca bloqueia o salvamento (#202).
 */
export default function FefoPreviewBadge({ articuloId, depositoId, cantidad }: Props) {
  const { t } = useTranslation('facturacion')
  const [state, setState] = useState<PreviewState>({ status: 'idle' })

  useEffect(() => {
    if (depositoId == null || articuloId < 1 || cantidad < 1) {
      setState({ status: 'idle' })
      return
    }
    let cancelled = false
    setState({ status: 'loading' })
    lotesAPI
      .previewFefo({ articuloId, depositoId, quantity: cantidad })
      .then((allocations) => {
        if (!cancelled) setState({ status: 'ok', allocations })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [articuloId, depositoId, cantidad])

  if (state.status === 'idle' || depositoId == null) return null

  if (state.status === 'loading') {
    return (
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400" data-testid="fefo-preview-loading">
        {t('fefoPreview.loading')}
      </p>
    )
  }

  if (state.status === 'error') {
    return (
      <p className="mt-1 text-xs text-amber-600" role="status" data-testid="fefo-preview-error">
        {t('fefoPreview.error')}
      </p>
    )
  }

  if (state.allocations.length === 0) {
    return (
      <p className="mt-1 text-xs text-amber-600" role="status" data-testid="fefo-preview-empty">
        {t('fefoPreview.empty')}
      </p>
    )
  }

  return (
    <ul
      className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-300"
      data-testid="fefo-preview-list"
      aria-label={t('fefoPreview.ariaLabel')}
    >
      {state.allocations.map((allocation) => (
        <li key={allocation.loteId} data-testid={`fefo-preview-${allocation.loteId}`}>
          {t('fefoPreview.line', {
            nroLote: allocation.nroLote,
            cantidad: allocation.cantidad,
            fecha: allocation.fechaVencimiento,
          })}
        </li>
      ))}
    </ul>
  )
}
