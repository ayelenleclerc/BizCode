import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ApiRequestFailedError,
  documentosCompraAPI,
  proveedoresAPI,
  type DocumentoCompraColaEstadoDTO,
  type DocumentoCompraImportadoRow,
  type DocumentoCompraItemPreviewDTO,
  type DocumentoCompraPreviewDataDTO,
} from '@/lib/api'
import DocumentoCompraItemsTable from './DocumentoCompraItemsTable'
import DocumentoCompraProveedorInlineDialog from './DocumentoCompraProveedorInlineDialog'
import DocumentoCompraTemplatesSection from './DocumentoCompraTemplatesSection'
import KeyboardHint, { useFormShortcuts } from '@/components/shared/KeyboardHint'
import { useFormPageHotkeys } from '@/hooks/useListPageKeyboard'
import type { Proveedor } from '@/types'

const TIPOS = ['A', 'B', 'C'] as const
const CONFIDENCE_REVIEW_THRESHOLD = 0.7

type FieldStatus = 'ok' | 'review' | 'error'

function parseAmount(value: string): number {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function resolveFieldStatus(
  hasValue: boolean,
  userTouched: boolean,
  showErrors: boolean,
  required: boolean,
  confidence?: number,
): FieldStatus {
  if (!hasValue && required && showErrors) return 'error'
  if (!hasValue) return 'review'
  if (confidence !== undefined && confidence >= CONFIDENCE_REVIEW_THRESHOLD && !userTouched) return 'ok'
  if (confidence !== undefined && confidence < CONFIDENCE_REVIEW_THRESHOLD) return 'review'
  if (!userTouched) return 'review'
  return 'ok'
}

function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

function applyPreviewData(
  data: DocumentoCompraPreviewDataDTO,
  setters: {
    setProveedorId: (v: string) => void
    setFecha: (v: string) => void
    setVencimiento: (v: string) => void
    setTipo: (v: (typeof TIPOS)[number]) => void
    setPrefijo: (v: string) => void
    setNumero: (v: string) => void
    setNeto1: (v: string) => void
    setNeto2: (v: string) => void
    setNeto3: (v: string) => void
    setIva1: (v: string) => void
    setIva2: (v: string) => void
    setTotal: (v: string) => void
    setCae: (v: string) => void
    setCaeVto: (v: string) => void
  },
): void {
  if (data.proveedorId != null) setters.setProveedorId(String(data.proveedorId))
  if (data.fecha) setters.setFecha(isoToDateInput(data.fecha))
  if (data.vencimiento) setters.setVencimiento(isoToDateInput(data.vencimiento))
  if (data.tipo) setters.setTipo(data.tipo)
  if (data.prefijo) setters.setPrefijo(data.prefijo)
  if (data.numero != null) setters.setNumero(String(data.numero))
  setters.setNeto1(String(data.neto1))
  setters.setNeto2(String(data.neto2))
  setters.setNeto3(String(data.neto3))
  setters.setIva1(String(data.iva1))
  setters.setIva2(String(data.iva2))
  if (data.total != null) setters.setTotal(String(data.total))
  if (data.cae) setters.setCae(data.cae)
  if (data.caeVto) setters.setCaeVto(isoToDateInput(data.caeVto))
}

function fieldClass(status: FieldStatus): string {
  if (status === 'ok') return 'border-green-500 dark:border-green-600'
  if (status === 'error') return 'border-red-500 dark:border-red-600'
  return 'border-amber-400 dark:border-amber-500'
}

/**
 * @en Purchase document import — upload, Tier 1 QR preview, confirm (#277).
 * @es Importación de documento de compra — subida, preview QR Tier 1, confirmación (#277).
 * @pt-BR Importação de documento de compra — upload, preview QR Tier 1, confirmação (#277).
 */
export default function DocumentoCompraImportSection({ onConfirmed }: { onConfirmed: () => void }) {
  const { t } = useTranslation('finanzas')
  const formShortcuts = useFormShortcuts()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loadingProveedores, setLoadingProveedores] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [documento, setDocumento] = useState<DocumentoCompraImportadoRow | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [proveedorId, setProveedorId] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [vencimiento, setVencimiento] = useState('')
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>('B')
  const [prefijo, setPrefijo] = useState('0001')
  const [numero, setNumero] = useState('1')
  const [neto1, setNeto1] = useState('0')
  const [neto2, setNeto2] = useState('0')
  const [neto3, setNeto3] = useState('0')
  const [iva1, setIva1] = useState('0')
  const [iva2, setIva2] = useState('0')
  const [total, setTotal] = useState('0')
  const [cae, setCae] = useState('')
  const [caeVto, setCaeVto] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showErrors, setShowErrors] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [cola, setCola] = useState<DocumentoCompraColaEstadoDTO | null>(null)
  const [loadingCola, setLoadingCola] = useState(false)
  const [previewItems, setPreviewItems] = useState<DocumentoCompraItemPreviewDTO[]>([])
  const [showInlineProveedor, setShowInlineProveedor] = useState(false)
  const [duplicateCheck, setDuplicateCheck] = useState<{
    duplicado: boolean
    comprobanteCompraId: number | null
  } | null>(null)
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)

  const loadCola = useCallback(async () => {
    setLoadingCola(true)
    try {
      const snapshot = await documentosCompraAPI.getCola()
      setCola(snapshot)
    } catch {
      setCola(null)
    } finally {
      setLoadingCola(false)
    }
  }, [])

  const loadProveedores = useCallback(async () => {
    setLoadingProveedores(true)
    try {
      const list = await proveedoresAPI.list()
      setProveedores(Array.isArray(list) ? list : [])
    } catch {
      setProveedores([])
    } finally {
      setLoadingProveedores(false)
    }
  }, [])

  useEffect(() => {
    void loadProveedores()
    void loadCola()
  }, [loadProveedores, loadCola])

  useEffect(() => {
    if (!showPreview) {
      setDuplicateCheck(null)
      return
    }
    const provId = Number.parseInt(proveedorId, 10)
    const num = Number.parseInt(numero, 10)
    if (!Number.isInteger(provId) || provId < 1 || !prefijo.trim() || !Number.isInteger(num) || num < 1) {
      setDuplicateCheck(null)
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      setCheckingDuplicate(true)
      void documentosCompraAPI
        .verificarDuplicado({ proveedorId: provId, tipo, prefijo: prefijo.trim(), numero: num })
        .then((result) => {
          if (!cancelled) setDuplicateCheck(result)
        })
        .catch(() => {
          if (!cancelled) setDuplicateCheck(null)
        })
        .finally(() => {
          if (!cancelled) setCheckingDuplicate(false)
        })
    }, 400)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [showPreview, proveedorId, tipo, prefijo, numero])

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const resetPreviewForm = () => {
    setProveedorId('')
    setFecha(new Date().toISOString().slice(0, 10))
    setVencimiento('')
    setTipo('B')
    setPrefijo('0001')
    setNumero('1')
    setNeto1('0')
    setNeto2('0')
    setNeto3('0')
    setIva1('0')
    setIva2('0')
    setTotal('0')
    setCae('')
    setCaeVto('')
    setTouched({})
    setShowErrors(false)
    setConfirmError(null)
    setPreviewItems([])
  }

  const openDocumentoForReview = (row: DocumentoCompraImportadoRow) => {
    setDocumento(row)
    resetPreviewForm()
    applyPreviewData(row.datosExtraidos, {
      setProveedorId,
      setFecha,
      setVencimiento,
      setTipo,
      setPrefijo,
      setNumero,
      setNeto1,
      setNeto2,
      setNeto3,
      setIva1,
      setIva2,
      setTotal,
      setCae,
      setCaeVto,
    })
    setPreviewItems(
      Array.isArray(row.datosExtraidos.items)
        ? row.datosExtraidos.items.map((item) => ({ ...item }))
        : [],
    )
    setShowPreview(true)
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const selected = Array.from(files).slice(0, 20)
    setUploadError(null)
    setSuccessMessage(null)
    setUploading(true)
    try {
      if (selected.length === 1) {
        const result = await documentosCompraAPI.procesar(selected[0])
        openDocumentoForReview(result)
      } else {
        const results = await documentosCompraAPI.procesarLote(selected)
        setSuccessMessage(t('documentoCompra.batchUploaded', { count: results.length }))
        const firstPending = results.find((r) => r.estado === 'pendiente_revision')
        if (firstPending) {
          openDocumentoForReview(firstPending)
        }
      }
      await loadCola()
    } catch (error) {
      if (error instanceof ApiRequestFailedError) {
        setUploadError(error.message)
      } else {
        setUploadError(t('documentoCompra.errors.uploadFailed'))
      }
    } finally {
      setUploading(false)
    }
  }

  const handleConfirm = async () => {
    if (!documento) return
    setShowErrors(true)
    setConfirmError(null)

    const provId = Number.parseInt(proveedorId, 10)
    const num = Number.parseInt(numero, 10)
    if (!Number.isInteger(provId) || provId < 1) {
      setConfirmError(t('comprobanteCompra.errors.proveedorRequired'))
      return
    }
    if (!Number.isInteger(num) || num < 1) {
      setConfirmError(t('comprobanteCompra.errors.numeroInvalid'))
      return
    }
    if (!prefijo.trim()) {
      setConfirmError(t('comprobanteCompra.errors.prefijoRequired'))
      return
    }
    const totalNum = parseAmount(total)
    if (totalNum <= 0) {
      setConfirmError(t('documentoCompra.errors.totalRequired'))
      return
    }

    setConfirming(true)
    try {
      const result = await documentosCompraAPI.confirmar({
        documentoId: documento.id,
        fecha: new Date(`${fecha}T12:00:00.000Z`).toISOString(),
        tipo,
        prefijo: prefijo.trim(),
        numero: num,
        proveedorId: provId,
        neto1: parseAmount(neto1),
        neto2: parseAmount(neto2),
        neto3: parseAmount(neto3),
        iva1: parseAmount(iva1),
        iva2: parseAmount(iva2),
        total: totalNum,
        ...(cae.trim() ? { cae: cae.trim() } : {}),
        ...(caeVto ? { caeVto: new Date(`${caeVto}T12:00:00.000Z`).toISOString() } : {}),
        ...(vencimiento.trim()
          ? { vencimiento: new Date(`${vencimiento}T12:00:00.000Z`).toISOString() }
          : {}),
        ...(previewItems.length > 0
          ? {
              items: previewItems.map((item) => ({
                descripcion: item.descripcion.trim(),
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                subtotal: item.subtotal,
                articuloId: item.articuloId ?? null,
                confianza: item.confianza,
              })),
            }
          : {}),
      })
      setSuccessMessage(
        t('documentoCompra.confirmed', {
          docId: result.documento.id,
          comprobanteId: result.comprobanteCompra.id,
        }),
      )
      setShowPreview(false)
      setDocumento(null)
      await loadCola()
      onConfirmed()
    } catch (error) {
      if (error instanceof ApiRequestFailedError) {
        setConfirmError(error.message)
      } else {
        setConfirmError(t('documentoCompra.errors.confirmFailed'))
      }
    } finally {
      setConfirming(false)
    }
  }

  const closePreview = useCallback(() => {
    setShowPreview(false)
    setDocumento(null)
  }, [])

  useFormPageHotkeys({
    onSave: showPreview ? () => void handleConfirm() : undefined,
    onClose: () => {
      if (showPreview) closePreview()
    },
  })

  const extractionConfidence =
    documento != null ? Number(documento.confianza) : 0
  const confidencePct = Math.round(extractionConfidence * 100)

  const fieldConfidence = documento?.datosExtraidos.fieldConfidence ?? {}
  const proveedorStatus = resolveFieldStatus(
    Boolean(proveedorId),
    touched.proveedorId === true,
    showErrors,
    true,
    fieldConfidence.proveedorId,
  )
  const fechaStatus = resolveFieldStatus(
    Boolean(fecha),
    touched.fecha === true,
    showErrors,
    true,
    fieldConfidence.fecha,
  )
  const totalStatus = resolveFieldStatus(
    parseAmount(total) > 0,
    touched.total === true,
    showErrors,
    true,
    fieldConfidence.total,
  )
  const proveedorMismatch =
    documento != null &&
    !proveedorId &&
    Boolean(
      documento.datosExtraidos.cuitExtracted ||
        (documento.errores != null &&
          typeof documento.errores === 'object' &&
          'proveedorId' in (documento.errores as Record<string, unknown>)),
    )

  return (
    <section
      className="mb-4 p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900/30"
      aria-labelledby="finanzas-documento-compra-import-title"
      data-testid="finanzas-documento-compra-import"
    >
      <h3
        id="finanzas-documento-compra-import-title"
        className="text-sm font-semibold mb-2 text-slate-800 dark:text-slate-200"
      >
        {t('documentoCompra.title')}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('documentoCompra.hint')}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('documentoCompra.batchHint')}</p>
      <KeyboardHint shortcuts={formShortcuts} className="mb-3" />

      {cola && (
        <div
          className="mb-3 p-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          data-testid="documento-compra-cola"
          aria-live="polite"
        >
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('documentoCompra.queueTitle')}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400 mb-2">
            <span data-testid="documento-compra-cola-procesando">
              {t('documentoCompra.queueProcesando', { count: cola.procesando })}
            </span>
            <span data-testid="documento-compra-cola-pendiente">
              {t('documentoCompra.queuePendiente', { count: cola.pendiente_revision })}
            </span>
            <span data-testid="documento-compra-cola-confirmado">
              {t('documentoCompra.queueConfirmado', { count: cola.confirmado })}
            </span>
          </div>
          {cola.documentos.length > 0 ? (
            <ul className="space-y-1 text-xs" data-testid="documento-compra-cola-list">
              {cola.documentos
                .filter((doc) => doc.estado === 'pendiente_revision')
                .map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono">{doc.archivoNombre}</span>
                    <button
                      type="button"
                      className="shrink-0 text-blue-600 hover:underline"
                      data-testid={`documento-compra-cola-review-${doc.id}`}
                      onClick={() => openDocumentoForReview(doc)}
                      disabled={uploading || confirming}
                    >
                      {t('documentoCompra.review')}
                    </button>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">{t('documentoCompra.queueEmpty')}</p>
          )}
          {loadingCola ? (
            <p className="text-xs text-slate-400 mt-1">{t('documentoCompra.queueLoading')}</p>
          ) : null}
        </div>
      )}

      <div
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center"
        data-testid="documento-compra-dropzone"
        onDragOver={(e) => {
          e.preventDefault()
        }}
        onDrop={(e) => {
          e.preventDefault()
          void handleFiles(e.dataTransfer.files)
        }}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('documentoCompra.dropHintBatch')}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded disabled:opacity-50"
            disabled={uploading}
            data-testid="documento-compra-btn-select"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? t('documentoCompra.uploading') : t('documentoCompra.selectFile')}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded disabled:opacity-50"
            disabled={uploading}
            data-testid="documento-compra-btn-camera"
            onClick={() => cameraInputRef.current?.click()}
          >
            {t('documentoCompra.takePhoto')}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/*"
          aria-label={t('documentoCompra.selectFile')}
          data-testid="documento-compra-file-input"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          aria-label={t('documentoCompra.takePhoto')}
          data-testid="documento-compra-camera-input"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {uploadError && (
        <p role="alert" className="mt-2 text-sm text-red-600" data-testid="documento-compra-upload-error">
          {uploadError}
        </p>
      )}
      {successMessage && (
        <p role="status" className="mt-2 text-sm text-green-700 dark:text-green-400" data-testid="documento-compra-success">
          {successMessage}
        </p>
      )}

      {showPreview && documento && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="documento-compra-preview-title"
          data-testid="documento-compra-preview-dialog"
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <h4 id="documento-compra-preview-title" className="text-lg font-semibold mb-1">
              {t('documentoCompra.previewTitle')}
            </h4>
            <p className="text-sm text-slate-500 mb-2" data-testid="documento-compra-confidence">
              {t('documentoCompra.confidence', { pct: confidencePct, tier: documento.tier })}
              {documento.tier === 1 ? ` — ${t('documentoCompra.tier1Hint')}` : null}
              {documento.tier === 2 ? ` — ${t('documentoCompra.tier2Hint')}` : null}
              {documento.tier === 3 ? ` — ${t('documentoCompra.tier3Hint')}` : null}
              {documento.tier === 4 ? ` — ${t('documentoCompra.tier4Hint')}` : null}
              {extractionConfidence < CONFIDENCE_REVIEW_THRESHOLD
                ? ` — ${t('documentoCompra.manualReview')}`
                : null}
            </p>
            {duplicateCheck?.duplicado ? (
              <p
                role="alert"
                className="mb-4 text-sm text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700 rounded px-3 py-2"
                data-testid="documento-compra-duplicate-warning"
              >
                {t('documentoCompra.duplicateWarning', {
                  comprobanteId: duplicateCheck.comprobanteCompraId ?? '—',
                })}
              </p>
            ) : null}
            {checkingDuplicate && !duplicateCheck?.duplicado ? (
              <p className="mb-4 text-xs text-slate-500" data-testid="documento-compra-duplicate-checking">
                {t('documentoCompra.duplicateChecking')}
              </p>
            ) : null}
            {proveedorMismatch ? (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <p
                  role="status"
                  className="text-sm text-amber-700 dark:text-amber-400"
                  data-testid="documento-compra-proveedor-mismatch"
                >
                  {t('documentoCompra.proveedorNotMatched')}
                </p>
                <button
                  type="button"
                  className="text-sm text-blue-600 dark:text-blue-400 underline"
                  data-testid="documento-compra-create-proveedor-btn"
                  onClick={() => setShowInlineProveedor(true)}
                  disabled={confirming}
                >
                  {t('documentoCompra.createProveedor')}
                </button>
              </div>
            ) : (
              <div className="mb-4" />
            )}
            <p className="text-xs text-slate-500 mb-4 font-mono">{documento.archivoNombre}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div>
                <label htmlFor="doc-import-proveedor" className="block text-xs mb-1">
                  {t('comprobanteCompra.proveedor')}
                </label>
                <select
                  id="doc-import-proveedor"
                  data-testid="documento-compra-preview-proveedor"
                  className={`w-full rounded px-2 py-1 border bg-white dark:bg-slate-700 ${fieldClass(proveedorStatus)}`}
                  value={proveedorId}
                  onChange={(e) => {
                    setProveedorId(e.target.value)
                    markTouched('proveedorId')
                  }}
                  disabled={confirming || loadingProveedores}
                >
                  <option value="">{t('comprobanteCompra.selectProveedor')}</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.codigo} — {p.rsocial}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="doc-import-fecha" className="block text-xs mb-1">
                  {t('comprobanteCompra.fecha')}
                </label>
                <input
                  id="doc-import-fecha"
                  type="date"
                  data-testid="documento-compra-preview-fecha"
                  className={`w-full rounded px-2 py-1 border bg-white dark:bg-slate-700 ${fieldClass(fechaStatus)}`}
                  value={fecha}
                  onChange={(e) => {
                    setFecha(e.target.value)
                    markTouched('fecha')
                  }}
                  disabled={confirming}
                />
              </div>
              <div>
                <label htmlFor="doc-import-tipo" className="block text-xs mb-1">
                  {t('comprobanteCompra.tipo')}
                </label>
                <select
                  id="doc-import-tipo"
                  data-testid="documento-compra-preview-tipo"
                  className="w-full rounded px-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  value={tipo}
                  onChange={(e) => {
                    setTipo(e.target.value as (typeof TIPOS)[number])
                    markTouched('tipo')
                  }}
                  disabled={confirming}
                >
                  {TIPOS.map((tv) => (
                    <option key={tv} value={tv}>
                      {tv}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="doc-import-prefijo" className="block text-xs mb-1">
                  {t('comprobanteCompra.prefijo')}
                </label>
                <input
                  id="doc-import-prefijo"
                  type="text"
                  maxLength={4}
                  data-testid="documento-compra-preview-prefijo"
                  className="w-full rounded px-2 py-1 border border-slate-300 font-mono bg-white dark:bg-slate-700"
                  value={prefijo}
                  onChange={(e) => {
                    setPrefijo(e.target.value)
                    markTouched('prefijo')
                  }}
                  disabled={confirming}
                />
              </div>
              <div>
                <label htmlFor="doc-import-numero" className="block text-xs mb-1">
                  {t('comprobanteCompra.numero')}
                </label>
                <input
                  id="doc-import-numero"
                  type="number"
                  min={1}
                  data-testid="documento-compra-preview-numero"
                  className="w-full rounded px-2 py-1 border border-slate-300 font-mono bg-white dark:bg-slate-700"
                  value={numero}
                  onChange={(e) => {
                    setNumero(e.target.value)
                    markTouched('numero')
                  }}
                  disabled={confirming}
                />
              </div>
              <div>
                <label htmlFor="doc-import-total" className="block text-xs mb-1">
                  {t('comprobanteCompra.total')}
                </label>
                <input
                  id="doc-import-total"
                  type="number"
                  min={0}
                  step="0.01"
                  data-testid="documento-compra-preview-total"
                  className={`w-full rounded px-2 py-1 border font-mono bg-white dark:bg-slate-700 ${fieldClass(totalStatus)}`}
                  value={total}
                  onChange={(e) => {
                    setTotal(e.target.value)
                    markTouched('total')
                  }}
                  disabled={confirming}
                />
              </div>
              <div>
                <label htmlFor="doc-import-neto1" className="block text-xs mb-1">
                  {t('comprobanteCompra.neto1')}
                </label>
                <input
                  id="doc-import-neto1"
                  type="number"
                  min={0}
                  step="0.01"
                  className="w-full rounded px-2 py-1 border bg-white dark:bg-slate-700"
                  value={neto1}
                  onChange={(e) => setNeto1(e.target.value)}
                  disabled={confirming}
                />
              </div>
              <div>
                <label htmlFor="doc-import-iva1" className="block text-xs mb-1">
                  {t('comprobanteCompra.iva1')}
                </label>
                <input
                  id="doc-import-iva1"
                  type="number"
                  min={0}
                  step="0.01"
                  className="w-full rounded px-2 py-1 border bg-white dark:bg-slate-700"
                  value={iva1}
                  onChange={(e) => setIva1(e.target.value)}
                  disabled={confirming}
                />
              </div>
              <div>
                <label htmlFor="doc-import-vencimiento" className="block text-xs mb-1">
                  {t('comprobanteCompra.vencimiento')}
                </label>
                <input
                  id="doc-import-vencimiento"
                  type="date"
                  className="w-full rounded px-2 py-1 border bg-white dark:bg-slate-700"
                  value={vencimiento}
                  onChange={(e) => setVencimiento(e.target.value)}
                  disabled={confirming}
                />
              </div>
              <div>
                <label htmlFor="doc-import-cae" className="block text-xs mb-1">
                  {t('comprobanteCompra.cae')}
                </label>
                <input
                  id="doc-import-cae"
                  type="text"
                  maxLength={20}
                  className="w-full rounded px-2 py-1 border font-mono bg-white dark:bg-slate-700"
                  value={cae}
                  onChange={(e) => setCae(e.target.value)}
                  disabled={confirming}
                />
              </div>
            </div>

            <DocumentoCompraItemsTable
              items={previewItems}
              onChange={setPreviewItems}
              proveedorId={proveedorId}
              disabled={confirming}
            />

            {confirmError && (
              <p role="alert" className="mt-3 text-sm text-red-600" data-testid="documento-compra-preview-error">
                {confirmError}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-6 justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600"
                data-testid="documento-compra-preview-cancel"
                onClick={closePreview}
                disabled={confirming}
              >
                {t('documentoCompra.cancel')}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                data-testid="documento-compra-preview-confirm"
                onClick={() => void handleConfirm()}
                disabled={confirming || duplicateCheck?.duplicado === true}
              >
                {confirming ? t('documentoCompra.confirming') : t('documentoCompra.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <DocumentoCompraProveedorInlineDialog
        open={showInlineProveedor}
        initialCuit={documento?.datosExtraidos.cuitExtracted ?? ''}
        initialRsocial={documento?.datosExtraidos.rsocialExtracted ?? ''}
        proveedores={proveedores}
        onClose={() => setShowInlineProveedor(false)}
        onCreated={(created) => {
          setProveedores((prev) => [...prev, created])
          setProveedorId(String(created.id))
          setShowInlineProveedor(false)
          markTouched('proveedorId')
        }}
      />

      <DocumentoCompraTemplatesSection />
    </section>
  )
}
