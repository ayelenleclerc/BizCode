import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import '@/i18n/config'
import SeguridadPage from './SeguridadPage'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/lib/api'
import type { AuthClaims } from '@/lib/rbac'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    authAPI: {
      ...actual.authAPI,
      mfaSetupStart: vi.fn(),
      mfaSetupConfirm: vi.fn(),
      mfaDisable: vi.fn(),
    },
  }
})

const baseClaims: AuthClaims = {
  userId: 1,
  tenantId: 1,
  username: 'owner',
  role: 'owner',
  permissions: [],
  scope: { tenantId: 1, branchIds: [], warehouseIds: [], routeIds: [], channels: ['backoffice'] },
  mfaEnabled: false,
  mfaSetupRequired: true,
}

describe('SeguridadPage MFA (#213)', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      claims: baseClaims,
      login: vi.fn(),
      verifyMfa: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    })
    vi.mocked(authAPI.mfaSetupStart).mockReset()
    vi.mocked(authAPI.mfaSetupConfirm).mockReset()
    vi.mocked(authAPI.mfaDisable).mockReset()
  })

  it('starts MFA enrollment and shows QR', async () => {
    const user = userEvent.setup()
    vi.mocked(authAPI.mfaSetupStart).mockResolvedValue({
      otpauthUrl: 'otpauth://totp/BizCode',
      qrDataUrl: 'data:image/png;base64,abc',
      secret: 'BASE32SECRET',
    })
    render(
      <MemoryRouter>
        <SeguridadPage />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('security-page')).toBeInTheDocument()
    await user.click(screen.getByTestId('security-mfa-start'))
    await waitFor(() => expect(screen.getByTestId('security-mfa-qr')).toBeInTheDocument())
    expect(screen.getByTestId('security-mfa-secret')).toHaveTextContent('BASE32SECRET')
  })

  it('confirms enrollment and shows backup codes once', async () => {
    const user = userEvent.setup()
    const refresh = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      claims: baseClaims,
      login: vi.fn(),
      verifyMfa: vi.fn(),
      logout: vi.fn(),
      refresh,
    })
    vi.mocked(authAPI.mfaSetupStart).mockResolvedValue({
      otpauthUrl: 'otpauth://totp/BizCode',
      qrDataUrl: 'data:image/png;base64,abc',
      secret: 'BASE32SECRET',
    })
    vi.mocked(authAPI.mfaSetupConfirm).mockResolvedValue({
      mfaEnabled: true,
      backupCodes: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    })
    render(
      <MemoryRouter>
        <SeguridadPage />
      </MemoryRouter>,
    )
    await user.click(screen.getByTestId('security-mfa-start'))
    await waitFor(() => expect(screen.getByTestId('security-mfa-confirm-code')).toBeInTheDocument())
    await user.type(screen.getByTestId('security-mfa-confirm-code'), '123456')
    await user.click(screen.getByTestId('security-mfa-confirm'))
    await waitFor(() => expect(screen.getByTestId('security-mfa-backup-codes')).toBeInTheDocument())
    expect(refresh).toHaveBeenCalled()
  })

  it('disables MFA when enabled', async () => {
    const user = userEvent.setup()
    const refresh = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      claims: { ...baseClaims, mfaEnabled: true, mfaSetupRequired: false },
      login: vi.fn(),
      verifyMfa: vi.fn(),
      logout: vi.fn(),
      refresh,
    })
    vi.mocked(authAPI.mfaDisable).mockResolvedValue({ mfaEnabled: false })
    render(
      <MemoryRouter>
        <SeguridadPage />
      </MemoryRouter>,
    )
    await user.type(screen.getByTestId('security-mfa-disable-code'), '123456')
    await user.click(screen.getByTestId('security-mfa-disable'))
    await waitFor(() => expect(authAPI.mfaDisable).toHaveBeenCalledWith({ code: '123456' }))
    expect(refresh).toHaveBeenCalled()
  })
})
