import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ProveedorCuentaCorrienteSection from './ProveedorCuentaCorrienteSection'

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
        'cc.filterTipo': 'Tipo',
        'cc.filterTipoAll': 'Todos',
        'cc.filterFrom': 'Desde',
        'cc.filterTo': 'Hasta',
        'cc.filterApply': 'Aplicar',
        'cc.movimientosEmpty': 'Sin movimientos',
        'cc.colFecha': 'Fecha',
        'cc.colTipo': 'Tipo',
        'cc.colReferencia': 'Ref',
        'cc.colMonto': 'Monto',
        'cc.colSaldo': 'Saldo',
        'cc.tipo.factura_compra': 'Factura compra',
        'cc.tipo.ajuste': 'Ajuste',
      }
      return map[key] ?? key
    },
  }),
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const { mockCuentaCorriente, mockCuentaCorrienteAjuste, mockListPagos } = vi.hoisted(() => ({
  mockCuentaCorriente: vi.fn(),
  mockCuentaCorrienteAjuste: vi.fn(),
  mockListPagos: vi.fn(),
}))

vi.mock('@/lib/api', () => {
  mockCuentaCorrienteAjuste.mockResolvedValue({ id: 2, tipo: 'ajuste', monto: '-10.00' })
  mockListPagos.mockResolvedValue({ data: [] })
  return {
    proveedoresAPI: {
      cuentaCorriente: mockCuentaCorriente,
      cuentaCorrienteAjuste: mockCuentaCorrienteAjuste,
      listPagos: mockListPagos,
    },
    ApiRequestFailedError: class ApiRequestFailedError extends Error {},
  }
})

const defaultMockCc = {
  proveedorId: 1,
  codigo: 4001,
  rsocial: 'Proveedor SA',
  saldo: '500.00',
  limiteCredito: '400.00',
  excedeLimite: true,
  movimientos: [
    {
      id: 1,
      tipo: 'factura_compra' as const,
      referencia: 'B-0001-1',
      monto: '500.00',
      saldoPost: '500.00',
      fecha: '2026-05-01T12:00:00.000Z',
      usuarioId: 1,
      notas: null,
    },
  ],
  serie: [
    { period: '2026-05', saldo: '500.00' },
    { period: '2026-06', saldo: '500.00' },
  ],
}

describe('ProveedorCuentaCorrienteSection', () => {
  beforeEach(() => {
    mockCuentaCorriente.mockReset()
    mockCuentaCorriente.mockResolvedValue(defaultMockCc)
  })

  it('muestra saldo y alerta de límite excedido', async () => {
    render(<ProveedorCuentaCorrienteSection proveedorId={1} />)
    await waitFor(() => {
      expect(screen.getByTestId('proveedor-cc-saldo')).toHaveTextContent('500.00')
    })
    expect(within(screen.getByTestId('proveedor-cc-saldo-panel')).getByRole('alert')).toHaveTextContent(
      'Excede límite',
    )
    expect(screen.getByTestId('proveedor-cc-chart')).toBeInTheDocument()
    expect(screen.getByTestId('proveedor-cc-table')).toBeInTheDocument()
  })

})
