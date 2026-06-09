import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { proveedoresAPI, type ProveedorInputDTO } from '@/lib/api'
import type { Proveedor } from '@/types'

type Props = {
  open: boolean
  initialCuit: string
  initialRsocial: string
  proveedores: Proveedor[]
  onClose: () => void
  onCreated: (proveedor: Proveedor) => void
}

function nextProveedorCodigo(proveedores: Proveedor[]): number {
  const max = proveedores.reduce((acc, p) => Math.max(acc, p.codigo ?? 0), 0)
  return max + 1
}

/**
 * @en Minimal inline supplier create from purchase document preview (#277 Fase F).
 * @es Alta mínima de proveedor inline desde preview de documento (#277 Fase F).
 * @pt-BR Cadastro mínimo inline de fornecedor no preview do documento (#277 Fase F).
 */
export default function DocumentoCompraProveedorInlineDialog({
  open,
  initialCuit,
  initialRsocial,
  proveedores,
  onClose,
  onCreated,
}: Props) {
  const { t } = useTranslation('finanzas')
  const [rsocial, setRsocial] = useState('')
  const [cuit, setCuit] = useState('')
  const [condIva, setCondIva] = useState<ProveedorInputDTO['condIva']>('RI')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setRsocial(initialRsocial)
    setCuit(initialCuit)
    setCondIva('RI')
    setError(null)
  }, [open, initialCuit, initialRsocial])

  if (!open) return null

  const handleSave = async () => {
    if (!rsocial.trim()) {
      setError(t('documentoCompra.inlineProveedor.rsocialRequired'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const created = await proveedoresAPI.create({
        codigo: nextProveedorCodigo(proveedores),
        rsocial: rsocial.trim(),
        condIva,
        activo: true,
        cuit: cuit.trim() || null,
      })
      if (created) onCreated(created as Proveedor)
    } catch {
      setError(t('documentoCompra.inlineProveedor.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="documento-compra-inline-proveedor-title"
      data-testid="documento-compra-inline-proveedor-dialog"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-5">
        <h4 id="documento-compra-inline-proveedor-title" className="text-lg font-semibold mb-3">
          {t('documentoCompra.inlineProveedor.title')}
        </h4>
        <div className="space-y-3 text-sm">
          <div>
            <label htmlFor="inline-prov-rsocial" className="block text-xs mb-1">
              {t('documentoCompra.inlineProveedor.rsocial')}
            </label>
            <input
              id="inline-prov-rsocial"
              type="text"
              className="w-full rounded px-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              value={rsocial}
              data-testid="documento-compra-inline-proveedor-rsocial"
              onChange={(e) => setRsocial(e.target.value)}
              disabled={saving}
            />
          </div>
          <div>
            <label htmlFor="inline-prov-cuit" className="block text-xs mb-1">
              {t('documentoCompra.inlineProveedor.cuit')}
            </label>
            <input
              id="inline-prov-cuit"
              type="text"
              className="w-full rounded px-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono"
              value={cuit}
              data-testid="documento-compra-inline-proveedor-cuit"
              onChange={(e) => setCuit(e.target.value)}
              disabled={saving}
            />
          </div>
          <div>
            <label htmlFor="inline-prov-cond-iva" className="block text-xs mb-1">
              {t('documentoCompra.inlineProveedor.condIva')}
            </label>
            <select
              id="inline-prov-cond-iva"
              className="w-full rounded px-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              value={condIva}
              data-testid="documento-compra-inline-proveedor-cond-iva"
              onChange={(e) => setCondIva(e.target.value as ProveedorInputDTO['condIva'])}
              disabled={saving}
            >
              <option value="RI">RI</option>
              <option value="Mono">Mono</option>
              <option value="CF">CF</option>
              <option value="Exento">Exento</option>
            </select>
          </div>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-600" data-testid="documento-compra-inline-proveedor-error">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600"
            onClick={onClose}
            disabled={saving}
            data-testid="documento-compra-inline-proveedor-cancel"
          >
            {t('documentoCompra.cancel')}
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
            onClick={() => void handleSave()}
            disabled={saving}
            data-testid="documento-compra-inline-proveedor-save"
          >
            {saving ? t('documentoCompra.inlineProveedor.saving') : t('documentoCompra.inlineProveedor.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
