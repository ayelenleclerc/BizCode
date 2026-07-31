import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@/i18n/config'
import ExtractosBancariosSection from './ExtractosBancariosSection'
import { bancosAPI } from '@/lib/api'

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    bancosAPI: {
      listCuentas: vi.fn(),
      listMappings: vi.fn(),
      listMovimientos: vi.fn(),
      createCuenta: vi.fn(),
      importar: vi.fn(),
      createMapping: vi.fn(),
      updateCuenta: vi.fn(),
      updateMapping: vi.fn(),
    },
  }
})

describe('ExtractosBancariosSection (#190)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    vi.mocked(bancosAPI.listCuentas).mockResolvedValue([])
    vi.mocked(bancosAPI.listMappings).mockResolvedValue([
      {
        id: 1,
        tenantId: 1,
        bancoCode: 'galicia',
        columnaFecha: 'Fecha',
        columnaDescripcion: 'Descripcion',
        columnaImporte: 'Importe',
        columnaReferencia: null,
        columnaSaldo: null,
        separadorDecimal: ',',
        formatoFecha: 'dd/MM/yyyy',
        delimiter: ';',
        signoDebitoCredito: 'signed_importe',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ])
    vi.mocked(bancosAPI.listMovimientos).mockResolvedValue({
      data: [],
      total: 0,
      take: 50,
      skip: 0,
    })
  })

  it('renders bancos section and empty accounts', async () => {
    render(<ExtractosBancariosSection />)
    expect(screen.getByTestId('bancos-section')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('bancos-cuentas-empty')).toBeInTheDocument()
    })
    expect(bancosAPI.listMappings).toHaveBeenCalled()
  })
})
