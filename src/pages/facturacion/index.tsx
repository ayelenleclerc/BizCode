import { useState, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { facturasAPI, clientesAPI, articulosAPI, formasPagoAPI } from '@/lib/api'
import { Cliente, Articulo, FormaPago, Factura } from '@/types'
import NuevaFacturaForm from './NuevaFacturaForm'
import ListadoFacturas from './ListadoFacturas'

export default function FacturacionPage() {
  const { t } = useTranslation('facturacion')
  const [view, setView] = useState<'lista' | 'nueva'>('lista')
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])

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

  useHotkeys('f3', () => {
    if (view === 'lista') setView('nueva')
  })

  useHotkeys('escape', () => {
    if (view === 'nueva') setView('lista')
  })

  const handleFacturaGuardada = async () => {
    setView('lista')
    try {
      const data = await facturasAPI.list()
      setFacturas(data || [])
    } catch (error) {
      console.error('Error refreshing facturas after save:', error)
    }
  }

  return (
    <div className="p-8 h-full flex flex-col">
      {view === 'lista' ? (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          </div>

          <div className="mb-6 flex justify-between items-start">
            <button
              data-testid="btn-nueva-factura"
              onClick={() => setView('nueva')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
            >
              ➕ {t('newInvoice')} (F3)
            </button>
          </div>
          <ListadoFacturas
            facturas={facturas}
            clientes={clientes}
            onFacturaVoided={handleFacturaGuardada}
          />
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
