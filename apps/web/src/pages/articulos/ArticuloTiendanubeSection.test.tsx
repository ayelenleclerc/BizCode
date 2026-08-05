import type { ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ArticuloTiendanubeSection from './ArticuloTiendanubeSection'

const tnMocks = vi.hoisted(() => ({
  getArticuloListing: vi.fn(),
  upsertArticuloListing: vi.fn(),
  unlinkArticuloListing: vi.fn(),
}))

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    tiendanubeAPI: {
      getArticuloListing: tnMocks.getArticuloListing,
      upsertArticuloListing: tnMocks.upsertArticuloListing,
      unlinkArticuloListing: tnMocks.unlinkArticuloListing,
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
    integrations: ['tiendanube'],
    hasModule: () => false,
    hasIntegration: (id: string) => id === 'tiendanube',
    refreshFeatures: vi.fn(),
  }),
}))

vi.mock('react-i18next', () => {
  const t = (key: string) => key
  return {
    useTranslation: () => ({ t }),
  }
})

describe('ArticuloTiendanubeSection', () => {
  beforeEach(() => {
    tnMocks.getArticuloListing.mockReset()
    tnMocks.upsertArticuloListing.mockReset()
    tnMocks.unlinkArticuloListing.mockReset()
    tnMocks.getArticuloListing.mockResolvedValue({
      linked: false,
      hasPhotos: true,
      photoWarning: false,
    })
    tnMocks.upsertArticuloListing.mockResolvedValue({
      linked: true,
      hasPhotos: true,
      photoWarning: false,
      tnProductId: '999',
      estado: 'active',
      syncStatus: 'synced',
      permalink: 'https://tienda.mitiendanube.com/productos/x',
    })
    tnMocks.unlinkArticuloListing.mockResolvedValue({ unlinked: true })
  })

  it('shows publish form when not linked', async () => {
    render(<ArticuloTiendanubeSection articuloId={42} />)
    await waitFor(() =>
      expect(screen.queryByTestId('articulo-tiendanube-loading')).not.toBeInTheDocument(),
    )
    expect(screen.getByTestId('articulo-tiendanube-publish')).toBeInTheDocument()
    expect(tnMocks.getArticuloListing).toHaveBeenCalledWith(42)
  })

  it('publishes listing', async () => {
    render(<ArticuloTiendanubeSection articuloId={42} />)
    await waitFor(() =>
      expect(screen.queryByTestId('articulo-tiendanube-loading')).not.toBeInTheDocument(),
    )
    fireEvent.click(screen.getByTestId('articulo-tiendanube-publish'))
    await waitFor(() => expect(tnMocks.upsertArticuloListing).toHaveBeenCalledWith(42))
    expect(await screen.findByTestId('articulo-tiendanube-linked')).toBeInTheDocument()
    expect(screen.getByTestId('articulo-tiendanube-product-id')).toHaveTextContent('999')
  })

  it('unlinks listing', async () => {
    tnMocks.getArticuloListing.mockResolvedValue({
      linked: true,
      hasPhotos: true,
      photoWarning: false,
      tnProductId: '999',
      estado: 'active',
      syncStatus: 'synced',
    })
    render(<ArticuloTiendanubeSection articuloId={42} />)
    await waitFor(() =>
      expect(screen.queryByTestId('articulo-tiendanube-loading')).not.toBeInTheDocument(),
    )
    fireEvent.click(screen.getByTestId('articulo-tiendanube-unlink'))
    await waitFor(() => expect(tnMocks.unlinkArticuloListing).toHaveBeenCalledWith(42))
  })

  it('shows photo warning and disables publish', async () => {
    tnMocks.getArticuloListing.mockResolvedValue({
      linked: false,
      hasPhotos: false,
      photoWarning: true,
    })
    render(<ArticuloTiendanubeSection articuloId={42} />)
    await waitFor(() =>
      expect(screen.queryByTestId('articulo-tiendanube-loading')).not.toBeInTheDocument(),
    )
    expect(screen.getByTestId('articulo-tiendanube-photo-warning')).toBeInTheDocument()
    expect(screen.getByTestId('articulo-tiendanube-publish')).toBeDisabled()
  })

  it('shows load error', async () => {
    tnMocks.getArticuloListing.mockRejectedValue(new Error('boom'))
    render(<ArticuloTiendanubeSection articuloId={42} />)
    expect(await screen.findByTestId('articulo-tiendanube-error')).toHaveTextContent(
      'tiendanube.errorLoad',
    )
  })
})
