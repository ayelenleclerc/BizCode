import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { facturasAPI } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import { Factura, Cliente } from '@/types'

interface ListadoFacturasProps {
  facturas: Factura[]
  clientes: Cliente[]
  onFacturaVoided?: () => void
}

export default function ListadoFacturas({ facturas, clientes, onFacturaVoided }: ListadoFacturasProps) {
  const { t } = useTranslation('facturacion')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [voidingId, setVoidingId] = useState<number | null>(null)
  const [motivo, setMotivo] = useState('')
  const [voidLoading, setVoidLoading] = useState(false)
  const [voidError, setVoidError] = useState<string | null>(null)

  const getClienteName = (clienteId: number) => {
    return clientes.find((c) => c.id === clienteId)?.rsocial || `Cliente #${clienteId}`
  }

  const handleVoid = async (facturaId: number) => {
    if (!motivo.trim()) {
      setVoidError(t('void.motivoRequired'))
      return
    }
    setVoidLoading(true)
    setVoidError(null)
    try {
      await facturasAPI.void(facturaId, motivo.trim())
      setVoidingId(null)
      setMotivo('')
      setExpandedId(null)
      onFacturaVoided?.()
    } catch (err: unknown) {
      setVoidError((err as Error).message || t('void.error'))
    } finally {
      setVoidLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      {facturas.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          {t('list.empty')}
        </div>
      ) : (
        <table
          data-testid="facturas-table"
          className="w-full border-collapse bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
          aria-label={t('listTitle')}
        >
          <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
            <tr className="border-b border-slate-200 dark:border-slate-600">
              <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('list.fecha')}</th>
              <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('list.tipo')}</th>
              <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('list.numero')}</th>
              <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">{t('list.cliente')}</th>
              <th className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">{t('list.neto')}</th>
              <th className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">{t('list.iva')}</th>
              <th className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">{t('list.total')}</th>
              <th className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{t('list.estado')}</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((factura) => {
              const neto = (Number(factura.neto1) + Number(factura.neto2) + Number(factura.neto3)).toFixed(2)
              const iva = (Number(factura.iva1) + Number(factura.iva2)).toFixed(2)

              return (
                <tr
                  key={factura.id}
                  role="row"
                  onClick={() => setExpandedId(expandedId === factura.id ? null : factura.id)}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition text-slate-900 dark:text-slate-100"
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
                  <td className="px-4 py-3 text-right font-mono font-semibold text-green-700 dark:text-green-400">
                    ${Number(factura.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {factura.estado === 'A' ? (
                      <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded text-xs font-semibold">
                        {t('list.activa')}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded text-xs font-semibold">
                        {t('list.anulada')}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {expandedId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-factura-title"
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {(() => {
              const factura = facturas.find((f) => f.id === expandedId)
              if (!factura) return null

              return (
                <>
                  <div className="bg-slate-200 dark:bg-slate-700 px-6 py-4 border-b border-slate-300 dark:border-slate-600">
                    <h2 id="dialog-factura-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {t('detail.title', {
                        tipo: factura.tipo,
                        prefijo: factura.prefijo,
                        numero: factura.numero.toString().padStart(8, '0'),
                      })}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {new Date(factura.fecha).toLocaleDateString('es-AR')} — {getClienteName(factura.clienteId)}
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    {factura.items && factura.items.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">{t('detail.items')}</h3>
                        <table className="w-full text-sm" aria-label={t('detail.items')}>
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-600">
                              <th className="text-left text-slate-700 dark:text-slate-300 py-2">{t('items.articulo')}</th>
                              <th className="text-center text-slate-700 dark:text-slate-300 py-2">{t('items.cantidad')}</th>
                              <th className="text-right text-slate-700 dark:text-slate-300 py-2">{t('items.precio')}</th>
                              <th className="text-center text-slate-700 dark:text-slate-300 py-2">{t('items.descuento')}</th>
                              <th className="text-right text-slate-700 dark:text-slate-300 py-2">{t('items.subtotal')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {factura.items.map((item) => (
                              <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700">
                                <td className="py-2 text-slate-900 dark:text-slate-100">{item.articulo?.descripcion}</td>
                                <td className="py-2 text-center text-slate-900 dark:text-slate-100">{item.cantidad}</td>
                                <td className="py-2 text-right text-slate-900 dark:text-slate-100 font-mono">
                                  ${Number(item.precio).toFixed(2)}
                                </td>
                                <td className="py-2 text-center text-slate-900 dark:text-slate-100">{Number(item.dscto).toFixed(1)}%</td>
                                <td className="py-2 text-right text-slate-900 dark:text-slate-100 font-mono">
                                  ${Number(item.subtotal).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded grid grid-cols-3 gap-4 text-right border border-slate-200 dark:border-slate-600">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('detail.iva21')}</p>
                        <p className="text-slate-900 dark:text-slate-100 font-semibold">${Number(factura.iva1).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('detail.iva105')}</p>
                        <p className="text-slate-900 dark:text-slate-100 font-semibold">${Number(factura.iva2).toFixed(2)}</p>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900 rounded p-2 border border-green-200 dark:border-green-800">
                        <p className="text-slate-600 dark:text-slate-400 text-sm">{t('totals.total')}</p>
                        <p className="text-green-800 dark:text-green-300 text-lg font-bold">${Number(factura.total).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Void section */}
                    {factura.estado === 'A' && (
                      <CanAccess permission="sales.cancel">
                        {voidingId === factura.id ? (
                          <div className="border border-red-300 dark:border-red-700 rounded p-4 bg-red-50 dark:bg-red-900/20">
                            <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                              {t('void.confirmTitle')}
                            </p>
                            <label className="block text-xs text-red-700 dark:text-red-400 mb-1">
                              {t('void.motivoLabel')} <span aria-hidden="true">*</span>
                            </label>
                            <input
                              type="text"
                              value={motivo}
                              onChange={(e) => setMotivo(e.target.value)}
                              placeholder={t('void.motivoPlaceholder')}
                              className="w-full px-3 py-1.5 text-sm border border-red-300 dark:border-red-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 mb-2"
                            />
                            {voidError && (
                              <p className="text-xs text-red-600 dark:text-red-400 mb-2">{voidError}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleVoid(factura.id)}
                                disabled={voidLoading}
                                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded font-semibold transition"
                              >
                                {voidLoading ? t('void.loading') : t('void.confirm')}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setVoidingId(null); setMotivo(''); setVoidError(null) }}
                                className="px-3 py-1.5 text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded transition"
                              >
                                {t('void.cancel')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setVoidingId(factura.id); setMotivo(''); setVoidError(null) }}
                            className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700 rounded font-semibold transition text-sm"
                          >
                            {t('void.button')}
                          </button>
                        )}
                      </CanAccess>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded font-semibold transition"
                    >
                      {t('detail.close')}
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
