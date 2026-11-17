import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { farmaciaAPI } from '@/lib/api'
import type {
  ObraSocialCuentaCorrienteRow,
  ObraSocialRow,
  OsTipoProducto,
  PresentacionOSRow,
  VentaConOSRow,
} from '@bizcode/types'
import { CanAccess } from '@/components/CanAccess'
import AsyncWrapper from '@/components/shared/AsyncWrapper'

export type OsTab = 'os' | 'ventasOs' | 'presentaciones' | 'cc'

const TIPOS: readonly OsTipoProducto[] = ['generico', 'marca', 'cronico', 'oncologico']

type Props = {
  tab: OsTab
}

/**
 * @en Pharmacy insurer / prepaid panels (#252).
 * @es Paneles de obras sociales / prepagas (#252).
 * @pt-BR Painéis de planos / prepagas (#252).
 */
export function ObrasSocialesPanels({ tab }: Props) {
  const { t } = useTranslation('farmacia')
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [obras, setObras] = useState<ObraSocialRow[]>([])
  const [ventas, setVentas] = useState<VentaConOSRow[]>([])
  const [presentaciones, setPresentaciones] = useState<PresentacionOSRow[]>([])
  const [cc, setCc] = useState<ObraSocialCuentaCorrienteRow[]>([])
  const [msg, setMsg] = useState<string | null>(null)

  const [osForm, setOsForm] = useState({
    nombre: '',
    codigo: '',
    tipoProducto: 'generico' as OsTipoProducto,
    cobertura: '70',
  })
  const [ventaForm, setVentaForm] = useState({
    clienteId: '',
    obraSocialId: '',
    nroAfiliado: '',
    descripcion: '',
    tipoProducto: 'generico' as OsTipoProducto,
    cantidad: '1',
    precioUnitario: '',
  })
  const [presentacionForm, setPresentacionForm] = useState({
    obraSocialId: '',
    periodo: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      if (tab === 'os') setObras(await farmaciaAPI.listObrasSociales())
      if (tab === 'ventasOs') setVentas(await farmaciaAPI.listVentasOs())
      if (tab === 'presentaciones') setPresentaciones(await farmaciaAPI.listPresentacionesOs())
      if (tab === 'cc') setCc(await farmaciaAPI.listObrasSocialesCc())
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(t('loadError')))
    } finally {
      setLoading(false)
    }
  }, [tab, t])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreateOs(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      await farmaciaAPI.createObraSocial({
        nombre: osForm.nombre,
        codigo: osForm.codigo,
        coberturas: [
          {
            tipoProducto: osForm.tipoProducto,
            cobertura: Number.parseFloat(osForm.cobertura),
          },
        ],
      })
      setMsg(t('os.saveOk'))
      setOsForm({ nombre: '', codigo: '', tipoProducto: 'generico', cobertura: '70' })
      await load()
    } catch {
      setMsg(t('os.saveError'))
    }
  }

  async function handleCreateVenta(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      await farmaciaAPI.createVentaOs({
        clienteId: Number.parseInt(ventaForm.clienteId, 10),
        obraSocialId: Number.parseInt(ventaForm.obraSocialId, 10),
        nroAfiliado: ventaForm.nroAfiliado,
        items: [
          {
            descripcion: ventaForm.descripcion,
            tipoProducto: ventaForm.tipoProducto,
            cantidad: Number.parseFloat(ventaForm.cantidad),
            precioUnitario: Number.parseFloat(ventaForm.precioUnitario),
          },
        ],
      })
      setMsg(t('ventasOs.saveOk'))
      await load()
    } catch {
      setMsg(t('ventasOs.saveError'))
    }
  }

  async function handleCreatePresentacion(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      await farmaciaAPI.createPresentacionOs({
        obraSocialId: Number.parseInt(presentacionForm.obraSocialId, 10),
        periodo: presentacionForm.periodo,
      })
      setMsg(t('presentaciones.saveOk'))
      await load()
    } catch {
      setMsg(t('presentaciones.saveError'))
    }
  }

  return (
    <AsyncWrapper loading={loading} error={loadError}>
      {msg ? (
        <p className="text-sm" role="status" data-testid="farmacia-os-msg">
          {msg}
        </p>
      ) : null}

      {tab === 'os' ? (
        <section className="space-y-4" aria-labelledby="farmacia-os-title" data-testid="farmacia-os-panel">
          <h2 id="farmacia-os-title" className="text-lg font-semibold">
            {t('os.title')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('os.hint')}</p>
          <CanAccess permission="inventory.adjust">
            <form
              onSubmit={(e) => void handleCreateOs(e)}
              className="grid max-w-3xl grid-cols-1 gap-3 rounded border p-4 sm:grid-cols-2"
              data-testid="farmacia-os-form"
            >
              <div>
                <label htmlFor="farmacia-os-nombre" className="mb-1 block text-sm">
                  {t('os.nombre')}
                </label>
                <input
                  id="farmacia-os-nombre"
                  required
                  className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                  value={osForm.nombre}
                  onChange={(e) => setOsForm((p) => ({ ...p, nombre: e.target.value }))}
                  data-testid="farmacia-os-nombre"
                />
              </div>
              <div>
                <label htmlFor="farmacia-os-codigo" className="mb-1 block text-sm">
                  {t('os.codigo')}
                </label>
                <input
                  id="farmacia-os-codigo"
                  required
                  className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                  value={osForm.codigo}
                  onChange={(e) => setOsForm((p) => ({ ...p, codigo: e.target.value }))}
                  data-testid="farmacia-os-codigo"
                />
              </div>
              <div>
                <label htmlFor="farmacia-os-tipo" className="mb-1 block text-sm">
                  {t('os.tipoProducto')}
                </label>
                <select
                  id="farmacia-os-tipo"
                  className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                  value={osForm.tipoProducto}
                  onChange={(e) =>
                    setOsForm((p) => ({ ...p, tipoProducto: e.target.value as OsTipoProducto }))
                  }
                  data-testid="farmacia-os-tipo"
                >
                  {TIPOS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {t(`os.tipos.${tipo}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="farmacia-os-cobertura" className="mb-1 block text-sm">
                  {t('os.cobertura')}
                </label>
                <input
                  id="farmacia-os-cobertura"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  required
                  className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                  value={osForm.cobertura}
                  onChange={(e) => setOsForm((p) => ({ ...p, cobertura: e.target.value }))}
                  data-testid="farmacia-os-cobertura"
                />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="rounded border px-3 py-1.5" data-testid="farmacia-os-save">
                  {t('os.save')}
                </button>
              </div>
            </form>
          </CanAccess>
          {obras.length === 0 ? (
            <p data-testid="farmacia-os-empty">{t('os.empty')}</p>
          ) : (
            <ul className="space-y-2" data-testid="farmacia-os-list">
              {obras.map((os) => (
                <li key={os.id} className="rounded border p-3">
                  <div className="font-medium">
                    {os.nombre} ({os.codigo})
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {(os.coberturas ?? [])
                      .map((c) => `${t(`os.tipos.${c.tipoProducto}`)}: ${c.cobertura}%`)
                      .join(' · ') || t('os.sinCoberturas')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === 'ventasOs' ? (
        <section className="space-y-4" data-testid="farmacia-ventas-os-panel">
          <h2 className="text-lg font-semibold">{t('ventasOs.title')}</h2>
          <CanAccess permission="inventory.adjust">
            <form
              onSubmit={(e) => void handleCreateVenta(e)}
              className="grid max-w-3xl grid-cols-1 gap-3 rounded border p-4 sm:grid-cols-2"
              data-testid="farmacia-venta-os-form"
            >
              <div>
                <label htmlFor="farmacia-venta-cliente" className="mb-1 block text-sm">
                  {t('ventasOs.clienteId')}
                </label>
                <input
                  id="farmacia-venta-cliente"
                  required
                  className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                  value={ventaForm.clienteId}
                  onChange={(e) => setVentaForm((p) => ({ ...p, clienteId: e.target.value }))}
                  data-testid="farmacia-venta-cliente"
                />
              </div>
              <div>
                <label htmlFor="farmacia-venta-os" className="mb-1 block text-sm">
                  {t('ventasOs.obraSocialId')}
                </label>
                <input
                  id="farmacia-venta-os"
                  required
                  className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                  value={ventaForm.obraSocialId}
                  onChange={(e) => setVentaForm((p) => ({ ...p, obraSocialId: e.target.value }))}
                  data-testid="farmacia-venta-os"
                />
              </div>
              <div>
                <label htmlFor="farmacia-venta-afiliado" className="mb-1 block text-sm">
                  {t('ventasOs.nroAfiliado')}
                </label>
                <input
                  id="farmacia-venta-afiliado"
                  required
                  className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                  value={ventaForm.nroAfiliado}
                  onChange={(e) => setVentaForm((p) => ({ ...p, nroAfiliado: e.target.value }))}
                  data-testid="farmacia-venta-afiliado"
                />
              </div>
              <div>
                <label htmlFor="farmacia-venta-desc" className="mb-1 block text-sm">
                  {t('ventasOs.descripcion')}
                </label>
                <input
                  id="farmacia-venta-desc"
                  required
                  className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                  value={ventaForm.descripcion}
                  onChange={(e) => setVentaForm((p) => ({ ...p, descripcion: e.target.value }))}
                  data-testid="farmacia-venta-desc"
                />
              </div>
              <div>
                <label htmlFor="farmacia-venta-precio" className="mb-1 block text-sm">
                  {t('ventasOs.precioUnitario')}
                </label>
                <input
                  id="farmacia-venta-precio"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                  value={ventaForm.precioUnitario}
                  onChange={(e) => setVentaForm((p) => ({ ...p, precioUnitario: e.target.value }))}
                  data-testid="farmacia-venta-precio"
                />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="rounded border px-3 py-1.5" data-testid="farmacia-venta-os-save">
                  {t('ventasOs.save')}
                </button>
              </div>
            </form>
          </CanAccess>
          {ventas.length === 0 ? (
            <p data-testid="farmacia-ventas-os-empty">{t('ventasOs.empty')}</p>
          ) : (
            <ul className="space-y-2" data-testid="farmacia-ventas-os-list">
              {ventas.map((v) => (
                <li key={v.id} className="rounded border p-3 text-sm">
                  #{v.id} · {v.nroAfiliado} · {t('ventasOs.copago')}: {v.copagoPaciente} ·{' '}
                  {t('ventasOs.credito')}: {v.creditoOS} · {v.estado}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === 'presentaciones' ? (
        <section className="space-y-4" data-testid="farmacia-presentaciones-panel">
          <h2 className="text-lg font-semibold">{t('presentaciones.title')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('presentaciones.hint')}</p>
          <CanAccess permission="inventory.adjust">
            <form
              onSubmit={(e) => void handleCreatePresentacion(e)}
              className="grid max-w-3xl grid-cols-1 gap-3 rounded border p-4 sm:grid-cols-2"
              data-testid="farmacia-presentacion-form"
            >
              <div>
                <label htmlFor="farmacia-pres-os" className="mb-1 block text-sm">
                  {t('presentaciones.obraSocialId')}
                </label>
                <input
                  id="farmacia-pres-os"
                  required
                  className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                  value={presentacionForm.obraSocialId}
                  onChange={(e) =>
                    setPresentacionForm((p) => ({ ...p, obraSocialId: e.target.value }))
                  }
                  data-testid="farmacia-pres-os"
                />
              </div>
              <div>
                <label htmlFor="farmacia-pres-periodo" className="mb-1 block text-sm">
                  {t('presentaciones.periodo')}
                </label>
                <input
                  id="farmacia-pres-periodo"
                  required
                  placeholder="YYYY-MM"
                  pattern="\d{4}-(0[1-9]|1[0-2])"
                  className="w-full rounded border px-2 py-1 dark:bg-slate-800"
                  value={presentacionForm.periodo}
                  onChange={(e) => setPresentacionForm((p) => ({ ...p, periodo: e.target.value }))}
                  data-testid="farmacia-pres-periodo"
                />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="rounded border px-3 py-1.5" data-testid="farmacia-pres-save">
                  {t('presentaciones.save')}
                </button>
              </div>
            </form>
          </CanAccess>
          {presentaciones.length === 0 ? (
            <p data-testid="farmacia-presentaciones-empty">{t('presentaciones.empty')}</p>
          ) : (
            <ul className="space-y-2" data-testid="farmacia-presentaciones-list">
              {presentaciones.map((p) => (
                <li key={p.id} className="rounded border p-3 text-sm">
                  #{p.id} · {p.periodo} · {p.estado} · {t('presentaciones.total')}: {p.totalCredito}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === 'cc' ? (
        <section className="space-y-4" data-testid="farmacia-os-cc-panel">
          <h2 className="text-lg font-semibold">{t('cc.title')}</h2>
          {cc.length === 0 ? (
            <p data-testid="farmacia-os-cc-empty">{t('cc.empty')}</p>
          ) : (
            <ul className="space-y-2" data-testid="farmacia-os-cc-list">
              {cc.map((row) => (
                <li key={row.obraSocialId} className="rounded border p-3 text-sm">
                  {row.nombre} ({row.codigo}) · {t('cc.saldo')}: {row.saldoAbierto} ·{' '}
                  {t('cc.cobrado')}: {row.creditoCobrado} · {t('cc.rechazado')}: {row.creditoRechazado}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </AsyncWrapper>
  )
}
