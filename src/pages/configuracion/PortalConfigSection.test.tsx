import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PortalConfigSection from './PortalConfigSection'
import { portalConfigAPI } from '@/lib/portalApi'

vi.mock('@/lib/portalApi', () => ({
  portalConfigAPI: {
    get: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ claims: { role: 'owner', tenantId: 1, userId: 1 } }),
}))

const portalT = (key: string) => key

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: portalT }),
}))

describe('PortalConfigSection', () => {
  beforeEach(() => {
    vi.mocked(portalConfigAPI.get).mockResolvedValue({
      enabled: true,
      showPedidos: true,
      logoUrl: null,
      primaryColor: '#2563eb',
      footerText: null,
    })
    vi.mocked(portalConfigAPI.update).mockResolvedValue({
      enabled: true,
      showPedidos: false,
      logoUrl: 'https://cdn/logo.png',
      primaryColor: '#111111',
      footerText: 'Footer',
    })
  })

  it('loads portal config for managers', async () => {
    render(<PortalConfigSection />)
    await waitFor(() => {
      expect(screen.getByTestId('portal-config-section')).toBeInTheDocument()
    })
    expect(screen.getByTestId('portal-config-enabled')).toBeChecked()
  })

  it('saves portal config changes', async () => {
    const user = userEvent.setup()
    render(<PortalConfigSection />)
    const saveButton = await screen.findByTestId('portal-config-save')
    await user.click(screen.getByTestId('portal-config-show-pedidos'))
    await user.click(saveButton)
    await waitFor(() => {
      expect(portalConfigAPI.update).toHaveBeenCalled()
    })
  })
})
