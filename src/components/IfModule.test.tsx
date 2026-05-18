import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import IfModule from '@/components/IfModule'

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: vi.fn(),
}))

import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'

describe('IfModule', () => {
  it('renders children when module enabled', () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      status: 'ready',
      modules: ['billing.orders'],
      integrations: [],
      hasModule: (key) => key === 'billing.orders',
      hasIntegration: () => false,
      refreshFeatures: vi.fn(),
    })

    render(
      <IfModule flag="billing.orders">
        <span data-testid="child">ok</span>
      </IfModule>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('hides children when module disabled', () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      status: 'ready',
      modules: [],
      integrations: [],
      hasModule: () => false,
      hasIntegration: () => false,
      refreshFeatures: vi.fn(),
    })

    render(
      <IfModule flag="billing.orders">
        <span data-testid="child">ok</span>
      </IfModule>,
    )
    expect(screen.queryByTestId('child')).not.toBeInTheDocument()
  })

  it('renders nothing while loading', () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      status: 'loading',
      modules: [],
      integrations: [],
      hasModule: () => true,
      hasIntegration: () => false,
      refreshFeatures: vi.fn(),
    })

    render(
      <IfModule flag="billing.orders">
        <span data-testid="child">ok</span>
      </IfModule>,
    )
    expect(screen.queryByTestId('child')).not.toBeInTheDocument()
  })
})
