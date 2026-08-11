import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Banner,
  Button,
  Chip,
  FAB,
  Searchbar,
  Text,
} from 'react-native-paper'
import type { ArticuloListItem } from '@bizcode/api-client'
import type { Rubro, SellerPolicies, SellerStockEstado, StockMultipleItem } from '@bizcode/types'
import { articulosAPI, clientesAPI, rubrosAPI, sellerAlertsAPI } from '../../../src/api/sellerApi'
import { capQtyToStock } from '../../../src/alerts/policyGates'
import { mapApiErrorToUiState, type UiLoadState } from '../../../src/lib/apiErrors'
import { formatMoney, parseMoney } from '../../../src/lib/money'
import { usePedidoCart } from '../../../src/pedidos/CartContext'

const DEBOUNCE_MS = 300
const CATALOG_LIMIT = 80

const STOCK_COLOR: Record<SellerStockEstado, string> = {
  ok: '#1B5E20',
  bajo: '#E65100',
  cero: '#B71C1C',
}

type ClienteMini = {
  id: number
  rsocial: string
  suspended?: boolean
}

function deriveStockEstado(stock: number): SellerStockEstado {
  return stock <= 0 ? 'cero' : 'ok'
}

export default function NuevoPedidoScreen() {
  const { clienteId: clienteIdParam } = useLocalSearchParams<{ clienteId?: string }>()
  const parsedClienteId = Number.parseInt(String(clienteIdParam ?? ''), 10)
  const { t, i18n } = useTranslation(['pedidos', 'common'])
  const router = useRouter()
  const cart = usePedidoCart()

  const [query, setQuery] = useState('')
  const [rubroId, setRubroId] = useState<number | null>(null)
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [items, setItems] = useState<ArticuloListItem[]>([])
  const [state, setState] = useState<UiLoadState>('idle')
  const [cliente, setCliente] = useState<ClienteMini | null>(null)
  const [clienteState, setClienteState] = useState<UiLoadState>('loading')
  const [policies, setPolicies] = useState<SellerPolicies | null>(null)
  const [stockById, setStockById] = useState<Record<number, StockMultipleItem>>({})
  const [stockAsOf, setStockAsOf] = useState<string | null>(null)
  const reqId = useRef(0)

  useEffect(() => {
    if (Number.isInteger(parsedClienteId) && parsedClienteId >= 1) {
      cart.setClienteId(parsedClienteId)
    }
  }, [parsedClienteId, cart])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const pols = await sellerAlertsAPI.getSellerPolicies()
        if (!cancelled) setPolicies(pols)
      } catch {
        try {
          const { getOfflineDb } = await import('../../../src/offline/db')
          const { getSellerPoliciesLocal } = await import('../../../src/offline/repos')
          const db = await getOfflineDb()
          const cached = (await getSellerPoliciesLocal(db)) as SellerPolicies | null
          if (!cancelled) setPolicies(cached)
        } catch {
          if (!cancelled) setPolicies(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const id = cart.clienteId
    if (id == null) {
      setCliente(null)
      setClienteState('not_found')
      return
    }
    setClienteState('loading')
    void (async () => {
      try {
        const raw = (await clientesAPI.get(id)) as ClienteMini | null | undefined
        if (cancelled) return
        if (!raw) {
          setCliente(null)
          setClienteState('not_found')
          return
        }
        setCliente(raw)
        setClienteState(raw.suspended ? 'forbidden' : 'success')
      } catch (err) {
        if (cancelled) return
        setCliente(null)
        setClienteState(mapApiErrorToUiState(err))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [cart.clienteId])

  useEffect(() => {
    void rubrosAPI.list({ limit: 100 }).then(
      (rows) => setRubros(Array.isArray(rows) ? rows : []),
      () => {
        void (async () => {
          try {
            const { getOfflineDb } = await import('../../../src/offline/db')
            const { listRubrosLocal } = await import('../../../src/offline/repos')
            const db = await getOfflineDb()
            const cached = await listRubrosLocal(db)
            setRubros(cached as unknown as Rubro[])
          } catch {
            setRubros([])
          }
        })()
      },
    )
  }, [])

  const search = useCallback(async (q: string) => {
    const id = ++reqId.current
    setState('loading')
    try {
      const data = await articulosAPI.list(q.trim() || undefined, { limit: CATALOG_LIMIT })
      if (id !== reqId.current) return
      const list = (Array.isArray(data) ? data : []).filter((a) => a.activo !== false && !a.esPadre)
      setItems(list)
      setState(list.length === 0 ? 'empty' : 'success')
    } catch (err) {
      if (id !== reqId.current) return
      try {
        const { getOfflineDb } = await import('../../../src/offline/db')
        const { searchArticulosLocal } = await import('../../../src/offline/repos')
        const db = await getOfflineDb()
        const cached = await searchArticulosLocal(db, q.trim())
        if (id !== reqId.current) return
        const list = cached
          .map((a) => a as unknown as ArticuloListItem)
          .filter((a) => a.activo !== false && !a.esPadre)
        setItems(list)
        setState(list.length === 0 ? 'empty' : 'success')
      } catch {
        setItems([])
        setState(mapApiErrorToUiState(err))
      }
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void search(query)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query, search])

  const filtered = useMemo(() => {
    if (rubroId == null) return items
    return items.filter((a) => a.rubroId === rubroId || a.rubro?.id === rubroId)
  }, [items, rubroId])

  const stockIdsKey = useMemo(() => {
    const ids = new Set<number>()
    for (const a of filtered) ids.add(a.id)
    for (const l of cart.lines) ids.add(l.articuloId)
    return Array.from(ids)
      .filter((n) => Number.isInteger(n) && n >= 1)
      .sort((a, b) => a - b)
      .join(',')
  }, [filtered, cart.lines])

  useEffect(() => {
    if (state !== 'success') return
    const ids = stockIdsKey
      ? stockIdsKey.split(',').map((s) => Number.parseInt(s, 10)).filter((n) => Number.isInteger(n) && n >= 1)
      : []
    if (ids.length === 0) {
      setStockById({})
      setStockAsOf(null)
      return
    }
    let cancelled = false
    void (async () => {
      const applyItems = (asOf: string, rows: StockMultipleItem[]) => {
        const map: Record<number, StockMultipleItem> = {}
        const stockPatch: Record<number, number> = {}
        for (const row of rows) {
          map[row.articuloId] = row
          stockPatch[row.articuloId] = row.stock
        }
        setStockById(map)
        setStockAsOf(asOf)
        cart.updateLineStocks(stockPatch)
      }
      try {
        const res = await sellerAlertsAPI.getStockMultiple(ids)
        if (cancelled) return
        applyItems(res.asOf, res.items)
      } catch {
        try {
          const { getOfflineDb } = await import('../../../src/offline/db')
          const { getStockSnapshotLocal } = await import('../../../src/offline/repos')
          const db = await getOfflineDb()
          const snap = (await getStockSnapshotLocal(db)) as {
            asOf: string
            items: StockMultipleItem[]
          }
          if (cancelled) return
          const idSet = new Set(ids)
          applyItems(
            snap.asOf,
            snap.items.filter((row) => idSet.has(row.articuloId)),
          )
        } catch {
          if (!cancelled) {
            setStockById({})
            setStockAsOf(null)
          }
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [state, stockIdsKey, cart])

  const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'pt-BR' ? 'pt-BR' : 'es-AR'
  const suspended = Boolean(cliente?.suspended)
  const capEnabled = policies?.sellerStockCapQtyToAvailable ?? true

  const resolveStock = (item: ArticuloListItem) => {
    const fromMulti = stockById[item.id]
    const stock = fromMulti?.stock ?? Number(item.stock ?? 0)
    const estado = fromMulti?.estado || deriveStockEstado(stock)
    return { stock, estado }
  }

  const tryAddOrInc = (item: ArticuloListItem, currentQty: number) => {
    const { stock } = resolveStock(item)
    const desired = currentQty + 1
    const capped = capQtyToStock(desired, stock, capEnabled)
    if (capped === 0 && policies?.sellerStockZeroAction === 'block') return
    if (capped <= 0) return
    if (currentQty > 0) {
      if (capped === currentQty) return
      cart.setCantidad(item.id, capped)
      return
    }
    const precio = parseMoney(item.precioLista1)
    cart.addOrIncrement({
      articuloId: item.id,
      descripcion: item.descripcion,
      precio,
      stock,
      condIva: item.condIva ?? '1',
      cantidad: capped,
    })
  }

  if (cart.clienteId == null || clienteState === 'not_found') {
    return (
      <View style={styles.root} testID="seller-pedido-nuevo">
        <Text>{t('pedidos:missingCliente')}</Text>
        <Button mode="contained" onPress={() => router.replace('/(app)/clientes')} testID="seller-pedido-goto-clientes">
          {t('common:tabs.clientes')}
        </Button>
      </View>
    )
  }

  return (
    <View style={styles.root} testID="seller-pedido-nuevo">
      {clienteState === 'loading' && (
        <View style={styles.centered} testID="seller-pedido-cliente-loading">
          <ActivityIndicator />
        </View>
      )}

      {suspended && (
        <Banner visible icon="alert" testID="seller-pedido-suspended">
          {t('pedidos:suspendedBanner')}
        </Banner>
      )}

      {cliente && !suspended && (
        <View testID="seller-pedido-cliente-name">
          <Text style={styles.cliente}>{cliente.rsocial}</Text>
        </View>
      )}

      {stockAsOf != null && stockAsOf !== '' && (
        <Banner visible icon="clock-outline" testID="seller-pedido-stock-asof">
          {t('pedidos:stockAsOf', { when: stockAsOf })}
        </Banner>
      )}

      <Searchbar
        placeholder={t('pedidos:searchPlaceholder')}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        {...({
          testID: 'seller-pedido-catalog-search',
          accessibilityLabel: t('pedidos:searchPlaceholder'),
        } as object)}
      />

      <FlatList
        horizontal
        data={[{ id: null as number | null, nombre: t('common:tabs.catalogo') }, ...rubros]}
        keyExtractor={(r) => String(r.id ?? 'all')}
        style={styles.rubros}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Chip
            selected={rubroId === item.id}
            onPress={() => setRubroId(item.id)}
            style={styles.chip}
            testID={`seller-pedido-rubro-${item.id ?? 'all'}`}
          >
            {item.nombre}
          </Chip>
        )}
      />

      {state === 'loading' && (
        <View style={styles.centered} testID="seller-pedido-catalog-loading">
          <ActivityIndicator />
        </View>
      )}
      {state === 'empty' && (
        <View testID="seller-pedido-catalog-empty">
          <Text style={styles.hint}>{t('pedidos:emptyCatalog')}</Text>
        </View>
      )}
      {(state === 'error' || state === 'offline' || state === 'forbidden') && (
        <View style={styles.centered} testID={`seller-pedido-catalog-${state}`}>
          <Text>
            {state === 'offline'
              ? t('common:errorOffline')
              : state === 'forbidden'
                ? t('common:errorForbidden')
                : t('common:errorGeneric')}
          </Text>
          <Button onPress={() => void search(query)}>{t('common:retry')}</Button>
        </View>
      )}

      {state === 'success' && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          testID="seller-pedido-catalog-list"
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.hint}>{t('pedidos:emptyCatalog')}</Text>
          }
          renderItem={({ item }) => {
            const precio = parseMoney(item.precioLista1)
            const { stock, estado } = resolveStock(item)
            const inCart = cart.lines.find((l) => l.articuloId === item.id)
            const stockColor = STOCK_COLOR[estado]
            return (
              <View style={styles.row} testID={`seller-pedido-articulo-${item.id}`}>
                <View style={styles.rowMain}>
                  <Text variant="titleSmall">{item.descripcion}</Text>
                  <Text style={styles.meta}>
                    {formatMoney(precio, locale)}
                  </Text>
                  <View style={styles.stockRow} testID={`seller-pedido-stock-${item.id}`}>
                    <Chip
                      compact
                      style={[styles.stockChip, { borderColor: stockColor }]}
                      textStyle={{ color: stockColor, fontSize: 12 }}
                    >
                      {t(`pedidos:stockStatus.${estado}`)} · {t('pedidos:stock', { count: stock })}
                    </Chip>
                  </View>
                </View>
                {inCart ? (
                  <View style={styles.qtyRow}>
                    <Button
                      compact
                      mode="outlined"
                      onPress={() => cart.setCantidad(item.id, inCart.cantidad - 1)}
                      disabled={suspended}
                      testID={`seller-pedido-qty-dec-${item.id}`}
                      accessibilityLabel="-"
                    >
                      −
                    </Button>
                    <View testID={`seller-pedido-qty-${item.id}`}>
                      <Text>{inCart.cantidad}</Text>
                    </View>
                    <Button
                      compact
                      mode="outlined"
                      onPress={() => tryAddOrInc(item, inCart.cantidad)}
                      disabled={suspended}
                      testID={`seller-pedido-qty-inc-${item.id}`}
                      accessibilityLabel="+"
                    >
                      +
                    </Button>
                  </View>
                ) : (
                  <Button
                    mode="contained-tonal"
                    compact
                    disabled={suspended}
                    onPress={() => tryAddOrInc(item, 0)}
                    testID={`seller-pedido-add-${item.id}`}
                    accessibilityLabel={t('pedidos:add')}
                  >
                    {t('pedidos:add')}
                  </Button>
                )}
              </View>
            )
          }}
        />
      )}

      {cart.lines.length > 0 && !suspended && (
        <FAB
          icon="cart"
          label={t('pedidos:cartFab', {
            count: cart.lines.length,
            total: formatMoney(cart.total, locale),
          })}
          style={styles.fab}
          onPress={() => router.push('/(app)/pedidos/resumen')}
          testID="seller-pedido-cart-fab"
          accessibilityLabel={t('pedidos:resume')}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 12, gap: 8 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  search: { marginBottom: 4 },
  cliente: { fontWeight: '600', marginBottom: 4 },
  rubros: { maxHeight: 44, marginBottom: 4 },
  chip: { marginRight: 8 },
  list: { paddingBottom: 96 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  rowMain: { flex: 1, gap: 2 },
  meta: { opacity: 0.7, fontSize: 13 },
  stockRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  stockChip: { alignSelf: 'flex-start', backgroundColor: 'transparent', borderWidth: 1 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hint: { opacity: 0.7, padding: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
})
