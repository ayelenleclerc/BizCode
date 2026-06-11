import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PortalMisDatosPage from './PortalMisDatosPage'

const portalT = (key: string, opts?: { name?: string }) =>
  opts?.name ? `${key}:${opts.name}` : key

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: portalT }),
}))

const mockUsePortalAuth = vi.fn()

vi.mock('@/contexts/PortalAuthContext', () => ({
  usePortalAuth: () => mockUsePortalAuth(),
}))

describe('PortalMisDatosPage', () => {
  it('renders customer profile fields', () => {
    mockUsePortalAuth.mockReturnValue({
      me: {
        rsocial: 'Cliente Demo SA',
        codigo: 'C001',
        email: 'cliente@example.com',
        telef: '11-2222-3333',
        domicilio: 'Calle 1',
        localidad: 'CABA',
        vendedor: { username: 'vendedor1' },
      },
    })
    render(<PortalMisDatosPage />)
    expect(screen.getByTestId('portal-mis-datos-page')).toBeInTheDocument()
    expect(screen.getByText('Cliente Demo SA')).toBeInTheDocument()
    expect(screen.getByText('misDatos.vendedorContact:vendedor1')).toBeInTheDocument()
  })

  it('shows message when customer has no assigned seller', () => {
    mockUsePortalAuth.mockReturnValue({
      me: {
        rsocial: 'Cliente Demo SA',
        codigo: 'C001',
        email: null,
        telef: null,
        domicilio: null,
        localidad: null,
        vendedor: null,
      },
    })
    render(<PortalMisDatosPage />)
    expect(screen.getByText('misDatos.sinVendedor')).toBeInTheDocument()
  })
})
