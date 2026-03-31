import { useState } from 'react'
import { Factura, Cliente } from '@/types'

interface ListadoFacturasProps {
  facturas: Factura[]
  clientes: Cliente[]
}

export default function ListadoFacturas({ facturas, clientes }: ListadoFacturasProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const getClienteName = (clienteId: number) => {
    return clientes.find((c) => c.id === clienteId)?.rsocial || `Cliente #${clienteId}`
  }

  return (
    <div className="flex-1 overflow-auto">
      {facturas.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No hay facturas. Crea una con F3.
        </div>
      ) : (
        <table className="w-full border-collapse bg-slate-800 rounded">
          <thead className="bg-slate-700 sticky top-0">
            <tr className="border-b border-slate-600">
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Fecha</th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Tipo</th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Número</th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Cliente</th>
              <th className="px-4 py-3 text-right text-slate-300 font-semibold">Neto</th>
              <th className="px-4 py-3 text-right text-slate-300 font-semibold">IVA</th>
              <th className="px-4 py-3 text-right text-slate-300 font-semibold">Total</th>
              <th className="px-4 py-3 text-center text-slate-300 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((factura) => {
              const neto = (Number(factura.neto1) + Number(factura.neto2) + Number(factura.neto3)).toFixed(2)
              const iva = (Number(factura.iva1) + Number(factura.iva2)).toFixed(2)
              const isExpanded = expandedId === factura.id

              return (
                <tr
                  key={factura.id}
                  onClick={() => setExpandedId(isExpanded ? null : factura.id)}
                  className="border-b border-slate-700 hover:bg-slate-700 cursor-pointer transition text-slate-100"
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
                  <td className="px-4 py-3 text-right font-mono font-semibold text-green-400">
                    ${Number(factura.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {factura.estado === 'A' ? (
                      <span className="inline-block px-2 py-1 bg-green-900 text-green-300 rounded text-xs font-semibold">
                        Activa
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-red-900 text-red-300 rounded text-xs font-semibold">
                        Anulada
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {/* Detalles expandibles */}
      {expandedId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {(() => {
              const factura = facturas.find((f) => f.id === expandedId)
              if (!factura) return null

              return (
                <>
                  <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
                    <h2 className="text-xl font-bold text-slate-100">
                      Factura {factura.tipo} {factura.prefijo} {factura.numero.toString().padStart(8, '0')}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      {new Date(factura.fecha).toLocaleDateString('es-AR')} - {getClienteName(factura.clienteId)}
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Ítems */}
                    {factura.items && factura.items.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100 mb-3">Detalles:</h3>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-600">
                              <th className="text-left text-slate-300 py-2">Artículo</th>
                              <th className="text-center text-slate-300 py-2">Cantidad</th>
                              <th className="text-right text-slate-300 py-2">Precio</th>
                              <th className="text-center text-slate-300 py-2">Dscto</th>
                              <th className="text-right text-slate-300 py-2">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {factura.items.map((item) => (
                              <tr key={item.id} className="border-b border-slate-700">
                                <td className="py-2 text-slate-100">{item.articulo?.descripcion}</td>
                                <td className="py-2 text-center text-slate-100">{item.cantidad}</td>
                                <td className="py-2 text-right text-slate-100 font-mono">
                                  ${Number(item.precio).toFixed(2)}
                                </td>
                                <td className="py-2 text-center text-slate-100">{Number(item.dscto).toFixed(1)}%</td>
                                <td className="py-2 text-right text-slate-100 font-mono">
                                  ${Number(item.subtotal).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Totales */}
                    <div className="bg-slate-700 p-4 rounded grid grid-cols-3 gap-4 text-right">
                      <div>
                        <p className="text-slate-400 text-sm">IVA 21%</p>
                        <p className="text-slate-100 font-semibold">${Number(factura.iva1).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">IVA 10.5%</p>
                        <p className="text-slate-100 font-semibold">${Number(factura.iva2).toFixed(2)}</p>
                      </div>
                      <div className="bg-green-900 rounded p-2">
                        <p className="text-slate-400 text-sm">TOTAL</p>
                        <p className="text-green-300 text-lg font-bold">${Number(factura.total).toFixed(2)}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedId(null)}
                      className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded font-semibold transition"
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
