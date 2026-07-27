import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import RecuentosPage from './index'
import { recuentosAPI, type Recuento } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { AuthClaims, Permission } from '@/lib/rbac'

const basePermissions = ['inventory.count'] as const satisfies readonly Permission[]

const baseClaims: AuthClaims = {
  userId: 1,
  tenantId: 1,
  username: 'count-user',
  role: 'warehouse_lead',
  permissions: [...basePermissions],
  scope: {
    tenantId: 1,
    branchIds: [],
    warehouseIds: [],
    routeIds: [],
    channels: ['warehouse'],
  },
  mfaEnabled: false,
  mfaSetupRequired: false,
}

const inProgressRecuento: Recuento = {
  id: 1,
  operadorId: 1,
  estado: 'in_progress',
  fecha: '2026-05-20T10:00:00.000Z',
  operador: { id: 1, username: 'wh1' },
  items: [
    {
      id: 10,
      articuloId: 3,
      cantSistema: 5,
      cantFisica: null,
      articulo: { id: 3, codigo: 100, descripcion: 'Artículo A' },
    },
  ],
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    recuentosAPI: {
      list: vi.fn(),
      get: vi.fn(),
      start: vi.fn(),
      updateItems: vi.fn(),
      close: vi.fn(),
      downloadPdf: vi.fn(),
    },
  }
})

function mockAuth(permissions: Permission[]) {
  vi.mocked(useAuth).mockReturnValue({
    status: 'authenticated',
    claims: { ...baseClaims, permissions },
    login: vi.fn(),
    verifyMfa: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  })
}

describe('RecuentosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth([...basePermissions])
    vi.mocked(recuentosAPI.list).mockResolvedValue({
      success: true,
      data: [inProgressRecuento],
      total: 1,
      limit: 100,
      offset: 0,
    })
    vi.mocked(recuentosAPI.get).mockResolvedValue(inProgressRecuento)
  })

  it('shows forbidden without inventory.count', () => {
    mockAuth([])
    render(<RecuentosPage />)
    expect(screen.getByTestId('recuentos-forbidden')).toBeInTheDocument()
  })

  it('lists counts and shows stock blocked banner when in progress', async () => {
    render(<RecuentosPage />)
    await waitFor(() => {
      expect(screen.getByTestId('recuentos-table')).toBeInTheDocument()
    })
    expect(screen.getByTestId('recuentos-stock-blocked')).toBeInTheDocument()
    expect(screen.queryByTestId('recuentos-btn-start')).not.toBeInTheDocument()
  })

  it('starts a new count when none is open', async () => {
    const user = userEvent.setup()
    vi.mocked(recuentosAPI.list).mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      limit: 100,
      offset: 0,
    })
    vi.mocked(recuentosAPI.start).mockResolvedValue(inProgressRecuento)
    render(<RecuentosPage />)
    await waitFor(() => {
      expect(screen.getByTestId('recuentos-btn-start')).toBeInTheDocument()
    })
    await user.click(screen.getByTestId('recuentos-btn-start'))
    await waitFor(() => {
      expect(recuentosAPI.start).toHaveBeenCalled()
    })
  })
})
