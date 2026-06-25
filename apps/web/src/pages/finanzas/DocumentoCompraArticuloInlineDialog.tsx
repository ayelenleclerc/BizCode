import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { articulosAPI, rubrosAPI } from '@/lib/api'
import type { Rubro } from '@bizcode/types'

type Props = {
  open: boolean
  initialDescripcion: string
  initialPrecio: number
  onClose: () => void
  onCreated: (articulo: { id: number; codigo: number; descripcion: string }) => void
}

/**
 * @en Minimal inline product create from purchase document line (#277 Fase G).
 * @es Alta mínima de artículo inline desde línea de documento (#277 Fase G).
 * @pt-BR Cadastro mínimo inline de produto a partir da linha do documento (#277 Fase G).
 */
export default function DocumentoCompraArticuloInlineDialog({
  open,
  initialDescripcion,
  initialPrecio,
  onClose,
  onCreated,
}: Props) {
  const { t } = useTranslation('finanzas')
  const [descripcion, setDescripcion] = useState('')
  const [codigo, setCodigo] = useState('')
  const [rubroId, setRubroId] = useState('')
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setDescripcion(initialDescripcion.slice(0, 30))
    setCodigo('')
    setRubroId('')
    setError(null)
    void rubrosAPI.list().then((list) => {
      const rows = Array.isArray(list) ? (list as Rubro[]) : []
      setRubros(rows)
      if (rows.length > 0) setRubroId(String(rows[0].id))
    })
  }, [open, initialDescripcion])

  if (!open) return null

  const handleSave = async () => {
    const desc = descripcion.trim()
    if (desc.length < 3) {
      setError(t('documentoCompra.inlineArticulo.descripcionRequired'))
      return
    }
    const codigoNum = Number.parseInt(codigo, 10)
    if (!Number.isInteger(codigoNum) || codigoNum < 1) {
      setError(t('documentoCompra.inlineArticulo.codigoRequired'))
      return
    }
    const rubroNum = Number.parseInt(rubroId, 10)
    if (!Number.isInteger(rubroNum) || rubroNum < 1) {
      setError(t('documentoCompra.inlineArticulo.rubroRequired'))
      return
    }
    const precio = initialPrecio > 0 ? initialPrecio : 1
    setSaving(true)
    setError(null)
    try {
      const created = await articulosAPI.create({
        codigo: codigoNum,
        descripcion: desc,
        rubroId: rubroNum,
        condIva: '1',
        umedida: 'UN',
        precioLista1: precio,
        precioLista2: precio,
        costo: precio,
        stock: 0,
        minimo: 0,
        activo: true,
      })
      if (created && typeof created.id === 'number') {
        onCreated({
          id: created.id,
          codigo: typeof created.codigo === 'number' ? created.codigo : codigoNum,
          descripcion: typeof created.descripcion === 'string' ? created.descripcion : desc,
        })
      }
    } catch {
      setError(t('documentoCompra.inlineArticulo.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="documento-compra-inline-articulo-title"
      data-testid="documento-compra-inline-articulo-dialog"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-5">
        <h4 id="documento-compra-inline-articulo-title" className="text-lg font-semibold mb-4">
          {t('documentoCompra.inlineArticulo.title')}
        </h4>
        <div className="space-y-3 text-sm">
          <div>
            <label htmlFor="inline-art-descripcion" className="block text-xs mb-1">
              {t('documentoCompra.inlineArticulo.descripcion')}
            </label>
            <input
              id="inline-art-descripcion"
              type="text"
              maxLength={30}
              className="w-full rounded px-2 py-1 border bg-white dark:bg-slate-700"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={saving}
              data-testid="documento-compra-inline-articulo-descripcion"
            />
          </div>
          <div>
            <label htmlFor="inline-art-codigo" className="block text-xs mb-1">
              {t('documentoCompra.inlineArticulo.codigo')}
            </label>
            <input
              id="inline-art-codigo"
              type="number"
              min={1}
              className="w-full rounded px-2 py-1 border font-mono bg-white dark:bg-slate-700"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              disabled={saving}
              data-testid="documento-compra-inline-articulo-codigo"
            />
          </div>
          <div>
            <label htmlFor="inline-art-rubro" className="block text-xs mb-1">
              {t('documentoCompra.inlineArticulo.rubro')}
            </label>
            <select
              id="inline-art-rubro"
              className="w-full rounded px-2 py-1 border bg-white dark:bg-slate-700"
              value={rubroId}
              onChange={(e) => setRubroId(e.target.value)}
              disabled={saving || rubros.length === 0}
              data-testid="documento-compra-inline-articulo-rubro"
            >
              {rubros.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.codigo} — {r.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-600" data-testid="documento-compra-inline-articulo-error">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2 mt-5 justify-end">
          <button
            type="button"
            className="px-3 py-1.5 rounded border"
            onClick={onClose}
            disabled={saving}
          >
            {t('documentoCompra.cancel')}
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-50"
            onClick={() => void handleSave()}
            disabled={saving}
            data-testid="documento-compra-inline-articulo-save"
          >
            {saving ? t('documentoCompra.inlineArticulo.saving') : t('documentoCompra.inlineArticulo.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
