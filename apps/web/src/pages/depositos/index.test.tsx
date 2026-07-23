import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { depositosAPI } from '@/lib/api'
import DepositosPage from './index'

vi.mock('@/lib/api', () => ({
  depositosAPI: {
    listDepositos: vi.fn(),
    createDeposito: vi.fn(),
    removeDeposito: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const DEPOSITO = {
  id: 1,
  tenantId: 1,
  nombre: 'Central',
  codigo: 'DEFAULT',
  tipo: 'central' as const,
  direccion: null,
  responsableId: null,
  activo: true,
  esDefault: true,
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
}

const SUCURSAL = {
  ...DEPOSITO,
  id: 2,
  nombre: 'Sucursal Norte',
  codigo: 'NORTE',
  tipo: 'sucursal' as const,
  esDefault: false,
}

describe('DepositosPage (#236)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(depositosAPI.listDepositos).mockResolvedValue({
      success: true,
      data: [DEPOSITO, SUCURSAL],
      total: 2,
      take: 200,
      skip: 0,
    })
    vi.mocked(depositosAPI.createDeposito).mockResolvedValue(SUCURSAL)
    vi.mocked(depositosAPI.removeDeposito).mockResolvedValue(undefined)
  })

  it('renders warehouses table', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DepositosPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('depositos-table')).toBeInTheDocument()
    })
    expect(screen.getByTestId('deposito-row-1')).toBeInTheDocument()
    expect(screen.getByTestId('deposito-row-2')).toBeInTheDocument()
  })

  it('creates a warehouse', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <DepositosPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('deposito-form')).toBeInTheDocument())

    await user.type(screen.getByTestId('deposito-nombre'), 'Sur')
    await user.type(screen.getByTestId('deposito-codigo'), 'SUR')
    await user.click(screen.getByTestId('deposito-create'))

    await waitFor(() => {
      expect(depositosAPI.createDeposito).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Sur', codigo: 'SUR', tipo: 'sucursal' }),
      )
    })
  })

  it('deletes a non-default warehouse after confirm', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(
      <I18nextProvider i18n={i18n}>
        <DepositosPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('deposito-delete-2')).toBeInTheDocument())
    await user.click(screen.getByTestId('deposito-delete-2'))
    await waitFor(() => {
      expect(depositosAPI.removeDeposito).toHaveBeenCalledWith(2)
    })
  })

  it('shows empty state', async () => {
    vi.mocked(depositosAPI.listDepositos).mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      take: 200,
      skip: 0,
    })
    render(
      <I18nextProvider i18n={i18n}>
        <DepositosPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('depositos-empty')).toBeInTheDocument()
    })
  })

  it('shows action error when create fails', async () => {
    const user = userEvent.setup()
    vi.mocked(depositosAPI.createDeposito).mockRejectedValue(new Error('boom-create'))
    render(
      <I18nextProvider i18n={i18n}>
        <DepositosPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('deposito-form')).toBeInTheDocument())
    await user.type(screen.getByTestId('deposito-nombre'), 'Sur')
    await user.type(screen.getByTestId('deposito-codigo'), 'SUR')
    await user.click(screen.getByTestId('deposito-create'))
    await waitFor(() => {
      expect(screen.getByTestId('depositos-action-error')).toHaveTextContent('boom-create')
    })
  })
})
