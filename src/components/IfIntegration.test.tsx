import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import IfIntegration from './IfIntegration'

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: vi.fn(),
}))

import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'

describe('IfIntegration', () => {
  it('renders children when integration is enabled', () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      status: 'ready',
      modules: [],
      integrations: ['mercadopago'],
      hasModule: () => false,
      hasIntegration: (id: string) => id === 'mercadopago',
      refreshFeatures: vi.fn(),
    })
    render(
      <IfIntegration id="mercadopago">
        <span data-testid="mp-child">visible</span>
      </IfIntegration>,
    )
    expect(screen.getByTestId('mp-child')).toBeInTheDocument()
  })

  it('renders nothing when integration is disabled', () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      status: 'ready',
      modules: [],
      integrations: [],
      hasModule: () => false,
      hasIntegration: () => false,
      refreshFeatures: vi.fn(),
    })
    render(
      <IfIntegration id="mercadopago">
        <span data-testid="mp-child">hidden</span>
      </IfIntegration>,
    )
    expect(screen.queryByTestId('mp-child')).not.toBeInTheDocument()
  })
})
