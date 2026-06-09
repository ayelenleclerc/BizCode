import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TenantModulesPage from '@/pages/superadmin/TenantModulesPage'
import { DEFAULT_MODULES } from '@/lib/modules'

vi.mock('@/lib/api', () => ({
  superadminAPI: {
    getTenant: vi.fn(),
    getConfig: vi.fn(),
    putConfig: vi.fn(),
    getConfigHistory: vi.fn(),
    applyConfigTemplate: vi.fn(),
    listTrials: vi.fn(),
    activateTrial: vi.fn(),
    deactivateTrial: vi.fn(),
  },
  modulesCatalogAPI: {
    get: vi.fn(),
  },
  ApiRequestFailedError: class ApiRequestFailedError extends Error {
    validation?: { valid: boolean; errors: Array<{ module: string; reason: string }> }
    constructor(
      message: string,
      options?: { hasResponse?: boolean; validation?: ApiRequestFailedError['validation'] },
    ) {
      super(message)
      this.name = 'ApiRequestFailedError'
      this.validation = options?.validation
    }
  },
}))

import {
  ApiRequestFailedError,
  modulesCatalogAPI,
  superadminAPI,
} from '@/lib/api'

const catalogPayload = {
  deploymentEnv: 'dev' as const,
  modules: [
    {
      key: 'core.auth',
      label: 'Auth',
      required: true,
      requiredInProd: true,
      dependencies: [],
      plan: 'starter',
      price: 0,
      canDeactivate: false,
    },
    {
      key: 'billing.orders',
      label: 'Orders',
      required: false,
      requiredInProd: false,
      dependencies: ['core.catalog', 'core.clients'],
      plan: 'starter',
      price: 1500,
      canDeactivate: true,
    },
  ],
  presets: {
    MAYORISTA_ALIMENTOS: { modules: [...DEFAULT_MODULES, 'billing.orders'] },
  },
}

const configRow = {
  tenantId: 1,
  businessType: 'ambos',
  rubros: [],
  plan: 'starter',
  modules: [...DEFAULT_MODULES],
  integrations: [],
  updatedAt: new Date().toISOString(),
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/superadmin/tenants/1/modules']}>
      <Routes>
        <Route path="/superadmin/tenants/:tenantId/modules" element={<TenantModulesPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('TenantModulesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(superadminAPI.getTenant).mockResolvedValue({
      id: 1,
      name: 'Demo Co',
      slug: 'demo',
      active: true,
      createdAt: configRow.updatedAt,
      updatedAt: configRow.updatedAt,
      plan: 'starter',
      modulesCount: DEFAULT_MODULES.length,
      configUpdatedAt: configRow.updatedAt,
      stats: { userCount: 1, facturaCount: 0, pedidoCount: 0, clienteCount: 0 },
      lastActivityAt: null,
    })
    vi.mocked(superadminAPI.getConfig).mockResolvedValue(configRow)
    vi.mocked(modulesCatalogAPI.get).mockResolvedValue(catalogPayload)
    vi.mocked(superadminAPI.getConfigHistory).mockResolvedValue({ total: 0, items: [] })
    vi.mocked(superadminAPI.listTrials).mockResolvedValue([])
  })

  it('shows loading then module list', async () => {
    renderPage()
    expect(screen.getByTestId('superadmin-modules-loading')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('superadmin-modules-page')).toBeInTheDocument()
    })
    expect(screen.getByTestId('superadmin-module-toggle-core.auth')).toBeInTheDocument()
  })

  it('saves config when reason is provided', async () => {
    const user = userEvent.setup()
    vi.mocked(superadminAPI.putConfig).mockResolvedValue({
      ...configRow,
      modules: [...DEFAULT_MODULES, 'billing.orders'],
    })

    renderPage()
    await waitFor(() => screen.getByTestId('superadmin-modules-page'))

    const ordersToggle = screen.getByTestId('superadmin-module-toggle-billing.orders')
    expect(ordersToggle).not.toBeDisabled()
    await user.click(ordersToggle)

    await user.type(screen.getByTestId('superadmin-config-reason'), 'enable orders for demo')
    await user.click(screen.getByTestId('superadmin-config-save'))

    await waitFor(() => {
      expect(superadminAPI.putConfig).toHaveBeenCalledWith(1, {
        modules: expect.arrayContaining(['billing.orders']),
        reason: 'enable orders for demo',
      })
    })
    expect(screen.getByTestId('superadmin-config-save-success')).toBeInTheDocument()
  })

  it('shows estimated pricing panel', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('superadmin-pricing-panel')).toBeInTheDocument()
    })
    expect(screen.getByTestId('superadmin-pricing-total')).toBeInTheDocument()
  })

  it('shows trial badge when trial is active', async () => {
    vi.mocked(superadminAPI.listTrials).mockResolvedValue([
      {
        id: 1,
        tenantId: 1,
        moduleKey: 'billing.orders',
        expiresAt: new Date(Date.now() + 10 * 86400000).toISOString(),
        active: true,
        daysRemaining: 10,
        createdAt: new Date().toISOString(),
      },
    ])
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('superadmin-trial-badge-billing.orders')).toBeInTheDocument()
    })
  })

  it('activates trial when confirmed', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(superadminAPI.activateTrial).mockResolvedValue({
      id: 2,
      tenantId: 1,
      moduleKey: 'billing.orders',
      expiresAt: new Date().toISOString(),
      active: true,
      daysRemaining: 30,
      createdAt: new Date().toISOString(),
    })
    vi.mocked(superadminAPI.getConfig).mockResolvedValue({
      ...configRow,
      modules: [...DEFAULT_MODULES, 'billing.orders'],
    })

    renderPage()
    await waitFor(() => screen.getByTestId('superadmin-modules-page'))

    await user.selectOptions(screen.getByTestId('superadmin-trial-module-select'), 'billing.orders')
    await user.click(screen.getByTestId('superadmin-trial-activate'))

    await waitFor(() => {
      expect(superadminAPI.activateTrial).toHaveBeenCalled()
    })
    confirmSpy.mockRestore()
  })

  it('shows validation error on invalid_module_set', async () => {
    const user = userEvent.setup()
    vi.mocked(superadminAPI.putConfig).mockRejectedValue(
      new ApiRequestFailedError('invalid_module_set', {
        hasResponse: true,
        validation: {
          valid: false,
          errors: [{ module: 'billing.orders', reason: 'required_module_missing' }],
        },
      }),
    )

    renderPage()
    await waitFor(() => screen.getByTestId('superadmin-modules-page'))
    await user.type(screen.getByTestId('superadmin-config-reason'), 'bad set')
    await user.click(screen.getByTestId('superadmin-config-save'))

    await waitFor(() => {
      expect(screen.getByTestId('superadmin-config-validation-error')).toBeInTheDocument()
    })
  })
})
