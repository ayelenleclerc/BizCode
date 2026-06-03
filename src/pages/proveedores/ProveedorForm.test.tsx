import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import ProveedorForm from './ProveedorForm'
import { proveedoresAPI } from '@/lib/api'

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    proveedoresAPI: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      downloadImportTemplate: vi.fn(),
      importFromCsv: vi.fn(),
    },
  }
})

describe('ProveedorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
  })

  it('muestra formulario nuevo y valida CBU inválido', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSaved = vi.fn()
    render(<ProveedorForm proveedorId={null} onClose={onClose} onSaved={onSaved} />)
    expect(screen.getByTestId('dialog-proveedor-form')).toBeInTheDocument()
    await user.type(screen.getByTestId('proveedor-form-codigo'), '5001')
    await user.type(screen.getByTestId('proveedor-form-rsocial'), 'Proveedor Test SA')
    await user.type(screen.getByTestId('proveedor-form-cbu'), '1234567890123456789012')
    await user.click(screen.getByTestId('btn-guardar-proveedor'))
    expect(await screen.findByText(/CBU inválido/i)).toBeInTheDocument()
    expect(proveedoresAPI.create).not.toHaveBeenCalled()
  })

  it('carga ficha y guarda con CBU válido', async () => {
    const user = userEvent.setup()
    vi.mocked(proveedoresAPI.get).mockResolvedValue({
      id: 1,
      codigo: 4001,
      rsocial: 'Proveedor Test SA',
      condIva: 'RI',
      activo: true,
    })
    vi.mocked(proveedoresAPI.update).mockResolvedValue({
      id: 1,
      codigo: 4001,
      rsocial: 'Proveedor Test SA',
      condIva: 'RI',
      activo: true,
      cbu: '2850590940090418135201',
    })
    const onSaved = vi.fn()
    render(<ProveedorForm proveedorId={1} onClose={vi.fn()} onSaved={onSaved} />)
    await waitFor(() => {
      expect(proveedoresAPI.get).toHaveBeenCalledWith(1)
    })
    await user.clear(screen.getByTestId('proveedor-form-cbu'))
    await user.type(screen.getByTestId('proveedor-form-cbu'), '2850590940090418135201')
    await user.click(screen.getByTestId('btn-guardar-proveedor'))
    await waitFor(() => {
      expect(proveedoresAPI.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ cbu: '2850590940090418135201' }),
      )
    })
    expect(onSaved).toHaveBeenCalled()
  })
})
