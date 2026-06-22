import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

type FacturaPdfPreviewDialogProps = {
  open: boolean
  blobUrl: string | null
  filename: string
  onClose: () => void
  onDownload: () => void
}

/**
 * @en Accessible PDF preview dialog with print and download (#148).
 * @es Diálogo accesible de vista previa PDF con imprimir y descarga (#148).
 * @pt-BR Diálogo acessível de pré-visualização PDF com impressão e download (#148).
 */
export default function FacturaPdfPreviewDialog({
  open,
  blobUrl,
  filename,
  onClose,
  onDownload,
}: FacturaPdfPreviewDialogProps) {
  const { t } = useTranslation('facturacion')
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      closeRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !blobUrl) return null

  const handlePrint = () => {
    const frame = document.getElementById('factura-pdf-print-frame') as HTMLIFrameElement | null
    try {
      frame?.contentWindow?.focus()
      frame?.contentWindow?.print()
    } catch {
      onDownload()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="dialog-factura-pdf"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center gap-2">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('pdfModal.title', { filename })}
          </h2>
          <button
            ref={closeRef}
            type="button"
            data-testid="btn-factura-pdf-close"
            onClick={onClose}
            className="px-2 py-1 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {t('pdfModal.close')}
          </button>
        </div>
        <div className="flex-1 min-h-[50vh] p-2">
          <iframe
            id="factura-pdf-print-frame"
            title={t('pdfModal.previewFrameTitle')}
            src={blobUrl}
            className="w-full h-[60vh] border border-slate-200 dark:border-slate-600 rounded"
            data-testid="iframe-factura-pdf-preview"
          />
        </div>
        <div
          className="px-4 py-3 border-t border-slate-200 dark:border-slate-600 flex flex-wrap gap-2 justify-end"
          role="group"
          aria-label={t('pdfModal.actions')}
        >
          <button
            type="button"
            data-testid="btn-factura-pdf-download-modal"
            onClick={onDownload}
            className="px-3 py-2 text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded"
          >
            {t('pdfModal.download')}
          </button>
          <button
            type="button"
            data-testid="btn-factura-pdf-print"
            onClick={handlePrint}
            className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            {t('pdfModal.print')}
          </button>
        </div>
      </div>
    </div>
  )
}
