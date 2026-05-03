/**
 * Ejercicio de shell de rutas con mocks para subir cobertura de páginas React sin E2E.
 * Complemento de `App.a11y.test.tsx` (axe) — aquí navegación lateral y tiles de configuración.
 */
import { describe, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import App from './App'

const { mockClaims } = vi.hoisted(() => ({
  mockClaims: {
    userId: 1,
    tenantId: 1,
    username: 'cov-user',
    role: 'owner' as const,
    permissions: ['customers.read', 'customers.manage', 'products.read', 'products.manage'] as string[],
    scope: {
      tenantId: 1,
      branchIds: [] as number[],
      warehouseIds: [] as number[],
      routeIds: [] as number[],
      channels: ['counter', 'field', 'backoffice', 'warehouse', 'delivery'] as string[],
    },
  },
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  const blob = Promise.resolve(new Blob([]))
  const emptyCsv = Promise.resolve({ created: 0, skipped: 0, errors: [] as { row: number; message: string }[] })

  const sampleChatMsg = {
    id: 1,
    tenantId: 1,
    fromUserId: 1,
    toUserId: 2,
    content: 'x',
    createdAt: '2026-01-01',
  }

  const sampleZone = {
    id: 1,
    tenantId: 1,
    nombre: 'Z',
    tipo: 'barrio',
    activo: true,
  }

  return {
    ...actual,
    authAPI: {
      me: vi.fn().mockResolvedValue(mockClaims),
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue({ loggedOut: true }),
    },
    clientesAPI: {
      list: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      downloadImportTemplate: vi.fn(() => blob),
      importFromCsv: vi.fn(() => emptyCsv),
    },
    articulosAPI: {
      list: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      downloadImportTemplate: vi.fn(() => blob),
      importFromCsv: vi.fn(() => emptyCsv),
    },
    rubrosAPI: {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      downloadImportTemplate: vi.fn(() => blob),
      importFromCsv: vi.fn(() => emptyCsv),
    },
    proveedoresAPI: {
      list: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      downloadImportTemplate: vi.fn(() => blob),
      importFromCsv: vi.fn(() => emptyCsv),
    },
    formasPagoAPI: { list: vi.fn().mockResolvedValue([]) },
    facturasAPI: {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      void: vi.fn(),
    },
    dashboardAPI: {
      summary: vi.fn().mockResolvedValue({
        ventasHoy: { count: 0, total: '0' },
        facturasVencidas: { count: 0, total: '0' },
        cobrosHoy: { count: 0, total: '0' },
        alertasActivas: 0,
      }),
    },
    notificationsAPI: {
      list: vi.fn().mockResolvedValue([]),
      markRead: vi.fn(),
      markAllRead: vi.fn(),
    },
    notifChannelsAPI: { status: vi.fn().mockResolvedValue({ inApp: true, email: false, whatsapp: false }) },
    zonasEntregaAPI: {
      list: vi.fn().mockResolvedValue([sampleZone]),
      create: vi.fn().mockResolvedValue(sampleZone),
      update: vi.fn().mockResolvedValue(sampleZone),
    },
    chatAPI: {
      conversations: vi.fn().mockResolvedValue(
        [] as import('@/lib/api').ChatConversation[],
      ),
      messages: vi.fn().mockResolvedValue([sampleChatMsg]),
      send: vi.fn().mockResolvedValue(sampleChatMsg),
    },
    usersAPI: {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      changePassword: vi.fn(),
    },
    checkAPI: vi.fn().mockResolvedValue({ status: 'ok' }),
  }
})

describe('App — cobertura de rutas protegidas (smoke navegación)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
  })

  async function clickAsideLink(href: string) {
    const aside = document.querySelector('aside')
    expect(aside).toBeTruthy()
    const anchor = aside?.querySelector<HTMLAnchorElement>(`a[href="${href}"]`)
    if (!anchor) {
      throw new Error(`aside link missing: ${href}`)
    }
    await userEvent.click(anchor)
  }

  async function clickMainLink(href: string) {
    const main = document.querySelector('main')
    expect(main).toBeTruthy()
    const anchor = main?.querySelector<HTMLAnchorElement>(`a[href="${href}"]`)
    if (!anchor) {
      throw new Error(`main link missing: ${href}`)
    }
    await userEvent.click(anchor)
  }

  it('recorre módulos principales del nav y rutas desde configuración', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('auth-user-label')).toBeInTheDocument()
    })

    const sidebarPaths = [
      '/inicio',
      '/facturacion',
      '/clientes',
      '/articulos',
      '/proveedores',
      '/logistica',
      '/finanzas',
      '/chat',
      '/configuracion',
    ] as const

    for (const path of sidebarPaths) {
      await clickAsideLink(path)
      await waitFor(() => {
        expect(globalThis.location.pathname).toBe(path)
      })
    }

    await clickMainLink('/users')
    await waitFor(() => expect(globalThis.location.pathname).toBe('/users'))

    await clickAsideLink('/configuracion')
    await clickMainLink('/configuracion/zonas-entrega')
    await waitFor(() => expect(globalThis.location.pathname).toBe('/configuracion/zonas-entrega'))
  })
})
