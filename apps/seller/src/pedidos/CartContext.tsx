import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { PedidoCondicionCobroUi, SellerCartLine } from './cartTypes'
import { cartTotal } from './cartMath'

type CartContextValue = {
  clienteId: number | null
  setClienteId: (id: number | null) => void
  lines: SellerCartLine[]
  addOrIncrement: (line: Omit<SellerCartLine, 'cantidad' | 'dscto'> & { cantidad?: number }) => void
  setCantidad: (articuloId: number, cantidad: number) => void
  setDscto: (articuloId: number, dscto: number) => void
  /** @en Sync line.stock from stock-multiple (#256). @es Sincroniza line.stock desde stock-multiple (#256). @pt-BR Sincroniza line.stock a partir de stock-multiple (#256). */
  updateLineStocks: (stockByArticuloId: Record<number, number>) => void
  removeLine: (articuloId: number) => void
  clear: () => void
  total: number
  condicionCobro: PedidoCondicionCobroUi
  setCondicionCobro: (v: PedidoCondicionCobroUi) => void
  plazoDias: string
  setPlazoDias: (v: string) => void
  observaciones: string
  setObservaciones: (v: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

/**
 * @en Holds cart + checkout fields for App Seller order flow (#169).
 * @es Mantiene carrito y campos de checkout del flujo de pedido App Seller (#169).
 * @pt-BR Mantém carrinho e campos de checkout do fluxo de pedido App Seller (#169).
 */
export function PedidoCartProvider({ children }: { children: ReactNode }) {
  const [clienteId, setClienteId] = useState<number | null>(null)
  const [lines, setLines] = useState<SellerCartLine[]>([])
  const [condicionCobro, setCondicionCobro] = useState<PedidoCondicionCobroUi>('contado')
  const [plazoDias, setPlazoDias] = useState('30')
  const [observaciones, setObservaciones] = useState('')

  const addOrIncrement = useCallback(
    (input: Omit<SellerCartLine, 'cantidad' | 'dscto'> & { cantidad?: number }) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.articuloId === input.articuloId)
        if (existing) {
          return prev.map((l) =>
            l.articuloId === input.articuloId
              ? { ...l, cantidad: l.cantidad + (input.cantidad ?? 1) }
              : l,
          )
        }
        return [
          ...prev,
          {
            articuloId: input.articuloId,
            descripcion: input.descripcion,
            precio: input.precio,
            stock: input.stock,
            cantidad: input.cantidad ?? 1,
            dscto: 0,
            condIva: input.condIva,
          },
        ]
      })
    },
    [],
  )

  const setCantidad = useCallback((articuloId: number, cantidad: number) => {
    setLines((prev) => {
      if (cantidad <= 0) {
        return prev.filter((l) => l.articuloId !== articuloId)
      }
      return prev.map((l) => (l.articuloId === articuloId ? { ...l, cantidad } : l))
    })
  }, [])

  const setDscto = useCallback((articuloId: number, dscto: number) => {
    const clamped = Math.min(100, Math.max(0, dscto))
    setLines((prev) => prev.map((l) => (l.articuloId === articuloId ? { ...l, dscto: clamped } : l)))
  }, [])

  const updateLineStocks = useCallback((stockByArticuloId: Record<number, number>) => {
    setLines((prev) => {
      let changed = false
      const next = prev.map((l) => {
        const stock = stockByArticuloId[l.articuloId]
        if (stock == null || stock === l.stock) return l
        changed = true
        return { ...l, stock }
      })
      return changed ? next : prev
    })
  }, [])

  const removeLine = useCallback((articuloId: number) => {
    setLines((prev) => prev.filter((l) => l.articuloId !== articuloId))
  }, [])

  const clear = useCallback(() => {
    setLines([])
    setObservaciones('')
    setCondicionCobro('contado')
    setPlazoDias('30')
  }, [])

  const total = useMemo(() => cartTotal(lines), [lines])

  const value = useMemo(
    () => ({
      clienteId,
      setClienteId,
      lines,
      addOrIncrement,
      setCantidad,
      setDscto,
      updateLineStocks,
      removeLine,
      clear,
      total,
      condicionCobro,
      setCondicionCobro,
      plazoDias,
      setPlazoDias,
      observaciones,
      setObservaciones,
    }),
    [
      clienteId,
      lines,
      addOrIncrement,
      setCantidad,
      setDscto,
      updateLineStocks,
      removeLine,
      clear,
      total,
      condicionCobro,
      plazoDias,
      observaciones,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function usePedidoCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('usePedidoCart must be used within PedidoCartProvider')
  }
  return ctx
}
