import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { facturasAPI, type MercadoPagoRefundDto, type MercadoPagoRefundStatusDto } from '@/lib/api'
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

function hasRefundInProgress(status: MercadoPagoRefundStatusDto): boolean {
  return status.refunds.some((r) => r.estado === 'iniciado' || r.estado === 'procesando')
}

function isFullyRefunded(status: MercadoPagoRefundStatusDto): boolean {
  return Number.parseFloat(status.refundableBalance) <= 0 && status.refunds.some((r) => r.estado === 'completado')
}

/**
 * @en Dialog to request Mercado Pago refunds — total (#179) and partial (#344).
 * @es Diálogo para solicitar reembolsos Mercado Pago — total (#179) y parcial (#344).
 * @pt-BR Diálogo para solicitar reembolsos Mercado Pago — total (#179) e parcial (#344).
 */
export default function MercadoPagoRefundDialog({ factura, onClose, onRefunded }: Props) {
  const { t } = useTranslation('facturacion')
  const titleId = useId()
  const feedbackId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [status, setStatus] = useState<MercadoPagoRefundStatusDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [monto, setMonto] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const loadRefund = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await facturasAPI.getMpRefund(factura.id)
      setStatus(data)
      setMonto(data.refundableBalance !== '0.00' ? data.refundableBalance : '')
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

  const refundableBalance = status ? Number.parseFloat(status.refundableBalance) : 0
  const parsedMonto = Number.parseFloat(monto)
  const montoValid =
    Number.isFinite(parsedMonto) && parsedMonto > 0 && parsedMonto <= refundableBalance

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    setFeedback(null)
    try {
      const body: { motivo: string; monto?: number } = { motivo: motivo.trim() }
      if (montoValid && parsedMonto < refundableBalance) {
        body.monto = parsedMonto
      } else if (montoValid && parsedMonto === refundableBalance) {
        body.monto = parsedMonto
      }
      const data = await facturasAPI.refundMp(factura.id, body)
      await loadRefund()
      const isPartial = parsedMonto < refundableBalance
      setFeedback(
        isPartial ? t('mercadopago.refund.successPartial', { monto: data.monto }) : t('mercadopago.refund.success'),
      )
      onRefunded?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('mercadopago.refund.errors.submitFailed')
      if (message === 'exceeds_refundable_balance') {
        setError(t('mercadopago.refund.errors.exceedsBalance'))
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit =
    motivo.trim().length >= 10 &&
    montoValid &&
    !submitting &&
    status != null &&
    !hasRefundInProgress(status) &&
    !isFullyRefunded(status)

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
            {status && (
              <div
                className="mt-4 rounded border border-slate-200 p-3 text-sm dark:border-slate-600"
                data-testid="mp-refund-timeline"
              >
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {t('mercadopago.refund.timelineTitle')}
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-300" data-testid="mp-refund-balance">
                  {t('mercadopago.refund.refundableBalance', { amount: status.refundableBalance })}
                </p>
                {status.refunds.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                    {status.refunds.map((refund: MercadoPagoRefundDto) => (
                      <li key={refund.id} data-testid={`mp-refund-entry-${refund.id}`}>
                        <span data-testid="mp-refund-estado">
                          {t(`mercadopago.refund.estado.${refund.estado}`)}
                        </span>
                        {' — '}
                        {refund.monto}
                        {refund.errorMessage && (
                          <span className="block text-red-600 dark:text-red-400">{refund.errorMessage}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-slate-500">{t('mercadopago.refund.noRefundsYet')}</p>
                )}
              </div>
            )}

            {status && !hasRefundInProgress(status) && !isFullyRefunded(status) && (
              <div className="mt-4 space-y-3">
                <div>
                  <label
                    htmlFor="mp-refund-monto"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t('mercadopago.refund.montoLabel')}
                  </label>
                  <input
                    id="mp-refund-monto"
                    type="number"
                    min={0.01}
                    step={0.01}
                    max={refundableBalance}
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                    data-testid="mp-refund-monto-input"
                  />
                  <p className="mt-1 text-xs text-slate-500">{t('mercadopago.refund.montoHint')}</p>
                </div>
                <div>
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
          {status && !hasRefundInProgress(status) && !isFullyRefunded(status) && (
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
