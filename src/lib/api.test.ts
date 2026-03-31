import { describe, it, expect, vi, beforeEach } from 'vitest'

// Crear los mocks hoisted para que estén disponibles en la factory de vi.mock
const { mockGet, mockPost, mockPut } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
}))

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({ get: mockGet, post: mockPost, put: mockPut })),
  },
}))

// Importar después del mock
import {
  clientesAPI,
  articulosAPI,
  rubrosAPI,
  formasPagoAPI,
  facturasAPI,
  checkAPI,
} from './api'

beforeEach(() => {
  vi.clearAllMocks()
})

// ────────────────────────────────────────────────────────────
// Helper: construye un error simulando AxiosError con respuesta
// ────────────────────────────────────────────────────────────
function axiosErrorWithResponse(message: string) {
  const error = new Error('Request failed') as Error & {
    response: { data: { error: string } }
  }
  error.response = { data: { error: message } }
  return error
}

function genericError(message?: string) {
  return new Error(message ?? '')
}

// ════════════════════════════════════════════════════════════
// clientesAPI
// ════════════════════════════════════════════════════════════
describe('clientesAPI', () => {
  describe('list', () => {
    it('retorna data en el happy path', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [{ id: 1 }] } })
      const result = await clientesAPI.list()
      expect(result).toEqual([{ id: 1 }])
      expect(mockGet).toHaveBeenCalledWith('/clientes', { params: { q: undefined } })
    })

    it('pasa el filtro como parámetro q', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await clientesAPI.list('test')
      expect(mockGet).toHaveBeenCalledWith('/clientes', { params: { q: 'test' } })
    })

    it('lanza error del servidor cuando response.data.error está presente', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('Cliente no encontrado'))
      await expect(clientesAPI.list()).rejects.toThrow('Cliente no encontrado')
    })

    it('lanza error genérico cuando no hay response', async () => {
      mockGet.mockRejectedValueOnce(genericError('Network error'))
      await expect(clientesAPI.list()).rejects.toThrow('Network error')
    })

    it('lanza "Unknown error" cuando error.message es vacío', async () => {
      mockGet.mockRejectedValueOnce(genericError())
      await expect(clientesAPI.list()).rejects.toThrow('Unknown error')
    })
  })

  describe('get', () => {
    it('retorna data en el happy path', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: { id: 1, rsocial: 'Test' } } })
      const result = await clientesAPI.get(1)
      expect(result).toEqual({ id: 1, rsocial: 'Test' })
      expect(mockGet).toHaveBeenCalledWith('/clientes/1')
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('Not found'))
      await expect(clientesAPI.get(99)).rejects.toThrow('Not found')
    })
  })

  describe('create', () => {
    it('retorna data en el happy path', async () => {
      const newCliente = { id: 2, rsocial: 'Nuevo' }
      mockPost.mockResolvedValueOnce({ data: { data: newCliente } })
      const result = await clientesAPI.create({ rsocial: 'Nuevo' })
      expect(result).toEqual(newCliente)
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Código duplicado'))
      await expect(clientesAPI.create({})).rejects.toThrow('Código duplicado')
    })
  })

  describe('update', () => {
    it('retorna data en el happy path', async () => {
      const updated = { id: 1, rsocial: 'Actualizado' }
      mockPut.mockResolvedValueOnce({ data: { data: updated } })
      const result = await clientesAPI.update(1, { rsocial: 'Actualizado' })
      expect(result).toEqual(updated)
      expect(mockPut).toHaveBeenCalledWith('/clientes/1', { rsocial: 'Actualizado' })
    })

    it('lanza error del servidor', async () => {
      mockPut.mockRejectedValueOnce(axiosErrorWithResponse('Error de actualización'))
      await expect(clientesAPI.update(1, {})).rejects.toThrow('Error de actualización')
    })
  })
})

// ════════════════════════════════════════════════════════════
// articulosAPI
// ════════════════════════════════════════════════════════════
describe('articulosAPI', () => {
  describe('list', () => {
    it('retorna data', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [{ id: 1 }] } })
      expect(await articulosAPI.list()).toEqual([{ id: 1 }])
    })

    it('pasa filtro como q', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await articulosAPI.list('cafe')
      expect(mockGet).toHaveBeenCalledWith('/articulos', { params: { q: 'cafe' } })
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('DB error'))
      await expect(articulosAPI.list()).rejects.toThrow('DB error')
    })
  })

  describe('get', () => {
    it('retorna artículo por id', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: { id: 5 } } })
      expect(await articulosAPI.get(5)).toEqual({ id: 5 })
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('Not found'))
      await expect(articulosAPI.get(999)).rejects.toThrow('Not found')
    })
  })

  describe('create', () => {
    it('retorna artículo creado', async () => {
      mockPost.mockResolvedValueOnce({ data: { data: { id: 10 } } })
      expect(await articulosAPI.create({ descripcion: 'X' })).toEqual({ id: 10 })
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Validation failed'))
      await expect(articulosAPI.create({})).rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('retorna artículo actualizado', async () => {
      mockPut.mockResolvedValueOnce({ data: { data: { id: 3, descripcion: 'Updated' } } })
      expect(await articulosAPI.update(3, { descripcion: 'Updated' })).toEqual({ id: 3, descripcion: 'Updated' })
    })

    it('lanza error del servidor', async () => {
      mockPut.mockRejectedValueOnce(axiosErrorWithResponse('Update error'))
      await expect(articulosAPI.update(3, {})).rejects.toThrow('Update error')
    })
  })
})

// ════════════════════════════════════════════════════════════
// rubrosAPI
// ════════════════════════════════════════════════════════════
describe('rubrosAPI', () => {
  describe('list', () => {
    it('retorna lista de rubros', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [{ id: 1, nombre: 'Electrónica' }] } })
      expect(await rubrosAPI.list()).toEqual([{ id: 1, nombre: 'Electrónica' }])
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('DB error'))
      await expect(rubrosAPI.list()).rejects.toThrow('DB error')
    })
  })

  describe('create', () => {
    it('retorna rubro creado', async () => {
      mockPost.mockResolvedValueOnce({ data: { data: { id: 5, nombre: 'Nuevo' } } })
      expect(await rubrosAPI.create({ nombre: 'Nuevo' })).toEqual({ id: 5, nombre: 'Nuevo' })
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Rubro duplicado'))
      await expect(rubrosAPI.create({})).rejects.toThrow('Rubro duplicado')
    })
  })
})

// ════════════════════════════════════════════════════════════
// formasPagoAPI
// ════════════════════════════════════════════════════════════
describe('formasPagoAPI', () => {
  describe('list', () => {
    it('retorna lista de formas de pago', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [{ id: 1, descripcion: 'Contado' }] } })
      expect(await formasPagoAPI.list()).toEqual([{ id: 1, descripcion: 'Contado' }])
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('Error'))
      await expect(formasPagoAPI.list()).rejects.toThrow('Error')
    })
  })
})

// ════════════════════════════════════════════════════════════
// facturasAPI
// ════════════════════════════════════════════════════════════
describe('facturasAPI', () => {
  describe('list', () => {
    it('retorna lista de facturas', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [{ id: 1 }] } })
      expect(await facturasAPI.list()).toEqual([{ id: 1 }])
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('Error al listar'))
      await expect(facturasAPI.list()).rejects.toThrow('Error al listar')
    })
  })

  describe('create', () => {
    it('retorna factura creada', async () => {
      const factura = { id: 7, total: 121 }
      mockPost.mockResolvedValueOnce({ data: { data: factura } })
      expect(await facturasAPI.create({ total: 121 })).toEqual(factura)
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Número duplicado'))
      await expect(facturasAPI.create({})).rejects.toThrow('Número duplicado')
    })
  })
})

// ════════════════════════════════════════════════════════════
// checkAPI
// ════════════════════════════════════════════════════════════
describe('checkAPI', () => {
  it('retorna response.data en el happy path', async () => {
    mockGet.mockResolvedValueOnce({ data: { status: 'ok' } })
    expect(await checkAPI()).toEqual({ status: 'ok' })
  })

  it('retorna null cuando el servidor no está disponible', async () => {
    mockGet.mockRejectedValueOnce(new Error('ECONNREFUSED'))
    expect(await checkAPI()).toBeNull()
  })
})
