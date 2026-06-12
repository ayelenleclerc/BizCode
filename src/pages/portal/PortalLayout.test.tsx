import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PortalLayout from './PortalLayout'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/components/LanguageSelect', () => ({
  default: () => <div data-testid="language-select" />,
}))

const logout = vi.fn().mockResolvedValue(undefined)

vi.mock('@/contexts/PortalAuthContext', () => ({
  usePortalAuth: () => ({
    tenantSlug: 'demo',
    status: 'authenticated',
    branding: {
      tenantName: 'Demo SA',
      logoUrl: 'https://cdn/logo.png',
      primaryColor: '#123456',
      showPedidos: true,
      footerText: 'Gracias',
    },
    me: { rsocial: 'Cliente Demo' },
    logout,
  }),
}))

describe('PortalLayout', () => {
  it('renders branding, navigation and footer', () => {
    render(
      <MemoryRouter initialEntries={['/portal/demo/facturas']}>
        <Routes>
          <Route path="/portal/:tenantSlug" element={<PortalLayout />}>
            <Route path="facturas" element={<div data-testid="outlet" />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('portal-layout')).toBeInTheDocument()
    expect(screen.getByTestId('portal-logo')).toBeInTheDocument()
    expect(screen.getByTestId('portal-cliente-name')).toHaveTextContent('Cliente Demo')
    expect(screen.getByTestId('portal-nav')).toBeInTheDocument()
    expect(screen.getByText('Gracias')).toBeInTheDocument()
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })
})
