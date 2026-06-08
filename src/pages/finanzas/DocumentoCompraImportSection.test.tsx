import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentoCompraImportSection from './DocumentoCompraImportSection'

const mockProcesar = vi.hoisted(() => vi.fn())
const mockConfirmar = vi.hoisted(() => vi.fn())
const mockProveedoresList = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api', () => ({
  documentosCompraAPI: {
    procesar: mockProcesar,
    confirmar: mockConfirmar,
    downloadOriginal: vi.fn(),
  },
  proveedoresAPI: {
    list: mockProveedoresList,
  },
  ApiRequestFailedError: class ApiRequestFailedError extends Error {},
}))

const sampleDoc = {
  id: 1,
  tenantId: 1,
  usuarioId: 1,
  archivoNombre: 'factura.pdf',
  archivoMime: 'application/pdf',
  archivoPath: '1/1/factura.pdf',
  tipoArchivo: 'pdf',
  tier: 0,
  confianza: 0,
  estado: 'pendiente_revision',
  datosExtraidos: {
    proveedorId: null,
    fecha: null,
    vencimiento: null,
    tipo: null,
    prefijo: null,
    numero: null,
    neto1: 0,
    neto2: 0,
    neto3: 0,
    iva1: 0,
    iva2: 0,
    total: null,
    cae: null,
    caeVto: null,
    items: [],
    fieldConfidence: {},
  },
  comprobanteCompraId: null,
  errores: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('DocumentoCompraImportSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProveedoresList.mockResolvedValue([{ id: 1, codigo: 10, rsocial: 'Proveedor SA' }])
    mockProcesar.mockResolvedValue(sampleDoc)
    mockConfirmar.mockResolvedValue({
      documento: { ...sampleDoc, estado: 'confirmado' },
      comprobanteCompra: { id: 42 },
    })
  })

  it('prefills preview from tier 1 datosExtraidos', async () => {
    mockProcesar.mockResolvedValue({
      ...sampleDoc,
      tier: 1,
      confianza: 1,
      datosExtraidos: {
        ...sampleDoc.datosExtraidos,
        proveedorId: 1,
        fecha: '2026-01-10T12:00:00.000Z',
        tipo: 'B',
        prefijo: '0003',
        numero: 157,
        total: 121,
        neto1: 100,
        iva1: 21,
        cae: '74239871234567',
        fieldConfidence: { proveedorId: 1, fecha: 1, tipo: 1, total: 1 },
      },
    })
    const user = userEvent.setup()
    render(<DocumentoCompraImportSection onConfirmed={vi.fn()} />)

    const file = new File(['%PDF'], 'factura.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByTestId('documento-compra-file-input'), file)

    expect(await screen.findByTestId('documento-compra-preview-proveedor')).toHaveValue('1')
    expect(screen.getByTestId('documento-compra-preview-numero')).toHaveValue(157)
    expect(screen.getByTestId('documento-compra-confidence')).toHaveTextContent(/1/)
  })

  it('renders drop zone and opens preview after upload', async () => {
    const user = userEvent.setup()
    render(<DocumentoCompraImportSection onConfirmed={vi.fn()} />)

    const file = new File(['%PDF'], 'factura.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('documento-compra-file-input')
    await user.upload(input, file)

    expect(mockProcesar).toHaveBeenCalled()
    expect(await screen.findByTestId('documento-compra-preview-dialog')).toBeInTheDocument()
  })
})
