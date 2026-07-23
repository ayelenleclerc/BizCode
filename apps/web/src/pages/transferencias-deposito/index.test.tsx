import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { depositosAPI } from '@/lib/api'
import TransferenciasDepositoPage from './index'

vi.mock('@/lib/api', () => ({
  depositosAPI: {
    listTransferencias: vi.fn(),
    listDepositos: vi.fn(),
    createTransferencia: vi.fn(),
    markEnTransito: vi.fn(),
    recibirTransferencia: vi.fn(),
    anularTransferencia: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const DEPOSITOS = [
  {
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
  },
  {
    id: 2,
    tenantId: 1,
    nombre: 'Norte',
    codigo: 'NORTE',
    tipo: 'sucursal' as const,
    direccion: null,
    responsableId: null,
    activo: true,
    esDefault: false,
    createdAt: '2026-07-23T00:00:00.000Z',
    updatedAt: '2026-07-23T00:00:00.000Z',
  },
]

const TRANSF_PENDIENTE = {
  id: 9,
  tenantId: 1,
  numero: 1,
  origenId: 1,
  destinoId: 2,
  origenCodigo: 'DEFAULT',
  destinoCodigo: 'NORTE',
  estado: 'pendiente' as const,
  solicitadoPorId: 3,
  aprobadoPorId: null,
  fechaEnvio: null,
  fechaRecepcion: null,
  nota: null,
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
  items: [
    {
      id: 1,
      transferenciaId: 9,
      articuloId: 5,
      cantidadEnviada: 3,
      cantidadRecibida: null,
    },
  ],
}

const TRANSF_TRANSITO = {
  ...TRANSF_PENDIENTE,
  id: 10,
  numero: 2,
  estado: 'en_transito' as const,
}

describe('TransferenciasDepositoPage (#236)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(depositosAPI.listDepositos).mockResolvedValue({
      success: true,
      data: DEPOSITOS,
      total: 2,
      take: 200,
      skip: 0,
    })
    vi.mocked(depositosAPI.listTransferencias).mockResolvedValue({
      success: true,
      data: [TRANSF_PENDIENTE, TRANSF_TRANSITO],
      total: 2,
      take: 100,
      skip: 0,
    })
    vi.mocked(depositosAPI.createTransferencia).mockResolvedValue(TRANSF_PENDIENTE)
    vi.mocked(depositosAPI.markEnTransito).mockResolvedValue({
      ...TRANSF_PENDIENTE,
      estado: 'en_transito',
    })
    vi.mocked(depositosAPI.recibirTransferencia).mockResolvedValue({
      ...TRANSF_TRANSITO,
      estado: 'recibida',
    })
    vi.mocked(depositosAPI.anularTransferencia).mockResolvedValue({
      ...TRANSF_PENDIENTE,
      estado: 'anulada',
    })
  })

  it('renders transfers table', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <TransferenciasDepositoPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('transferencias-table')).toBeInTheDocument()
    })
    expect(screen.getByTestId('transf-row-9')).toBeInTheDocument()
    expect(screen.getByTestId('transf-row-10')).toBeInTheDocument()
  })

  it('creates a transfer', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <TransferenciasDepositoPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('transferencia-form')).toBeInTheDocument())

    await user.selectOptions(screen.getByTestId('transf-origen'), '1')
    await user.selectOptions(screen.getByTestId('transf-destino'), '2')
    await user.type(screen.getByTestId('transf-articulo'), '5')
    await user.clear(screen.getByTestId('transf-cantidad'))
    await user.type(screen.getByTestId('transf-cantidad'), '4')
    await user.click(screen.getByTestId('transf-create'))

    await waitFor(() => {
      expect(depositosAPI.createTransferencia).toHaveBeenCalledWith({
        origenId: 1,
        destinoId: 2,
        items: [{ articuloId: 5, cantidadEnviada: 4 }],
      })
    })
  })

  it('marks pendiente transfer as en_transito', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <TransferenciasDepositoPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('transf-en-transito-9')).toBeInTheDocument())
    await user.click(screen.getByTestId('transf-en-transito-9'))
    await waitFor(() => {
      expect(depositosAPI.markEnTransito).toHaveBeenCalledWith(9)
    })
  })

  it('receives en_transito transfer', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <TransferenciasDepositoPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('transf-recibir-10')).toBeInTheDocument())
    await user.click(screen.getByTestId('transf-recibir-10'))
    await waitFor(() => {
      expect(depositosAPI.recibirTransferencia).toHaveBeenCalledWith(10, {
        items: [{ articuloId: 5, cantidadRecibida: 3 }],
      })
    })
  })
})
