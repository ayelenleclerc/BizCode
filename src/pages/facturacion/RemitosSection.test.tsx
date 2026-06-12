import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import RemitosSection from './RemitosSection'
import { remitosAPI, type RemitoDTO } from '@/lib/api'

const baseRemito = (overrides: Partial<RemitoDTO> = {}): RemitoDTO => ({
  id: 1,
  referencia: 'REM-0001',
  prefijo: null,
  numero: null,
  tipo: 'remito_x',
  estado: 'borrador',
  clienteId: 2,
  proveedorId: null,
  facturaId: null,
  pedidoId: null,
  ordenEntregaId: null,
  fecha: '2026-06-01T12:00:00.000Z',
  fechaEntrega: null,
  observaciones: null,
  firmadoPor: null,
  items: [],
  cliente: { id: 2, codigo: 10, rsocial: 'Cliente SA', cuit: '20123456789', domicilio: 'Calle 1' },
  ...overrides,
})

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    remitosAPI: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      emitir: vi.fn(),
      entregar: vi.fn(),
      anular: vi.fn(),
      downloadPdf: vi.fn(),
      createFromPedido: vi.fn(),
      createFromFactura: vi.fn(),
    },
  }
})

describe('RemitosSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    vi.mocked(remitosAPI.list).mockResolvedValue({
      data: [baseRemito()],
      total: 1,
    })
    vi.mocked(remitosAPI.emitir).mockResolvedValue(baseRemito({ estado: 'emitido', prefijo: '0001', numero: 1 }))
    vi.mocked(remitosAPI.anular).mockResolvedValue(baseRemito({ estado: 'anulado' }))
    vi.mocked(remitosAPI.downloadPdf).mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
  })

  it('carga listado y muestra tabla', async () => {
    render(<RemitosSection />)
    expect(await screen.findByTestId('remitos-section')).toBeInTheDocument()
    expect(await screen.findByTestId('remitos-table')).toBeInTheDocument()
    expect(screen.getByTestId('remito-row-1')).toBeInTheDocument()
    expect(screen.getByText('Cliente SA')).toBeInTheDocument()
  })

  it('muestra vacío sin remitos', async () => {
    vi.mocked(remitosAPI.list).mockResolvedValue({ data: [], total: 0 })
    render(<RemitosSection />)
    expect(await screen.findByTestId('remitos-empty')).toBeInTheDocument()
  })

  it('refresca al pulsar el botón', async () => {
    const user = userEvent.setup()
    render(<RemitosSection />)
    await screen.findByTestId('remitos-table')
    await user.click(screen.getByTestId('remitos-refresh'))
    await waitFor(() => {
      expect(remitosAPI.list).toHaveBeenCalledTimes(2)
    })
  })

  it('muestra error de carga', async () => {
    vi.mocked(remitosAPI.list).mockRejectedValue(new Error('red'))
    render(<RemitosSection />)
    await waitFor(() => {
      expect(screen.queryByTestId('remitos-table')).not.toBeInTheDocument()
    })
  })

  it('emite remito en borrador', async () => {
    const user = userEvent.setup()
    render(<RemitosSection />)
    await screen.findByTestId('remito-emitir-1')
    await user.click(screen.getByTestId('remito-emitir-1'))
    await waitFor(() => {
      expect(remitosAPI.emitir).toHaveBeenCalledWith(1)
      expect(remitosAPI.list).toHaveBeenCalledTimes(2)
    })
  })

  it('descarga PDF para remito emitido', async () => {
    vi.mocked(remitosAPI.list).mockResolvedValue({
      data: [baseRemito({ estado: 'emitido', prefijo: '0001', numero: 1 })],
      total: 1,
    })

    const user = userEvent.setup()
    render(<RemitosSection />)
    await screen.findByTestId('remito-pdf-1')

    const originalCreateElement = document.createElement.bind(document)
    const link = originalCreateElement('a')
    const clickSpy = vi.spyOn(link, 'click')
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      if (tagName === 'a') return link
      return originalCreateElement(tagName, options)
    })
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    await user.click(screen.getByTestId('remito-pdf-1'))
    await waitFor(() => {
      expect(remitosAPI.downloadPdf).toHaveBeenCalledWith(1)
      expect(clickSpy).toHaveBeenCalled()
    })

    createElementSpy.mockRestore()
    createObjectURLSpy.mockRestore()
    revokeObjectURLSpy.mockRestore()
    clickSpy.mockRestore()
  })

  it('anula remito emitido', async () => {
    vi.mocked(remitosAPI.list).mockResolvedValue({
      data: [baseRemito({ estado: 'emitido', prefijo: '0001', numero: 1 })],
      total: 1,
    })
    const user = userEvent.setup()
    render(<RemitosSection />)
    await user.click(await screen.findByTestId('remito-anular-1'))
    await waitFor(() => {
      expect(remitosAPI.anular).toHaveBeenCalledWith(1)
    })
  })

  it('muestra error de acción', async () => {
    vi.mocked(remitosAPI.emitir).mockRejectedValue(new Error('no se pudo emitir'))
    const user = userEvent.setup()
    render(<RemitosSection />)
    await user.click(await screen.findByTestId('remito-emitir-1'))
    expect(await screen.findByRole('alert')).toHaveTextContent('no se pudo emitir')
  })
})
