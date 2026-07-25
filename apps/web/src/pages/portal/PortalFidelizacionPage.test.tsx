import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import PortalFidelizacionPage from './PortalFidelizacionPage'
import { portalAPI } from '@/lib/portalApi'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/contexts/PortalAuthContext', () => ({
  usePortalAuth: () => ({
    tenantSlug: 'demo',
  }),
}))

vi.mock('@/lib/portalApi', () => ({
  portalAPI: {
    getFidelizacion: vi.fn(),
  },
}))

describe('PortalFidelizacionPage (#250)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders active program balance', async () => {
    vi.mocked(portalAPI.getFidelizacion).mockResolvedValue({
      puntos: 120,
      equivalenteDinero: 120,
      programaActivo: true,
      nombrePrograma: 'Programa Demo',
    })
    render(<PortalFidelizacionPage />)
    expect(await screen.findByTestId('portal-fidelizacion-puntos')).toHaveTextContent('120')
    expect(screen.getByTestId('portal-fidelizacion-equiv')).toBeInTheDocument()
    expect(screen.getByText('Programa Demo')).toBeInTheDocument()
  })

  it('shows inactive message when program is off', async () => {
    vi.mocked(portalAPI.getFidelizacion).mockResolvedValue({
      puntos: 0,
      equivalenteDinero: 0,
      programaActivo: false,
      nombrePrograma: null,
    })
    render(<PortalFidelizacionPage />)
    expect(await screen.findByTestId('portal-fidelizacion-inactive')).toBeInTheDocument()
  })

  it('shows error when API fails', async () => {
    vi.mocked(portalAPI.getFidelizacion).mockRejectedValue(new Error('network'))
    render(<PortalFidelizacionPage />)
    await waitFor(() => {
      expect(screen.getByTestId('portal-fidelizacion-error')).toHaveTextContent('network')
    })
  })
})
