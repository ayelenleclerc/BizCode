import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import DriverDeliveryWizard from './DriverDeliveryWizard'
import { repartosAPI, type RepartoItemRow } from '@/lib/api'

vi.mock('./PodSignatureCanvas', () => ({
  default: ({ onChange }: { onChange: (v: string | null) => void }) => (
    <button type="button" data-testid="mock-sign" onClick={() => onChange('data:image/png;base64,YWJj')}>
      sign
    </button>
  ),
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    repartosAPI: {
      ...actual.repartosAPI,
      updateItemPod: vi.fn(),
    },
  }
})

const item: RepartoItemRow = {
  id: 10,
  ordenEntregaId: 1,
  secuencia: 1,
  estado: 'pending',
  entregadoAt: null,
  motivoNoEntrega: null,
  receptorNombre: null,
  receptorDni: null,
  notasEntrega: null,
  hasPod: false,
  ordenEntrega: {
    id: 1,
    tenantId: 1,
    clienteId: 1,
    zonaId: null,
    driverId: 2,
    pickerUserId: null,
    pickingIniciadoAt: null,
    pickingListoAt: null,
    items: [],
    facturaId: null,
    fecha: '2026-05-20',
    estado: 'in_transit',
    nota: null,
    cliente: { id: 1, codigo: 1, rsocial: 'ACME' },
    zona: null,
    driver: null,
    factura: null,
  },
}

describe('DriverDeliveryWizard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when closed', () => {
    const { container } = render(
      <DriverDeliveryWizard repartoId={1} item={item} open={false} onClose={vi.fn()} onSaved={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('submits delivered flow with signature', async () => {
    const onSaved = vi.fn()
    const user = userEvent.setup()
    render(<DriverDeliveryWizard repartoId={1} item={item} open onClose={vi.fn()} onSaved={onSaved} />)

    await user.type(screen.getByTestId('pod-receptor-nombre'), 'Ana')
    await user.click(screen.getByTestId('pod-wizard-next'))
    await user.click(screen.getByTestId('mock-sign'))
    await user.click(screen.getByTestId('pod-wizard-next'))
    await user.click(screen.getByTestId('pod-wizard-next'))
    await user.click(screen.getByTestId('pod-wizard-confirm'))

    expect(repartosAPI.updateItemPod).toHaveBeenCalledWith(
      1,
      10,
      expect.objectContaining({ outcome: 'delivered', receptorNombre: 'Ana' }),
    )
    expect(onSaved).toHaveBeenCalled()
  })

  it('submits not_delivered at confirm step', async () => {
    const user = userEvent.setup()
    render(<DriverDeliveryWizard repartoId={1} item={item} open onClose={vi.fn()} onSaved={vi.fn()} />)

    await user.type(screen.getByTestId('pod-receptor-nombre'), 'Ana')
    await user.click(screen.getByTestId('pod-wizard-next'))
    await user.click(screen.getByTestId('mock-sign'))
    await user.click(screen.getByTestId('pod-wizard-next'))
    await user.click(screen.getByTestId('pod-wizard-next'))

    await user.click(screen.getByLabelText(/no entregado/i))
    await user.click(screen.getByTestId('pod-wizard-confirm'))

    expect(repartosAPI.updateItemPod).toHaveBeenCalledWith(
      1,
      10,
      expect.objectContaining({ outcome: 'not_delivered', motivoNoEntrega: 'ausente' }),
    )
  })
})
