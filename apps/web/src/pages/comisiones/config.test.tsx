import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { comisionesAPI } from '@/lib/api'
import ComisionesConfigPage from './config'

vi.mock('@/lib/api', () => ({
  comisionesAPI: {
    listConfigs: vi.fn(),
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
    createConfig: vi.fn(),
    removeConfig: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('ComisionesConfigPage (#237)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(comisionesAPI.listConfigs).mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          tenantId: 1,
          vendedorId: 3,
          tipo: 'porcentaje_cobrado',
          alicuota: 3,
          vigenciaDesde: '2026-07-01T00:00:00.000Z',
          vigenciaHasta: null,
          articuloCategoriaId: null,
          clienteId: null,
          createdAt: '2026-07-01T00:00:00.000Z',
          updatedAt: '2026-07-01T00:00:00.000Z',
          vendedorUsername: 'seller1',
        },
      ],
      total: 1,
      take: 200,
      skip: 0,
    })
    vi.mocked(comisionesAPI.getSettings).mockResolvedValue({ modoDevengo: 'porcentaje_cobrado' })
    vi.mocked(comisionesAPI.createConfig).mockResolvedValue({
      id: 2,
      tenantId: 1,
      vendedorId: 4,
      tipo: 'porcentaje_cobrado',
      alicuota: 2,
      vigenciaDesde: '2026-07-01T00:00:00.000Z',
      vigenciaHasta: null,
      articuloCategoriaId: null,
      clienteId: null,
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-01T00:00:00.000Z',
    })
  })

  it('renders configs table', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ComisionesConfigPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('comisiones-configs-table')).toBeInTheDocument()
    })
    expect(screen.getByTestId('comision-config-row-1')).toBeInTheDocument()
  })

  it('creates a config', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <ComisionesConfigPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('comision-config-form')).toBeInTheDocument())
    await user.type(screen.getByTestId('comision-vendedor'), '4')
    await user.clear(screen.getByTestId('comision-alicuota'))
    await user.type(screen.getByTestId('comision-alicuota'), '2')
    await user.click(screen.getByTestId('comision-create'))
    await waitFor(() => {
      expect(comisionesAPI.createConfig).toHaveBeenCalledWith(
        expect.objectContaining({ vendedorId: 4, alicuota: 2 }),
      )
    })
  })
})
