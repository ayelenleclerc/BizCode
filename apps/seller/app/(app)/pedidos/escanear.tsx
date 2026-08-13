import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera'
import * as Haptics from 'expo-haptics'
import {
  ActivityIndicator,
  Button,
  Dialog,
  Portal,
  Switch,
  Text,
} from 'react-native-paper'
import type { ArticuloListItem } from '@bizcode/api-client'
import type { SellerPolicies, StockMultipleItem } from '@bizcode/types'
import { articulosAPI, sellerAlertsAPI, sugerenciasPedidoAPI } from '../../../src/api/sellerApi'
import { capQtyToStock } from '../../../src/alerts/policyGates'
import { parseMoney } from '../../../src/lib/money'
import { usePedidoCart } from '../../../src/pedidos/CartContext'
import { NumpadSheet } from '../../../src/pedidos/NumpadSheet'
import { roundQtyToMultiplo } from '../../../src/pedidos/numpadParse'
import { getScanQtyPreference, setScanQtyPreference } from '../../../src/scan/scanPrefs'

const CONFIRM_MS = 2000
const BARCODE_TYPES = ['ean13', 'ean8', 'code128', 'qr'] as const

type HitState = {
  articulo: ArticuloListItem
  stock: number
  suggestedQty: number
}

/**
 * @en Continuous barcode scanner for order cart (#255).
 * @es Escáner continuo de código de barras para el carrito (#255).
 * @pt-BR Leitor contínuo de código de barras para o carrinho (#255).
 */
export default function EscanearPedidoScreen() {
  const { clienteId: clienteIdParam } = useLocalSearchParams<{ clienteId?: string }>()
  const parsedClienteId = Number.parseInt(String(clienteIdParam ?? ''), 10)
  const { t, i18n } = useTranslation(['pedidos', 'common'])
  const router = useRouter()
  const cart = usePedidoCart()
  const [permission, requestPermission] = useCameraPermissions()
  const [locked, setLocked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [missCode, setMissCode] = useState<string | null>(null)
  const [hit, setHit] = useState<HitState | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [addOne, setAddOne] = useState(getScanQtyPreference() === 'addOne')
  const [policies, setPolicies] = useState<SellerPolicies | null>(null)
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (Number.isInteger(parsedClienteId) && parsedClienteId >= 1) {
      cart.setClienteId(parsedClienteId)
    }
  }, [parsedClienteId, cart])

  useEffect(() => {
    let cancelled = false
    void sellerAlertsAPI
      .getSellerPolicies()
      .then((p) => {
        if (!cancelled) setPolicies(p)
      })
      .catch(() => {
        if (!cancelled) setPolicies(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      if (unlockTimer.current) clearTimeout(unlockTimer.current)
    }
  }, [])

  const scheduleResume = useCallback(() => {
    if (unlockTimer.current) clearTimeout(unlockTimer.current)
    unlockTimer.current = setTimeout(() => {
      setFlash(null)
      setMissCode(null)
      setHit(null)
      setLocked(false)
      setBusy(false)
    }, CONFIRM_MS)
  }, [])

  const resolveArticulo = useCallback(async (code: string): Promise<ArticuloListItem | null> => {
    try {
      const { getOfflineDb } = await import('../../../src/offline/db')
      const { getArticuloByBarcodeLocal } = await import('../../../src/offline/repos')
      const db = await getOfflineDb()
      const local = await getArticuloByBarcodeLocal(db, code)
      if (local && typeof local.id === 'number') {
        return local as unknown as ArticuloListItem
      }
    } catch {
      // fall through to API
    }
    try {
      return await articulosAPI.getByBarcode(code)
    } catch {
      return null
    }
  }, [])

  const suggestedQtyFor = useCallback(
    async (articuloId: number, multiplo: number | null): Promise<number> => {
      const step = multiplo != null && multiplo > 0 ? multiplo : 1
      if (cart.clienteId == null) return step
      try {
        const sug = await sugerenciasPedidoAPI.get(cart.clienteId)
        const habitual = sug.habituales.find((h) => h.articuloId === articuloId)
        if (habitual && habitual.cantidadSugerida > 0) return habitual.cantidadSugerida
      } catch {
        // ignore
      }
      return step
    },
    [cart.clienteId],
  )

  const stockFor = useCallback(async (articuloId: number, fallback: number): Promise<number> => {
    try {
      const res = await sellerAlertsAPI.getStockMultiple([articuloId])
      const row = res.items.find((i: StockMultipleItem) => i.articuloId === articuloId)
      return row?.stock ?? fallback
    } catch {
      return fallback
    }
  }, [])

  const addToCart = useCallback(
    async (articulo: ArticuloListItem, qty: number, stock: number) => {
      const capEnabled = policies?.sellerStockCapQtyToAvailable ?? true
      const inCart = cart.lines.find((l) => l.articuloId === articulo.id)
      if (inCart) {
        const desired = inCart.cantidad + qty
        const capped = capQtyToStock(desired, stock, capEnabled)
        if (capped === 0 && policies?.sellerStockZeroAction === 'block') return false
        if (capped <= 0 || capped === inCart.cantidad) return false
        cart.setCantidad(articulo.id, capped)
        return true
      }
      const capped = capQtyToStock(qty, stock, capEnabled)
      if (capped === 0 && policies?.sellerStockZeroAction === 'block') return false
      if (capped <= 0) return false
      cart.addOrIncrement({
        articuloId: articulo.id,
        descripcion: articulo.descripcion,
        precio: parseMoney(articulo.precioLista1),
        stock,
        condIva: articulo.condIva ?? '1',
        cantidad: capped,
      })
      return true
    },
    [cart, policies],
  )

  const onBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (locked || busy) return
      const code = String(result.data ?? '').trim()
      if (!code) return
      setLocked(true)
      setBusy(true)
      setMissCode(null)
      setHit(null)
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch {
        // haptics optional
      }
      const articulo = await resolveArticulo(code)
      if (!articulo) {
        setMissCode(code)
        setBusy(false)
        return
      }
      const multiplo =
        articulo.multiploVenta != null && Number(articulo.multiploVenta) > 0
          ? Number(articulo.multiploVenta)
          : null
      const suggested = await suggestedQtyFor(articulo.id, multiplo)
      const stock = await stockFor(articulo.id, Number(articulo.stock ?? 0))
      const already = cart.lines.some((l) => l.articuloId === articulo.id)
      const mode = addOne ? 'addOne' : 'ask'
      if (already || mode === 'addOne') {
        const ok = await addToCart(articulo, already ? multiplo ?? 1 : suggested, stock)
        if (ok) {
          setFlash(articulo.descripcion)
          scheduleResume()
        } else {
          setBusy(false)
          setLocked(false)
        }
        return
      }
      setHit({ articulo, stock, suggestedQty: suggested })
      setBusy(false)
    },
    [
      locked,
      busy,
      resolveArticulo,
      suggestedQtyFor,
      stockFor,
      cart.lines,
      addOne,
      addToCart,
      scheduleResume,
    ],
  )

  const confirmHitQty = async (rawQty: number) => {
    if (!hit) return
    const multiplo =
      hit.articulo.multiploVenta != null && Number(hit.articulo.multiploVenta) > 0
        ? Number(hit.articulo.multiploVenta)
        : null
    const qty = roundQtyToMultiplo(rawQty, multiplo)
    if (qty <= 0) return
    const ok = await addToCart(hit.articulo, qty, hit.stock)
    if (ok) {
      setFlash(hit.articulo.descripcion)
      setHit(null)
      scheduleResume()
    }
  }

  const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'pt-BR' ? 'pt-BR' : 'es-AR'

  if (!permission) {
    return (
      <View style={styles.centered} testID="seller-pedido-scan-permission-loading">
        <ActivityIndicator />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered} testID="seller-pedido-scan-permission">
        <Text style={styles.hint}>{t('pedidos:scan.permission')}</Text>
        <Button mode="contained" onPress={() => void requestPermission()} testID="seller-pedido-scan-permission-btn">
          {t('pedidos:scan.grantPermission')}
        </Button>
        <Button onPress={() => router.back()}>{t('common:cancel')}</Button>
      </View>
    )
  }

  return (
    <View style={styles.root} testID="seller-pedido-scan-camera">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        onBarcodeScanned={locked ? undefined : onBarcodeScanned}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Text style={styles.overlayText}>{t('pedidos:scan.hint')}</Text>
          <View style={styles.prefRow}>
            <Text style={styles.overlayText}>{t('pedidos:scan.addOnePref')}</Text>
            <Switch
              value={addOne}
              onValueChange={(v) => {
                setAddOne(v)
                setScanQtyPreference(v ? 'addOne' : 'ask')
              }}
              testID="seller-pedido-scan-add-one-switch"
            />
          </View>
        </View>
        <View style={styles.frame} />
        {busy ? (
          <ActivityIndicator color="#fff" testID="seller-pedido-scan-busy" />
        ) : null}
        {flash ? (
          <Text style={styles.flash} testID="seller-pedido-scan-flash">
            {t('pedidos:scan.added', { name: flash })}
          </Text>
        ) : null}
        <Button mode="contained" onPress={() => router.back()} style={styles.done} testID="seller-pedido-scan-done">
          {t('pedidos:scan.done')}
        </Button>
      </View>

      <Portal>
        <Dialog visible={missCode != null} onDismiss={() => { setMissCode(null); setLocked(false) }} testID="seller-pedido-scan-miss">
          <Dialog.Title>{t('pedidos:scan.notFoundTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('pedidos:scan.notFound', { code: missCode })}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setMissCode(null)
                router.back()
              }}
              testID="seller-pedido-scan-miss-manual"
            >
              {t('pedidos:scan.searchManual')}
            </Button>
            <Button
              onPress={() => {
                setMissCode(null)
                setLocked(false)
                setBusy(false)
              }}
              testID="seller-pedido-scan-miss-retry"
            >
              {t('pedidos:scan.scanAnother')}
            </Button>
          </Dialog.Actions>
        </Dialog>

      </Portal>

      <NumpadSheet
        visible={hit != null}
        mode="cantidad"
        initialValue={hit?.suggestedQty ?? 1}
        precio={hit ? parseMoney(hit.articulo.precioLista1) : 0}
        cantidadForSubtotal={hit?.suggestedQty ?? 0}
        dsctoForSubtotal={0}
        title={hit?.articulo.descripcion}
        subtitle={hit ? t('pedidos:stock', { count: hit.stock }) : undefined}
        locale={locale}
        onDismiss={() => {
          setHit(null)
          setLocked(false)
        }}
        onConfirm={(value) => void confirmHitQty(value)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  hint: { textAlign: 'center', marginBottom: 8 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  topBar: { gap: 8, marginTop: 24 },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  overlayText: { color: '#fff', fontWeight: '600' },
  frame: {
    alignSelf: 'center',
    width: '80%',
    height: 180,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
  },
  flash: {
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 8,
    borderRadius: 8,
  },
  done: { marginBottom: 24 },
})
