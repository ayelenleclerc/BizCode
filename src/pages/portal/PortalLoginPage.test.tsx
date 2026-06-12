import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PortalLoginPage from './PortalLoginPage'
import { portalAPI } from '@/lib/portalApi'

const portalT = (key: string) => key

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: portalT }),
}))

const mockUsePortalAuth = vi.fn()

vi.mock('@/contexts/PortalAuthContext', () => ({
  usePortalAuth: () => mockUsePortalAuth(),
}))

vi.mock('@/lib/portalApi', () => ({
  portalAPI: {
    requestMagicLink: vi.fn(),
  },
}))

describe('PortalLoginPage', () => {
  beforeEach(() => {
    mockUsePortalAuth.mockReturnValue({
      tenantSlug: 'demo',
      branding: { enabled: true },
    })
    vi.mocked(portalAPI.requestMagicLink).mockResolvedValue({ sent: true })
  })

  it('shows unavailable message when portal disabled', () => {
    mockUsePortalAuth.mockReturnValue({
      tenantSlug: 'demo',
      branding: { enabled: false },
    })
    render(<PortalLoginPage />)
    expect(screen.getByTestId('portal-unavailable')).toBeInTheDocument()
  })

  it('submits email and shows confirmation', async () => {
    const user = userEvent.setup()
    render(<PortalLoginPage />)

    await user.type(screen.getByTestId('portal-email-input'), 'cliente@example.com')
    await user.click(screen.getByTestId('portal-login-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('portal-magic-link-sent')).toBeInTheDocument()
    })
    expect(portalAPI.requestMagicLink).toHaveBeenCalledWith('demo', 'cliente@example.com')
  })
})
