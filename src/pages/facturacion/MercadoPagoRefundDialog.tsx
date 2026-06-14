import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { facturasAPI, type MercadoPagoRefundDto } from '@/lib/api'
import type { Factura } from '@/types'

type Props = {
  factura: Factura
  onClose: () => void
  onRefunded?: () => void
}

function formatFacturaRef(factura: Factura): string {
  const prefijo = factura.prefijo.padStart(4, '0')
  const numero = String(factura.numero).padStart(8, '0')
  return `${factura.tipo}-${prefijo}-${numero}`
}

/**
 * @en Dialog to request a total Mercado Pago refund (#179).
 * @es Diálogo para solicitar reembolso total Mercado Pago (#179).
 * @pt-BR Diálogo para solicitar reembolso total Mercado Pago (#179).
 */
export default function MercadoPagoRefundDialog({ factura, onClose, onRefunded }: Props) {
  const { t } = useTranslation('facturacion')
  const titleId = useId()
  const feedbackId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [refund, setRefund] = useState<MercadoPagoRefundDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const loadRefund = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await facturasAPI.getMpRefund(factura.id)
      setRefund(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('mercadopago.refund.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [factura.id, t])

  useEffect(() => {
    void loadRefund()
    closeButtonRef.current?.focus()
  }, [loadRefund])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    setFeedback(null)
    try {
      const data = await facturasAPI.refundMp(factura.id, { motivo: motivo.trim() })
      setRefund(data)
      setFeedback(t('mercadopago.refund.success'))
      onRefunded?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('mercadopago.refund.errors.submitFailed')
      if (message === 'partial_refund_not_supported') {
        setError(t('mercadopago.refund.errors.partialNotSupported'))
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = motivo.trim().length >= 10 && !submitting && refund?.estado !== 'completado'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      data-testid="mp-refund-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={feedback ? feedbackId : undefined}
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800"
        data-testid="mp-refund-dialog"
      >
        <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t('mercadopago.refund.modalTitle')}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {t('mercadopago.refund.modalSubtitle', { ref: formatFacturaRef(factura) })}
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500" data-testid="mp-refund-loading">
            {t('mercadopago.refund.loading')}
          </p>
        ) : (
          <>
            {refund && (
              <div
                className="mt-4 rounded border border-slate-200 p-3 text-sm dark:border-slate-600"
                data-testid="mp-refund-timeline"
              >
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {t('mercadopago.refund.timelineTitle')}
                </p>
                <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                  <li>
                    {t('mercadopago.refund.timelineEstado')}:{' '}
                    <span data-testid="mp-refund-estado">{t(`mercadopago.refund.estado.${refund.estado}`)}</span>
                  </li>
                  <li>
                    {t('mercadopago.refund.timelineMonto')}: {refund.monto}
                  </li>
                  {refund.errorMessage && (
                    <li className="text-red-600 dark:text-red-400">{refund.errorMessage}</li>
                  )}
                </ul>
              </div>
            )}

            {refund?.estado !== 'completado' && (
              <div className="mt-4">
                <label htmlFor="mp-refund-motivo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('mercadopago.refund.motivoLabel')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id="mp-refund-motivo"
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder={t('mercadopago.refund.motivoPlaceholder')}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  data-testid="mp-refund-motivo-input"
                />
              </div>
            )}

            {error && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert" data-testid="mp-refund-error">
                {error}
              </p>
            )}

            {feedback && (
              <p
                id={feedbackId}
                className="mt-3 text-sm text-green-700 dark:text-green-300"
                role="status"
                aria-live="polite"
                data-testid="mp-refund-feedback"
              >
                {feedback}
              </p>
            )}
          </>
        )}

        <div className="mt-6 flex justify-end gap-2">
          {refund?.estado !== 'completado' && (
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!canSubmit}
              className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              data-testid="mp-refund-submit"
            >
              {submitting ? t('mercadopago.refund.submitting') : t('mercadopago.refund.submit')}
            </button>
          )}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            data-testid="mp-refund-close"
          >
            {t('mercadopago.refund.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
