import { useCallback, useEffect, useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import ErrorBoundary from '@/components/ErrorBoundary'
import KeyboardHint, { useGlobalListShortcuts } from '@/components/shared/KeyboardHint'
import { useListKeyboardNav, useListPageHotkeys } from '@/hooks/useListPageKeyboard'
import { useAuth } from '@/contexts/AuthContext'
import {
  reportesAPI,
  type ReporteCobranzasRow,
  type ReporteVentasRow,
  type StockCriticoRow,
} from '@/lib/api'
import ReportesDataPanel from './ReportesDataPanel'
import ReportesPeriodSelector from './ReportesPeriodSelector'
import ReportesTabPanel, { type TabId } from './ReportesTabPanel'
import ReportesVentasChart from './ReportesVentasChart'
import { downloadCsvBlob } from './reportesExport'
import { resolvePresetRange, type ReportesPreset } from './reportesDatePresets'

function formatMoney(value: string): string {
  const n = Number.parseFloat(value)
  if (Number.isNaN(n)) return value
  return n.toLocaleString(undefined, { style: 'currency', currency: 'ARS' })
}

export default function ReportesPage() {
  const { t } = useTranslation('reportes')
  const listShortcuts = useGlobalListShortcuts()
  const { claims } = useAuth()
  const canOperational = claims?.permissions.includes('reports.operational.read') ?? false
  const canFinancial = claims?.permissions.includes('reports.financial.read') ?? false

  const initialRange = resolvePresetRange('month')
  const [from, setFrom] = useState(initialRange.from)
  const [to, setTo] = useState(initialRange.to)
  const [agrupar, setAgrupar] = useState<'dia' | 'semana' | 'mes'>('dia')
  const [activeTab, setActiveTab] = useState<TabId>(canOperational ? 'ventas' : 'cobranzas')

  const [ventas, setVentas] = useState<ReporteVentasRow[]>([])
  const [stock, setStock] = useState<StockCriticoRow[]>([])
  const [cobranzas, setCobranzas] = useState<ReporteCobranzasRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)

  const loadActive = useCallback(async () => {
    if (!canOperational && !canFinancial) return
    setLoading(true)
    setError(null)
    try {
      if (activeTab === 'ventas' && canOperational) {
        const data = await reportesAPI.ventas({ from, to, agrupar })
        setVentas(data ?? [])
      } else if (activeTab === 'stock' && canOperational) {
        const data = await reportesAPI.stockCritico()
        setStock(data ?? [])
      } else if (activeTab === 'cobranzas' && canFinancial) {
        const data = await reportesAPI.cobranzas({ from, to })
        setCobranzas(data ?? [])
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [activeTab, agrupar, canFinancial, canOperational, from, to])

  useEffect(() => {
    void loadActive()
  }, [loadActive])

  useEffect(() => {
    setSelectedRow(0)
  }, [activeTab, ventas, stock, cobranzas])

  const applyPreset = (preset: ReportesPreset) => {
    const range = resolvePresetRange(preset)
    setFrom(range.from)
    setTo(range.to)
  }

  const exportCsv = async () => {
    const params: Record<string, string> = {}
    const path =
      activeTab === 'ventas'
        ? (() => {
            params.from = from
            params.to = to
            params.agrupar = agrupar
            return '/reportes/ventas'
          })()
        : activeTab === 'stock'
          ? '/reportes/stock-critico'
          : (() => {
              params.from = from
              params.to = to
              return '/reportes/cobranzas'
            })()
    const blob = await reportesAPI.exportCsv(path, Object.keys(params).length > 0 ? params : undefined)
    if (blob) downloadCsvBlob(blob, `reportes-${activeTab}.csv`)
  }

  const ventasRows = useMemo(
    () =>
      ventas.map((r) => ({
        periodo: r.periodo,
        count: r.count,
        total: formatMoney(r.total),
        neto1: formatMoney(r.neto1),
        neto2: formatMoney(r.neto2),
        iva1: formatMoney(r.iva1),
        iva2: formatMoney(r.iva2),
      })),
    [ventas],
  )

  const stockRows = useMemo(
    () =>
      stock.map((r) => ({
        codigo: r.articulo.codigo,
        descripcion: r.articulo.descripcion,
        stock: r.stock,
        minimo: r.minimo,
        deficit: r.deficit,
      })),
    [stock],
  )

  const cobranzasRows = useMemo(() => {
    const flat: Record<string, string | number>[] = []
    for (const day of cobranzas) {
      if (day.porFormaPago.length === 0) {
        flat.push({ fecha: day.fecha, count: day.count, total: formatMoney(day.total), forma: '—', fpTotal: '—' })
        continue
      }
      for (const fp of day.porFormaPago) {
        flat.push({
          fecha: day.fecha,
          count: day.count,
          total: formatMoney(day.total),
          forma: fp.descripcion,
          fpTotal: formatMoney(fp.total),
        })
      }
    }
    return flat
  }, [cobranzas])

  const activeRowCount =
    activeTab === 'ventas' ? ventasRows.length : activeTab === 'stock' ? stockRows.length : cobranzasRows.length

  const handleKeyDown = useListKeyboardNav({
    itemCount: activeRowCount,
    selectedRow,
    setSelectedRow,
    onOpenRow: () => {},
  })

  const filterInputId =
    activeTab === 'ventas' || activeTab === 'cobranzas' ? 'reportes-from' : undefined

  useListPageHotkeys({ searchInputId: filterInputId })

  useHotkeys(
    'f2',
    () => {
      if (activeTab === 'stock') {
        const exportBtn = document.querySelector('[data-testid="reportes-export-csv"]') as HTMLButtonElement | null
        exportBtn?.focus()
      }
    },
    { enabled: activeTab === 'stock' },
  )

  if (!canOperational && !canFinancial) {
    return (
      <div className="p-8" data-testid="reportes-forbidden">
        <p className="text-slate-600 dark:text-slate-300">{t('forbidden')}</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="reportes-page">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('subtitle')}</p>
        </header>

        <KeyboardHint shortcuts={listShortcuts} className="mb-4" />

        <ReportesTabPanel
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabListLabel={t('tabs.legend')}
          labels={{ ventas: t('tabs.ventas'), stock: t('tabs.stock'), cobranzas: t('tabs.cobranzas') }}
          ventasVisible={canOperational}
          stockVisible={canOperational}
          cobranzasVisible={canFinancial}
          ventasPanel={
            <>
              <ReportesPeriodSelector
                  from={from}
                  to={to}
                  onFromChange={setFrom}
                  onToChange={setTo}
                  onPreset={applyPreset}
                  showAgrupar
                  agrupar={agrupar}
                  onAgruparChange={setAgrupar}
                />
              <ReportesDataPanel
                loading={loading}
                error={error}
                empty={ventas.length === 0}
                columns={[
                  { key: 'periodo', label: t('ventas.periodo') },
                  { key: 'count', label: t('ventas.count') },
                  { key: 'total', label: t('ventas.total') },
                  { key: 'neto1', label: t('ventas.neto1') },
                  { key: 'iva1', label: t('ventas.iva1') },
                ]}
                rows={ventasRows}
                tableTestId="reportes-ventas-table"
                onExportCsv={() => void exportCsv()}
                exportDisabled={loading}
                selectedRow={selectedRow}
                onRowKeyDown={handleKeyDown}
                onRowClick={setSelectedRow}
              >
                <ReportesVentasChart rows={ventas} />
              </ReportesDataPanel>
            </>
          }
          stockPanel={
            <ReportesDataPanel
              loading={loading}
              error={error}
              empty={stock.length === 0}
              columns={[
                { key: 'codigo', label: t('stock.codigo') },
                { key: 'descripcion', label: t('stock.descripcion') },
                { key: 'stock', label: t('stock.stock') },
                { key: 'minimo', label: t('stock.minimo') },
                { key: 'deficit', label: t('stock.deficit') },
              ]}
              rows={stockRows}
              tableTestId="reportes-stock-table"
              onExportCsv={() => void exportCsv()}
              exportDisabled={loading}
              selectedRow={selectedRow}
              onRowKeyDown={handleKeyDown}
              onRowClick={setSelectedRow}
            />
          }
          cobranzasPanel={
            <>
              <ReportesPeriodSelector
                from={from}
                to={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onPreset={applyPreset}
              />
              <ReportesDataPanel
                loading={loading}
                error={error}
                empty={cobranzas.length === 0}
                columns={[
                  { key: 'fecha', label: t('cobranzas.fecha') },
                  { key: 'count', label: t('cobranzas.count') },
                  { key: 'total', label: t('cobranzas.total') },
                  { key: 'forma', label: t('cobranzas.forma') },
                  { key: 'fpTotal', label: t('cobranzas.fpTotal') },
                ]}
                rows={cobranzasRows}
                tableTestId="reportes-cobranzas-table"
                onExportCsv={() => void exportCsv()}
                exportDisabled={loading}
                selectedRow={selectedRow}
                onRowKeyDown={handleKeyDown}
                onRowClick={setSelectedRow}
              />
            </>
          }
        />
      </div>
    </ErrorBoundary>
  )
}
