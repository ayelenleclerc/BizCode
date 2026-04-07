import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import '@/i18n/config'
import App from './App'

vi.mock('@/lib/api', () => ({
  authAPI: {
    me: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
  clientesAPI: { list: vi.fn() },
  articulosAPI: { list: vi.fn(), get: vi.fn() },
  rubrosAPI: { list: vi.fn() },
  formasPagoAPI: { list: vi.fn() },
  facturasAPI: { list: vi.fn(), create: vi.fn() },
  checkAPI: vi.fn().mockResolvedValue({ status: 'ok' }),
}))

import { authAPI } from '@/lib/api'

vi.mock('./pages/clientes', () => ({
  default: () => <div data-testid="clientes-page">clientes</div>,
}))

vi.mock('./pages/articulos', () => ({
  default: () => <div>articulos</div>,
}))

vi.mock('./pages/facturacion', () => ({
  default: () => <div>facturacion</div>,
}))

vi.mock('./components/layout/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}))

describe('App auth routing', () => {
  beforeEach(() => {
    vi.mocked(authAPI.me).mockReset()
  })

  it('renders loading state while session is loading', async () => {
    vi.mocked(authAPI.me).mockReturnValue(new Promise(() => {}))
    render(<App />)
    await waitFor(() => {
      expect(screen.getByRole('status', { busy: true })).toBeInTheDocument()
    })
  })

  it('renders login screen when unauthenticated', async () => {
    vi.mocked(authAPI.me).mockRejectedValueOnce(new Error('unauthorized'))
    render(<App />)
    await waitFor(() => {
      expect(screen.getByTestId('login-tenant-slug')).toBeInTheDocument()
    })
  })
})
