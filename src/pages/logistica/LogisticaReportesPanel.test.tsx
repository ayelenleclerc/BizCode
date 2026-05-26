import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import LogisticaReportesPanel from './LogisticaReportesPanel'
import {
  logisticaReportesAPI,
  type LogisticaChoferRow,
  type LogisticaKpis,
  type LogisticaZonaRow,
} from '@/lib/api'

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    logisticaReportesAPI: {
      kpis: vi.fn(),
      reporteChoferes: vi.fn(),
      reporteZonas: vi.fn(),
      exportChoferesCsv: vi.fn(),
      exportZonasCsv: vi.fn(),
    },
  }
})

vi.mock('@/pages/reportes/reportesExport', () => ({
  downloadCsvBlob: vi.fn(),
}))

import { downloadCsvBlob } from '@/pages/reportes/reportesExport'

const kpisFixture: LogisticaKpis = {
  dispatchedCount: 12,
  firstVisitDeliveredCount: 9,
  firstVisitRate: 0.75,
  avgDeliveryMinutes: 18.5,
  returnsByReason: [{ motivo: 'ausente', count: 2 }],
  overdueCount: 1,
}

const choferesFixture: LogisticaChoferRow[] = [
  {
    choferId: 2,
    choferUsername: 'driver1',
    day: '2026-05-20',
    dispatched: 5,
    delivered: 4,
    notDelivered: 1,
  },
]

const zonasFixture: LogisticaZonaRow[] = [
  {
    zonaId: 1,
    zonaNombre: 'Norte',
    dispatched: 6,
    delivered: 5,
    notDelivered: 1,
  },
]

function mockSuccessLoad() {
  vi.mocked(logisticaReportesAPI.kpis).mockResolvedValue(kpisFixture)
  vi.mocked(logisticaReportesAPI.reporteChoferes).mockResolvedValue(choferesFixture)
  vi.mocked(logisticaReportesAPI.reporteZonas).mockResolvedValue(zonasFixture)
}

describe('LogisticaReportesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSuccessLoad()
  })

  it('shows loading state before data arrives', () => {
    vi.mocked(logisticaReportesAPI.kpis).mockImplementation(
      () => new Promise(() => undefined),
    )
    render(<LogisticaReportesPanel />)
    expect(screen.getByText(/loading|cargando|carregando/i)).toBeInTheDocument()
  })

  it('renders KPIs, driver table and zone table after load', async () => {
    render(<LogisticaReportesPanel />)
    expect(screen.getByTestId('logistica-reportes-panel')).toBeInTheDocument()
    expect(await screen.findByTestId('logistica-reportes-kpis')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByTestId('logistica-reportes-returns')).toBeInTheDocument()
    expect(screen.getByTestId('logistica-reportes-choferes-table')).toBeInTheDocument()
    expect(screen.getByText('driver1')).toBeInTheDocument()
    expect(screen.getByTestId('logistica-reportes-zonas-table')).toBeInTheDocument()
    expect(screen.getByText('Norte')).toBeInTheDocument()
  })

  it('shows error alert when load fails', async () => {
    vi.mocked(logisticaReportesAPI.kpis).mockRejectedValue(new Error('network'))
    render(<LogisticaReportesPanel />)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByTestId('logistica-reportes-kpis')).not.toBeInTheDocument()
  })

  it('shows empty state when no driver or zone rows', async () => {
    vi.mocked(logisticaReportesAPI.reporteChoferes).mockResolvedValue([])
    vi.mocked(logisticaReportesAPI.reporteZonas).mockResolvedValue([])
    render(<LogisticaReportesPanel />)
    await screen.findByTestId('logistica-reportes-kpis')
    expect(screen.queryByTestId('logistica-reportes-choferes-table')).not.toBeInTheDocument()
    expect(screen.queryByTestId('logistica-reportes-zonas-table')).not.toBeInTheDocument()
  })

  it('reloads with new date range when from date changes', async () => {
    const user = userEvent.setup()
    render(<LogisticaReportesPanel />)
    await screen.findByTestId('logistica-reportes-kpis')
    vi.mocked(logisticaReportesAPI.kpis).mockClear()
    await user.clear(screen.getByTestId('logistica-reportes-from'))
    await user.type(screen.getByTestId('logistica-reportes-from'), '2026-01-01')
    await waitFor(() => {
      expect(logisticaReportesAPI.kpis).toHaveBeenCalled()
    })
    const lastCall = vi.mocked(logisticaReportesAPI.kpis).mock.calls.at(-1)?.[0]
    expect(lastCall?.from).toBe('2026-01-01')
  })

  it('passes choferId to all report endpoints when filter is set', async () => {
    const user = userEvent.setup()
    render(<LogisticaReportesPanel />)
    await screen.findByTestId('logistica-reportes-kpis')
    vi.mocked(logisticaReportesAPI.kpis).mockClear()
    vi.mocked(logisticaReportesAPI.reporteChoferes).mockClear()
    vi.mocked(logisticaReportesAPI.reporteZonas).mockClear()
    await user.clear(screen.getByTestId('logistica-reportes-chofer-filter'))
    await user.type(screen.getByTestId('logistica-reportes-chofer-filter'), '7')
    await user.click(screen.getByTestId('logistica-reportes-refresh'))
    await waitFor(() => {
      expect(logisticaReportesAPI.reporteZonas).toHaveBeenCalledWith(
        expect.objectContaining({ choferId: 7 }),
      )
    })
    expect(logisticaReportesAPI.kpis).toHaveBeenCalledWith(expect.objectContaining({ choferId: 7 }))
    expect(logisticaReportesAPI.reporteChoferes).toHaveBeenCalledWith(
      expect.objectContaining({ choferId: 7 }),
    )
  })

  it('exports driver CSV via API and download helper', async () => {
    const user = userEvent.setup()
    const blob = new Blob(['csv'], { type: 'text/csv' })
    vi.mocked(logisticaReportesAPI.exportChoferesCsv).mockResolvedValue(blob)
    render(<LogisticaReportesPanel />)
    await screen.findByTestId('logistica-reportes-kpis')
    await user.click(screen.getByTestId('logistica-reportes-export-choferes'))
    await waitFor(() => {
      expect(logisticaReportesAPI.exportChoferesCsv).toHaveBeenCalled()
      expect(downloadCsvBlob).toHaveBeenCalledWith(blob, 'logistica-choferes.csv')
    })
  })

  it('exports zone CSV with current query params including choferId', async () => {
    const user = userEvent.setup()
    const blob = new Blob(['csv'], { type: 'text/csv' })
    vi.mocked(logisticaReportesAPI.exportZonasCsv).mockResolvedValue(blob)
    render(<LogisticaReportesPanel />)
    await screen.findByTestId('logistica-reportes-kpis')
    await user.clear(screen.getByTestId('logistica-reportes-chofer-filter'))
    await user.type(screen.getByTestId('logistica-reportes-chofer-filter'), '3')
    await user.click(screen.getByTestId('logistica-reportes-refresh'))
    await screen.findByTestId('logistica-reportes-zonas-table')
    await user.click(screen.getByTestId('logistica-reportes-export-zonas'))
    await waitFor(() => {
      expect(logisticaReportesAPI.exportZonasCsv).toHaveBeenCalledWith(
        expect.objectContaining({ choferId: 3 }),
      )
      expect(downloadCsvBlob).toHaveBeenCalledWith(blob, 'logistica-zonas.csv')
    })
  })

  it('renders em dash when firstVisitRate is null', async () => {
    vi.mocked(logisticaReportesAPI.kpis).mockResolvedValue({
      ...kpisFixture,
      firstVisitRate: null,
      avgDeliveryMinutes: null,
    })
    render(<LogisticaReportesPanel />)
    await screen.findByTestId('logistica-reportes-kpis')
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('applies today preset when preset button is clicked', async () => {
    const user = userEvent.setup()
    render(<LogisticaReportesPanel />)
    await screen.findByTestId('logistica-reportes-kpis')
    const fromBefore = (screen.getByTestId('logistica-reportes-from') as HTMLInputElement).value
    await user.click(screen.getByRole('button', { name: /today|hoy|hoje/i }))
    await waitFor(() => {
      const fromAfter = (screen.getByTestId('logistica-reportes-from') as HTMLInputElement).value
      expect(fromAfter).not.toBe(fromBefore)
    })
  })

  it('applies week and month presets', async () => {
    const user = userEvent.setup()
    render(<LogisticaReportesPanel />)
    await screen.findByTestId('logistica-reportes-kpis')
    await user.click(screen.getByRole('button', { name: /week|semana/i }))
    await user.click(screen.getByRole('button', { name: /month|mes|mês/i }))
    await waitFor(() => expect(logisticaReportesAPI.kpis).toHaveBeenCalled())
  })

  it('shows raw motivo key when translation is missing', async () => {
    vi.mocked(logisticaReportesAPI.kpis).mockResolvedValue({
      ...kpisFixture,
      returnsByReason: [{ motivo: 'custom_reason', count: 1 }],
    })
    render(<LogisticaReportesPanel />)
    await screen.findByTestId('logistica-reportes-returns')
    expect(screen.getByText(/custom_reason/)).toBeInTheDocument()
  })

  it('does not download when export API returns no blob', async () => {
    const user = userEvent.setup()
    vi.mocked(logisticaReportesAPI.exportChoferesCsv).mockResolvedValue(undefined as unknown as Blob)
    render(<LogisticaReportesPanel />)
    await screen.findByTestId('logistica-reportes-kpis')
    await user.click(screen.getByTestId('logistica-reportes-export-choferes'))
    await waitFor(() => expect(logisticaReportesAPI.exportChoferesCsv).toHaveBeenCalled())
    expect(downloadCsvBlob).not.toHaveBeenCalled()
  })

  it('reloads when to date changes', async () => {
    const user = userEvent.setup()
    render(<LogisticaReportesPanel />)
    await screen.findByTestId('logistica-reportes-kpis')
    vi.mocked(logisticaReportesAPI.kpis).mockClear()
    await user.clear(screen.getByTestId('logistica-reportes-to'))
    await user.type(screen.getByTestId('logistica-reportes-to'), '2026-05-31')
    await waitFor(() => {
      expect(logisticaReportesAPI.kpis).toHaveBeenCalledWith(
        expect.objectContaining({ to: '2026-05-31' }),
      )
    })
  })
})
