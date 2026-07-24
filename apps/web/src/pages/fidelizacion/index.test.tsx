import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import FidelizacionPage from './index'

vi.mock('@/lib/api', () => ({
  fidelizacionAPI: {
    getConfig: vi.fn(),
    getDashboard: vi.fn(),
    upsertConfig: vi.fn(),
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    claims: { permissions: ['customers.read', 'customers.manage'] },
  }),
}))

import { fidelizacionAPI } from '@/lib/api'

describe('FidelizacionPage (#250)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fidelizacionAPI.getConfig).mockResolvedValue({
      id: 1,
      tenantId: 1,
      activo: true,
      nombre: 'Programa de Puntos',
      pesosPorPunto: 100,
      puntosPorPeso: 1,
      mesesVencimiento: 12,
      montoMinCompra: 0,
      aplicaEnDescuento: false,
      createdAt: '2026-07-24T12:00:00.000Z',
      updatedAt: '2026-07-24T12:00:00.000Z',
    })
    vi.mocked(fidelizacionAPI.getDashboard).mockResolvedValue({
      puntosEmitidos: 100,
      puntosCanjeados: 20,
      puntosVencidos: 0,
      puntosAjustados: 0,
      pasivoPuntos: 80,
      pasivoDinero: 80,
      ranking: [],
    })
  })

  it('renders config form and dashboard pasivo', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <FidelizacionPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('fidelizacion-page')).toBeInTheDocument()
    })
    expect(await screen.findByTestId('fidelizacion-config-form')).toBeInTheDocument()
    expect(await screen.findByTestId('fidelizacion-pasivo')).toHaveTextContent('80')
  })
})
