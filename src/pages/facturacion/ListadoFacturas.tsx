import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { arcaAPI, facturasAPI, printingAPI, remitosAPI, type MercadoPagoFacturaPaymentDto } from '@/lib/api'
import KeyboardHint from '@/components/shared/KeyboardHint'
import { useListKeyboardNav, useListPageHotkeys } from '@/hooks/useListPageKeyboard'
import { CanAccess } from '@/components/CanAccess'
import IfModule from '@/components/IfModule'
import IfIntegration from '@/components/IfIntegration'
import { Factura, Cliente } from '@/types'
import FacturaPdfPreviewDialog from './FacturaPdfPreviewDialog'
import MercadoPagoPaymentLinkModal from './MercadoPagoPaymentLinkModal'
import MercadoPagoQrModal from './MercadoPagoQrModal'
import MercadoPagoRefundDialog from './MercadoPagoRefundDialog'

interface ListadoFacturasProps {
  facturas: Factura[]
  clientes: Cliente[]
  onFacturaVoided?: () => void
  onFacturaUpdated?: () => void
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/** @see server/schemas/domain.ts factura void body — motivo min length */
const FACTURA_VOID_MOTIVO_MIN_LEN = 10 as const

function CaeBadge({ estado }: { estado: Factura['estadoCae'] }) {
  const { t } = useTranslation('facturacion')
  if (!estado) return null
  const label =
    estado === 'issued' ? t('cae.issued') : estado === 'failed' ? t('cae.failed') : t('cae.pending')
  const className =
    estado === 'issued'
      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
      : estado === 'failed'
        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
        : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300'
  return (
    <span
      data-testid={`factura-cae-badge-${estado}`}
      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  )
}

function deriveMpEstadoFromFactura(factura: Factura): MercadoPagoFacturaPaymentDto['estado'] | null {
  if (!factura.mpEstado) return null
  if (factura.mpEstado === 'approved') return 'approved'
  if (factura.mpEstado === 'refunded') return 'refunded'
  if (factura.mpEstado === 'rejected') return 'rejected'
  if (factura.mpEstado === 'cancelled') return 'cancelled'
  if (factura.mpEstado === 'pending') {
    const expiresAt = factura.mpPreferenceExpiresAt
      ? new Date(factura.mpPreferenceExpiresAt).getTime()
      : null
    if (expiresAt != null && expiresAt <= Date.now()) return 'expired'
    return 'pending'
  }
  return null
}

function MpPaymentBadge({ factura }: { factura: Factura }) {
  const { t } = useTranslation('facturacion')
  const estado = deriveMpEstadoFromFactura(factura)
  if (!estado || estado === 'none') return null
  const className =
    estado === 'approved'
      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
      : estado === 'refunded'
        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
      : estado === 'expired' || estado === 'rejected'
        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
        : 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-300'
  return (
    <span
      data-testid={`factura-mp-badge-${factura.id}`}
      className={`ml-1 inline-block rounded px-2 py-0.5 text-xs font-semibold ${className}`}
      title={t(`mercadopago.estado.${estado}`)}
    >
      {t('mercadopago.badgeShort')} {t(`mercadopago.estado.${estado}`)}
    </span>
  )
}

export default function ListadoFacturas({
  facturas,
  clientes,
  onFacturaVoided,
  onFacturaUpdated,
}: ListadoFacturasProps) {
  const { t } = useTranslation('facturacion')
  const { t: tc } = useTranslation('common')
  const listShortcuts = useMemo(
    () => [
      { key: '↑↓', description: tc('shortcuts.navigate') },
      { key: 'Enter', description: tc('shortcuts.open') },
      { key: 'Esc', description: tc('shortcuts.cancel') },
    ],
    [tc],
  )
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)
  const [voidingId, setVoidingId] = useState<number | null>(null)
  const [motivo, setMotivo] = useState('')
  const [voidLoading, setVoidLoading] = useState(false)
  const [voidError, setVoidError] = useState<string | null>(null)
  const [caeLoadingId, setCaeLoadingId] = useState<number | null>(null)
  const [caeError, setCaeError] = useState<string | null>(null)
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [pdfPreviewFilename, setPdfPreviewFilename] = useState('factura.pdf')
  const [printLoadingId, setPrintLoadingId] = useState<number | null>(null)
  const [printError, setPrintError] = useState<string | null>(null)
  const [printFeedback, setPrintFeedback] = useState<string | null>(null)
  const [fiscalPrinterEnabled, setFiscalPrinterEnabled] = useState(false)
  const [thermalPrinterEnabled, setThermalPrinterEnabled] = useState(false)
  const [remitoLoadingId, setRemitoLoadingId] = useState<number | null>(null)
  const [remitoFeedback, setRemitoFeedback] = useState<string | null>(null)
  const [mpModalFacturaId, setMpModalFacturaId] = useState<number | null>(null)
  const [mpQrModalFacturaId, setMpQrModalFacturaId] = useState<number | null>(null)
  const [mpRefundModalFacturaId, setMpRefundModalFacturaId] = useState<number | null>(null)

  useEffect(() => {
    setSelectedRow(0)
  }, [facturas])

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
    }
  }, [pdfPreviewUrl])

  const onOpenRow = useCallback(
    (index: number) => {
      const factura = facturas[index]
      if (factura) setExpandedId(factura.id)
    },
    [facturas],
  )

  const handleKeyDown = useListKeyboardNav({
    itemCount: facturas.length,
    selectedRow,
    setSelectedRow,
    onOpenRow,
  })

  useEffect(() => {
    printingAPI
      .status()
      .then((data) => {
        setFiscalPrinterEnabled(data.fiscalPrinterEnabled)
        setThermalPrinterEnabled(data.thermalPrinterEnabled)
      })
      .catch(() => {
        setFiscalPrinterEnabled(false)
        setThermalPrinterEnabled(false)
      })
  }, [])

  const getClienteName = (clienteId: number) => {
    return clientes.find((c) => c.id === clienteId)?.rsocial || `Cliente #${clienteId}`
  }

  const handleVoid = async (facturaId: number) => {
    const motivoTrim = motivo.trim()
    if (!motivoTrim) {
      setVoidError(t('void.motivoRequired'))
      return
    }
    if (motivoTrim.length < FACTURA_VOID_MOTIVO_MIN_LEN) {
      setVoidError(t('void.motivoMinLength'))
      return
    }
    setVoidLoading(true)
    setVoidError(null)
    try {
      await facturasAPI.void(facturaId, motivoTrim)
      setVoidingId(null)
      setMotivo('')
      setExpandedId(null)
      onFacturaVoided?.()
    } catch (err: unknown) {
      setVoidError((err as Error).message || t('void.error'))
    } finally {
      setVoidLoading(false)
    }
  }

  const handleRetryCae = async (facturaId: number) => {
    setCaeLoadingId(facturaId)
    setCaeError(null)
    try {
      await arcaAPI.requestCae(facturaId)
      onFacturaUpdated?.()
    } catch (err: unknown) {
      setCaeError((err as Error).message || t('cae.retryError'))
    } finally {
      setCaeLoadingId(null)
    }
  }

  const openPdfPreview = (blob: Blob, filename: string) => {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
    const url = URL.createObjectURL(blob)
    setPdfPreviewUrl(url)
    setPdfPreviewFilename(filename)
  }

  const closePdfPreview = () => {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
    setPdfPreviewUrl(null)
  }

  const isOverlayOpen = expandedId !== null || pdfPreviewUrl !== null || voidingId !== null

  useListPageHotkeys({
    onClose: () => {
      if (pdfPreviewUrl) closePdfPreview()
      else if (voidingId !== null) {
        setVoidingId(null)
        setMotivo('')
        setVoidError(null)
      } else {
        setExpandedId(null)
      }
    },
    isOverlayOpen,
  })

  const handlePdfDownload = async (facturaId: number, preview: boolean) => {
    setPdfLoadingId(facturaId)
    setPdfError(null)
    try {
      const blob = preview
        ? await facturasAPI.downloadPdfPreview(facturaId)
        : await facturasAPI.downloadPdf(facturaId)
      const name = preview ? `factura-${facturaId}-preview.pdf` : `factura-${facturaId}.pdf`
      triggerBlobDownload(blob, name)
    } catch (err: unknown) {
      setPdfError((err as Error).message || t('cae.pdfError'))
    } finally {
      setPdfLoadingId(null)
    }
  }

  const handlePdfPreview = async (facturaId: number, preview: boolean) => {
    setPdfLoadingId(facturaId)
    setPdfError(null)
    try {
      const blob = preview
        ? await facturasAPI.downloadPdfPreview(facturaId)
        : await facturasAPI.downloadPdf(facturaId)
      const name = preview ? `factura-${facturaId}-preview.pdf` : `factura-${facturaId}.pdf`
      openPdfPreview(blob, name)
    } catch (err: unknown) {
      setPdfError((err as Error).message || t('cae.pdfError'))
    } finally {
      setPdfLoadingId(null)
    }
  }

  const handleDevicePrint = async (
    facturaId: number,
    device: 'pdf' | 'fiscal' | 'thermal',
    canDownloadPdf: boolean,
  ) => {
    setPrintLoadingId(facturaId)
    setPrintError(null)
    setPrintFeedback(null)
    try {
      const result = await facturasAPI.print(facturaId, device)
      if (result.fallbackToPdf && result.downloadPath) {
        setPdfLoadingId(facturaId)
        try {
          const blob = canDownloadPdf
            ? await facturasAPI.downloadPdf(facturaId)
            : await facturasAPI.downloadPdfPreview(facturaId)
          const name = canDownloadPdf ? `factura-${facturaId}.pdf` : `factura-${facturaId}-preview.pdf`
          if (canDownloadPdf) {
            triggerBlobDownload(blob, name)
          } else {
            openPdfPreview(blob, name)
          }
        } catch (err: unknown) {
          setPrintError((err as Error).message || t('cae.pdfError'))
        } finally {
          setPdfLoadingId(null)
        }
        setPrintFeedback(
          device === 'thermal'
            ? t('print.feedback.thermalFallbackPdf')
            : t('print.feedback.fiscalFallbackPdf'),
        )
        return
      }
      if (device === 'pdf' && result.downloadPath) {
        setPdfLoadingId(facturaId)
        try {
          const blob = canDownloadPdf
            ? await facturasAPI.downloadPdf(facturaId)
            : await facturasAPI.downloadPdfPreview(facturaId)
          const name = canDownloadPdf ? `factura-${facturaId}.pdf` : `factura-${facturaId}-preview.pdf`
          if (canDownloadPdf) {
            triggerBlobDownload(blob, name)
          } else {
            openPdfPreview(blob, name)
          }
        } catch (err: unknown) {
          setPrintError((err as Error).message || t('cae.pdfError'))
        } finally {
          setPdfLoadingId(null)
        }
        return
      }
      if (result.jobId) {
        setPrintFeedback(t('print.feedback.mockSuccess', { jobId: result.jobId }))
      }
    } catch (err: unknown) {
      setPrintError((err as Error).message || t('print.feedback.error'))
    } finally {
      setPrintLoadingId(null)
    }
  }

  const handleTicket = async (facturaId: number, downloadOnly: boolean) => {
    setPdfLoadingId(facturaId)
    setPdfError(null)
    try {
      const blob = await facturasAPI.downloadTicket(facturaId)
      const name = `factura-${facturaId}-ticket.pdf`
      if (downloadOnly) {
        triggerBlobDownload(blob, name)
      } else {
        openPdfPreview(blob, name)
      }
    } catch (err: unknown) {
      setPdfError((err as Error).message || t('cae.pdfError'))
    } finally {
      setPdfLoadingId(null)
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      {facturas.length > 0 && <KeyboardHint shortcuts={listShortcuts} className="mb-4" />}
      {facturas.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          {t('list.empty')}
        </div>
      ) : (
        <table
          data-testid="facturas-table"
          className="w-full border-collapse bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
          aria-label={t('listTitle')}
        >
          <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
            <tr className="border-b border-slate-200 dark:border-slate-600">
              <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('list.fecha')}</th>
              <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('list.tipo')}</th>
              <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('list.numero')}</th>
              <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('list.cliente')}</th>
              <th className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">{t('list.neto')}</th>
              <th className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">{t('list.iva')}</th>
              <th className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">{t('list.total')}</th>
              <IfModule flag="billing.arca_cae">
                <th className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{t('cae.column')}</th>
              </IfModule>
              <th className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{t('list.estado')}</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((factura, idx) => {
              const neto = (Number(factura.neto1) + Number(factura.neto2) + Number(factura.neto3)).toFixed(2)
              const iva = (Number(factura.iva1) + Number(factura.iva2)).toFixed(2)

              return (
                <tr
                  key={factura.id}
                  role="row"
                  tabIndex={0}
                  {...(selectedRow === idx
                    ? { 'aria-selected': 'true' as const }
                    : { 'aria-selected': 'false' as const })}
                  onClick={() => {
                    setSelectedRow(idx)
                    setExpandedId(expandedId === factura.id ? null : factura.id)
                  }}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`border-b border-slate-200 dark:border-slate-700 cursor-pointer transition ${
                    selectedRow === idx
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <td className="px-4 py-3">
                    {new Date(factura.fecha).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 font-semibold">{factura.tipo}</td>
                  <td className="px-4 py-3 font-mono">
                    {factura.prefijo} {factura.numero.toString().padStart(8, '0')}
                  </td>
                  <td className="px-4 py-3">{getClienteName(factura.clienteId)}</td>
                  <td className="px-4 py-3 text-right font-mono">${neto}</td>
                  <td className="px-4 py-3 text-right font-mono">${iva}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-green-700 dark:text-green-400">
                    ${Number(factura.total).toFixed(2)}
                  </td>
                  <IfModule flag="billing.arca_cae">
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <CaeBadge estado={factura.estadoCae} />
                    </td>
                  </IfModule>
                  <td className="px-4 py-3 text-center">
                    {factura.estado === 'A' ? (
                      <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded text-xs font-semibold">
                        {t('list.activa')}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded text-xs font-semibold">
                        {t('list.anulada')}
                      </span>
                    )}
                    <IfIntegration id="mercadopago">
                      <MpPaymentBadge factura={factura} />
                    </IfIntegration>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {expandedId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-factura-title"
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {(() => {
              const factura = facturas.find((f) => f.id === expandedId)
              if (!factura) return null

              const canRetryCae =
                factura.estadoCae === 'pending' || factura.estadoCae === 'failed'
              const canDownloadPdf = factura.estadoCae === 'issued' && !!factura.cae

              return (
                <>
                  <div className="bg-slate-200 dark:bg-slate-700 px-6 py-4 border-b border-slate-300 dark:border-slate-600">
                    <h2 id="dialog-factura-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {t('detail.title', {
                        tipo: factura.tipo,
                        prefijo: factura.prefijo,
                        numero: factura.numero.toString().padStart(8, '0'),
                      })}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {new Date(factura.fecha).toLocaleDateString('es-AR')} — {getClienteName(factura.clienteId)}
                    </p>
                    <IfModule flag="billing.arca_cae">
                      <div className="mt-2">
                        <CaeBadge estado={factura.estadoCae} />
                        {factura.cae && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {t('cae.caeNumber', { cae: factura.cae })}
                            {factura.caeVto &&
                              ` — ${t('cae.caeVto', { date: new Date(factura.caeVto).toLocaleDateString('es-AR') })}`}
                          </p>
                        )}
                      </div>
                    </IfModule>
                  </div>

                  <div className="p-6 space-y-4">
                    {factura.items && factura.items.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">{t('detail.items')}</h3>
                        <table className="w-full text-sm" aria-label={t('detail.items')}>
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-600">
                              <th className="text-left text-slate-700 dark:text-slate-300 py-2">{t('items.articulo')}</th>
                              <th className="text-center text-slate-700 dark:text-slate-300 py-2">{t('items.cantidad')}</th>
                              <th className="text-right text-slate-700 dark:text-slate-300 py-2">{t('items.precio')}</th>
                              <th className="text-center text-slate-700 dark:text-slate-300 py-2">{t('items.descuento')}</th>
                              <th className="text-right text-slate-700 dark:text-slate-300 py-2">{t('items.subtotal')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {factura.items.map((item) => (
                              <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700">
                                <td className="py-2 text-slate-900 dark:text-slate-100">{item.articulo?.descripcion}</td>
                                <td className="py-2 text-center text-slate-900 dark:text-slate-100">{item.cantidad}</td>
                                <td className="py-2 text-right text-slate-900 dark:text-slate-100 font-mono">
                                  ${Number(item.precio).toFixed(2)}
                                </td>
                                <td className="py-2 text-center text-slate-900 dark:text-slate-100">{Number(item.dscto).toFixed(1)}%</td>
                                <td className="py-2 text-right text-slate-900 dark:text-slate-100 font-mono">
                                  ${Number(item.subtotal).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded grid grid-cols-3 gap-4 text-right border border-slate-200 dark:border-slate-600">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('detail.iva21')}</p>
                        <p className="text-slate-900 dark:text-slate-100 font-semibold">${Number(factura.iva1).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('detail.iva105')}</p>
                        <p className="text-slate-900 dark:text-slate-100 font-semibold">${Number(factura.iva2).toFixed(2)}</p>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900 rounded p-2 border border-green-200 dark:border-green-800">
                        <p className="text-slate-600 dark:text-slate-400 text-sm">{t('totals.total')}</p>
                        <p className="text-green-800 dark:text-green-300 text-lg font-bold">${Number(factura.total).toFixed(2)}</p>
                      </div>
                    </div>

                    <IfModule flag="billing.arca_cae">
                      <div className="flex flex-wrap gap-2" role="group" aria-label={t('cae.column')}>
                        <CanAccess permission="reports.operational.read">
                          <button
                            type="button"
                            data-testid="btn-factura-pdf-preview"
                            disabled={pdfLoadingId === factura.id}
                            onClick={() => void handlePdfPreview(factura.id, true)}
                            className="px-3 py-2 text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded transition disabled:opacity-50"
                          >
                            {pdfLoadingId === factura.id ? t('cae.pdfLoading') : t('cae.previewPdf')}
                          </button>
                          {canDownloadPdf && (
                            <>
                              <button
                                type="button"
                                data-testid="btn-factura-pdf-print"
                                disabled={pdfLoadingId === factura.id}
                                onClick={() => void handlePdfPreview(factura.id, false)}
                                className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition disabled:opacity-50"
                              >
                                {pdfLoadingId === factura.id ? t('cae.pdfLoading') : t('pdfModal.print')}
                              </button>
                              <button
                                type="button"
                                data-testid="btn-factura-pdf-download"
                                disabled={pdfLoadingId === factura.id}
                                onClick={() => void handlePdfDownload(factura.id, false)}
                                className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
                              >
                                {pdfLoadingId === factura.id ? t('cae.pdfLoading') : t('cae.downloadPdf')}
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            data-testid="btn-factura-ticket"
                            disabled={pdfLoadingId === factura.id}
                            onClick={() => void handleTicket(factura.id, false)}
                            className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100 rounded transition disabled:opacity-50"
                          >
                            {pdfLoadingId === factura.id ? t('cae.pdfLoading') : t('pdfModal.ticket')}
                          </button>
                        </CanAccess>
                        {canRetryCae && (
                          <CanAccess permission="sales.create">
                            <button
                              type="button"
                              data-testid="btn-factura-retry-cae"
                              disabled={caeLoadingId === factura.id}
                              onClick={() => void handleRetryCae(factura.id)}
                              className="px-3 py-2 text-sm bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 rounded transition disabled:opacity-50"
                            >
                              {caeLoadingId === factura.id ? t('cae.retryLoading') : t('cae.retry')}
                            </button>
                          </CanAccess>
                        )}
                      </div>
                      {(caeError || pdfError) && (
                        <p className="text-sm text-red-600 dark:text-red-400" role="alert" aria-live="polite">
                          {caeError ?? pdfError}
                        </p>
                      )}
                    </IfModule>

                    <IfModule flag="fiscal.remito">
                      <CanAccess permission="sales.create">
                        <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label={t('remitos.title')}>
                          <button
                            type="button"
                            data-testid="btn-factura-generar-remito"
                            disabled={remitoLoadingId === factura.id || factura.estado !== 'A'}
                            onClick={async () => {
                              setRemitoLoadingId(factura.id)
                              setRemitoFeedback(null)
                              try {
                                const remito = await remitosAPI.createFromFactura(factura.id)
                                setRemitoFeedback(t('remitos.created', { ref: remito.referencia }))
                              } catch (err) {
                                setRemitoFeedback(err instanceof Error ? err.message : String(err))
                              } finally {
                                setRemitoLoadingId(null)
                              }
                            }}
                            className="px-3 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded transition disabled:opacity-50"
                          >
                            {remitoLoadingId === factura.id ? t('remitos.creating') : t('remitos.generateFromFactura')}
                          </button>
                        </div>
                        {remitoFeedback && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1" role="status">
                            {remitoFeedback}
                          </p>
                        )}
                      </CanAccess>
                    </IfModule>

                    <CanAccess permission="reports.operational.read">
                      <div
                        className="flex flex-wrap gap-2 mt-2"
                        role="group"
                        aria-label={t('print.actionsGroup')}
                      >
                        <button
                          type="button"
                          data-testid="btn-factura-print-pdf"
                          disabled={printLoadingId === factura.id || pdfLoadingId === factura.id}
                          onClick={() => void handleDevicePrint(factura.id, 'pdf', canDownloadPdf)}
                          className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
                        >
                          {printLoadingId === factura.id ? t('print.loading') : t('print.legalPdf')}
                        </button>
                        {thermalPrinterEnabled ? (
                          <button
                            type="button"
                            data-testid="btn-factura-print-thermal"
                            disabled={printLoadingId === factura.id}
                            onClick={() => void handleDevicePrint(factura.id, 'thermal', canDownloadPdf)}
                            className="px-3 py-2 text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded transition disabled:opacity-50"
                          >
                            {printLoadingId === factura.id ? t('print.loading') : t('print.thermal')}
                          </button>
                        ) : null}
                        {fiscalPrinterEnabled ? (
                          <button
                            type="button"
                            data-testid="btn-factura-print-fiscal"
                            disabled={printLoadingId === factura.id}
                            onClick={() => void handleDevicePrint(factura.id, 'fiscal', canDownloadPdf)}
                            className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition disabled:opacity-50"
                          >
                            {printLoadingId === factura.id ? t('print.loading') : t('print.fiscal')}
                          </button>
                        ) : null}
                      </div>
                      {(printError || printFeedback) && (
                        <p
                          data-testid="factura-print-feedback"
                          className={`text-sm mt-2 ${printError ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-300'}`}
                          role="alert"
                          aria-live="polite"
                        >
                          {printError ?? printFeedback}
                        </p>
                      )}
                    </CanAccess>

                    {factura.estado === 'A' && (
                      <IfModule flag="billing.credit_notes">
                        <CanAccess permission="sales.cancel">
                          {voidingId === factura.id ? (
                            <div className="border border-red-300 dark:border-red-700 rounded p-4 bg-red-50 dark:bg-red-900/20">
                              <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                                {t('void.confirmTitle')}
                              </p>
                              <label className="block text-xs text-red-700 dark:text-red-400 mb-1">
                                {t('void.motivoLabel')} <span aria-hidden="true">*</span>
                              </label>
                              <input
                                type="text"
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                placeholder={t('void.motivoPlaceholder')}
                                className="w-full px-3 py-1.5 text-sm border border-red-300 dark:border-red-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 mb-2"
                              />
                              {voidError && (
                                <p className="text-xs text-red-600 dark:text-red-400 mb-2">{voidError}</p>
                              )}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleVoid(factura.id)}
                                  disabled={voidLoading}
                                  className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded font-semibold transition"
                                >
                                  {voidLoading ? t('void.loading') : t('void.confirm')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setVoidingId(null); setMotivo(''); setVoidError(null) }}
                                  className="px-3 py-1.5 text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded transition"
                                >
                                  {t('void.cancel')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => { setVoidingId(factura.id); setMotivo(''); setVoidError(null) }}
                              className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700 rounded font-semibold transition text-sm"
                            >
                              {t('void.button')}
                            </button>
                          )}
                        </CanAccess>
                      </IfModule>
                    )}

                    <IfIntegration id="mercadopago">
                      <CanAccess permission="reports.financial.read">
                        {factura.estado === 'A' && deriveMpEstadoFromFactura(factura) !== 'approved' && (
                          <button
                            type="button"
                            data-testid="btn-factura-mp-collect"
                            onClick={() => setMpModalFacturaId(factura.id)}
                            className="mb-3 w-full rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                          >
                            {t('mercadopago.collectButton')}
                          </button>
                        )}
                        {factura.estado === 'A' && deriveMpEstadoFromFactura(factura) !== 'approved' && (
                          <button
                            type="button"
                            data-testid="btn-factura-mp-qr"
                            onClick={() => setMpQrModalFacturaId(factura.id)}
                            className="mb-3 w-full rounded border border-sky-600 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950"
                          >
                            {t('mercadopago.qr.collectButton')}
                          </button>
                        )}
                      </CanAccess>
                      <CanAccess permission="sales.cancel">
                            <IfModule flag="billing.credit_notes">
                          {factura.estado === 'A' && deriveMpEstadoFromFactura(factura) === 'approved' && (
                            <button
                              type="button"
                              data-testid="btn-factura-mp-refund"
                              onClick={() => setMpRefundModalFacturaId(factura.id)}
                              className="mb-3 w-full rounded border border-red-600 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
                            >
                              {t('mercadopago.refund.button')}
                            </button>
                          )}
                        </IfModule>
                      </CanAccess>
                    </IfIntegration>

                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded font-semibold transition"
                    >
                      {t('detail.close')}
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {mpModalFacturaId != null && (() => {
        const mpFactura = facturas.find((f) => f.id === mpModalFacturaId)
        if (!mpFactura) return null
        return (
          <MercadoPagoPaymentLinkModal
            factura={mpFactura}
            cliente={clientes.find((c) => c.id === mpFactura.clienteId)}
            onClose={() => setMpModalFacturaId(null)}
            onStatusChange={() => {
              onFacturaUpdated?.()
            }}
          />
        )
      })()}

      {mpQrModalFacturaId != null && (() => {
        const mpFactura = facturas.find((f) => f.id === mpQrModalFacturaId)
        if (!mpFactura) return null
        return (
          <MercadoPagoQrModal
            factura={mpFactura}
            onClose={() => setMpQrModalFacturaId(null)}
            onStatusChange={() => {
              onFacturaUpdated?.()
            }}
          />
        )
      })()}

      {mpRefundModalFacturaId != null && (() => {
        const mpFactura = facturas.find((f) => f.id === mpRefundModalFacturaId)
        if (!mpFactura) return null
        return (
          <MercadoPagoRefundDialog
            factura={mpFactura}
            onClose={() => setMpRefundModalFacturaId(null)}
            onRefunded={() => {
              onFacturaUpdated?.()
            }}
          />
        )
      })()}

      <FacturaPdfPreviewDialog
        open={pdfPreviewUrl != null}
        blobUrl={pdfPreviewUrl}
        filename={pdfPreviewFilename}
        onClose={closePdfPreview}
        onDownload={() => {
          if (!pdfPreviewUrl) return
          void fetch(pdfPreviewUrl)
            .then((r) => r.blob())
            .then((blob) => triggerBlobDownload(blob, pdfPreviewFilename))
            .catch(() => setPdfError(t('cae.pdfError')))
        }}
      />
    </div>
  )
}
