import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import ClienteForm from './ClienteForm'
import { arcaAPI, clientesAPI, listasPreciosAPI, zonasEntregaAPI } from '@/lib/api'
import type { PadronA4ConsultaDto } from '@/lib/api'
import type { Cliente } from '@bizcode/types'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    claims: { role: 'owner', permissions: ['customers.manage'] },
  }),
}))

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: () => ({ jurisdiccionFiscal: 'AR' }),
}))

vi.mock('@/components/IfModule', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('./ClienteCobrosRecientes', () => ({
  default: () => <div data-testid="cliente-cobros-recientes-stub" />,
}))

vi.mock('./ClienteCuentaCorrienteSection', () => ({
  default: () => <div data-testid="cliente-cc-stub" />,
}))

vi.mock('./ClienteFidelizacionSection', () => ({
  default: () => <div data-testid="cliente-fidelizacion-stub" />,
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    clientesAPI: {
      ...actual.clientesAPI,
      create: vi.fn(),
      update: vi.fn(),
    },
    zonasEntregaAPI: {
      list: vi.fn().mockResolvedValue([]),
    },
    listasPreciosAPI: {
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    arcaAPI: {
      ...actual.arcaAPI,
      consultaPadron: vi.fn(),
    },
  }
})

const VALID_KNOWN_CUIT = '20-11111111-2'
const VALID_NOT_FOUND_CUIT = '20-22222222-3'
const VALID_TIMEOUT_CUIT = '20-33333333-4'

function verifiedResult(overrides: Partial<PadronA4ConsultaDto> = {}): PadronA4ConsultaDto {
  return {
    cuit: '20111111112',
    verificado: true,
    available: true,
    reason: 'ok',
    fromCache: false,
    fetchedAt: '2026-07-31T00:00:00.000Z',
    razonSocial: 'DEMO SA PADRON A4 MOCK LARGO NOMBRE',
    razonSocialTruncada: 'DEMO SA PADRON A4 MOCK LARGO N',
    razonSocialTruncadaFlag: true,
    domicilio: 'Av Corrientes 1234',
    localidad: 'CABA',
    cpost: '1043',
    condIva: 'RI',
    estado: 'activo',
    categoriaMonotributo: null,
    ...overrides,
  }
}

function emptyResult(reason: PadronA4ConsultaDto['reason']): PadronA4ConsultaDto {
  return {
    cuit: '20222222223',
    verificado: false,
    available: reason === 'not_found',
    reason,
    fromCache: false,
    fetchedAt: null,
    razonSocial: null,
    razonSocialTruncada: null,
    razonSocialTruncadaFlag: false,
    domicilio: null,
    localidad: null,
    cpost: null,
    condIva: null,
    estado: null,
    categoriaMonotributo: null,
  }
}

describe('ClienteForm AFIP Padrón A4 lookup (#192)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    vi.mocked(zonasEntregaAPI.list).mockResolvedValue([])
    vi.mocked(listasPreciosAPI.list).mockResolvedValue({ data: [], total: 0 } as never)
  })

  it('autofills rsocial (truncated), condIva, domicilio, localidad and cpost when verified', async () => {
    const user = userEvent.setup()
    vi.mocked(arcaAPI.consultaPadron).mockResolvedValue(verifiedResult())

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={vi.fn()} />)

    await user.type(screen.getByTestId('cliente-form-cuit'), VALID_KNOWN_CUIT)
    await user.tab()

    await waitFor(() => {
      expect(arcaAPI.consultaPadron).toHaveBeenCalledWith(VALID_KNOWN_CUIT)
    })

    await waitFor(() => {
      expect(screen.getByTestId('cliente-padron-status')).toHaveAttribute('data-status', 'verified')
    })
    expect(screen.getByTestId('cliente-form-rsocial')).toHaveValue('DEMO SA PADRON A4 MOCK LARGO N')
    expect(screen.getByLabelText(/Condición IVA/i)).toHaveValue('RI')
    expect(screen.getByLabelText(/^Domicilio/i)).toHaveValue('Av Corrientes 1234')
    expect(screen.getByLabelText(/Localidad/i)).toHaveValue('CABA')
    expect(screen.getByLabelText(/Código Postal/i)).toHaveValue('1043')
    expect(screen.getByTestId('cliente-padron-truncated-warning')).toBeInTheDocument()
  })

  it('shows not_found status without autofilling and without blocking the form', async () => {
    const user = userEvent.setup()
    vi.mocked(arcaAPI.consultaPadron).mockResolvedValue(emptyResult('not_found'))

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={vi.fn()} />)

    await user.type(screen.getByTestId('cliente-form-cuit'), VALID_NOT_FOUND_CUIT)
    await user.tab()

    await waitFor(() => {
      expect(screen.getByTestId('cliente-padron-status')).toHaveAttribute('data-status', 'not_found')
    })
    expect(screen.queryByTestId('cliente-padron-truncated-warning')).not.toBeInTheDocument()
    expect(screen.getByTestId('cliente-form-rsocial')).toHaveValue('')
  })

  it('shows timeout status when the lookup times out', async () => {
    const user = userEvent.setup()
    vi.mocked(arcaAPI.consultaPadron).mockResolvedValue(emptyResult('timeout'))

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={vi.fn()} />)

    await user.type(screen.getByTestId('cliente-form-cuit'), VALID_TIMEOUT_CUIT)
    await user.tab()

    await waitFor(() => {
      expect(screen.getByTestId('cliente-padron-status')).toHaveAttribute('data-status', 'timeout')
    })
  })

  it('shows unavailable status when the API call fails, without blocking submit', async () => {
    const user = userEvent.setup()
    const onGuardado = vi.fn()
    vi.mocked(arcaAPI.consultaPadron).mockRejectedValue(new Error('network error'))
    vi.mocked(clientesAPI.create).mockResolvedValue({ id: 1 } as Cliente)

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={onGuardado} />)

    await user.type(screen.getByTestId('cliente-form-cuit'), VALID_KNOWN_CUIT)
    await user.tab()

    await waitFor(() => {
      expect(screen.getByTestId('cliente-padron-status')).toHaveAttribute('data-status', 'unavailable')
    })

    await user.type(screen.getByTestId('cliente-form-codigo'), '950')
    await user.type(screen.getByTestId('cliente-form-rsocial'), 'Cliente Manual SA')
    await user.click(screen.getByTestId('cliente-privacy-consent-input'))
    await user.click(screen.getByTestId('btn-save-cliente'))

    await waitFor(() => {
      expect(clientesAPI.create).toHaveBeenCalled()
    })
  })

  it('shows invalid status for a malformed CUIT and does not call the API', async () => {
    const user = userEvent.setup()

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={vi.fn()} />)

    await user.type(screen.getByTestId('cliente-form-cuit'), '123')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByTestId('cliente-padron-status')).toHaveAttribute('data-status', 'invalid')
    })
    expect(arcaAPI.consultaPadron).not.toHaveBeenCalled()
  })

  it('does not show a status when the CUIT field is left empty', async () => {
    const user = userEvent.setup()

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={vi.fn()} />)

    await user.click(screen.getByTestId('cliente-form-cuit'))
    await user.tab()

    expect(screen.queryByTestId('cliente-padron-status')).not.toBeInTheDocument()
    expect(arcaAPI.consultaPadron).not.toHaveBeenCalled()
  })
})
