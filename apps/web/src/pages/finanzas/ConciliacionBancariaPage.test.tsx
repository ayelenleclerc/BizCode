import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import '@/i18n/config'
import ConciliacionBancariaPage from './ConciliacionBancariaPage'
import { bancosAPI } from '@/lib/api'

const cuenta = {
  id: 7,
  tenantId: 1,
  banco: 'galicia',
  tipoCuenta: 'corriente',
  cbu: '1234567890123456789012',
  alias: null,
  moneda: 'ARS',
  activo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const movSuggested = {
  id: 1,
  cuentaId: 7,
  fecha: '2026-07-10T00:00:00.000Z',
  descripcion: 'TRANSFERENCIA RECIBIDA',
  importe: '1000.00',
  tipo: 'credito',
  referencia: 'REF-1',
  conciliadoTipo: null,
  matchEstado: 'suggested' as const,
  conciliadoId: null,
  conciliadoAt: null,
  matchScore: 55,
  matchSugerencias: [
    { tipo: 'cobro' as const, id: 5, clienteId: 3, importe: 1000, fecha: '2026-07-10T00:00:00.000Z', referencia: null },
  ],
  periodoLocked: false,
}

const movUnmatched = {
  id: 2,
  cuentaId: 7,
  fecha: '2026-07-11T00:00:00.000Z',
  descripcion: 'DEBITO VARIOS',
  importe: '250.00',
  tipo: 'debito',
  referencia: null,
  conciliadoTipo: null,
  matchEstado: 'unmatched' as const,
  conciliadoId: null,
  conciliadoAt: null,
  matchScore: null,
  matchSugerencias: null,
  periodoLocked: false,
}

const summary = {
  total: 2,
  unmatched: 1,
  suggested: 1,
  matchedAuto: 0,
  matchedManual: 0,
  ignored: 0,
  bankFees: 0,
  openCandidates: { recibosForma: 0, cobros: 1 },
}

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    bancosAPI: {
      listCuentas: vi.fn(),
      getConciliacion: vi.fn(),
      runMatching: vi.fn(),
      exportExcel: vi.fn(),
      conciliar: vi.fn(),
      confirmarSugerencia: vi.fn(),
      ignorar: vi.fn(),
      marcarGastoBancario: vi.fn(),
      lockPeriodo: vi.fn(),
      unlockPeriodo: vi.fn(),
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    claims: { role: 'owner', tenantId: 1, userId: 1, permissions: ['reports.financial.read'] },
  }),
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ConciliacionBancariaPage />
    </MemoryRouter>,
  )
}

describe('ConciliacionBancariaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    vi.mocked(bancosAPI.listCuentas).mockResolvedValue([cuenta])
    vi.mocked(bancosAPI.getConciliacion).mockResolvedValue({
      movimientos: [movSuggested, movUnmatched],
      summary,
    })
    vi.mocked(bancosAPI.runMatching).mockResolvedValue({
      processed: 2,
      autoMatched: 0,
      suggested: 1,
      unmatched: 1,
      bankFees: 0,
    })
    vi.mocked(bancosAPI.exportExcel).mockResolvedValue(new Blob(['xlsx']))
    vi.mocked(bancosAPI.conciliar).mockResolvedValue({ ...movUnmatched, matchEstado: 'matched_manual', conciliadoTipo: 'cobro', conciliadoId: 9 })
    vi.mocked(bancosAPI.confirmarSugerencia).mockResolvedValue({ ...movSuggested, matchEstado: 'matched_manual', conciliadoTipo: 'cobro', conciliadoId: 5 })
    vi.mocked(bancosAPI.ignorar).mockResolvedValue({ ...movUnmatched, matchEstado: 'ignored' })
    vi.mocked(bancosAPI.marcarGastoBancario).mockResolvedValue({ ...movUnmatched, matchEstado: 'bank_fee' })
    vi.mocked(bancosAPI.lockPeriodo).mockResolvedValue({ periodo: '2026-07', lockedAt: '2026-07-31T00:00:00.000Z' })
    vi.mocked(bancosAPI.unlockPeriodo).mockResolvedValue(null)
  })

  it('carga cuentas y movimientos con su resumen', async () => {
    renderPage()
    expect(await screen.findByTestId('conciliacion-bancaria-table')).toBeInTheDocument()
    expect(screen.getByTestId('conciliacion-bancaria-row-1')).toBeInTheDocument()
    expect(screen.getByTestId('conciliacion-bancaria-row-2')).toBeInTheDocument()
    expect(screen.getByTestId('conciliacion-bancaria-summary')).toBeInTheDocument()
  })

  it('muestra vacío sin cuentas', async () => {
    vi.mocked(bancosAPI.listCuentas).mockResolvedValue([])
    renderPage()
    expect(await screen.findByTestId('conciliacion-bancaria-no-cuentas')).toBeInTheDocument()
  })

  it('ejecuta el matching manual', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByTestId('conciliacion-bancaria-run')
    await user.click(screen.getByTestId('conciliacion-bancaria-run'))
    await waitFor(() => {
      expect(bancosAPI.runMatching).toHaveBeenCalledWith(7, expect.objectContaining({ desde: expect.any(String), hasta: expect.any(String) }))
    })
  })

  it('exporta el excel de conciliación', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByTestId('conciliacion-bancaria-export')

    const originalCreateElement = document.createElement.bind(document)
    const link = originalCreateElement('a')
    const clickSpy = vi.spyOn(link, 'click')
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      if (tagName === 'a') return link
      return originalCreateElement(tagName, options)
    })
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    await user.click(screen.getByTestId('conciliacion-bancaria-export'))
    await waitFor(() => {
      expect(bancosAPI.exportExcel).toHaveBeenCalledWith(7, expect.any(Object))
      expect(clickSpy).toHaveBeenCalled()
    })

    createElementSpy.mockRestore()
    createObjectURLSpy.mockRestore()
    revokeObjectURLSpy.mockRestore()
    clickSpy.mockRestore()
  })

  it('confirma una sugerencia', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByTestId('conciliacion-bancaria-row-1-confirm')
    await user.click(screen.getByTestId('conciliacion-bancaria-row-1-confirm'))
    await waitFor(() => {
      expect(bancosAPI.confirmarSugerencia).toHaveBeenCalledWith(1)
    })
  })

  it('ignora un movimiento', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByTestId('conciliacion-bancaria-row-2-ignore')
    await user.click(screen.getByTestId('conciliacion-bancaria-row-2-ignore'))
    await waitFor(() => {
      expect(bancosAPI.ignorar).toHaveBeenCalledWith(2)
    })
  })

  it('marca un movimiento como gasto bancario', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByTestId('conciliacion-bancaria-row-2-gasto')
    await user.click(screen.getByTestId('conciliacion-bancaria-row-2-gasto'))
    await waitFor(() => {
      expect(bancosAPI.marcarGastoBancario).toHaveBeenCalledWith(2)
    })
  })

  it('concilia manualmente ingresando tipo e id', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByTestId('conciliacion-bancaria-row-2-id')
    await user.type(screen.getByTestId('conciliacion-bancaria-row-2-id'), '9')
    await user.click(screen.getByTestId('conciliacion-bancaria-row-2-conciliar'))
    await waitFor(() => {
      expect(bancosAPI.conciliar).toHaveBeenCalledWith(2, { tipo: 'cobro', id: 9 })
    })
  })

  it('bloquea y desbloquea un período', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByTestId('conciliacion-bancaria-lock')
    await user.click(screen.getByTestId('conciliacion-bancaria-lock'))
    await waitFor(() => {
      expect(bancosAPI.lockPeriodo).toHaveBeenCalled()
    })
    await user.click(screen.getByTestId('conciliacion-bancaria-unlock'))
    await waitFor(() => {
      expect(bancosAPI.unlockPeriodo).toHaveBeenCalled()
    })
  })
})
