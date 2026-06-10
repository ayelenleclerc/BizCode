import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ClienteCuentaCorrienteSection from './ClienteCuentaCorrienteSection'

vi.mock('recharts', async (importOriginal) => {
  const mod = await importOriginal<typeof import('recharts')>()
  return {
    ...mod,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-mock-container">{children}</div>
    ),
  }
})

vi.mock('react-i18next', () => ({
  useTranslation: (ns?: string) => ({
    t: (key: string, opts?: { limite?: string }) => {
      if (ns === 'common') {
        const common: Record<string, string> = {
          'status.loading': 'Cargando…',
          'actions.retry': 'Reintentar',
          'actions.cancel': 'Cancelar',
          'actions.saving': 'Guardando…',
          'errors.generic': 'Error',
        }
        return common[key] ?? key
      }
      const map: Record<string, string> = {
        'cc.saldoActual': 'Saldo actual',
        'cc.limiteCredito': `Límite: ${opts?.limite ?? ''}`,
        'cc.excedeLimite': 'Excede límite',
        'cc.chartTitle': 'Gráfico',
        'cc.chartAria': 'Gráfico aria',
        'cc.chartEmpty': 'Sin datos',
        'cc.saldo': 'Saldo',
        'cc.antiguedadTitle': 'Antigüedad',
        'cc.antiguedad.0-30': '0-30',
        'cc.filterTipo': 'Tipo',
        'cc.filterTipoAll': 'Todos',
        'cc.filterFrom': 'Desde',
        'cc.filterTo': 'Hasta',
        'cc.filterApply': 'Aplicar',
        'cc.descargarPdf': 'PDF',
        'cc.enviarPdf': 'Enviar',
        'cc.movimientosEmpty': 'Sin movimientos',
        'cc.colFecha': 'Fecha',
        'cc.colTipo': 'Tipo',
        'cc.colReferencia': 'Ref',
        'cc.colMonto': 'Monto',
        'cc.colSaldo': 'Saldo',
        'cc.tipo.factura': 'Factura',
      }
      return map[key] ?? key
    },
  }),
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const { mockCuentaCorriente, mockAntiguedad } = vi.hoisted(() => ({
  mockCuentaCorriente: vi.fn(),
  mockAntiguedad: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  clientesAPI: {
    cuentaCorriente: mockCuentaCorriente,
    cuentaCorrienteAntiguedad: mockAntiguedad,
    cuentaCorrienteAjuste: vi.fn(),
    cuentaCorrienteEnviar: vi.fn(),
  },
  ApiRequestFailedError: class ApiRequestFailedError extends Error {},
}))

const defaultMockCc = {
  clienteId: 1,
  codigo: 1001,
  rsocial: 'Cliente SA',
  saldo: '800.00',
  creditLimit: '500.00',
  excedeLimite: true,
  movimientos: [
    {
      id: 1,
      tipo: 'factura' as const,
      referencia: 'A-0001-1',
      monto: '800.00',
      saldoPost: '800.00',
      fecha: '2026-05-01T12:00:00.000Z',
      usuarioId: 1,
      notas: null,
    },
  ],
  serie: [{ period: '2026-05', saldo: '800.00' }],
  total: 1,
  limit: 100,
  offset: 0,
}

describe('ClienteCuentaCorrienteSection', () => {
  beforeEach(() => {
    mockCuentaCorriente.mockReset()
    mockAntiguedad.mockReset()
    mockCuentaCorriente.mockResolvedValue(defaultMockCc)
    mockAntiguedad.mockResolvedValue({
      clienteId: 1,
      buckets: [{ label: '0-30', total: '800.00' }],
      totalPendiente: '800.00',
    })
  })

  it('muestra saldo y antigüedad', async () => {
    render(<ClienteCuentaCorrienteSection clienteId={1} />)
    await waitFor(() => {
      expect(screen.getByTestId('cliente-cc-saldo')).toHaveTextContent('800.00')
    })
    expect(screen.getByTestId('cliente-cc-antiguedad')).toBeInTheDocument()
    expect(screen.getByTestId('cliente-cc-row-1')).toBeInTheDocument()
  })
})
