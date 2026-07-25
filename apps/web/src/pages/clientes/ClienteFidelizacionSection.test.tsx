import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ClienteFidelizacionSection from './ClienteFidelizacionSection'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const getClientePuntos = vi.fn()
const ajustar = vi.fn()

vi.mock('@/lib/api', () => ({
  fidelizacionAPI: {
    getClientePuntos: (...args: unknown[]) => getClientePuntos(...args),
    ajustar: (...args: unknown[]) => ajustar(...args),
  },
}))

describe('ClienteFidelizacionSection (#250)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders saldo and movements', async () => {
    getClientePuntos.mockResolvedValue({
      clienteId: 1,
      puntos: 40,
      equivalenteDinero: 40,
      totalMovimientos: 1,
      movimientos: [
        {
          id: 9,
          tenantId: 1,
          clienteId: 1,
          tipo: 'acumulacion',
          puntos: 40,
          saldoPost: 40,
          puntosRestantes: 40,
          referenciaFacturaId: 3,
          venceEn: null,
          concepto: 'Acumulación',
          userId: null,
          createdAt: '2026-07-24T12:00:00.000Z',
        },
      ],
    })
    render(<ClienteFidelizacionSection clienteId={1} />)
    expect(await screen.findByTestId('cliente-fidelizacion-saldo')).toHaveTextContent('40')
    expect(screen.getByTestId('cliente-fidelizacion-movimientos')).toBeInTheDocument()
  })

  it('applies manual adjustment', async () => {
    getClientePuntos.mockResolvedValue({
      clienteId: 1,
      puntos: 10,
      equivalenteDinero: 10,
      totalMovimientos: 0,
      movimientos: [],
    })
    ajustar.mockResolvedValue({
      clienteId: 1,
      puntos: 15,
      equivalenteDinero: 15,
      totalMovimientos: 1,
      movimientos: [],
    })
    render(<ClienteFidelizacionSection clienteId={1} />)
    await screen.findByTestId('cliente-fidelizacion-ajuste-form')
    fireEvent.change(screen.getByTestId('cliente-fidelizacion-ajuste-puntos'), {
      target: { value: '5' },
    })
    fireEvent.change(screen.getByTestId('cliente-fidelizacion-ajuste-concepto'), {
      target: { value: 'bonus' },
    })
    fireEvent.submit(screen.getByTestId('cliente-fidelizacion-ajuste-form'))
    await waitFor(() => {
      expect(ajustar).toHaveBeenCalledWith({
        clienteId: 1,
        puntos: 5,
        concepto: 'bonus',
      })
    })
  })

  it('shows error when load fails', async () => {
    getClientePuntos.mockRejectedValue(new Error('fail'))
    render(<ClienteFidelizacionSection clienteId={1} />)
    expect(await screen.findByTestId('cliente-fidelizacion-error')).toHaveTextContent('fail')
  })
})
