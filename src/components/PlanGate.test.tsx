import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PlanGate from '@/components/PlanGate'
import { PlanProvider } from '@/contexts/PlanContext'

vi.mock('@/lib/api', () => ({
  planAPI: {
    getMe: vi.fn().mockResolvedValue({
      planKey: 'starter',
      planName: 'Starter',
      monthlyPrice: 0,
      currency: 'ARS',
      maxUsers: 3,
      maxInvoicesPerMonth: 100,
      features: [],
      status: 'active',
      usage: { usersUsed: 0, invoicesUsed: 0 },
    }),
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ status: 'authenticated', claims: { tenantId: 1, role: 'owner' } }),
}))

describe('PlanGate', () => {
  it('shows upgrade CTA when feature not in plan', async () => {
    render(
      <PlanProvider>
        <PlanGate feature="apps.driver">
          <span data-testid="protected">secret</span>
        </PlanGate>
      </PlanProvider>,
    )
    expect(await screen.findByTestId('plan-gate')).toBeInTheDocument()
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument()
  })
})
