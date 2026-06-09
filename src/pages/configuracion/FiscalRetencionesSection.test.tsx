import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FiscalRetencionesSection from './FiscalRetencionesSection'
import { fiscalRetencionesAPI } from '@/lib/api'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    fiscalRetencionesAPI: {
      getConfig: vi.fn(),
      updateConfig: vi.fn(),
      listRegimenes: vi.fn(),
      createRegimen: vi.fn(),
      updateRegimen: vi.fn(),
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ claims: { role: 'owner', tenantId: 1, userId: 1 } }),
}))

vi.mock('@/components/IfModule', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('FiscalRetencionesSection', () => {
  beforeEach(() => {
    vi.mocked(fiscalRetencionesAPI.getConfig).mockResolvedValue({
      esAgenteRetencionGanancias: false,
      esAgenteRetencionIVA: false,
      esAgenteRetencionIIBB: false,
    })
    vi.mocked(fiscalRetencionesAPI.listRegimenes).mockResolvedValue([])
    vi.mocked(fiscalRetencionesAPI.updateConfig).mockResolvedValue({
      esAgenteRetencionGanancias: true,
      esAgenteRetencionIVA: false,
      esAgenteRetencionIIBB: false,
    })
    vi.mocked(fiscalRetencionesAPI.createRegimen).mockResolvedValue({
      id: 1,
      tenantId: 1,
      tipo: 'ganancias',
      subtipo: 'retencion',
      nombre: 'Test',
      alicuota: '4.5',
      alicuotaMin: null,
      provincia: null,
      activo: true,
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    })
  })

  it('loads config and shows agent toggles', async () => {
    render(<FiscalRetencionesSection />)
    await waitFor(() => {
      expect(screen.getByTestId('checkbox-esAgenteRetencionGanancias')).toBeInTheDocument()
    })
    expect(screen.getByTestId('retenciones-empty')).toBeInTheDocument()
  })

  it('saves agent config', async () => {
    const user = userEvent.setup()
    render(<FiscalRetencionesSection />)
    await waitFor(() => screen.getByTestId('btn-save-retenciones-config'))
    await user.click(screen.getByTestId('checkbox-esAgenteRetencionGanancias'))
    await user.click(screen.getByTestId('btn-save-retenciones-config'))
    await waitFor(() => {
      expect(fiscalRetencionesAPI.updateConfig).toHaveBeenCalled()
    })
  })
})
