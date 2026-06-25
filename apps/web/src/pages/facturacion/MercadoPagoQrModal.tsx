import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { facturasAPI, type MercadoPagoFacturaPaymentDto } from '@/lib/api'
import type { Factura } from '@bizcode/types'

type Props = {
  factura: Factura
  onClose: () => void
  onStatusChange?: (status: MercadoPagoFacturaPaymentDto) => void
}

const POLL_MS = 3000

function formatFacturaNumber(factura: Factura): string {
  return `${factura.prefijo} ${factura.numero.toString().padStart(8, '0')}`
}

/**
 * @en Modal to display Mercado Pago instore QR and poll payment status (#177).
 * @es Modal para mostrar QR instore de Mercado Pago y consultar estado (#177).
 * @pt-BR Modal para exibir QR instore do Mercado Pago e consultar status (#177).
 */
export default function MercadoPagoQrModal({ factura, onClose, onStatusChange }: Props) {
  const { t } = useTranslation('facturacion')
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [status, setStatus] = useState<MercadoPagoFacturaPaymentDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paidCelebration, setPaidCelebration] = useState(false)

  const loadStatus = useCallback(async () => {
    setError(null)
    try {
      const data = await facturasAPI.getMpStatus(factura.id)
      setStatus(data)
      onStatusChange?.(data)
      if (data.estado === 'approved') {
        setPaidCelebration(true)
      }
      return data
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('mercadopago.qr.errors.loadFailed'))
      return null
    }
  }, [factura.id, onStatusChange, t])

  useEffect(() => {
    void (async () => {
      setLoading(true)
      await loadStatus()
      setLoading(false)
    })()
    closeButtonRef.current?.focus()
  }, [loadStatus])

  useEffect(() => {
    if (status?.estado !== 'pending' || status.channel !== 'qr') return undefined
    const timer = window.setInterval(() => {
      void loadStatus()
    }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [loadStatus, status?.channel, status?.estado])

  const handleCreate = async () => {
    setCreating(true)
    setError(null)
    setPaidCelebration(false)
    try {
      const data = await facturasAPI.createMpQr(factura.id)
      setStatus(data)
      onStatusChange?.(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('mercadopago.qr.errors.createFailed'))
    } finally {
      setCreating(false)
    }
  }

  const canCreate =
    status != null &&
    status.estado !== 'approved' &&
    (status.estado === 'none' || status.estado === 'expired' || status.channel !== 'qr') &&
    factura.estado === 'A'

  const qrImageSrc =
    status?.qrImageBase64 != null ? `data:image/png;base64,${status.qrImageBase64}` : null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="mp-qr-modal"
    >
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-slate-800">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-600">
          <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('mercadopago.qr.modalTitle')}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t('mercadopago.qr.modalSubtitle', { ref: formatFacturaNumber(factura) })}
          </p>
        </div>

        <div className="space-y-4 p-6">
          {loading && (
            <p className="text-slate-600 dark:text-slate-300" role="status">
              {t('mercadopago.qr.loading')}
            </p>
          )}

          {!loading && status && (
            <>
              <p
                className="inline-block rounded px-2 py-1 text-xs font-semibold"
                data-testid="mp-qr-status-badge"
                aria-live="polite"
              >
                <span
                  className={
                    status.estado === 'approved'
                      ? 'text-green-800 dark:text-green-300'
                      : status.estado === 'expired' || status.estado === 'rejected'
                        ? 'text-red-800 dark:text-red-300'
                        : 'text-amber-800 dark:text-amber-300'
                  }
                >
                  {t(`mercadopago.estado.${status.estado}`)}
                </span>
              </p>

              {paidCelebration && (
                <p
                  className="rounded bg-green-100 px-3 py-2 text-sm font-medium text-green-900 dark:bg-green-900/40 dark:text-green-200"
                  role="status"
                  data-testid="mp-qr-paid-success"
                >
                  {t('mercadopago.qr.paidSuccess')}
                </p>
              )}

              {qrImageSrc && status.estado === 'pending' && (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={qrImageSrc}
                    alt={t('mercadopago.qr.imageAlt')}
                    className="h-64 w-64 rounded border border-slate-200 bg-white p-2 dark:border-slate-600"
                    data-testid="mp-qr-image"
                  />
                  {status.amount && (
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {t('mercadopago.qr.amountLabel', { amount: status.amount })}
                    </p>
                  )}
                  {status.qrExpiresAt && (
                    <p className="text-xs text-slate-500">
                      {t('mercadopago.qr.expiresAt', {
                        date: new Date(status.qrExpiresAt).toLocaleString(),
                      })}
                    </p>
                  )}
                  <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                    {t('mercadopago.qr.scanHint')}
                  </p>
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-600">
          {canCreate && (
            <button
              type="button"
              className="rounded bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-50"
              disabled={creating}
              onClick={() => void handleCreate()}
              data-testid="btn-mp-create-qr"
            >
              {creating ? t('mercadopago.qr.creating') : t('mercadopago.qr.createQr')}
            </button>
          )}
          <button
            ref={closeButtonRef}
            type="button"
            className="rounded border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
            onClick={onClose}
            data-testid="btn-mp-qr-modal-close"
          >
            {t('detail.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
