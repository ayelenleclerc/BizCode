import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import BrazilSefazFiscalSection from './BrazilSefazFiscalSection'
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
    t: (key: string, opts?: { cnpj?: string; ambiente?: string }) =>
      opts?.cnpj ? `${key}:${opts.cnpj}:${opts.ambiente}` : key,
  }),
}))

const brazilStatus = {
  provider: 'brazil_sefaz_nfe' as const,
  countryCode: 'BR' as const,
  capabilities: {
    provider: 'brazil_sefaz_nfe' as const,
    countryCode: 'BR' as const,
    displayName: 'SEFAZ (Brasil)',
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
  taxIdentifier: '11222333000181',
}

describe('BrazilSefazFiscalSection (#211)', () => {
  beforeEach(() => {
    vi.mocked(fiscalAPI.getProvidersConfig).mockResolvedValue([brazilStatus])
    vi.mocked(fiscalAPI.putProvidersConfig).mockResolvedValue({ configured: true })
  })

  it('loads configured CNPJ status into the form', async () => {
    render(<BrazilSefazFiscalSection />)
    await waitFor(() => {
      expect(screen.getByTestId('section-brazil-sefaz')).toBeInTheDocument()
      expect(screen.getByTestId('input-brazil-sefaz-cnpj')).toHaveValue('11222333000181')
    })
    expect(screen.getByTestId('select-brazil-sefaz-ambiente')).toHaveValue('homologacion')
  })

  it('saves brazil_sefaz_nfe credentials via putProvidersConfig', async () => {
    render(<BrazilSefazFiscalSection />)
    await waitFor(() => {
      expect(screen.getByTestId('btn-brazil-sefaz-save')).toBeEnabled()
    })
    fireEvent.change(screen.getByTestId('input-brazil-sefaz-cnpj'), {
      target: { value: '04.252.011/0001-10' },
    })
    fireEvent.click(screen.getByTestId('btn-brazil-sefaz-save'))
    await waitFor(() => {
      expect(fiscalAPI.putProvidersConfig).toHaveBeenCalledWith({
        provider: 'brazil_sefaz_nfe',
        cnpj: '04.252.011/0001-10',
        ambiente: 'homologacion',
      })
    })
    expect(await screen.findByText('brazilSefaz.saveSuccess')).toBeInTheDocument()
  })

  it('shows a load error when providers config fails', async () => {
    vi.mocked(fiscalAPI.getProvidersConfig).mockRejectedValueOnce(new Error('network'))
    render(<BrazilSefazFiscalSection />)
    await waitFor(() => {
      expect(screen.getByText('brazilSefaz.errors.loadFailed')).toBeInTheDocument()
    })
  })
})
