import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PortalVerifyPage from './PortalVerifyPage'
import { portalAPI } from '@/lib/portalApi'

const portalT = (key: string) => key
const setSessionFromVerify = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: portalT }),
}))

vi.mock('@/contexts/PortalAuthContext', () => ({
  usePortalAuth: () => ({
    tenantSlug: 'demo',
    status: 'unauthenticated',
    setSessionFromVerify,
  }),
}))

vi.mock('@/lib/portalApi', () => ({
  portalAPI: {
    verifyToken: vi.fn(),
  },
}))

describe('PortalVerifyPage', () => {
  it('shows error when token is missing', () => {
    render(
      <MemoryRouter initialEntries={['/portal/demo/verify']}>
        <Routes>
          <Route path="/portal/:tenantSlug/verify" element={<PortalVerifyPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByTestId('portal-verify-error')).toHaveTextContent('verify.missingToken')
  })

  it('verifies token and navigates to facturas', async () => {
    vi.mocked(portalAPI.verifyToken).mockResolvedValue({
      me: {
        rsocial: 'Cliente',
        codigo: 1,
        clienteId: 1,
        fantasia: null,
        email: null,
        telef: null,
        domicilio: null,
        localidad: null,
        vendedor: null,
      },
    })

    render(
      <MemoryRouter initialEntries={['/portal/demo/verify?token=abc']}>
        <Routes>
          <Route path="/portal/:tenantSlug/verify" element={<PortalVerifyPage />} />
          <Route path="/portal/:tenantSlug/facturas" element={<div data-testid="facturas-page" />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('facturas-page')).toBeInTheDocument()
    })
    expect(setSessionFromVerify).toHaveBeenCalled()
  })
})
