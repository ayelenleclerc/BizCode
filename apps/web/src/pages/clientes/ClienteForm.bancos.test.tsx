import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import ClienteForm from './ClienteForm'
import { clientesAPI, listasPreciosAPI, zonasEntregaAPI } from '@/lib/api'
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
  }
})

// Valid Argentine CBU (same fixture used in apps/web/src/lib/validators.test.ts).
const VALID_CBU = '2850590940090418135201'

const existingCliente: Cliente = {
  id: 9,
  codigo: 900,
  rsocial: 'Bancos Co',
  fantasia: 'Banc',
  cuit: '20-99999999-9',
  condIva: 'RI',
  domicilio: 'Av Test 9',
  localidad: 'CABA',
  cpost: '1000',
  telef: '1111',
  email: 'bancos@example.com',
  activo: true,
  creditLimit: null,
  creditDays: 0,
  balance: 0,
  balanceInicial: 0,
  score: 50,
  suspended: false,
  deliveryZoneId: null,
  listaPrecioId: null,
  cbu: VALID_CBU,
  alias: 'bancos.co.mp',
  anonymizedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

describe('ClienteForm cbu/alias (#191)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    vi.mocked(zonasEntregaAPI.list).mockResolvedValue([])
    vi.mocked(listasPreciosAPI.list).mockResolvedValue({ data: [], total: 0 } as never)
  })

  it('prefills cbu and alias when editing an existing customer', async () => {
    render(<ClienteForm cliente={existingCliente} onClose={vi.fn()} onGuardado={vi.fn()} />)

    expect(await screen.findByTestId('cliente-form-cbu')).toHaveValue(VALID_CBU)
    expect(screen.getByTestId('cliente-form-alias')).toHaveValue('bancos.co.mp')
  }, 15000)

  it('creates a customer including cbu and alias in the request body', async () => {
    const user = userEvent.setup()
    const onGuardado = vi.fn()
    vi.mocked(clientesAPI.create).mockResolvedValue(existingCliente)

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={onGuardado} />)

    await user.type(screen.getByTestId('cliente-form-codigo'), '901')
    await user.type(screen.getByTestId('cliente-form-rsocial'), 'Nuevo Cliente Bancos SA')
    await user.type(screen.getByTestId('cliente-form-cbu'), VALID_CBU)
    await user.type(screen.getByTestId('cliente-form-alias'), 'nuevo.cliente.mp')
    await user.click(screen.getByTestId('cliente-privacy-consent-input'))
    await user.click(screen.getByTestId('btn-save-cliente'))

    await waitFor(() => {
      expect(clientesAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({ cbu: VALID_CBU, alias: 'nuevo.cliente.mp' }),
      )
    })
  })

  it('shows a validation error for an invalid cbu and blocks submission', async () => {
    const user = userEvent.setup()
    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={vi.fn()} />)

    await user.type(screen.getByTestId('cliente-form-codigo'), '902')
    await user.type(screen.getByTestId('cliente-form-rsocial'), 'Otro Cliente SA')
    await user.type(screen.getByTestId('cliente-form-cbu'), '12345')
    await user.click(screen.getByTestId('cliente-privacy-consent-input'))
    await user.click(screen.getByTestId('btn-save-cliente'))

    expect(await screen.findByText('CBU inválido')).toBeInTheDocument()
    expect(clientesAPI.create).not.toHaveBeenCalled()
  })

  it('allows saving without cbu/alias since both are optional', async () => {
    const user = userEvent.setup()
    vi.mocked(clientesAPI.create).mockResolvedValue(existingCliente)

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={vi.fn()} />)

    await user.type(screen.getByTestId('cliente-form-codigo'), '903')
    await user.type(screen.getByTestId('cliente-form-rsocial'), 'Cliente Sin Banco SA')
    await user.click(screen.getByTestId('cliente-privacy-consent-input'))
    await user.click(screen.getByTestId('btn-save-cliente'))

    await waitFor(() => {
      expect(clientesAPI.create).toHaveBeenCalled()
    })
  })
})
