import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import ChequesSection from './ChequesSection'
import { chequesAPI, type ChequeDTO } from '@/lib/api'

const baseCheque = (overrides: Partial<ChequeDTO> = {}): ChequeDTO => ({
  id: 1,
  tipo: 'recibido',
  modalidad: 'fisico',
  numero: '12345678',
  banco: 'Galicia',
  sucursal: null,
  cbuOrigen: null,
  libradorNombre: 'Cliente SA',
  libradorCuit: null,
  monto: '15000.00',
  moneda: 'ARS',
  fechaEmision: '2026-06-01T12:00:00.000Z',
  fechaVencimiento: new Date(Date.now() + 2 * 86400000).toISOString(),
  estado: 'en_cartera',
  clienteId: 1,
  proveedorId: null,
  observaciones: null,
  cliente: { id: 1, codigo: 1, rsocial: 'Cliente SA', cuit: '20123456789' },
  ...overrides,
})

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    chequesAPI: {
      list: vi.fn(),
      resumen: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      depositar: vi.fn(),
      endosar: vi.fn(),
      descontar: vi.fn(),
      cobrar: vi.fn(),
      rechazar: vi.fn(),
      devolverACartera: vi.fn(),
      anular: vi.fn(),
    },
  }
})

describe('ChequesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    vi.mocked(chequesAPI.list).mockResolvedValue({ data: [baseCheque()], total: 1 })
    vi.mocked(chequesAPI.resumen).mockResolvedValue({
      enCartera: { count: 1, total: '15000.00' },
      proximosVencer: { count: 1, total: '15000.00' },
      rechazados: { count: 0, total: '0.00' },
    })
    vi.mocked(chequesAPI.depositar).mockResolvedValue(baseCheque({ estado: 'depositado' }))
  })

  it('carga listado y resumen', async () => {
    render(<ChequesSection />)
    expect(await screen.findByTestId('cheques-section')).toBeInTheDocument()
    expect(screen.getByTestId('cheques-table')).toBeInTheDocument()
    expect(screen.getByTestId('cheques-resumen')).toBeInTheDocument()
    expect(screen.getByTestId('cheque-due-soon-1')).toBeInTheDocument()
  })

  it('muestra vacío sin cheques', async () => {
    vi.mocked(chequesAPI.list).mockResolvedValue({ data: [], total: 0 })
    render(<ChequesSection />)
    expect(await screen.findByTestId('cheques-empty')).toBeInTheDocument()
  })

  it('deposita cheque en cartera', async () => {
    const user = userEvent.setup()
    render(<ChequesSection />)
    await screen.findByTestId('cheque-row-1')
    await user.click(screen.getByTestId('cheque-depositar-1'))
    await waitFor(() => {
      expect(chequesAPI.depositar).toHaveBeenCalledWith(1, { destino: 'Depósito' })
    })
  })
})
