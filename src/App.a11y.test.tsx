import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { axe } from 'jest-axe'
import '@/i18n/config'
import App from './App'

vi.mock('@/lib/api', () => ({
  clientesAPI: { list: vi.fn().mockResolvedValue([]) },
  articulosAPI: { list: vi.fn(), get: vi.fn() },
  rubrosAPI: { list: vi.fn() },
  formasPagoAPI: { list: vi.fn() },
  facturasAPI: { list: vi.fn(), create: vi.fn() },
  checkAPI: vi.fn().mockResolvedValue({ status: 'ok' }),
}))

describe('App — accesibilidad (smoke)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('no debe tener violaciones axe en la ruta inicial (tras carga)', async () => {
    const { container } = render(<App />)
    await waitFor(() => {
      expect(container.querySelector('h1')).toBeTruthy()
    })
    const results = await axe(container)
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toHaveLength(0)
  })
})
