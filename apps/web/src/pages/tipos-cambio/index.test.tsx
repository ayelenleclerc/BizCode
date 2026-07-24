import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { tiposCambioAPI } from '@/lib/api'
import TiposCambioPage from './index'

vi.mock('@/lib/api', () => ({
  tiposCambioAPI: {
    list: vi.fn(),
    getPreferido: vi.fn(),
    setPreferido: vi.fn(),
    createManual: vi.fn(),
    syncBcra: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const RATE_ROW = {
  id: 1,
  tenantId: 1,
  moneda: 'USD' as const,
  tipo: 'oficial' as const,
  valor: 1250,
  fecha: '2026-07-24T12:00:00.000Z',
  fuente: 'bcra_api' as const,
  createdById: null,
  createdAt: '2026-07-24T12:00:00.000Z',
}

describe('TiposCambioPage (#243)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(tiposCambioAPI.list).mockResolvedValue({
      success: true,
      data: [RATE_ROW],
      total: 1,
      take: 100,
      skip: 0,
    })
    vi.mocked(tiposCambioAPI.getPreferido).mockResolvedValue({
      tipoCambioPreferido: 'oficial',
    })
    vi.mocked(tiposCambioAPI.setPreferido).mockResolvedValue({
      tipoCambioPreferido: 'mep',
    })
    vi.mocked(tiposCambioAPI.createManual).mockResolvedValue({
      row: { ...RATE_ROW, id: 2, tipo: 'manual', fuente: 'manual' },
      recalc: { updatedCount: 1, moneda: 'USD', tipo: 'manual', valor: 1300 },
    })
    vi.mocked(tiposCambioAPI.syncBcra).mockResolvedValue({
      row: RATE_ROW,
      recalc: { updatedCount: 2, moneda: 'USD', tipo: 'oficial', valor: 1250 },
    })
  })

  it('loads history table and preferred type', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <TiposCambioPage />
      </I18nextProvider>,
    )

    expect(screen.getByTestId('tipos-cambio-page')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('tipos-cambio-table')).toBeInTheDocument()
    })
    expect(tiposCambioAPI.list).toHaveBeenCalled()
    expect(tiposCambioAPI.getPreferido).toHaveBeenCalled()
    expect(screen.getByTestId('tipos-cambio-preferred')).toHaveValue('oficial')
  })

  it('shows empty state when there is no history', async () => {
    vi.mocked(tiposCambioAPI.list).mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      take: 100,
      skip: 0,
    })

    render(
      <I18nextProvider i18n={i18n}>
        <TiposCambioPage />
      </I18nextProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('tipos-cambio-empty')).toBeInTheDocument()
    })
  })

  it('shows load error when history request fails', async () => {
    vi.mocked(tiposCambioAPI.list).mockRejectedValue(new Error('network'))

    render(
      <I18nextProvider i18n={i18n}>
        <TiposCambioPage />
      </I18nextProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('tipos-cambio-error')).toBeInTheDocument()
    })
  })

  it('saves preferred exchange-rate type', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <TiposCambioPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('tipos-cambio-preferred')).toBeInTheDocument())

    await user.selectOptions(screen.getByTestId('tipos-cambio-preferred'), 'mep')
    await user.click(screen.getByTestId('tipos-cambio-save-preferred'))

    await waitFor(() => {
      expect(tiposCambioAPI.setPreferido).toHaveBeenCalledWith('mep')
      expect(screen.getByTestId('tipos-cambio-success')).toBeInTheDocument()
    })
  })

  it('rejects invalid manual value and creates a valid manual rate', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <TiposCambioPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('tipos-cambio-manual-form')).toBeInTheDocument())

    fireEvent.change(screen.getByTestId('tipos-cambio-valor'), { target: { value: '0' } })
    fireEvent.submit(screen.getByTestId('tipos-cambio-manual-form'))
    await waitFor(() => {
      expect(screen.getByTestId('tipos-cambio-error')).toBeInTheDocument()
    })
    expect(tiposCambioAPI.createManual).not.toHaveBeenCalled()

    await user.clear(screen.getByTestId('tipos-cambio-valor'))
    await user.type(screen.getByTestId('tipos-cambio-valor'), '1300')
    await user.type(screen.getByTestId('tipos-cambio-fecha'), '2026-07-24')
    await user.click(screen.getByTestId('tipos-cambio-save-manual'))

    await waitFor(() => {
      expect(tiposCambioAPI.createManual).toHaveBeenCalledWith(
        expect.objectContaining({
          moneda: 'USD',
          tipo: 'manual',
          valor: 1300,
          fecha: '2026-07-24',
        }),
      )
      expect(screen.getByTestId('tipos-cambio-success')).toBeInTheDocument()
    })
  })

  it('syncs official USD rate from BCRA', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <TiposCambioPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('tipos-cambio-sync-bcra')).toBeInTheDocument())
    await user.click(screen.getByTestId('tipos-cambio-sync-bcra'))

    await waitFor(() => {
      expect(tiposCambioAPI.syncBcra).toHaveBeenCalledWith('USD')
      expect(screen.getByTestId('tipos-cambio-success')).toBeInTheDocument()
    })
  })

  it('surfaces preference, manual and sync action errors', async () => {
    const user = userEvent.setup()
    vi.mocked(tiposCambioAPI.setPreferido).mockRejectedValue(new Error('pref'))
    vi.mocked(tiposCambioAPI.createManual).mockRejectedValue(new Error('manual'))
    vi.mocked(tiposCambioAPI.syncBcra).mockRejectedValue(new Error('sync'))

    render(
      <I18nextProvider i18n={i18n}>
        <TiposCambioPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('tipos-cambio-save-preferred')).toBeInTheDocument())

    await user.click(screen.getByTestId('tipos-cambio-save-preferred'))
    await waitFor(() => expect(screen.getByTestId('tipos-cambio-error')).toBeInTheDocument())

    await user.type(screen.getByTestId('tipos-cambio-valor'), '1100')
    await user.click(screen.getByTestId('tipos-cambio-save-manual'))
    await waitFor(() => expect(tiposCambioAPI.createManual).toHaveBeenCalled())
    expect(screen.getByTestId('tipos-cambio-error')).toBeInTheDocument()

    await user.click(screen.getByTestId('tipos-cambio-sync-bcra'))
    await waitFor(() => expect(tiposCambioAPI.syncBcra).toHaveBeenCalled())
    expect(screen.getByTestId('tipos-cambio-error')).toBeInTheDocument()
  })
})
