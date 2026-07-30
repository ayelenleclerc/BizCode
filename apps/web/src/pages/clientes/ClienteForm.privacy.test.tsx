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
      exportarDatos: vi.fn(),
      anonimizar: vi.fn(),
    },
    zonasEntregaAPI: {
      list: vi.fn().mockResolvedValue([]),
    },
    listasPreciosAPI: {
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
  }
})

const existingCliente: Cliente = {
  id: 7,
  codigo: 700,
  rsocial: 'Privacy Co',
  fantasia: 'Priv',
  cuit: '20-99999999-9',
  condIva: 'RI',
  domicilio: 'Av Test 1',
  localidad: 'CABA',
  cpost: '1000',
  telef: '1111',
  email: 'privacy@example.com',
  activo: true,
  creditLimit: null,
  creditDays: 0,
  balance: 0,
  balanceInicial: 0,
  score: 50,
  suspended: false,
  deliveryZoneId: null,
  listaPrecioId: null,
  anonymizedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

describe('ClienteForm privacy (#195)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    vi.mocked(zonasEntregaAPI.list).mockResolvedValue([])
    vi.mocked(listasPreciosAPI.list).mockResolvedValue({ data: [], total: 0 } as never)
  })

  it('blocks create without privacy consent', async () => {
    const user = userEvent.setup()
    vi.mocked(clientesAPI.create).mockResolvedValue(existingCliente)

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={vi.fn()} />)

    expect(screen.getByTestId('cliente-privacy-consent')).toBeInTheDocument()
    await user.type(screen.getByTestId('cliente-form-codigo'), '701')
    await user.type(screen.getByTestId('cliente-form-rsocial'), 'Nuevo Cliente SA')
    await user.click(screen.getByTestId('btn-save-cliente'))

    expect(await screen.findByTestId('cliente-form-error')).toBeInTheDocument()
    expect(clientesAPI.create).not.toHaveBeenCalled()
  })

  it('creates after checking privacy consent', async () => {
    const user = userEvent.setup()
    const onGuardado = vi.fn()
    vi.mocked(clientesAPI.create).mockResolvedValue(existingCliente)

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={onGuardado} />)

    await user.type(screen.getByTestId('cliente-form-codigo'), '701')
    await user.type(screen.getByTestId('cliente-form-rsocial'), 'Nuevo Cliente SA')
    await user.click(screen.getByTestId('cliente-privacy-consent-input'))
    await user.click(screen.getByTestId('btn-save-cliente'))

    await waitFor(() => {
      expect(clientesAPI.create).toHaveBeenCalled()
    })
    expect(onGuardado).toHaveBeenCalled()
  })

  it('exports customer data package and anonymizes with confirm', async () => {
    const user = userEvent.setup()
    const onGuardado = vi.fn()
    const blob = new Blob(['cliente,rsocial'], { type: 'text/csv' })
    vi.mocked(clientesAPI.exportarDatos).mockResolvedValue(blob)
    vi.mocked(clientesAPI.anonimizar).mockResolvedValue({
      ...existingCliente,
      rsocial: 'ANON-7',
      activo: false,
      anonymizedAt: '2026-07-30T00:00:00.000Z',
    })

    const createObjectURL = vi.fn(() => 'blob:privacy')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })

    render(<ClienteForm cliente={existingCliente} onClose={vi.fn()} onGuardado={onGuardado} />)

    expect(screen.getByTestId('cliente-privacy-actions')).toBeInTheDocument()
    await user.click(screen.getByTestId('cliente-privacy-export'))
    await waitFor(() => {
      expect(clientesAPI.exportarDatos).toHaveBeenCalledWith(7, 'csv')
    })
    expect(await screen.findByTestId('cliente-privacy-notice')).toBeInTheDocument()

    await user.click(screen.getByTestId('cliente-privacy-anonymize-open'))
    expect(screen.getByTestId('cliente-privacy-anonymize-panel')).toBeInTheDocument()
    await user.type(screen.getByTestId('cliente-anonymize-confirm'), 'ANONYMIZE')
    await user.click(screen.getByTestId('cliente-anonymize-submit'))

    await waitFor(() => {
      expect(clientesAPI.anonimizar).toHaveBeenCalledWith(7, 'ANONYMIZE')
    })
    expect(onGuardado).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('shows anonymized banner and hides privacy actions', () => {
    render(
      <ClienteForm
        cliente={{ ...existingCliente, anonymizedAt: '2026-07-30T00:00:00.000Z' }}
        onClose={vi.fn()}
        onGuardado={vi.fn()}
      />,
    )
    expect(screen.getByTestId('cliente-anonymized-banner')).toBeInTheDocument()
    expect(screen.queryByTestId('cliente-privacy-actions')).not.toBeInTheDocument()
  })
})
