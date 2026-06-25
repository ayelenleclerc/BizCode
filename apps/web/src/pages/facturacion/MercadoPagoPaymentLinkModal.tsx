import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { facturasAPI, type MercadoPagoFacturaPaymentDto } from '@/lib/api'
import type { Cliente, Factura } from '@bizcode/types'

type Props = {
  factura: Factura
  cliente: Cliente | undefined
  onClose: () => void
  onStatusChange?: (status: MercadoPagoFacturaPaymentDto) => void
}

function formatFacturaNumber(factura: Factura): string {
  return `${factura.prefijo} ${factura.numero.toString().padStart(8, '0')}`
}

function normalizePhoneForWhatsApp(telef: string): string {
  return telef.replace(/\D/g, '')
}

/**
 * @en Modal to create and share Mercado Pago payment links per invoice (#175).
 * @es Modal para crear y compartir links de pago Mercado Pago por factura (#175).
 * @pt-BR Modal para criar e compartilhar links de pagamento Mercado Pago por fatura (#175).
 */
export default function MercadoPagoPaymentLinkModal({
  factura,
  cliente,
  onClose,
  onStatusChange,
}: Props) {
  const { t } = useTranslation('facturacion')
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [status, setStatus] = useState<MercadoPagoFacturaPaymentDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await facturasAPI.getMpStatus(factura.id)
      setStatus(data)
      onStatusChange?.(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('mercadopago.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [factura.id, onStatusChange, t])

  useEffect(() => {
    void loadStatus()
    closeButtonRef.current?.focus()
  }, [loadStatus])

  const handleCreate = async () => {
    setCreating(true)
    setError(null)
    try {
      const data = await facturasAPI.createMpPreference(factura.id)
      setStatus(data)
      onStatusChange?.(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('mercadopago.errors.createFailed'))
    } finally {
      setCreating(false)
    }
  }

  const buildShareMessage = (): string => {
    const nombre = cliente?.rsocial ?? t('mercadopago.share.defaultName')
    const numero = formatFacturaNumber(factura)
    const amount = status?.amount ?? String(factura.total)
    const link = status?.paymentLink ?? ''
    return t('mercadopago.share.message', { nombre, numero, amount, link })
  }

  const handleCopy = async () => {
    if (!status?.paymentLink) return
    try {
      await navigator.clipboard.writeText(status.paymentLink)
      setCopyFeedback(t('mercadopago.copySuccess'))
    } catch {
      setCopyFeedback(t('mercadopago.copyFailed'))
    }
  }

  const whatsappHref = (() => {
    const phone = cliente?.telef ? normalizePhoneForWhatsApp(cliente.telef) : ''
    if (!phone || !status?.paymentLink) return null
    const text = encodeURIComponent(buildShareMessage())
    return `https://wa.me/${phone}?text=${text}`
  })()

  const emailHref = (() => {
    const email = cliente?.email?.trim()
    if (!email || !status?.paymentLink) return null
    const subject = encodeURIComponent(
      t('mercadopago.share.emailSubject', { numero: formatFacturaNumber(factura) }),
    )
    const body = encodeURIComponent(buildShareMessage())
    return `mailto:${email}?subject=${subject}&body=${body}`
  })()

  const canCreate =
    status != null &&
    status.estado !== 'approved' &&
    status.estado !== 'pending' &&
    factura.estado === 'A'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="mp-payment-link-modal"
    >
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-slate-800">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-600">
          <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('mercadopago.modalTitle')}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t('mercadopago.modalSubtitle', { ref: formatFacturaNumber(factura) })}
          </p>
        </div>

        <div className="space-y-4 p-6">
          {loading && (
            <p className="text-slate-600 dark:text-slate-300" role="status">
              {t('mercadopago.loading')}
            </p>
          )}

          {!loading && status && (
            <>
              <p
                className="inline-block rounded px-2 py-1 text-xs font-semibold"
                data-testid="mp-payment-status-badge"
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

              {status.paymentLink && (
                <div>
                  <label htmlFor="mp-payment-link-input" className="mb-1 block text-sm font-medium">
                    {t('mercadopago.linkLabel')}
                  </label>
                  <input
                    id="mp-payment-link-input"
                    type="url"
                    readOnly
                    value={status.paymentLink}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    data-testid="mp-payment-link-input"
                  />
                  {status.expiresAt && (
                    <p className="mt-1 text-xs text-slate-500">
                      {t('mercadopago.expiresAt', {
                        date: new Date(status.expiresAt).toLocaleString(),
                      })}
                    </p>
                  )}
                </div>
              )}

              {status.paymentLink && (
                <div className="flex flex-wrap gap-2" role="group" aria-label={t('mercadopago.shareGroup')}>
                  <button
                    type="button"
                    className="rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300 dark:bg-slate-700"
                    onClick={() => void handleCopy()}
                    data-testid="btn-mp-copy-link"
                  >
                    {t('mercadopago.copy')}
                  </button>
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                      data-testid="btn-mp-whatsapp"
                    >
                      {t('mercadopago.whatsapp')}
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title={t('mercadopago.whatsappDisabled')}
                      className="rounded bg-slate-100 px-3 py-2 text-sm text-slate-400"
                      data-testid="btn-mp-whatsapp"
                    >
                      {t('mercadopago.whatsapp')}
                    </button>
                  )}
                  {emailHref ? (
                    <a
                      href={emailHref}
                      className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                      data-testid="btn-mp-email"
                    >
                      {t('mercadopago.email')}
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title={t('mercadopago.emailDisabled')}
                      className="rounded bg-slate-100 px-3 py-2 text-sm text-slate-400"
                      data-testid="btn-mp-email"
                    >
                      {t('mercadopago.email')}
                    </button>
                  )}
                </div>
              )}

              {copyFeedback && (
                <p className="text-sm text-green-700 dark:text-green-400" role="status">
                  {copyFeedback}
                </p>
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
              data-testid="btn-mp-create-preference"
            >
              {creating ? t('mercadopago.creating') : t('mercadopago.createLink')}
            </button>
          )}
          <button
            ref={closeButtonRef}
            type="button"
            className="rounded border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
            onClick={onClose}
            data-testid="btn-mp-modal-close"
          >
            {t('detail.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
