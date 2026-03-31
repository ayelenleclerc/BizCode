import { useState, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { facturasAPI, clientesAPI, articulosAPI, formasPagoAPI } from '@/lib/api'
import { calculateInvoice, calculateItemSubtotal } from '@/lib/invoice'
import { Cliente, Articulo, FormaPago, Factura } from '@/types'
import NuevaFacturaForm from './NuevaFacturaForm'
import ListadoFacturas from './ListadoFacturas'
import KeyboardHint, { GLOBAL_SHORTCUTS, INVOICE_SHORTCUTS } from '@/components/shared/KeyboardHint'

export default function FacturacionPage() {
  const [view, setView] = useState<'lista' | 'nueva'>('lista')
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [fac, cli, art, forma] = await Promise.all([
          facturasAPI.list(),
          clientesAPI.list(),
          articulosAPI.list(),
          formasPagoAPI.list(),
        ])
        setFacturas(fac || [])
        setClientes(cli || [])
        setArticulos(art || [])
        setFormasPago(forma || [])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  // Hotkeys
  useHotkeys('f3', () => {
    if (view === 'lista') setView('nueva')
  })

  useHotkeys('escape', () => {
    if (view === 'nueva') setView('lista')
  })

  const handleFacturaGuardada = async () => {
    setView('lista')
    const data = await facturasAPI.list()
    setFacturas(data || [])
  }

  return (
    <div className="p-8 h-full flex flex-col">
      {view === 'lista' ? (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-100">Facturación</h1>
          </div>

          {/* Keyboard Hints */}
          <KeyboardHint shortcuts={GLOBAL_SHORTCUTS} className="mb-4" />

          <div className="mb-6 flex justify-between items-start">
            <button
              onClick={() => setView('nueva')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
            >
              ➕ Nueva Factura (F3)
            </button>
          </div>
          <ListadoFacturas facturas={facturas} clientes={clientes} />
        </>
      ) : (
        <NuevaFacturaForm
          clientes={clientes}
          articulos={articulos}
          formasPago={formasPago}
          onCancel={() => setView('lista')}
          onGuardada={handleFacturaGuardada}
        />
      )}
    </div>
  )
}
