import type { ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ArticuloWooCommerceSection from './ArticuloWooCommerceSection'

const wcMocks = vi.hoisted(() => ({
  getArticuloListing: vi.fn(),
  upsertArticuloListing: vi.fn(),
  unlinkArticuloListing: vi.fn(),
}))

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    woocommerceAPI: {
      getArticuloListing: wcMocks.getArticuloListing,
      upsertArticuloListing: wcMocks.upsertArticuloListing,
      unlinkArticuloListing: wcMocks.unlinkArticuloListing,
    },
  }
})

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: () => ({
    status: 'ready',
    modules: [],
    integrations: ['woocommerce'],
    hasModule: () => false,
    hasIntegration: (id: string) => id === 'woocommerce',
    refreshFeatures: vi.fn(),
  }),
}))

vi.mock('react-i18next', () => {
  const t = (key: string) => key
  return {
    useTranslation: () => ({ t }),
  }
})

describe('ArticuloWooCommerceSection', () => {
  beforeEach(() => {
    wcMocks.getArticuloListing.mockReset()
    wcMocks.upsertArticuloListing.mockReset()
    wcMocks.unlinkArticuloListing.mockReset()
    wcMocks.getArticuloListing.mockResolvedValue({
      linked: false,
      hasPhotos: true,
      photoWarning: false,
    })
    wcMocks.upsertArticuloListing.mockResolvedValue({
      linked: true,
      hasPhotos: true,
      photoWarning: false,
      wcProductId: '999',
      estado: 'active',
      syncStatus: 'synced',
      permalink: 'https://mitienda.com/producto/999',
    })
    wcMocks.unlinkArticuloListing.mockResolvedValue({ unlinked: true })
  })

  it('shows publish form when not linked', async () => {
    render(<ArticuloWooCommerceSection articuloId={42} />)
    await waitFor(() =>
      expect(screen.queryByTestId('articulo-woocommerce-loading')).not.toBeInTheDocument(),
    )
    expect(screen.getByTestId('articulo-woocommerce-publish')).toBeInTheDocument()
    expect(wcMocks.getArticuloListing).toHaveBeenCalledWith(42)
  })

  it('publishes listing', async () => {
    render(<ArticuloWooCommerceSection articuloId={42} />)
    await waitFor(() =>
      expect(screen.queryByTestId('articulo-woocommerce-loading')).not.toBeInTheDocument(),
    )
    fireEvent.click(screen.getByTestId('articulo-woocommerce-publish'))
    await waitFor(() => expect(wcMocks.upsertArticuloListing).toHaveBeenCalledWith(42))
    expect(await screen.findByTestId('articulo-woocommerce-linked')).toBeInTheDocument()
    expect(screen.getByTestId('articulo-woocommerce-product-id')).toHaveTextContent('999')
  })

  it('unlinks listing', async () => {
    wcMocks.getArticuloListing.mockResolvedValue({
      linked: true,
      hasPhotos: true,
      photoWarning: false,
      wcProductId: '999',
      estado: 'active',
      syncStatus: 'synced',
    })
    render(<ArticuloWooCommerceSection articuloId={42} />)
    await waitFor(() =>
      expect(screen.queryByTestId('articulo-woocommerce-loading')).not.toBeInTheDocument(),
    )
    fireEvent.click(screen.getByTestId('articulo-woocommerce-unlink'))
    await waitFor(() => expect(wcMocks.unlinkArticuloListing).toHaveBeenCalledWith(42))
  })

  it('shows photo warning and disables publish', async () => {
    wcMocks.getArticuloListing.mockResolvedValue({
      linked: false,
      hasPhotos: false,
      photoWarning: true,
    })
    render(<ArticuloWooCommerceSection articuloId={42} />)
    await waitFor(() =>
      expect(screen.queryByTestId('articulo-woocommerce-loading')).not.toBeInTheDocument(),
    )
    expect(screen.getByTestId('articulo-woocommerce-photo-warning')).toBeInTheDocument()
    expect(screen.getByTestId('articulo-woocommerce-publish')).toBeDisabled()
  })

  it('shows load error', async () => {
    wcMocks.getArticuloListing.mockRejectedValue(new Error('boom'))
    render(<ArticuloWooCommerceSection articuloId={42} />)
    expect(await screen.findByTestId('articulo-woocommerce-error')).toHaveTextContent(
      'woocommerce.errorLoad',
    )
  })
})
