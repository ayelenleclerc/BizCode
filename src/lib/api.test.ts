import { describe, it, expect, vi, beforeEach } from 'vitest'

// Crear los mocks hoisted para que estén disponibles en la factory de vi.mock
const { mockGet, mockPost, mockPut, mockCreate } = vi.hoisted(() => {
  const mockGet = vi.fn()
  const mockPost = vi.fn()
  const mockPut = vi.fn()
  const mockCreate = vi.fn(() => ({ get: mockGet, post: mockPost, put: mockPut }))
  return { mockGet, mockPost, mockPut, mockCreate }
})

vi.mock('axios', () => ({
  default: {
    create: mockCreate,
  },
}))

// Importar después del mock
import {
  ApiRequestFailedError,
  authAPI,
  articulosAPI,
  chatAPI,
  checkAPI,
  clientesAPI,
  facturasAPI,
  formasPagoAPI,
  getAuthErrorI18nKey,
  notifChannelsAPI,
  proveedoresAPI,
  rubrosAPI,
  usersAPI,
  zonasEntregaAPI,
} from './api'

beforeEach(() => {
  mockGet.mockClear()
  mockPost.mockClear()
  mockPut.mockClear()
})

describe('getAuthErrorI18nKey', () => {
  it('mapea Invalid credentials', () => {
    expect(
      getAuthErrorI18nKey(new ApiRequestFailedError('Invalid credentials', { hasResponse: true })),
    ).toBe('auth.errors.invalidCredentials')
  })

  it('mapea Error genérico con mensaje Invalid credentials (legacy)', () => {
    expect(getAuthErrorI18nKey(new Error('Invalid credentials'))).toBe('auth.errors.invalidCredentials')
  })

  it('mapea ERR_NETWORK sin respuesta', () => {
    expect(
      getAuthErrorI18nKey(
        new ApiRequestFailedError('Network Error', { axiosCode: 'ERR_NETWORK', hasResponse: false }),
      ),
    ).toBe('auth.errors.network')
  })

  it('mapea mensaje Network Error sin código', () => {
    expect(getAuthErrorI18nKey(new ApiRequestFailedError('Network Error', { hasResponse: false }))).toBe(
      'auth.errors.network',
    )
  })

  it('mapea Failed to fetch sin respuesta', () => {
    expect(getAuthErrorI18nKey(new ApiRequestFailedError('Failed to fetch', { hasResponse: false }))).toBe(
      'auth.errors.network',
    )
  })

  it('mapea sin respuesta y mensaje no reconocido a red (fallback)', () => {
    expect(getAuthErrorI18nKey(new ApiRequestFailedError('Unknown error', { hasResponse: false }))).toBe(
      'auth.errors.network',
    )
  })

  it('mapea timeout por texto en el mensaje', () => {
    expect(getAuthErrorI18nKey(new ApiRequestFailedError('timeout exceeded', { hasResponse: false }))).toBe(
      'auth.errors.timeout',
    )
  })

  it('mapea ECONNABORTED a timeout', () => {
    expect(
      getAuthErrorI18nKey(
        new ApiRequestFailedError('timeout of 10000ms exceeded', {
          axiosCode: 'ECONNABORTED',
          hasResponse: false,
        }),
      ),
    ).toBe('auth.errors.timeout')
  })

  it('mapea ETIMEDOUT a timeout', () => {
    expect(
      getAuthErrorI18nKey(new ApiRequestFailedError('socket hang up', { axiosCode: 'ETIMEDOUT', hasResponse: false })),
    ).toBe('auth.errors.timeout')
  })

  it('mapea respuesta HTTP con cuerpo de error a genérico salvo Invalid credentials', () => {
    expect(
      getAuthErrorI18nKey(new ApiRequestFailedError('Something broke', { axiosCode: 'ERR_BAD_RESPONSE', hasResponse: true })),
    ).toBe('auth.errors.generic')
  })

  it('mapea desconocido a genérico', () => {
    expect(getAuthErrorI18nKey('string')).toBe('auth.errors.generic')
  })
})

describe('API client (axios)', () => {
  it('crea la instancia con withCredentials y baseURL del API', () => {
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://localhost:3001/api',
        timeout: 10000,
        withCredentials: true,
      }),
    )
  })
})

// ════════════════════════════════════════════════════════════
// authAPI
// ════════════════════════════════════════════════════════════
describe('authAPI', () => {
  describe('login', () => {
    it('retorna data en el happy path', async () => {
      const payload = { userId: 1, tenantId: 2, username: 'a', role: 'owner' }
      mockPost.mockResolvedValueOnce({ data: { data: payload } })
      const result = await authAPI.login({ tenantSlug: 'demo', username: 'a', password: 'x' })
      expect(result).toEqual(payload)
      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        tenantSlug: 'demo',
        username: 'a',
        password: 'x',
      })
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Invalid credentials'))
      await expect(authAPI.login({ tenantSlug: 'd', username: 'u', password: 'p' })).rejects.toThrow(
        'Invalid credentials',
      )
    })

    it('lanza ApiRequestFailedError en fallo de red', async () => {
      const err = Object.assign(new Error('Network Error'), {
        code: 'ERR_NETWORK' as const,
      })
      mockPost.mockRejectedValueOnce(err)
      await expect(authAPI.login({ tenantSlug: 'd', username: 'u', password: 'p' })).rejects.toMatchObject({
        name: 'ApiRequestFailedError',
        message: 'Network Error',
        axiosCode: 'ERR_NETWORK',
        hasResponse: false,
      })
    })

    it('respuesta con error no string usa mensaje de Axios', async () => {
      const err = new Error('Request failed') as Error & {
        response: { data: { error: { code: number } }; status: number }
        code: string
        isAxiosError: boolean
      }
      err.response = { data: { error: { code: 400 } }, status: 400 }
      err.code = 'ERR_BAD_REQUEST'
      err.isAxiosError = true
      mockPost.mockRejectedValueOnce(err)
      await expect(authAPI.login({ tenantSlug: 'd', username: 'u', password: 'p' })).rejects.toThrow(
        'Request failed',
      )
    })
  })

  describe('logout', () => {
    it('retorna loggedOut', async () => {
      mockPost.mockResolvedValueOnce({ data: { data: { loggedOut: true } } })
      expect(await authAPI.logout()).toEqual({ loggedOut: true })
      expect(mockPost).toHaveBeenCalledWith('/auth/logout')
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('fail'))
      await expect(authAPI.logout()).rejects.toThrow('fail')
    })
  })

  describe('me', () => {
    it('retorna claims', async () => {
      const claims = {
        userId: 1,
        tenantId: 1,
        username: 'u',
        role: 'owner',
        permissions: ['customers.read'],
        scope: {
          tenantId: 1,
          branchIds: [],
          warehouseIds: [],
          routeIds: [],
          channels: ['counter'],
        },
      }
      mockGet.mockResolvedValueOnce({ data: { data: claims } })
      expect(await authAPI.me()).toEqual(claims)
      expect(mockGet).toHaveBeenCalledWith('/auth/me')
    })

    it('lanza error cuando no hay sesión', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('Authentication required'))
      await expect(authAPI.me()).rejects.toThrow('Authentication required')
    })
  })
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

  describe('downloadImportTemplate', () => {
    it('retorna Blob en el happy path', async () => {
      mockGet.mockResolvedValueOnce({ data: new Blob(['a,b']) })
      const blob = await clientesAPI.downloadImportTemplate()
      expect(blob).toBeInstanceOf(Blob)
      expect(mockGet).toHaveBeenCalledWith('/clientes/import/template', { responseType: 'blob' })
    })

    it('lanza ApiRequestFailedError en fallo', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('Forbidden'))
      await expect(clientesAPI.downloadImportTemplate()).rejects.toThrow('Forbidden')
    })
  })

  describe('importFromCsv', () => {
    it('envía FormData con timeout extendido', async () => {
      mockPost.mockResolvedValueOnce({
        data: { data: { created: 2, skipped: 1, errors: [{ row: 3, message: 'x' }] } },
      })
      const file = new File(['csv'], 'c.csv', { type: 'text/csv' })
      const result = await clientesAPI.importFromCsv(file)
      expect(result).toEqual({ created: 2, skipped: 1, errors: [{ row: 3, message: 'x' }] })
      expect(mockPost).toHaveBeenCalledWith('/clientes/import', expect.any(FormData), {
        timeout: 120000,
      })
    })

    it('lanza ApiRequestFailedError en fallo', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Invalid CSV'))
      const file = new File(['x'], 'bad.csv')
      await expect(clientesAPI.importFromCsv(file)).rejects.toThrow('Invalid CSV')
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

  describe('downloadImportTemplate', () => {
    it('retorna Blob en el happy path', async () => {
      mockGet.mockResolvedValueOnce({ data: new Blob(['h']) })
      const blob = await articulosAPI.downloadImportTemplate()
      expect(blob).toBeInstanceOf(Blob)
      expect(mockGet).toHaveBeenCalledWith('/articulos/import/template', { responseType: 'blob' })
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('No template'))
      await expect(articulosAPI.downloadImportTemplate()).rejects.toThrow('No template')
    })
  })

  describe('importFromCsv', () => {
    it('retorna resumen de importación', async () => {
      mockPost.mockResolvedValueOnce({ data: { data: { created: 1, skipped: 0, errors: [] } } })
      const file = new File(['a'], 'a.csv')
      expect(await articulosAPI.importFromCsv(file)).toEqual({ created: 1, skipped: 0, errors: [] })
      expect(mockPost).toHaveBeenCalledWith('/articulos/import', expect.any(FormData), {
        timeout: 120000,
      })
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Bad file'))
      await expect(articulosAPI.importFromCsv(new File([], 'x.csv'))).rejects.toThrow('Bad file')
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

  describe('downloadImportTemplate', () => {
    it('retorna Blob en el happy path', async () => {
      mockGet.mockResolvedValueOnce({ data: new Blob(['t']) })
      expect(await rubrosAPI.downloadImportTemplate()).toBeInstanceOf(Blob)
      expect(mockGet).toHaveBeenCalledWith('/rubros/import/template', { responseType: 'blob' })
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('Denied'))
      await expect(rubrosAPI.downloadImportTemplate()).rejects.toThrow('Denied')
    })
  })

  describe('importFromCsv', () => {
    it('retorna resumen de importación', async () => {
      mockPost.mockResolvedValueOnce({ data: { data: { created: 0, skipped: 2, errors: [] } } })
      const file = new File(['r'], 'r.csv')
      expect(await rubrosAPI.importFromCsv(file)).toEqual({ created: 0, skipped: 2, errors: [] })
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Parse error'))
      await expect(rubrosAPI.importFromCsv(new File([], 'e.csv'))).rejects.toThrow('Parse error')
    })
  })
})

// ════════════════════════════════════════════════════════════
// proveedoresAPI
// ════════════════════════════════════════════════════════════
describe('proveedoresAPI', () => {
  describe('list', () => {
    it('retorna datos en el happy path', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [{ id: 1 }] } })
      expect(await proveedoresAPI.list()).toEqual([{ id: 1 }])
      expect(mockGet).toHaveBeenCalledWith('/proveedores', { params: { q: undefined } })
    })

    it('aplica filtro q', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await proveedoresAPI.list('acme')
      expect(mockGet).toHaveBeenCalledWith('/proveedores', { params: { q: 'acme' } })
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('DB error'))
      await expect(proveedoresAPI.list()).rejects.toThrow('DB error')
    })
  })

  describe('get', () => {
    it('retorna proveedor por id', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: { id: 9, rsocial: 'P' } } })
      expect(await proveedoresAPI.get(9)).toEqual({ id: 9, rsocial: 'P' })
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('Not found'))
      await expect(proveedoresAPI.get(1)).rejects.toThrow('Not found')
    })
  })

  describe('create', () => {
    it('retorna proveedor creado', async () => {
      mockPost.mockResolvedValueOnce({ data: { data: { id: 2 } } })
      expect(await proveedoresAPI.create({ rsocial: 'New' })).toEqual({ id: 2 })
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Duplicate'))
      await expect(proveedoresAPI.create({})).rejects.toThrow('Duplicate')
    })
  })

  describe('update', () => {
    it('retorna proveedor actualizado', async () => {
      mockPut.mockResolvedValueOnce({ data: { data: { id: 1, rsocial: 'Up' } } })
      expect(await proveedoresAPI.update(1, { rsocial: 'Up' })).toEqual({ id: 1, rsocial: 'Up' })
    })

    it('lanza error del servidor', async () => {
      mockPut.mockRejectedValueOnce(axiosErrorWithResponse('Conflict'))
      await expect(proveedoresAPI.update(1, {})).rejects.toThrow('Conflict')
    })
  })

  describe('downloadImportTemplate', () => {
    it('retorna Blob en el happy path', async () => {
      mockGet.mockResolvedValueOnce({ data: new Blob(['z']) })
      expect(await proveedoresAPI.downloadImportTemplate()).toBeInstanceOf(Blob)
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('Nope'))
      await expect(proveedoresAPI.downloadImportTemplate()).rejects.toThrow('Nope')
    })
  })

  describe('importFromCsv', () => {
    it('retorna resumen', async () => {
      mockPost.mockResolvedValueOnce({ data: { data: { created: 1, skipped: 0, errors: [] } } })
      await proveedoresAPI.importFromCsv(new File([''], 'p.csv'))
      expect(mockPost).toHaveBeenCalledWith('/proveedores/import', expect.any(FormData), {
        timeout: 120000,
      })
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Bad CSV'))
      await expect(proveedoresAPI.importFromCsv(new File([], 'x.csv'))).rejects.toThrow('Bad CSV')
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

  describe('void', () => {
    it('retorna factura anulada en el happy path', async () => {
      const voided = { id: 1, estado: 'N', total: 5000 }
      mockPut.mockResolvedValueOnce({ data: { success: true, data: voided } })
      expect(await facturasAPI.void(1, 'Error en precio')).toEqual(voided)
      expect(mockPut).toHaveBeenCalledWith('/facturas/1/void', { motivo: 'Error en precio' })
    })

    it('lanza ApiRequestFailedError en fallo', async () => {
      mockPut.mockRejectedValueOnce(axiosErrorWithResponse('Already voided'))
      await expect(facturasAPI.void(1, 'Test')).rejects.toThrow('Already voided')
    })
  })
})

// ════════════════════════════════════════════════════════════
// usersAPI
// ════════════════════════════════════════════════════════════
describe('usersAPI', () => {
  describe('list', () => {
    it('retorna lista de usuarios en el happy path', async () => {
      const users = [{ id: 1, username: 'alice', role: 'seller' }]
      mockGet.mockResolvedValueOnce({ data: { data: users } })
      const result = await usersAPI.list()
      expect(result).toEqual(users)
      expect(mockGet).toHaveBeenCalledWith('/users')
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('Authentication required'))
      await expect(usersAPI.list()).rejects.toThrow('Authentication required')
    })
  })

  describe('create', () => {
    it('retorna el usuario creado en el happy path', async () => {
      const newUser = { id: 2, username: 'bob', role: 'seller' }
      mockPost.mockResolvedValueOnce({ data: { data: newUser } })
      const result = await usersAPI.create({ username: 'bob', role: 'seller', password: 'x' })
      expect(result).toEqual(newUser)
      expect(mockPost).toHaveBeenCalledWith('/users', { username: 'bob', role: 'seller', password: 'x' })
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Username already exists'))
      await expect(usersAPI.create({ username: 'bob', role: 'seller', password: 'x' })).rejects.toThrow(
        'Username already exists',
      )
    })
  })

  describe('update', () => {
    it('retorna el usuario actualizado en el happy path', async () => {
      const updated = { id: 1, username: 'alice', role: 'manager', active: true }
      mockPut.mockResolvedValueOnce({ data: { data: updated } })
      const result = await usersAPI.update(1, { role: 'manager' })
      expect(result).toEqual(updated)
      expect(mockPut).toHaveBeenCalledWith('/users/1', { role: 'manager' })
    })

    it('lanza error del servidor', async () => {
      mockPut.mockRejectedValueOnce(axiosErrorWithResponse('User not found'))
      await expect(usersAPI.update(99, { active: false })).rejects.toThrow('User not found')
    })
  })

  describe('changePassword', () => {
    it('resuelve sin error en el happy path', async () => {
      mockPost.mockResolvedValueOnce({ data: { data: { changed: true } } })
      await expect(usersAPI.changePassword('old', 'new')).resolves.toBeUndefined()
      expect(mockPost).toHaveBeenCalledWith('/auth/change-password', {
        currentPassword: 'old',
        newPassword: 'new',
      })
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Current password is incorrect'))
      await expect(usersAPI.changePassword('wrong', 'new')).rejects.toThrow(
        'Current password is incorrect',
      )
    })
  })
})

// ════════════════════════════════════════════════════════════
// dashboardAPI
// ════════════════════════════════════════════════════════════
describe('dashboardAPI', () => {
  it('retorna el resumen del dashboard en el happy path', async () => {
    const summary = { ventasHoy: { count: 1, total: '100' }, facturasVencidas: { count: 0, total: '0' }, cobrosHoy: { count: 0, total: '0' }, alertasActivas: 0 }
    mockGet.mockResolvedValueOnce({ data: { success: true, data: summary } })
    const { dashboardAPI } = await import('./api')
    expect(await dashboardAPI.summary()).toEqual(summary)
    expect(mockGet).toHaveBeenCalledWith('/dashboard/summary')
  })

  it('lanza ApiRequestFailedError en fallo', async () => {
    mockGet.mockRejectedValueOnce(
      Object.assign(new Error('fail'), { response: { data: { error: 'Server Error' } }, isAxiosError: true }),
    )
    const { dashboardAPI } = await import('./api')
    await expect(dashboardAPI.summary()).rejects.toThrow('Server Error')
  })
})

// ════════════════════════════════════════════════════════════
// notificationsAPI
// ════════════════════════════════════════════════════════════
describe('notificationsAPI', () => {
  it('list retorna notificaciones en el happy path', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } })
    const { notificationsAPI } = await import('./api')
    expect(await notificationsAPI.list()).toEqual([])
    expect(mockGet).toHaveBeenCalledWith('/notifications')
  })

  it('list lanza ApiRequestFailedError en fallo', async () => {
    mockGet.mockRejectedValueOnce(
      Object.assign(new Error('fail'), { response: { data: { error: 'Unauthorized' } }, isAxiosError: true }),
    )
    const { notificationsAPI } = await import('./api')
    await expect(notificationsAPI.list()).rejects.toThrow('Unauthorized')
  })

  it('markRead retorna la notificación marcada en el happy path', async () => {
    const notif = { id: 1, tenantId: 1, userId: 1, type: 'test', payload: {}, readAt: 'now', createdAt: 'now' }
    mockPut.mockResolvedValueOnce({ data: { success: true, data: notif } })
    const { notificationsAPI } = await import('./api')
    expect(await notificationsAPI.markRead(1)).toEqual(notif)
    expect(mockPut).toHaveBeenCalledWith('/notifications/1/read')
  })

  it('markRead lanza ApiRequestFailedError en fallo', async () => {
    mockPut.mockRejectedValueOnce(
      Object.assign(new Error('fail'), { response: { data: { error: 'Not Found' } }, isAxiosError: true }),
    )
    const { notificationsAPI } = await import('./api')
    await expect(notificationsAPI.markRead(99)).rejects.toThrow('Not Found')
  })

  it('markAllRead retorna el conteo en el happy path', async () => {
    mockPut.mockResolvedValueOnce({ data: { success: true, data: { updated: 3 } } })
    const { notificationsAPI } = await import('./api')
    expect(await notificationsAPI.markAllRead()).toEqual({ updated: 3 })
    expect(mockPut).toHaveBeenCalledWith('/notifications/read-all')
  })

  it('markAllRead lanza ApiRequestFailedError en fallo', async () => {
    mockPut.mockRejectedValueOnce(
      Object.assign(new Error('fail'), { response: { data: { error: 'Forbidden' } }, isAxiosError: true }),
    )
    const { notificationsAPI } = await import('./api')
    await expect(notificationsAPI.markAllRead()).rejects.toThrow('Forbidden')
  })
})

// ════════════════════════════════════════════════════════════
// notifChannelsAPI
// ════════════════════════════════════════════════════════════
describe('notifChannelsAPI', () => {
  it('retorna el estado de los canales en el happy path', async () => {
    const status = { inApp: true, email: false, whatsapp: false }
    mockGet.mockResolvedValueOnce({ data: { success: true, data: status } })
    expect(await notifChannelsAPI.status()).toEqual(status)
    expect(mockGet).toHaveBeenCalledWith('/notifications/channels')
  })

  it('lanza ApiRequestFailedError en fallo', async () => {
    mockGet.mockRejectedValueOnce(
      Object.assign(new Error('fail'), { response: { data: { error: 'Unauthorized' } }, isAxiosError: true }),
    )
    await expect(notifChannelsAPI.status()).rejects.toThrow('Unauthorized')
  })
})

// ════════════════════════════════════════════════════════════
// chatAPI
// ════════════════════════════════════════════════════════════
describe('chatAPI', () => {
  const SAMPLE_CONV = [
    {
      user: { id: 1, username: 'a', role: 'seller' },
      unreadCount: 0,
      lastMessage: null,
    },
  ]
  const SAMPLE_MSG = {
    id: 1,
    tenantId: 1,
    fromUserId: 1,
    toUserId: 2,
    content: 'hola',
    createdAt: '2026-01-01',
  }

  describe('conversations', () => {
    it('usa límite por defecto', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true, data: SAMPLE_CONV } })
      expect(await chatAPI.conversations()).toEqual(SAMPLE_CONV)
      expect(mockGet).toHaveBeenCalledWith('/chat/conversations', { params: { limit: 20 } })
    })

    it('permite override de limit', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } })
      await chatAPI.conversations(5)
      expect(mockGet).toHaveBeenCalledWith('/chat/conversations', { params: { limit: 5 } })
    })

    it('lanza ApiRequestFailedError en fallo', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('No chat'))
      await expect(chatAPI.conversations()).rejects.toThrow('No chat')
    })
  })

  describe('messages', () => {
    it('pasa params opcionales', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true, data: [SAMPLE_MSG] } })
      expect(await chatAPI.messages(2, { limit: 10, before: 99 })).toEqual([SAMPLE_MSG])
      expect(mockGet).toHaveBeenCalledWith('/chat/messages/2', { params: { limit: 10, before: 99 } })
    })

    it('lanza error del servidor', async () => {
      mockGet.mockRejectedValueOnce(axiosErrorWithResponse('Forbidden'))
      await expect(chatAPI.messages(3)).rejects.toThrow('Forbidden')
    })
  })

  describe('send', () => {
    it('retorna mensaje enviado', async () => {
      mockPost.mockResolvedValueOnce({ data: { success: true, data: SAMPLE_MSG } })
      expect(await chatAPI.send(2, 'hola')).toEqual(SAMPLE_MSG)
      expect(mockPost).toHaveBeenCalledWith('/chat/messages', { toUserId: 2, content: 'hola' })
    })

    it('lanza error del servidor', async () => {
      mockPost.mockRejectedValueOnce(axiosErrorWithResponse('Empty content'))
      await expect(chatAPI.send(1, '')).rejects.toThrow('Empty content')
    })
  })
})

// ════════════════════════════════════════════════════════════
// zonasEntregaAPI
// ════════════════════════════════════════════════════════════
describe('zonasEntregaAPI', () => {
  const ZONE = { id: 1, tenantId: 1, nombre: 'Z', tipo: 'barrio', activo: true }

  describe('list', () => {
    it('retorna la lista de zonas en el happy path', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true, data: [ZONE] } })
      expect(await zonasEntregaAPI.list()).toEqual([ZONE])
      expect(mockGet).toHaveBeenCalledWith('/zonas-entrega')
    })

    it('lanza ApiRequestFailedError en fallo', async () => {
      mockGet.mockRejectedValueOnce(
        Object.assign(new Error('fail'), { response: { data: { error: 'Forbidden' } }, isAxiosError: true }),
      )
      await expect(zonasEntregaAPI.list()).rejects.toThrow('Forbidden')
    })
  })

  describe('create', () => {
    it('retorna la zona creada en el happy path', async () => {
      mockPost.mockResolvedValueOnce({ data: { success: true, data: ZONE } })
      expect(await zonasEntregaAPI.create({ nombre: 'Z' })).toEqual(ZONE)
      expect(mockPost).toHaveBeenCalledWith('/zonas-entrega', { nombre: 'Z' })
    })

    it('lanza ApiRequestFailedError en fallo', async () => {
      mockPost.mockRejectedValueOnce(
        Object.assign(new Error('fail'), { response: { data: { error: 'Bad Request' } }, isAxiosError: true }),
      )
      await expect(zonasEntregaAPI.create({ nombre: 'Z' })).rejects.toThrow('Bad Request')
    })
  })

  describe('update', () => {
    it('retorna la zona actualizada en el happy path', async () => {
      const updated = { ...ZONE, activo: false }
      mockPut.mockResolvedValueOnce({ data: { success: true, data: updated } })
      expect(await zonasEntregaAPI.update(1, { activo: false })).toEqual(updated)
      expect(mockPut).toHaveBeenCalledWith('/zonas-entrega/1', { activo: false })
    })

    it('lanza ApiRequestFailedError en fallo', async () => {
      mockPut.mockRejectedValueOnce(
        Object.assign(new Error('fail'), { response: { data: { error: 'Not Found' } }, isAxiosError: true }),
      )
      await expect(zonasEntregaAPI.update(99, {})).rejects.toThrow('Not Found')
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
