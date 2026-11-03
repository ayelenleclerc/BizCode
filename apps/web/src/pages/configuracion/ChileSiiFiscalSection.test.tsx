import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import ChileSiiFiscalSection from './ChileSiiFiscalSection'
import { fiscalAPI } from '@/lib/api'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    fiscalAPI: {
      ...actual.fiscalAPI,
      getProvidersConfig: vi.fn(),
      putProvidersConfig: vi.fn(),
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ claims: { role: 'owner', tenantId: 1, userId: 1 } }),
}))

vi.mock('@/components/IfModule', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { rut?: string; ambiente?: string }) =>
      opts?.rut ? `${key}:${opts.rut}:${opts.ambiente}` : key,
  }),
}))

const chileStatus = {
  provider: 'chile_sii' as const,
  countryCode: 'CL' as const,
  capabilities: {
    provider: 'chile_sii' as const,
    countryCode: 'CL' as const,
    displayName: 'SII (Chile)',
    implemented: true,
    supportsInvoice: true,
    supportsCreditNote: true,
    supportsCancel: false,
    supportsHealthCheck: true,
    supportsLastAuthorizedNumber: false,
  },
  configured: true,
  enabled: true,
  isDefault: false,
  environment: 'homologacion' as const,
  taxIdentifier: '12.345.678-5',
}

describe('ChileSiiFiscalSection (#208)', () => {
  beforeEach(() => {
    vi.mocked(fiscalAPI.getProvidersConfig).mockResolvedValue([chileStatus])
    vi.mocked(fiscalAPI.putProvidersConfig).mockResolvedValue({ configured: true })
  })

  it('loads configured RUT status into the form', async () => {
    render(<ChileSiiFiscalSection />)
    await waitFor(() => {
      expect(screen.getByTestId('section-chile-sii')).toBeInTheDocument()
      expect(screen.getByTestId('input-chile-sii-rut')).toHaveValue('12.345.678-5')
    })
    expect(screen.getByTestId('select-chile-sii-ambiente')).toHaveValue('homologacion')
  })

  it('saves chile_sii credentials via putProvidersConfig', async () => {
    render(<ChileSiiFiscalSection />)
    await waitFor(() => {
      expect(screen.getByTestId('btn-chile-sii-save')).toBeEnabled()
    })
    fireEvent.change(screen.getByTestId('input-chile-sii-rut'), {
      target: { value: '76.123.456-0' },
    })
    fireEvent.click(screen.getByTestId('btn-chile-sii-save'))
    await waitFor(() => {
      expect(fiscalAPI.putProvidersConfig).toHaveBeenCalledWith({
        provider: 'chile_sii',
        rut: '76.123.456-0',
        ambiente: 'homologacion',
      })
    })
    expect(await screen.findByText('chileSii.saveSuccess')).toBeInTheDocument()
  })

  it('shows a load error when providers config fails', async () => {
    vi.mocked(fiscalAPI.getProvidersConfig).mockRejectedValueOnce(new Error('network'))
    render(<ChileSiiFiscalSection />)
    await waitFor(() => {
      expect(screen.getByText('chileSii.errors.loadFailed')).toBeInTheDocument()
    })
  })
})
