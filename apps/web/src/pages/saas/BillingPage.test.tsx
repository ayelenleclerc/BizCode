import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import '@/i18n/config'
import BillingPage from './BillingPage'

const billing = vi.fn()
const subscribe = vi.fn()

vi.mock('@/lib/api', () => ({
  saasAPI: {
    billing: (...args: unknown[]) => billing(...args),
    subscribe: (...args: unknown[]) => subscribe(...args),
  },
}))

describe('BillingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    billing.mockResolvedValue({
      saasStatus: 'trial',
      subscription: null,
      invoices: [],
      platformMpLive: false,
    })
    subscribe.mockResolvedValue({
      planKey: 'starter',
      saasStatus: 'active',
      subscriptionStatus: 'authorized',
      mock: true,
      initPoint: null,
      amount: '0.00',
      currency: 'ARS',
    })
  })

  it('shows empty state then success after subscribe', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('saas-billing-empty')).toBeInTheDocument()
    })
    billing.mockResolvedValue({
      saasStatus: 'active',
      subscription: {
        planKey: 'starter',
        status: 'authorized',
        mock: true,
        initPoint: null,
        paymentRetryCount: 0,
      },
      invoices: [
        {
          id: 1,
          planKey: 'starter',
          periodStart: '2026-08-01T00:00:00.000Z',
          periodEnd: '2026-09-01T00:00:00.000Z',
          amount: '0.00',
          currency: 'ARS',
          status: 'paid',
          createdAt: '2026-08-01T00:00:00.000Z',
        },
      ],
      platformMpLive: false,
    })
    await user.click(screen.getByTestId('saas-billing-subscribe'))
    await waitFor(() => {
      expect(screen.getByTestId('saas-billing-success')).toBeInTheDocument()
      expect(screen.getByTestId('saas-billing-invoices')).toBeInTheDocument()
    })
  })
})
