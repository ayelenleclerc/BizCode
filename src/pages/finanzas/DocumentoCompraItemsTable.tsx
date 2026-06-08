import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  articulosAPI,
  proveedoresAPI,
  type DocumentoCompraItemPreviewDTO,
} from '@/lib/api'

const CONFIDENCE_REVIEW_THRESHOLD = 0.7

type ItemRow = DocumentoCompraItemPreviewDTO

type Props = {
  items: ItemRow[]
  onChange: (items: ItemRow[]) => void
  proveedorId: string
  disabled?: boolean
}

function itemStatus(confianza: number | undefined): 'ok' | 'review' {
  if (confianza === undefined) return 'review'
  return confianza >= CONFIDENCE_REVIEW_THRESHOLD ? 'ok' : 'review'
}

function cellClass(status: 'ok' | 'review'): string {
  return status === 'ok'
    ? 'border-green-500 dark:border-green-600'
    : 'border-amber-400 dark:border-amber-500'
}

/**
 * @en Editable purchase document line items with catalog mapping (#277 Fase F).
 * @es Líneas editables de documento de compra con mapeo a catálogo (#277 Fase F).
 * @pt-BR Itens editáveis de documento de compra com mapeamento ao catálogo (#277 Fase F).
 */
export default function DocumentoCompraItemsTable({
  items,
  onChange,
  proveedorId,
  disabled = false,
}: Props) {
  const { t } = useTranslation('finanzas')
  const [catalogLabels, setCatalogLabels] = useState<Record<number, string>>({})
  const provId = Number.parseInt(proveedorId, 10)
  const validProvId = Number.isInteger(provId) && provId >= 1 ? provId : null
  const effectiveCatalog = validProvId != null ? catalogLabels : {}

  useEffect(() => {
    if (validProvId == null) return
    let cancelled = false
    void proveedoresAPI
      .listCatalogo(validProvId)
      .then((entries) => {
        if (cancelled) return
        const labels: Record<number, string> = {}
        for (const entry of entries) {
          labels[entry.articuloId] =
            `${entry.codigoProveedor} — ${entry.descripcion ?? entry.articulo.descripcion}`
        }
        setCatalogLabels(labels)
      })
      .catch(() => {
        if (!cancelled) setCatalogLabels({})
      })
    return () => {
      cancelled = true
    }
  }, [validProvId])

  const updateRow = (index: number, patch: Partial<ItemRow>) => {
    onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const mapArticulo = async (index: number, articuloId: number | null) => {
    if (articuloId == null) {
      updateRow(index, { articuloId: null })
      return
    }
    updateRow(index, { articuloId, confianza: 1 })
    if (effectiveCatalog[articuloId]) return
    try {
      const articulo = await articulosAPI.get(articuloId)
      if (articulo?.descripcion) {
        updateRow(index, {
          articuloId,
          descripcion: articulo.descripcion,
          confianza: 1,
        })
      }
    } catch {
      updateRow(index, { articuloId, confianza: 1 })
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-xs text-slate-500 mb-4" data-testid="documento-compra-items-empty">
        {t('documentoCompra.itemsEmpty')}
      </p>
    )
  }

  return (
    <div className="mb-4 overflow-x-auto" data-testid="documento-compra-items-section">
      <h5 className="text-sm font-medium mb-2">{t('documentoCompra.itemsTitle')}</h5>
      <table
        className="w-full text-xs border border-slate-200 dark:border-slate-600"
        data-testid="documento-compra-items-table"
      >
        <caption className="sr-only">{t('documentoCompra.itemsCaption')}</caption>
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-700">
            <th scope="col" className="text-left px-2 py-1">
              {t('documentoCompra.colDescripcion')}
            </th>
            <th scope="col" className="text-right px-2 py-1">
              {t('documentoCompra.colCantidad')}
            </th>
            <th scope="col" className="text-right px-2 py-1">
              {t('documentoCompra.colPrecio')}
            </th>
            <th scope="col" className="text-right px-2 py-1">
              {t('documentoCompra.colSubtotal')}
            </th>
            <th scope="col" className="text-left px-2 py-1">
              {t('documentoCompra.colArticulo')}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, index) => {
            const status = itemStatus(row.confianza)
            const catalogHint =
              row.articuloId != null ? effectiveCatalog[row.articuloId] : undefined
            return (
              <tr
                key={`item-${index}-${row.descripcion.slice(0, 12)}`}
                className="border-t border-slate-200 dark:border-slate-600"
                data-testid={`documento-compra-item-row-${index}`}
              >
                <td className="px-2 py-1">
                  <input
                    type="text"
                    className={`w-full min-w-[8rem] rounded px-1 py-0.5 border bg-white dark:bg-slate-700 ${cellClass(status)}`}
                    value={row.descripcion}
                    disabled={disabled}
                    aria-label={t('documentoCompra.colDescripcion')}
                    data-testid={`documento-compra-item-desc-${index}`}
                    onChange={(e) => updateRow(index, { descripcion: e.target.value, confianza: 1 })}
                  />
                </td>
                <td className="px-2 py-1 text-right">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    className={`w-16 rounded px-1 py-0.5 border bg-white dark:bg-slate-700 text-right ${cellClass(status)}`}
                    value={row.cantidad}
                    disabled={disabled}
                    aria-label={t('documentoCompra.colCantidad')}
                    data-testid={`documento-compra-item-qty-${index}`}
                    onChange={(e) => {
                      const cantidad = Number.parseFloat(e.target.value)
                      updateRow(index, {
                        cantidad: Number.isFinite(cantidad) ? cantidad : 0,
                        confianza: 1,
                      })
                    }}
                  />
                </td>
                <td className="px-2 py-1 text-right">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    className={`w-20 rounded px-1 py-0.5 border bg-white dark:bg-slate-700 text-right ${cellClass(status)}`}
                    value={row.precioUnitario}
                    disabled={disabled}
                    aria-label={t('documentoCompra.colPrecio')}
                    data-testid={`documento-compra-item-price-${index}`}
                    onChange={(e) => {
                      const precioUnitario = Number.parseFloat(e.target.value)
                      updateRow(index, {
                        precioUnitario: Number.isFinite(precioUnitario) ? precioUnitario : 0,
                        confianza: 1,
                      })
                    }}
                  />
                </td>
                <td className="px-2 py-1 text-right font-mono">{row.subtotal.toLocaleString('es-AR')}</td>
                <td className="px-2 py-1">
                  <label className="sr-only" htmlFor={`doc-item-articulo-${index}`}>
                    {t('documentoCompra.colArticulo')}
                  </label>
                  <input
                    id={`doc-item-articulo-${index}`}
                    type="number"
                    min={1}
                    className={`w-20 rounded px-1 py-0.5 border bg-white dark:bg-slate-700 ${row.articuloId ? 'border-green-500' : 'border-amber-400'}`}
                    placeholder={t('documentoCompra.articuloIdPlaceholder')}
                    value={row.articuloId ?? ''}
                    disabled={disabled}
                    data-testid={`documento-compra-item-articulo-${index}`}
                    onChange={(e) => {
                      const raw = e.target.value.trim()
                      if (!raw) {
                        void mapArticulo(index, null)
                        return
                      }
                      const id = Number.parseInt(raw, 10)
                      if (Number.isInteger(id) && id > 0) void mapArticulo(index, id)
                    }}
                  />
                  {catalogHint ? (
                    <span className="block text-[10px] text-slate-500 mt-0.5 truncate max-w-[10rem]">
                      {catalogHint}
                    </span>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
