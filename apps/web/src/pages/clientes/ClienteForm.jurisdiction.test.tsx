/**
 * @en The tax identifier labels follow the jurisdiction, not the identifier kind: Uruguay and
 *   Chile both call it RUT but expect different formats, so a shared label showed the Uruguayan
 *   example to Chilean tenants (#208).
 * @es Las etiquetas del identificador fiscal siguen a la jurisdicción, no al tipo: Uruguay y Chile
 *   llaman RUT a formatos distintos, así que una etiqueta compartida mostraba el ejemplo uruguayo
 *   a los tenants chilenos (#208).
 * @pt-BR Os rótulos do identificador fiscal seguem a jurisdição, não o tipo: Uruguai e Chile chamam
 *   de RUT formatos diferentes, então um rótulo compartilhado mostrava o exemplo uruguaio aos
 *   tenants chilenos (#208).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import ClienteForm from './ClienteForm'
import { arcaAPI, listasPreciosAPI, zonasEntregaAPI } from '@/lib/api'

const jurisdiccionFiscal = vi.hoisted(() => ({ current: 'CL' }))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    claims: { role: 'owner', permissions: ['customers.manage'] },
  }),
}))

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: () => ({ jurisdiccionFiscal: jurisdiccionFiscal.current }),
}))

vi.mock('@/components/IfModule', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('./ClienteCobrosRecientes', () => ({
  default: () => <div data-testid="cliente-cobros-recientes-stub" />,
}))

vi.mock('./ClienteCuentaCorrienteSection', () => ({
  default: () => <div data-testid="cliente-cc-stub" />,
}))

vi.mock('./ClienteFidelizacionSection', () => ({
  default: () => <div data-testid="cliente-fidelizacion-stub" />,
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    clientesAPI: { ...actual.clientesAPI, create: vi.fn(), update: vi.fn() },
    zonasEntregaAPI: { list: vi.fn().mockResolvedValue([]) },
    listasPreciosAPI: { list: vi.fn().mockResolvedValue({ data: [] }) },
    arcaAPI: { ...actual.arcaAPI, consultaPadron: vi.fn() },
  }
})

describe('ClienteForm tax identifier per jurisdiction (#208)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    vi.mocked(zonasEntregaAPI.list).mockResolvedValue([])
    vi.mocked(listasPreciosAPI.list).mockResolvedValue({ data: [], total: 0 } as never)
  })

  it('shows the Chilean example, not the Uruguayan one, for a Chilean tenant', () => {
    jurisdiccionFiscal.current = 'CL'

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={vi.fn()} />)

    const field = screen.getByTestId('cliente-form-cuit')
    expect(field).toHaveAttribute('placeholder', '12.345.678-5')
    expect(field).toHaveAttribute('data-tax-id-kind', 'rut')
  })

  it('keeps the Uruguayan example for a Uruguayan tenant', () => {
    jurisdiccionFiscal.current = 'UY'

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={vi.fn()} />)

    expect(screen.getByTestId('cliente-form-cuit')).toHaveAttribute('placeholder', '01-234567-8908')
  })

  it('keeps the Argentine example and the padron lookup for an Argentine tenant', async () => {
    jurisdiccionFiscal.current = 'AR'
    const user = userEvent.setup()

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={vi.fn()} />)

    const field = screen.getByTestId('cliente-form-cuit')
    expect(field).toHaveAttribute('placeholder', '20-12345678-6')

    await user.type(field, '20-11111111-2')
    await user.tab()

    expect(arcaAPI.consultaPadron).toHaveBeenCalled()
  })

  it('skips the Argentine padron lookup outside Argentina', async () => {
    jurisdiccionFiscal.current = 'CL'
    const user = userEvent.setup()

    render(<ClienteForm cliente={null} onClose={vi.fn()} onGuardado={vi.fn()} />)

    await user.type(screen.getByTestId('cliente-form-cuit'), '12.345.678-5')
    await user.tab()

    expect(arcaAPI.consultaPadron).not.toHaveBeenCalled()
  })
})
