import { useState, useEffect, useCallback, useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { depositosAPI, empresaAPI, facturasAPI, fidelizacionAPI, fiscalRetencionesAPI, listasPreciosAPI, ApiRequestFailedError, type RetencionPreviewLineDTO } from '@/lib/api'
import { calculateInvoice, calculateItemSubtotal } from '@/lib/invoice'
import { Cliente, Articulo, FormaPago, allowsDecimalQuantity, type UnidadBase } from '@bizcode/types'
import KeyboardHint, { useInvoiceShortcuts } from '@/components/shared/KeyboardHint'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import FefoPreviewBadge from './FefoPreviewBadge'

interface LineaFactura {
  id: string
  mode: 'catalog' | 'adhoc'
  articuloId: number | null
  articulo?: Articulo
  descripcion: string
  condIva: '1' | '2' | '3'
  unidadServicio: 'hora' | 'dia' | 'mes' | 'proyecto' | 'km' | 'unidad' | 'otro' | null
  cantidad: number
  precio: number
  dscto: number
  subtotal: number
}

type LineaQuantityConfig = {
  step: string
  inputMode: 'decimal' | 'numeric'
  decimalAllowed: boolean
}

/**
 * @en For catalog lines, resolves the cantidad input step/inputMode from the article's UoM rules (#203); ad-hoc/service lines and tenants without `inventory.uom` always stay integer-only.
 * @es Para líneas de catálogo, resuelve step/inputMode del input de cantidad según las reglas UoM del artículo (#203); las líneas ad-hoc/servicio y tenants sin `inventory.uom` siempre quedan enteras.
 * @pt-BR Para linhas de catálogo, resolve step/inputMode do input de quantidade conforme as regras UoM do artigo (#203); linhas ad-hoc/serviço e tenants sem `inventory.uom` permanecem sempre inteiras.
 */
function resolveLineQuantityConfig(linea: LineaFactura, uomEnabled: boolean): LineaQuantityConfig {
  if (!uomEnabled || linea.mode !== 'catalog' || !linea.articulo || linea.articulo.tipo === 'servicio') {
    return { step: '1', inputMode: 'numeric', decimalAllowed: false }
  }
  const unidadBase = (linea.articulo.unidadBase ?? 'unidad') as UnidadBase
  const multiploVenta =
    linea.articulo.multiploVenta != null ? Number(linea.articulo.multiploVenta) : null
  const decimalAllowed = allowsDecimalQuantity(unidadBase, multiploVenta)
  return {
    step: decimalAllowed ? '0.0001' : '1',
    inputMode: decimalAllowed ? 'decimal' : 'numeric',
    decimalAllowed,
  }
}

interface NuevaFacturaFormProps {
  clientes: Cliente[]
  articulos: Articulo[]
  formasPago: FormaPago[]
  onCancel: () => void
  onGuardada: () => void | Promise<void>
}

export default function NuevaFacturaForm({
  clientes,
  articulos,
  onCancel,
  onGuardada,
}: NuevaFacturaFormProps) {
  const { t } = useTranslation('facturacion')
  const { t: tc } = useTranslation('common')
  const { t: ta } = useTranslation('articulos')
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
  const [anomalyWarnings, setAnomalyWarnings] = useState<
    Array<{ tipo: string; severidad: string; descripcion: string }>
  >([])
  const [pendingDuplicateConfirm, setPendingDuplicateConfirm] = useState(false)
  const [totales, setTotales] = useState({ neto1: 0, neto2: 0, neto3: 0, iva1: 0, iva2: 0, total: 0 })
  const [agentePercepcion, setAgentePercepcion] = useState(false)
  const [applyPercepciones, setApplyPercepciones] = useState(false)
  const [percepcionRows, setPercepcionRows] = useState<Array<RetencionPreviewLineDTO & { selected: boolean }>>([])
  const [percepcionesLoading, setPercepcionesLoading] = useState(false)
  const { hasModule } = useFeatureFlags()
  const retencionesModule = hasModule('finance.retenciones')
  const pricelistsModule = hasModule('catalog.pricelists')
  const loyaltyModule = hasModule('clients.loyalty')
  const fefoModule = hasModule('inventory.fefo')
  const warehousesModule = hasModule('inventory.warehouses')
  const uomModule = hasModule('inventory.uom')
  const [fefoDefaultDepositoId, setFefoDefaultDepositoId] = useState<number | null>(null)
  const [puntosCanje, setPuntosCanje] = useState('')
  const [loyaltySaldo, setLoyaltySaldo] = useState<{
    puntos: number
    equivalenteDinero: number
    puntosPorPeso: number
  } | null>(null)
  const { t: tf } = useTranslation('fidelizacion')

  const cliente = clientes.find((c) => c.id === clienteId)

  useEffect(() => {
    if (!loyaltyModule || !clienteId) {
      setLoyaltySaldo(null)
      setPuntosCanje('')
      return
    }
    let cancelled = false
    void Promise.all([
      fidelizacionAPI.getConfig(),
      fidelizacionAPI.getClientePuntos(clienteId, { limit: 1, offset: 0 }),
    ])
      .then(([cfg, detail]) => {
        if (cancelled) return
        if (!cfg.activo) {
          setLoyaltySaldo(null)
          return
        }
        setLoyaltySaldo({
          puntos: detail.puntos,
          equivalenteDinero: detail.equivalenteDinero,
          puntosPorPeso: cfg.puntosPorPeso,
        })
      })
      .catch(() => {
        if (!cancelled) setLoyaltySaldo(null)
      })
    return () => {
      cancelled = true
    }
  }, [loyaltyModule, clienteId])

  useEffect(() => {
    if (!fefoModule || !warehousesModule) {
      setFefoDefaultDepositoId(null)
      return
    }
    let cancelled = false
    depositosAPI
      .listDepositos({ activo: true, take: 50 })
      .then((response) => {
        if (cancelled) return
        const deposito = response.data.find((d) => d.esDefault) ?? response.data[0]
        setFefoDefaultDepositoId(deposito?.id ?? null)
      })
      .catch(() => {
        if (!cancelled) setFefoDefaultDepositoId(null)
      })
    return () => {
      cancelled = true
    }
  }, [fefoModule, warehousesModule])

  const puntosCanjeNum = Number.parseInt(puntosCanje, 10)
  const canjeMontoEstimado =
    loyaltySaldo && Number.isInteger(puntosCanjeNum) && puntosCanjeNum > 0
      ? Math.round(puntosCanjeNum * loyaltySaldo.puntosPorPeso * 100) / 100
      : 0

  const percepcionesTotal = useMemo(
    () =>
      applyPercepciones
        ? percepcionRows
            .filter((r) => r.selected)
            .reduce((sum, r) => sum + Number.parseFloat(r.importe), 0)
        : 0,
    [applyPercepciones, percepcionRows],
  )

  const totalConPercepciones = totales.total + percepcionesTotal

  useEffect(() => {
    void empresaAPI.get().then((data) => {
      if (!data) return
      setPrefijo((prev) => (prev.trim() === '' ? data.prefijoFactura : prev))
      if (data.tipoFactura === 'A' || data.tipoFactura === 'B') {
        setTipo(data.tipoFactura)
      }
    }).catch(() => {})
  }, [])

  // Credit limit warning: shown when balance + this invoice total would exceed the limit
  const creditLimitWarning = (() => {
    if (!cliente || cliente.creditLimit === null || cliente.creditLimit === undefined) return null
    const limit = Number(cliente.creditLimit)
    if (limit <= 0) return null
    const balance = Number(cliente.balance ?? 0)
    if (balance + totalConPercepciones > limit) {
      return { balance, limit, projected: balance + totalConPercepciones }
    }
    return null
  })()

  useEffect(() => {
    if (lineas.length === 0) {
      setTotales({ neto1: 0, neto2: 0, neto3: 0, iva1: 0, iva2: 0, total: 0 })
      return
    }

    const itemsForCalc = lineas.map((l) => ({
      cantidad: l.cantidad,
      precio: l.precio,
      dscto: l.dscto,
      articuloIva: (l.mode === 'adhoc' ? l.condIva : l.articulo?.condIva ?? l.condIva) as '1' | '2' | '3',
    }))

    const newTotales = calculateInvoice(itemsForCalc, cliente?.condIva || 'RI')
    setTotales(newTotales)
  }, [lineas, cliente])

  useEffect(() => {
    if (!retencionesModule) return
    void fiscalRetencionesAPI
      .getConfig()
      .then((config) => {
        setAgentePercepcion(
          config.esAgenteRetencionGanancias ||
            config.esAgenteRetencionIVA ||
            config.esAgenteRetencionIIBB,
        )
      })
      .catch(() => setAgentePercepcion(false))
  }, [retencionesModule])

  const loadPercepcionesPreview = useCallback(async () => {
    if (!applyPercepciones || !agentePercepcion || !clienteId || totales.neto1 + totales.neto2 + totales.neto3 <= 0) {
      setPercepcionRows([])
      return
    }
    setPercepcionesLoading(true)
    try {
      const lines = await fiscalRetencionesAPI.previewRetenciones({
        entidadTipo: 'cliente',
        entidadId: clienteId,
        monto: 1,
        contexto: 'factura',
        neto1: totales.neto1,
        neto2: totales.neto2,
        neto3: totales.neto3,
      })
      setPercepcionRows(lines.map((line) => ({ ...line, selected: true })))
    } catch {
      setPercepcionRows([])
    } finally {
      setPercepcionesLoading(false)
    }
  }, [agentePercepcion, applyPercepciones, clienteId, totales.neto1, totales.neto2, totales.neto3])

  useEffect(() => {
    void loadPercepcionesPreview()
  }, [loadPercepcionesPreview])

  useHotkeys('f5', () => handleGuardar())
  useHotkeys('escape', onCancel)
  useHotkeys('ins', () => agregarLinea())
  useHotkeys('delete', () => eliminarLinea(selectedLineIdx))

  const agregarLinea = (mode: 'catalog' | 'adhoc' = 'catalog') => {
    const newId = Math.random().toString()
    setLineas([
      ...lineas,
      {
        id: newId,
        mode,
        articuloId: null,
        descripcion: '',
        condIva: '1',
        unidadServicio: mode === 'adhoc' ? 'hora' : null,
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

  /**
   * @en Best-effort: prefill the line price from the effective-price endpoint (#234).
   * @es Best-effort: prefija el precio de la línea con el endpoint de precio efectivo (#234).
   * @pt-BR Best-effort: preenche o preço da linha via endpoint de preço efetivo (#234).
   */
  const resolveSuggestedPrice = useCallback(
    async (lineId: string, articuloId: number, cantidad: number) => {
      if (!pricelistsModule) return
      try {
        const res = await listasPreciosAPI.getPrecioEfectivo({
          articuloId,
          listaPrecioId: cliente?.listaPrecioId ?? undefined,
          cantidad: cantidad > 0 ? cantidad : 1,
        })
        setLineas((prev) =>
          prev.map((l) =>
            l.id === lineId
              ? { ...l, precio: res.precio, subtotal: calculateItemSubtotal(l.cantidad, res.precio, l.dscto) }
              : l,
          ),
        )
      } catch {
        // Best-effort: keep the base price already set from precioLista1.
      }
    },
    [pricelistsModule, cliente],
  )

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
        newLineas[idx].articuloId = art.id
        newLineas[idx].descripcion = art.descripcion
        newLineas[idx].condIva = (art.condIva as '1' | '2' | '3') || '1'
        newLineas[idx].unidadServicio =
          art.tipo === 'servicio'
            ? ((art.unidadServicio as LineaFactura['unidadServicio']) ?? null)
            : null
        newLineas[idx].precio = Number(art.precioLista1)
        newLineas[idx].subtotal = calculateItemSubtotal(
          newLineas[idx].cantidad,
          newLineas[idx].precio,
          newLineas[idx].dscto,
        )
        void resolveSuggestedPrice(newLineas[idx].id, art.id, newLineas[idx].cantidad)
      }
    }

    if (field === 'cantidad' && newLineas[idx].mode === 'catalog' && newLineas[idx].articuloId != null) {
      void resolveSuggestedPrice(
        newLineas[idx].id,
        newLineas[idx].articuloId as number,
        newLineas[idx].cantidad,
      )
    }

    setLineas(newLineas)
  }

  const handleGuardar = async (opts?: { confirmAnomalies?: boolean }) => {
    if (!clienteId) {
      setError(t('errors.noCliente'))
      return
    }
    if (lineas.length === 0) {
      setError(t('errors.noItems'))
      return
    }
    for (const l of lineas) {
      if (l.mode === 'catalog' && (l.articuloId == null || l.articuloId < 1)) {
        setError(t('errors.noArticulo'))
        return
      }
      if (l.mode === 'adhoc' && l.descripcion.trim().length < 1) {
        setError(t('errors.noDescripcionServicio'))
        return
      }
    }

    setLoading(true)
    setError(null)
    if (!opts?.confirmAnomalies) {
      setAnomalyWarnings([])
      setPendingDuplicateConfirm(false)
    }

    try {
      const percepcionesPayload = applyPercepciones
        ? percepcionRows
            .filter((r) => r.selected)
            .map((r) => ({
              regimenId: r.regimenId,
              baseImponible: Number.parseFloat(r.baseImponible),
              alicuota: Number.parseFloat(r.alicuota),
              importe: Number.parseFloat(r.importe),
            }))
        : undefined

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
        total: totalConPercepciones,
        items: lineas.map((l) =>
          l.mode === 'adhoc'
            ? {
                articuloId: null,
                descripcion: l.descripcion.trim(),
                condIva: l.condIva,
                unidadServicio: l.unidadServicio,
                cantidad: l.cantidad,
                precio: l.precio,
                dscto: l.dscto,
                subtotal: l.subtotal,
              }
            : {
                articuloId: l.articuloId as number,
                cantidad: l.cantidad,
                precio: l.precio,
                dscto: l.dscto,
                subtotal: l.subtotal,
              },
        ),
        ...(percepcionesPayload != null && percepcionesPayload.length > 0
          ? { percepciones: percepcionesPayload }
          : {}),
        ...(Number.isInteger(puntosCanjeNum) && puntosCanjeNum > 0
          ? { puntosCanje: puntosCanjeNum }
          : {}),
        ...(opts?.confirmAnomalies === true ? { confirmAnomalies: true } : {}),
      }

      const created = await facturasAPI.create(facturaData)
      if (created.warnings.length > 0) {
        setAnomalyWarnings(created.warnings)
      }
      setPendingDuplicateConfirm(false)
      await Promise.resolve(onGuardada())
    } catch (err: unknown) {
      if (
        err instanceof ApiRequestFailedError &&
        err.message === 'DUPLICATE_INVOICE_CONFIRM_REQUIRED'
      ) {
        setPendingDuplicateConfirm(true)
        setAnomalyWarnings(err.warnings ?? [])
        setError(t('anomaly.duplicateConfirmRequired'))
      } else {
        setError((err as Error).message || t('errors.generic'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col" data-testid="nueva-factura-form">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('newInvoice')}</h2>
      </div>

      <KeyboardHint shortcuts={invoiceShortcuts} className="mb-4" />

      {error && (
        <div role="alert" className="p-4 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded border border-red-300 dark:border-red-700 mb-4">
          {error}
        </div>
      )}

      {creditLimitWarning && (
        <div
          data-testid="credit-limit-warning"
          role="alert"
          aria-live="polite"
          className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 rounded mb-4 flex items-start gap-3"
        >
          <span className="text-amber-600 dark:text-amber-400 text-xl leading-none" aria-hidden="true">⚠</span>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
              {t('creditLimitWarning.title')}
            </p>
            <p className="text-amber-700 dark:text-amber-400 text-sm mt-0.5">
              {t('creditLimitWarning.detail', {
                balance: creditLimitWarning.balance.toFixed(2),
                limit: creditLimitWarning.limit.toFixed(2),
                projected: creditLimitWarning.projected.toFixed(2),
              })}
            </p>
            <p className="text-amber-600 dark:text-amber-500 text-xs mt-1">
              {t('creditLimitWarning.hint')}
            </p>
          </div>
        </div>
      )}

      {(anomalyWarnings.length > 0 || pendingDuplicateConfirm) && (
        <div
          data-testid="factura-anomaly-warning"
          role="alert"
          aria-live="assertive"
          className={`p-4 rounded mb-4 border ${
            pendingDuplicateConfirm || anomalyWarnings.some((w) => w.severidad === 'critical')
              ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100'
              : 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-600 text-amber-900 dark:text-amber-100'
          }`}
        >
          <p className="font-semibold text-sm">{t('anomaly.title')}</p>
          <ul className="mt-2 list-disc list-inside text-sm space-y-1">
            {anomalyWarnings.map((w) => (
              <li key={`${w.tipo}-${w.descripcion}`}>
                {t(`anomaly.tipos.${w.tipo}`, { defaultValue: w.descripcion })}
              </li>
            ))}
          </ul>
          {pendingDuplicateConfirm && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="factura-anomaly-confirm"
                className="px-3 py-1.5 text-sm rounded bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                disabled={loading}
                onClick={() => void handleGuardar({ confirmAnomalies: true })}
              >
                {t('anomaly.confirmDuplicate')}
              </button>
              <button
                type="button"
                data-testid="factura-anomaly-dismiss"
                className="px-3 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-500"
                disabled={loading}
                onClick={() => {
                  setPendingDuplicateConfirm(false)
                  setAnomalyWarnings([])
                  setError(null)
                }}
              >
                {t('anomaly.cancelDuplicate')}
              </button>
            </div>
          )}
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
            data-testid="factura-form-numero"
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
            data-testid="factura-form-clienteId"
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

      {loyaltyModule && loyaltySaldo && loyaltySaldo.puntos > 0 ? (
        <div
          className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20"
          data-testid="factura-loyalty-panel"
        >
          <h3 className="text-sm font-semibold mb-2">{tf('factura.title')}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
            {tf('factura.saldo', {
              puntos: loyaltySaldo.puntos,
              dinero: loyaltySaldo.equivalenteDinero.toFixed(2),
            })}
          </p>
          <label htmlFor="factura-puntos-canje" className="block text-sm mb-1">
            {tf('factura.puntos')}
          </label>
          <input
            id="factura-puntos-canje"
            type="number"
            min={1}
            max={loyaltySaldo.puntos}
            value={puntosCanje}
            onChange={(e) => setPuntosCanje(e.target.value)}
            className="w-40 rounded border px-2 py-1 text-sm"
            data-testid="factura-puntos-canje"
          />
          {canjeMontoEstimado > 0 ? (
            <p className="text-xs mt-1" data-testid="factura-loyalty-estimado">
              {tf('factura.montoEstimado', { monto: canjeMontoEstimado.toFixed(2) })}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex-1 overflow-auto mb-6">
        <table
          className="w-full border-collapse bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
          aria-label={t('newInvoice')}
          data-testid="factura-items-table"
        >
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
                  aria-label={
                    selectedLineIdx === idx
                      ? t('items.rowAriaSelected', { n: idx + 1 })
                      : t('items.rowAria', { n: idx + 1 })
                  }
                  onClick={() => setSelectedLineIdx(idx)}
                  className={`border-b border-slate-200 dark:border-slate-700 transition ${
                    selectedLineIdx === idx
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <td className="px-3 py-2 text-sm">
                    {linea.mode === 'adhoc' ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={linea.descripcion}
                          data-testid={`factura-line-${idx}-descripcion`}
                          onChange={(e) => updateLinea(idx, 'descripcion', e.target.value)}
                          aria-label={`${t('items.descripcionServicio')} ${idx + 1}`}
                          maxLength={120}
                          placeholder={t('items.descripcionServicioPlaceholder')}
                          className="w-full bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 px-2 py-1 text-sm"
                        />
                        <div className="flex gap-2">
                          <select
                            value={linea.condIva}
                            data-testid={`factura-line-${idx}-condIva`}
                            onChange={(e) =>
                              updateLinea(idx, 'condIva', e.target.value as '1' | '2' | '3')
                            }
                            aria-label={`${t('items.condIva')} ${idx + 1}`}
                            className="bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 px-2 py-1 text-xs"
                          >
                            <option value="1">21%</option>
                            <option value="2">10.5%</option>
                            <option value="3">{t('items.exento')}</option>
                          </select>
                          <select
                            value={linea.unidadServicio ?? 'hora'}
                            data-testid={`factura-line-${idx}-unidadServicio`}
                            onChange={(e) =>
                              updateLinea(
                                idx,
                                'unidadServicio',
                                e.target.value as LineaFactura['unidadServicio'],
                              )
                            }
                            aria-label={`${t('items.unidadServicio')} ${idx + 1}`}
                            className="bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 px-2 py-1 text-xs"
                          >
                            {(['hora', 'dia', 'mes', 'proyecto', 'km', 'unidad', 'otro'] as const).map(
                              (u) => (
                                <option key={u} value={u}>
                                  {t(`items.unidadServicioOptions.${u}`)}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={linea.articuloId ?? 0}
                        data-testid={`factura-line-${idx}-articulo`}
                        onChange={(e) =>
                          updateLinea(idx, 'articuloId', parseInt(e.target.value, 10))
                        }
                        aria-label={`${t('items.articulo')} ${idx + 1}`}
                        className="w-full bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 px-2 py-1 text-sm"
                      >
                        <option value={0}>{t('items.selectArticulo')}</option>
                        {articulos
                          .filter((a) => a.esPadre !== true)
                          .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.codigo} - {a.descripcion}
                            {a.tipo === 'servicio' ? ` (${t('items.badgeServicio')})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                    {linea.mode === 'catalog' && fefoModule && linea.articulo?.controlLote && linea.articuloId ? (
                      <FefoPreviewBadge
                        articuloId={linea.articuloId}
                        depositoId={fefoDefaultDepositoId}
                        cantidad={linea.cantidad}
                      />
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    {(() => {
                      const qtyConfig = resolveLineQuantityConfig(linea, uomModule)
                      const unidadBase = linea.articulo?.unidadBase
                      const showUnidad =
                        uomModule && linea.mode === 'catalog' && linea.articulo?.tipo !== 'servicio' && !!unidadBase
                      const unidadHintId = `factura-line-${idx}-unidad`
                      return (
                        <>
                          <input
                            type="number"
                            step={qtyConfig.step}
                            inputMode={qtyConfig.inputMode}
                            value={linea.cantidad}
                            onChange={(e) => {
                              const parsed = qtyConfig.decimalAllowed
                                ? parseFloat(e.target.value)
                                : parseInt(e.target.value, 10)
                              updateLinea(idx, 'cantidad', Number.isFinite(parsed) ? parsed : 0)
                            }}
                            aria-label={`${t('items.cantidad')} ${idx + 1}`}
                            aria-describedby={showUnidad ? unidadHintId : undefined}
                            data-testid={`factura-line-${idx}-cantidad`}
                            className="w-full bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 px-2 py-1 text-sm text-center"
                          />
                          {showUnidad ? (
                            <p
                              id={unidadHintId}
                              data-testid={unidadHintId}
                              className="mt-0.5 text-center text-xs text-slate-500 dark:text-slate-300"
                            >
                              {ta(`form.uom.unidadBaseOptions.${unidadBase}`)}
                            </p>
                          ) : null}
                        </>
                      )
                    })()}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={linea.precio}
                      onChange={(e) =>
                        updateLinea(idx, 'precio', parseFloat(e.target.value) || 0)
                      }
                      aria-label={`${t('items.precio')} ${idx + 1}`}
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
                      aria-label={`${t('items.descuento')} ${idx + 1}`}
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
          <p className="text-green-800 dark:text-green-300 text-lg font-bold" data-testid="factura-total-con-percepciones">
            ${totalConPercepciones.toFixed(2)}
          </p>
        </div>
      </div>

      {retencionesModule && agentePercepcion && totales.neto1 + totales.neto2 + totales.neto3 > 0 ? (
        <div className="mb-6 rounded border border-slate-200 dark:border-slate-600 p-4 space-y-3" data-testid="factura-percepciones-section">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={applyPercepciones}
              onChange={(e) => setApplyPercepciones(e.target.checked)}
              data-testid="factura-apply-percepciones"
            />
            {t('percepciones.apply')}
          </label>
          {applyPercepciones ? (
            percepcionesLoading ? (
              <p className="text-sm text-slate-500">{t('percepciones.loading')}</p>
            ) : percepcionRows.length === 0 ? (
              <p className="text-sm text-slate-500">{t('percepciones.empty')}</p>
            ) : (
              <table className="w-full text-sm" data-testid="factura-percepciones-table">
                <caption className="sr-only">{t('percepciones.caption')}</caption>
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-600 text-left">
                    <th scope="col" className="py-1 pr-2">{t('percepciones.colSelect')}</th>
                    <th scope="col" className="py-1 pr-2">{t('percepciones.colRegimen')}</th>
                    <th scope="col" className="py-1 pr-2 text-right">{t('percepciones.colBase')}</th>
                    <th scope="col" className="py-1 pr-2 text-right">{t('percepciones.colAlicuota')}</th>
                    <th scope="col" className="py-1 text-right">{t('percepciones.colImporte')}</th>
                  </tr>
                </thead>
                <tbody>
                  {percepcionRows.map((row, idx) => (
                    <tr key={row.regimenId} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="py-1 pr-2">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          aria-label={row.nombre}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setPercepcionRows((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, selected: checked } : r)),
                            )
                          }}
                        />
                      </td>
                      <td className="py-1 pr-2">{row.nombre}</td>
                      <td className="py-1 pr-2 text-right tabular-nums">{row.baseImponible}</td>
                      <td className="py-1 pr-2 text-right tabular-nums">{row.alicuota}%</td>
                      <td className="py-1 text-right tabular-nums">{row.importe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : null}
          {percepcionesTotal > 0 ? (
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {t('percepciones.sum')}: ${percepcionesTotal.toFixed(2)}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => agregarLinea('catalog')}
          data-testid="btn-add-factura-item"
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
        >
          {t('items.addItem')}
        </button>
        <button
          type="button"
          onClick={() => agregarLinea('adhoc')}
          data-testid="btn-add-factura-servicio-libre"
          className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition"
        >
          {t('items.addServicioLibre')}
        </button>
        <button
          type="button"
          data-testid="btn-save-factura"
          onClick={() => void handleGuardar()}
          disabled={loading || lineas.length === 0 || !clienteId}
          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white rounded font-semibold transition"
        >
          {loading ? tc('actions.saving') : t('save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded font-semibold transition"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}
