import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import ContracargosMpPage from './ContracargosMpPage'
import { mercadopagoAPI } from '@/lib/api'

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    mercadopagoAPI: {
      ...actual.mercadopagoAPI,
      listChargebacks: vi.fn(),
      updateChargeback: vi.fn(),
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    claims: { role: 'owner', tenantId: 1, userId: 1, permissions: ['reports.financial.read'] },
  }),
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: () => ({
    status: 'ready',
    hasIntegration: (id: string) => id === 'mercadopago',
    hasModule: () => true,
  }),
}))

describe('ContracargosMpPage (#179)', () => {
  beforeEach(() => {
    vi.mocked(mercadopagoAPI.listChargebacks).mockResolvedValue([
      {
        id: 1,
        mpChargebackId: 'cb-1',
        mpPaymentId: 'pay-1',
        facturaId: 7,
        estado: 'pendiente',
        notifiedAt: '2026-06-10T12:00:00.000Z',
        resolvedAt: null,
        createdAt: '2026-06-10T12:00:00.000Z',
      },
    ])
    vi.mocked(mercadopagoAPI.updateChargeback).mockResolvedValue({
      id: 1,
      mpChargebackId: 'cb-1',
      mpPaymentId: 'pay-1',
      facturaId: 7,
      estado: 'resuelto',
      notifiedAt: '2026-06-10T12:00:00.000Z',
      resolvedAt: '2026-06-10T13:00:00.000Z',
      createdAt: '2026-06-10T12:00:00.000Z',
    })
  })

  it('renders pending chargeback queue', async () => {
    render(<ContracargosMpPage />)
    expect(await screen.findByTestId('contracargos-mp-page')).toBeInTheDocument()
    expect(screen.getByTestId('contracargos-mp-row-1')).toBeInTheDocument()
  })

  it('marks chargeback as resolved', async () => {
    const user = userEvent.setup()
    render(<ContracargosMpPage />)
    await screen.findByTestId('contracargos-mp-row-1')
    await user.click(screen.getByTestId('contracargos-mp-row-1-resolve'))
    expect(await screen.findByTestId('contracargos-mp-feedback')).toBeInTheDocument()
  })
})
