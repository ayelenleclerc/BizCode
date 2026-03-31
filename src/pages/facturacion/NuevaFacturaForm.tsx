import { useState, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { facturasAPI } from '@/lib/api'
import { calculateInvoice, calculateItemSubtotal } from '@/lib/invoice'
import { Cliente, Articulo, FormaPago } from '@/types'
import KeyboardHint, { useInvoiceShortcuts } from '@/components/shared/KeyboardHint'

interface LineaFactura {
  id: string
  articuloId: number
  articulo?: Articulo
  cantidad: number
  precio: number
  dscto: number
  subtotal: number
}

interface NuevaFacturaFormProps {
  clientes: Cliente[]
  articulos: Articulo[]
  formasPago: FormaPago[]
  onCancel: () => void
  onGuardada: () => void
}

export default function NuevaFacturaForm({
  clientes,
  articulos,
  onCancel,
  onGuardada,
}: NuevaFacturaFormProps) {
  const { t } = useTranslation('facturacion')
  const { t: tc } = useTranslation('common')
  const invoiceShortcuts = useInvoiceShortcuts()

  const [tipo, setTipo] = useState<'A' | 'B'>('A')
  const [prefijo, setPrefijo] = useState('')
  const [numero, setNumero] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [clienteId, setClienteId] = useState<number>(0)
  const [formaPagoId] = useState<number>(0)
  const [lineas, setLineas] = useState<LineaFactura[]>([])
  const [selectedLineIdx, setSelectedLineIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totales, setTotales] = useState({ neto1: 0, neto2: 0, neto3: 0, iva1: 0, iva2: 0, total: 0 })

  const cliente = clientes.find((c) => c.id === clienteId)

  useEffect(() => {
    if (lineas.length === 0) {
      setTotales({ neto1: 0, neto2: 0, neto3: 0, iva1: 0, iva2: 0, total: 0 })
      return
    }

    const itemsForCalc = lineas.map((l) => ({
      cantidad: l.cantidad,
      precio: l.precio,
      dscto: l.dscto,
      articuloIva: (l.articulo?.condIva ?? '3') as '1' | '2' | '3',
    }))

    const newTotales = calculateInvoice(itemsForCalc, cliente?.condIva || 'RI')
    setTotales(newTotales)
  }, [lineas, cliente])

  useHotkeys('f5', () => handleGuardar())
  useHotkeys('escape', onCancel)
  useHotkeys('ins', () => agregarLinea())
  useHotkeys('delete', () => eliminarLinea(selectedLineIdx))

  const agregarLinea = () => {
    const newId = Math.random().toString()
    setLineas([
      ...lineas,
      {
        id: newId,
        articuloId: 0,
        cantidad: 1,
        precio: 0,
        dscto: 0,
        subtotal: 0,
      },
    ])
    setSelectedLineIdx(lineas.length)
  }

  const eliminarLinea = (idx: number) => {
    if (lineas.length === 0) return
    const newLineas = lineas.filter((_, i) => i !== idx)
    setLineas(newLineas)
    if (selectedLineIdx >= newLineas.length && selectedLineIdx > 0) {
      setSelectedLineIdx(selectedLineIdx - 1)
    }
  }

  const updateLinea = (idx: number, field: keyof LineaFactura, value: unknown) => {
    const newLineas = [...lineas]
    newLineas[idx] = { ...newLineas[idx], [field]: value }

    if (['cantidad', 'precio', 'dscto'].includes(field)) {
      newLineas[idx].subtotal = calculateItemSubtotal(
        newLineas[idx].cantidad,
        newLineas[idx].precio,
        newLineas[idx].dscto
      )
    }

    if (field === 'articuloId') {
      const art = articulos.find((a) => a.id === value)
      if (art) {
        newLineas[idx].articulo = art
        newLineas[idx].precio = Number(art.precioLista1)
      }
    }

    setLineas(newLineas)
  }

  const handleGuardar = async () => {
    if (!clienteId) {
      setError(t('errors.noCliente'))
      return
    }
    if (lineas.length === 0) {
      setError(t('errors.noItems'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const facturaData = {
        fecha,
        tipo,
        prefijo,
        numero: parseInt(numero),
        clienteId,
        formaPagoId: formaPagoId || null,
        neto1: totales.neto1,
        neto2: totales.neto2,
        neto3: totales.neto3,
        iva1: totales.iva1,
        iva2: totales.iva2,
        total: totales.total,
        items: lineas.map((l) => ({
          articuloId: l.articuloId,
          cantidad: l.cantidad,
          precio: l.precio,
          dscto: l.dscto,
          subtotal: l.subtotal,
        })),
      }

      await facturasAPI.create(facturaData)
      onGuardada()
    } catch (err: unknown) {
      setError((err as Error).message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('newInvoice')}</h2>
      </div>

      <KeyboardHint shortcuts={invoiceShortcuts} className="mb-4" />

      {error && (
        <div role="alert" className="p-4 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded border border-red-300 dark:border-red-700 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-6 gap-4 mb-6 bg-slate-100 dark:bg-slate-700 p-4 rounded border border-slate-200 dark:border-slate-600">
        <div>
          <label htmlFor="factura-tipo" className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
            {t('form.tipo')} *
          </label>
          <select
            id="factura-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'A' | 'B')}
            className="w-full px-2 py-1 bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 text-sm"
          >
            <option value="A">{t('form.tipoOptions.A')}</option>
            <option value="B">{t('form.tipoOptions.B')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="factura-prefijo" className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
            {t('form.prefijo')}
          </label>
          <input
            id="factura-prefijo"
            type="text"
            value={prefijo}
            onChange={(e) => setPrefijo(e.target.value)}
            maxLength={4}
            className="w-full px-2 py-1 bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 text-sm"
          />
        </div>

        <div>
          <label htmlFor="factura-numero" className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
            {t('form.numero')} *
          </label>
          <input
            id="factura-numero"
            type="number"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            aria-required="true"
            className="w-full px-2 py-1 bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 text-sm"
          />
        </div>

        <div>
          <label htmlFor="factura-fecha" className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
            {t('form.fecha')}
          </label>
          <input
            id="factura-fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-2 py-1 bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label htmlFor="factura-clienteId" className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
            {t('form.cliente')} *
          </label>
          <select
            id="factura-clienteId"
            value={clienteId}
            onChange={(e) => setClienteId(parseInt(e.target.value))}
            aria-required="true"
            className="w-full px-2 py-1 bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 text-sm"
          >
            <option value={0}>{t('form.selectCliente')}</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} - {c.rsocial}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto mb-6">
        <table className="w-full border-collapse bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700" aria-label={t('newInvoice')}>
          <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
            <tr className="border-b border-slate-200 dark:border-slate-600">
              <th className="px-3 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold text-sm">{t('items.articulo')}</th>
              <th className="px-3 py-2 text-center text-slate-700 dark:text-slate-300 font-semibold text-sm">{t('items.cantidad')}</th>
              <th className="px-3 py-2 text-right text-slate-700 dark:text-slate-300 font-semibold text-sm">{t('items.precio')}</th>
              <th className="px-3 py-2 text-center text-slate-700 dark:text-slate-300 font-semibold text-sm">{t('items.descuento')}</th>
              <th className="px-3 py-2 text-right text-slate-700 dark:text-slate-300 font-semibold text-sm">{t('items.subtotal')}</th>
            </tr>
          </thead>
          <tbody>
            {lineas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  {t('items.empty')}
                </td>
              </tr>
            ) : (
              lineas.map((linea, idx) => (
                <tr
                  key={linea.id}
                  role="row"
                  aria-selected={selectedLineIdx === idx}
                  onClick={() => setSelectedLineIdx(idx)}
                  className={`border-b border-slate-200 dark:border-slate-700 transition ${
                    selectedLineIdx === idx
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <td className="px-3 py-2 text-sm">
                    <select
                      value={linea.articuloId}
                      onChange={(e) =>
                        updateLinea(idx, 'articuloId', parseInt(e.target.value))
                      }
                      className="w-full bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 px-2 py-1 text-sm"
                    >
                      <option value={0}>{t('items.selectArticulo')}</option>
                      {articulos.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.codigo} - {a.descripcion}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={linea.cantidad}
                      onChange={(e) =>
                        updateLinea(idx, 'cantidad', parseInt(e.target.value) || 0)
                      }
                      className="w-full bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 px-2 py-1 text-sm text-center"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={linea.precio}
                      onChange={(e) =>
                        updateLinea(idx, 'precio', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 px-2 py-1 text-sm text-right"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={linea.dscto}
                      onChange={(e) =>
                        updateLinea(idx, 'dscto', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 px-2 py-1 text-sm text-center"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-sm">
                    ${linea.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6 bg-slate-100 dark:bg-slate-700 p-4 rounded border border-slate-200 dark:border-slate-600">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('totals.neto21')}</p>
          <p className="text-slate-900 dark:text-slate-100 font-semibold">${totales.neto1.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('totals.neto105')}</p>
          <p className="text-slate-900 dark:text-slate-100 font-semibold">${totales.neto2.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('totals.netoExento')}</p>
          <p className="text-slate-900 dark:text-slate-100 font-semibold">${totales.neto3.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('totals.iva')}</p>
          <p className="text-slate-900 dark:text-slate-100 font-semibold">${(totales.iva1 + totales.iva2).toFixed(2)}</p>
        </div>
        <div className="text-center bg-green-100 dark:bg-green-900 rounded p-2 border border-green-200 dark:border-green-800">
          <p className="text-slate-600 dark:text-slate-400 text-sm">{t('totals.total')}</p>
          <p className="text-green-800 dark:text-green-300 text-lg font-bold">${totales.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={agregarLinea}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
        >
          {t('items.addItem')}
        </button>
        <button
          data-testid="btn-save-factura"
          onClick={handleGuardar}
          disabled={loading || lineas.length === 0 || !clienteId}
          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white rounded font-semibold transition"
        >
          {loading ? tc('actions.saving') : t('save')}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded font-semibold transition"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}
