import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import '@/i18n/config'
import NuevaFacturaForm from './NuevaFacturaForm'
import type { Articulo, Cliente, FormaPago } from '@/types'

vi.mock('@/lib/api', () => ({
  facturasAPI: {
    create: vi.fn().mockResolvedValue({ id: 1 }),
  },
}))

const clientes: Cliente[] = [
  {
    id: 1,
    codigo: 1001,
    rsocial: 'Cliente con limite',
    condIva: 'RI',
    activo: true,
    creditLimit: 100,
    balance: 90,
  },
]

const articulos: Articulo[] = [
  {
    id: 1,
    codigo: 1,
    descripcion: 'Articulo 1',
    rubroId: 1,
    condIva: '1',
    umedida: 'UN',
    precioLista1: 20,
    precioLista2: 20,
    costo: 10,
    stock: 100,
    minimo: 0,
    activo: true,
  },
]

const formasPago: FormaPago[] = []

describe('NuevaFacturaForm — warning por limite de credito', () => {
  it('muestra el warning cuando balance + total supera el limite', async () => {
    render(
      <NuevaFacturaForm
        clientes={clientes}
        articulos={articulos}
        formasPago={formasPago}
        onCancel={() => {}}
        onGuardada={() => {}}
      />,
    )

    fireEvent.change(screen.getByLabelText(/cliente/i), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /agregar ítem|agregar item/i }))

    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[2], { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/número/i), { target: { value: '1' } })

    expect(await screen.findByTestId('credit-limit-warning')).not.toBeNull()
  })
})

