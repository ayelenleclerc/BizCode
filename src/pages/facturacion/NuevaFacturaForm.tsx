import { useState, useRef, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { facturasAPI } from '@/lib/api'
import { calculateInvoice, calculateItemSubtotal } from '@/lib/invoice'
import { Cliente, Articulo, FormaPago } from '@/types'
import KeyboardHint, { INVOICE_SHORTCUTS } from '@/components/shared/KeyboardHint'

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
  formasPago,
  onCancel,
  onGuardada,
}: NuevaFacturaFormProps) {
  const [tipo, setTipo] = useState<'A' | 'B'>('A')
  const [prefijo, setPrefijo] = useState('')
  const [numero, setNumero] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [clienteId, setClienteId] = useState<number>(0)
  const [formaPagoId, setFormaPagoId] = useState<number>(0)
  const [lineas, setLineas] = useState<LineaFactura[]>([])
  const [selectedLineIdx, setSelectedLineIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totales, setTotales] = useState({ neto1: 0, neto2: 0, neto3: 0, iva1: 0, iva2: 0, total: 0 })

  const cliente = clientes.find((c) => c.id === clienteId)

  // Calcular totales cuando cambia cliente o líneas
  useEffect(() => {
    if (lineas.length === 0) {
      setTotales({ neto1: 0, neto2: 0, neto3: 0, iva1: 0, iva2: 0, total: 0 })
      return
    }

    const itemsForCalc = lineas.map((l) => ({
      cantidad: l.cantidad,
      precio: l.precio,
      dscto: l.dscto,
      articuloIva: l.articulo?.condIva || '3',
    }))

    const newTotales = calculateInvoice(itemsForCalc, cliente?.condIva || 'RI')
    setTotales(newTotales)
  }, [lineas, cliente])

  // Hotkeys
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

  const updateLinea = (idx: number, field: keyof LineaFactura, value: any) => {
    const newLineas = [...lineas]
    newLineas[idx] = { ...newLineas[idx], [field]: value }

    // Recalcular subtotal si cambia cantidad, precio o descuento
    if (['cantidad', 'precio', 'dscto'].includes(field)) {
      newLineas[idx].subtotal = calculateItemSubtotal(
        newLineas[idx].cantidad,
        newLineas[idx].precio,
        newLineas[idx].dscto
      )
    }

    // Si selecciona artículo, llenar precio
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
      setError('Seleccione un cliente')
      return
    }
    if (lineas.length === 0) {
      setError('Agregue al menos un artículo')
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
    } catch (err: any) {
      setError(err.message || 'Error al guardar factura')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Nueva Factura</h2>
      </div>

      {/* Keyboard Hints */}
      <KeyboardHint shortcuts={INVOICE_SHORTCUTS} className="mb-4" />

      {error && (
        <div className="p-4 bg-red-900 text-red-100 rounded border border-red-700 mb-4">
          {error}
        </div>
      )}

      {/* Cabecera */}
      <div className="grid grid-cols-6 gap-4 mb-6 bg-slate-700 p-4 rounded">
        <div>
          <label className="text-slate-300 font-semibold text-sm">Tipo *</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'A' | 'B')}
            className="w-full px-2 py-1 bg-slate-600 text-slate-100 rounded border border-slate-500 text-sm"
          >
            <option value="A">Factura A</option>
            <option value="B">Factura B</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-semibold text-sm">Prefijo</label>
          <input
            type="text"
            value={prefijo}
            onChange={(e) => setPrefijo(e.target.value)}
            maxLength={4}
            className="w-full px-2 py-1 bg-slate-600 text-slate-100 rounded border border-slate-500 text-sm"
          />
        </div>

        <div>
          <label className="text-slate-300 font-semibold text-sm">Número *</label>
          <input
            type="number"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="w-full px-2 py-1 bg-slate-600 text-slate-100 rounded border border-slate-500 text-sm"
          />
        </div>

        <div>
          <label className="text-slate-300 font-semibold text-sm">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-2 py-1 bg-slate-600 text-slate-100 rounded border border-slate-500 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="text-slate-300 font-semibold text-sm">Cliente *</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(parseInt(e.target.value))}
            className="w-full px-2 py-1 bg-slate-600 text-slate-100 rounded border border-slate-500 text-sm"
          >
            <option value={0}>Seleccionar...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} - {c.rsocial}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de ítems */}
      <div className="flex-1 overflow-auto mb-6">
        <table className="w-full border-collapse bg-slate-800 rounded">
          <thead className="bg-slate-700 sticky top-0">
            <tr className="border-b border-slate-600">
              <th className="px-3 py-2 text-left text-slate-300 font-semibold text-sm">Artículo</th>
              <th className="px-3 py-2 text-center text-slate-300 font-semibold text-sm">Cant.</th>
              <th className="px-3 py-2 text-right text-slate-300 font-semibold text-sm">Precio</th>
              <th className="px-3 py-2 text-center text-slate-300 font-semibold text-sm">Dscto %</th>
              <th className="px-3 py-2 text-right text-slate-300 font-semibold text-sm">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {lineas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Sin ítems. Presione Ins para agregar (o F3+Ins).
                </td>
              </tr>
            ) : (
              lineas.map((linea, idx) => (
                <tr
                  key={linea.id}
                  onClick={() => setSelectedLineIdx(idx)}
                  className={`border-b border-slate-700 transition ${
                    selectedLineIdx === idx
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-700 text-slate-100'
                  }`}
                >
                  <td className="px-3 py-2 text-sm">
                    <select
                      value={linea.articuloId}
                      onChange={(e) =>
                        updateLinea(idx, 'articuloId', parseInt(e.target.value))
                      }
                      className="w-full bg-slate-600 text-slate-100 rounded border border-slate-500 px-2 py-1 text-sm"
                    >
                      <option value={0}>Seleccionar...</option>
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
                      className="w-full bg-slate-600 text-slate-100 rounded border border-slate-500 px-2 py-1 text-sm text-center"
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
                      className="w-full bg-slate-600 text-slate-100 rounded border border-slate-500 px-2 py-1 text-sm text-right"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={linea.dscto}
                      onChange={(e) =>
                        updateLinea(idx, 'dscto', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-slate-600 text-slate-100 rounded border border-slate-500 px-2 py-1 text-sm text-center"
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

      {/* Totales */}
      <div className="grid grid-cols-5 gap-4 mb-6 bg-slate-700 p-4 rounded">
        <div className="text-center">
          <p className="text-slate-400 text-sm">Neto 21%</p>
          <p className="text-slate-100 font-semibold">${totales.neto1.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-sm">Neto 10.5%</p>
          <p className="text-slate-100 font-semibold">${totales.neto2.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-sm">Neto Exento</p>
          <p className="text-slate-100 font-semibold">${totales.neto3.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-sm">IVA</p>
          <p className="text-slate-100 font-semibold">${(totales.iva1 + totales.iva2).toFixed(2)}</p>
        </div>
        <div className="text-center bg-green-900 rounded p-2">
          <p className="text-slate-400 text-sm">TOTAL</p>
          <p className="text-green-300 text-lg font-bold">${totales.total.toFixed(2)}</p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={agregarLinea}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
        >
          ➕ Agregar Ítem (Ins)
        </button>
        <button
          onClick={handleGuardar}
          disabled={loading || lineas.length === 0 || !clienteId}
          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded font-semibold transition"
        >
          {loading ? 'Guardando...' : '✓ Guardar Factura (F5)'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded font-semibold transition"
        >
          Cancelar (Esc)
        </button>
      </div>
    </div>
  )
}
