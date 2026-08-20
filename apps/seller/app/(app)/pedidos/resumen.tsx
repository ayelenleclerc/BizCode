import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Banner,
  Button,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper'
import type { EstadoCredito, PedidoWhatsAppItem, SellerPolicies } from '@bizcode/types'
import { clientesAPI, pedidosAPI, sellerAlertsAPI } from '../../../src/api/sellerApi'
import { capQtyToStock, isCreditBlocked, shouldBlockConfirmForStock } from '../../../src/alerts/policyGates'
import { useAuth } from '../../../src/auth/AuthContext'
import { mapApiErrorToUiState } from '../../../src/lib/apiErrors'
import { formatMoney, parseMoney } from '../../../src/lib/money'
import { useOffline } from '../../../src/offline/OfflineContext'
import { useDeviceIntegrity } from '../../../src/security/DeviceIntegrityContext'
import { usePedidoCart } from '../../../src/pedidos/CartContext'
import { NumpadSheet } from '../../../src/pedidos/NumpadSheet'
import { roundQtyToMultiplo } from '../../../src/pedidos/numpadParse'
import {
  availableCredit,
  buildPedidoBody,
  hasStockWarnings,
  lineSubtotal,
} from '../../../src/pedidos/cartMath'
import type { PedidoCondicionCobroUi, SellerCartLine } from '../../../src/pedidos/cartTypes'
import { PedidoWhatsAppButton } from '../../../src/pedidos/PedidoWhatsAppButton'

export default function PedidoResumenScreen() {
  const { t, i18n } = useTranslation(['pedidos', 'common'])
  const router = useRouter()
  const cart = usePedidoCart()
  const { claims } = useAuth()
  const { refreshMeta } = useOffline()
  const { confirmSensitiveAction } = useDeviceIntegrity()
  const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'pt-BR' ? 'pt-BR' : 'es-AR'

  const [saldo, setSaldo] = useState<number | null>(null)
  const [creditLimit, setCreditLimit] = useState<number | null>(null)
  const [estado, setEstado] = useState<EstadoCredito | null>(null)
  const [policies, setPolicies] = useState<SellerPolicies | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmedId, setConfirmedId] = useState<number | null>(null)
  const [clienteTelef, setClienteTelef] = useState<string | null>(null)
  const [waSnapshot, setWaSnapshot] = useState<{
    telef?: string | null
    items: PedidoWhatsAppItem[]
    total: number
    template?: string | null
  } | null>(null)
  const [numpad, setNumpad] = useState<
    | { mode: 'cantidad'; line: SellerCartLine }
    | { mode: 'dscto'; line: SellerCartLine }
    | { mode: 'dscto'; scope: 'all' }
    | null
  >(null)

  useEffect(() => {
    const id = cart.clienteId
    if (id == null) return
    void (async () => {
      try {
        const [clienteRaw, saldoRes] = await Promise.all([
          clientesAPI.get(id) as Promise<{
            creditLimit?: number | string | null
            telef?: string | null
          } | null>,
          clientesAPI.cuentaCorrienteSaldo(id).catch(() => null),
        ])
        setCreditLimit(
          clienteRaw?.creditLimit == null ? null : parseMoney(clienteRaw.creditLimit),
        )
        setClienteTelef(typeof clienteRaw?.telef === 'string' ? clienteRaw.telef : null)
        setSaldo(saldoRes ? parseMoney(saldoRes.saldo) : null)
      } catch {
        try {
          const { getOfflineDb } = await import('../../../src/offline/db')
          const { getClienteLocal } = await import('../../../src/offline/repos')
          const db = await getOfflineDb()
          const cached = (await getClienteLocal(db, id)) as {
            creditLimit?: number | string | null
            telef?: string | null
          } | null
          setCreditLimit(
            cached?.creditLimit == null ? null : parseMoney(cached.creditLimit),
          )
          setClienteTelef(typeof cached?.telef === 'string' ? cached.telef : null)
          setSaldo(null)
        } catch {
          setSaldo(null)
          setCreditLimit(null)
          setClienteTelef(null)
        }
      }

      try {
        const [estadoRes, pols] = await Promise.all([
          sellerAlertsAPI.getEstadoCredito(id),
          sellerAlertsAPI.getSellerPolicies(),
        ])
        setEstado(estadoRes)
        setPolicies(pols)
      } catch {
        try {
          const { getOfflineDb } = await import('../../../src/offline/db')
          const { getEstadoCreditoLocal, getSellerPoliciesLocal } = await import(
            '../../../src/offline/repos'
          )
          const db = await getOfflineDb()
          const creditCached = (await getEstadoCreditoLocal(db, id)) as EstadoCredito | null
          const polsCached = (await getSellerPoliciesLocal(db)) as SellerPolicies | null
          setEstado(creditCached)
          setPolicies(polsCached)
        } catch {
          setEstado(null)
          setPolicies(null)
        }
      }
    })()
  }, [cart.clienteId])

  const stockWarn = hasStockWarnings(cart.lines)
  const avail = availableCredit(saldo, creditLimit)
  const creditWarn = avail != null && cart.total > avail

  const stockBlocked = shouldBlockConfirmForStock(cart.lines, policies)
  const creditBlocked =
    isCreditBlocked(estado?.nivel, policies) ||
    (creditWarn && !estado && policies?.sellerCreditOverLimitAction === 'block') ||
    (creditWarn && avail != null && avail < 0 && policies?.sellerCreditOverLimitAction === 'block')

  const confirmDisabled =
    submitting ||
    stockBlocked ||
    creditBlocked ||
    (creditWarn && policies?.sellerCreditOverLimitAction === 'block')
  const policyBlocked =
    stockBlocked ||
    creditBlocked ||
    (creditWarn && policies?.sellerCreditOverLimitAction === 'block')

  const onConfirm = useCallback(async () => {
    if (cart.clienteId == null || cart.lines.length === 0) return
    if (cart.condicionCobro === 'plazo') {
      const dias = Number.parseInt(cart.plazoDias, 10)
      if (!Number.isInteger(dias) || dias < 1) {
        setError(t('pedidos:plazoRequired'))
        return
      }
    }
    setSubmitting(true)
    setError(null)
    try {
      const plazoDias =
        cart.condicionCobro === 'plazo' ? Number.parseInt(cart.plazoDias, 10) : null
      const body = buildPedidoBody({
        clienteId: cart.clienteId,
        lines: cart.lines,
        observaciones: cart.observaciones.trim() || null,
        condicionCobro: cart.condicionCobro,
        plazoDias,
        vendedorId: claims?.userId ?? null,
      })
      const snapshot = {
        telef: clienteTelef,
        items: cart.lines.map((line) => ({
          descripcion: line.descripcion,
          cantidad: line.cantidad,
          precio: line.precio,
          dscto: line.dscto,
          subtotal: lineSubtotal(line),
        })),
        total: cart.total,
        template: policies?.sellerWhatsappTemplate ?? null,
      }
      const { isOnline } = await import('../../../src/offline/network')
      const online = await isOnline()
      if (!online) {
        const { enqueuePedidoCreateConfirm } = await import('../../../src/offline/actions')
        const localId = await enqueuePedidoCreateConfirm({
          body: body as unknown as Record<string, unknown>,
          clienteId: cart.clienteId,
        })
        setWaSnapshot(snapshot)
        setConfirmedId(localId)
        cart.clear()
        await refreshMeta()
        return
      }
      const created = await pedidosAPI.create(body as unknown as Record<string, unknown>)
      const confirmed = await pedidosAPI.confirm(created.id)
      setWaSnapshot(snapshot)
      setConfirmedId(confirmed.id)
      cart.clear()
    } catch (err) {
      const ui = mapApiErrorToUiState(err)
      if (ui === 'offline') {
        try {
          const plazoDias =
            cart.condicionCobro === 'plazo' ? Number.parseInt(cart.plazoDias, 10) : null
          const body = buildPedidoBody({
            clienteId: cart.clienteId,
            lines: cart.lines,
            observaciones: cart.observaciones.trim() || null,
            condicionCobro: cart.condicionCobro,
            plazoDias,
            vendedorId: claims?.userId ?? null,
          })
          const { enqueuePedidoCreateConfirm } = await import('../../../src/offline/actions')
          const localId = await enqueuePedidoCreateConfirm({
            body: body as unknown as Record<string, unknown>,
            clienteId: cart.clienteId!,
          })
          setWaSnapshot({
            telef: clienteTelef,
            items: cart.lines.map((line) => ({
              descripcion: line.descripcion,
              cantidad: line.cantidad,
              precio: line.precio,
              dscto: line.dscto,
              subtotal: lineSubtotal(line),
            })),
            total: cart.total,
            template: policies?.sellerWhatsappTemplate ?? null,
          })
          setConfirmedId(localId)
          cart.clear()
          await refreshMeta()
          return
        } catch {
          setError(t('common:errorOffline'))
        }
      } else if (ui === 'forbidden') setError(t('common:errorForbidden'))
      else setError(err instanceof Error ? err.message : t('common:errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }, [cart, t, claims?.userId, refreshMeta, clienteTelef, policies?.sellerWhatsappTemplate])

  if (cart.clienteId == null) {
    return (
      <View style={styles.root} testID="seller-pedido-resumen">
        <Text>{t('pedidos:missingCliente')}</Text>
      </View>
    )
  }

  if (confirmedId != null) {
    const pending = confirmedId < 0
    return (
      <View style={styles.root} testID="seller-pedido-success">
        <Text variant="titleLarge">
          {pending
            ? t('common:offline.queuedOrder', { id: confirmedId })
            : t('pedidos:successTitle', { id: confirmedId })}
        </Text>
        <PedidoWhatsAppButton
          pedidoId={confirmedId}
          locale={i18n.language}
          snapshot={pending ? waSnapshot : null}
          policies={policies}
        />
        {!pending ? (
          <Button
            mode="contained"
            onPress={() => router.replace(`/(app)/pedidos/${confirmedId}`)}
            testID="seller-pedido-view-detail"
          >
            {t('pedidos:viewDetail')}
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={() => router.replace('/(app)/pedidos')}
            testID="seller-pedido-back-list"
          >
            {t('common:tabs.pedidos')}
          </Button>
        )}
      </View>
    )
  }

  if (cart.lines.length === 0) {
    return (
      <View style={styles.root} testID="seller-pedido-resumen">
        <Text>{t('pedidos:cartEmpty')}</Text>
        <Button mode="contained" onPress={() => router.back()}>
          {t('common:cancel')}
        </Button>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.root} testID="seller-pedido-resumen">
      {stockBlocked ? (
        <Banner visible icon="alert" testID="seller-pedido-stock-warning-block">
          {t('pedidos:stockWarningBlock')}
        </Banner>
      ) : (
        stockWarn && (
          <Banner visible icon="alert" testID="seller-pedido-stock-warning">
            {t('pedidos:stockWarning')}
          </Banner>
        )
      )}
      {creditBlocked || (creditWarn && policies?.sellerCreditOverLimitAction === 'block') ? (
        <Banner visible icon="alert-circle" testID="seller-pedido-credit-warning-block">
          {t('pedidos:creditWarningBlock')}
        </Banner>
      ) : (
        creditWarn && (
          <Banner visible icon="alert-circle" testID="seller-pedido-credit-warning">
            {t('pedidos:creditWarning', { available: formatMoney(avail, locale) })}
          </Banner>
        )
      )}

      {cart.lines.map((line) => (
        <Swipeable
          key={line.articuloId}
          overshootRight={false}
          renderRightActions={() => (
            <View style={styles.swipeActions}>
              <Pressable
                onPress={() => setNumpad({ mode: 'dscto', line })}
                style={[styles.swipeBtn, styles.swipeDscto]}
                accessibilityRole="button"
                accessibilityLabel={t('pedidos:numpad.swipeDiscount')}
                testID={`seller-pedido-swipe-dscto-${line.articuloId}`}
              >
                <Text style={styles.swipeLabel}>{t('pedidos:numpad.swipeDiscount')}</Text>
              </Pressable>
              <Pressable
                onPress={() => cart.removeLine(line.articuloId)}
                style={[styles.swipeBtn, styles.swipeRemove]}
                accessibilityRole="button"
                accessibilityLabel={t('pedidos:remove')}
                testID={`seller-pedido-swipe-remove-${line.articuloId}`}
              >
                <Text style={styles.swipeLabel}>{t('pedidos:remove')}</Text>
              </Pressable>
            </View>
          )}
        >
          <View style={styles.line} testID={`seller-pedido-summary-line-${line.articuloId}`}>
            <View style={styles.lineMain}>
              <Text variant="titleSmall">{line.descripcion}</Text>
              <Pressable
                onPress={() => setNumpad({ mode: 'cantidad', line })}
                accessibilityRole="button"
                accessibilityLabel={t('pedidos:qty')}
                testID={`seller-pedido-summary-qty-${line.articuloId}`}
              >
                <Text style={styles.meta}>
                  {line.cantidad} × {formatMoney(line.precio, locale)}
                  {line.dscto > 0 ? ` (−${line.dscto}%)` : ''}
                  {line.cantidad > line.stock ? ` · ${t('pedidos:lineStockWarn')}` : ''}
                </Text>
              </Pressable>
            </View>
            <Text>{formatMoney(lineSubtotal(line), locale)}</Text>
          </View>
        </Swipeable>
      ))}

      <View testID="seller-pedido-total">
        <Text variant="titleMedium" style={styles.total}>
          {t('pedidos:total')}: {formatMoney(cart.total, locale)}
        </Text>
      </View>

      <Button
        mode="outlined"
        onPress={() => setNumpad({ mode: 'dscto', scope: 'all' })}
        testID="seller-pedido-dscto-global"
        accessibilityLabel={t('pedidos:numpad.globalDiscount')}
      >
        {t('pedidos:numpad.globalDiscount')}
      </Button>

      <Text style={styles.label}>{t('pedidos:condicion')}</Text>
      <SegmentedButtons
        value={cart.condicionCobro}
        onValueChange={(v) => cart.setCondicionCobro(v as PedidoCondicionCobroUi)}
        buttons={[
          { value: 'contado', label: t('pedidos:condicionContado') },
          { value: 'cuenta_corriente', label: t('pedidos:condicionCc') },
          { value: 'plazo', label: t('pedidos:condicionPlazo') },
        ]}
        style={styles.segment}
        {...({ testID: 'seller-pedido-condicion' } as object)}
      />

      {cart.condicionCobro === 'plazo' && (
        <TextInput
          mode="outlined"
          label={t('pedidos:plazoDias')}
          value={cart.plazoDias}
          onChangeText={cart.setPlazoDias}
          {...({
            testID: 'seller-pedido-plazo-dias',
            keyboardType: 'number-pad',
          } as object)}
        />
      )}

      <TextInput
        mode="outlined"
        label={t('pedidos:observaciones')}
        placeholder={t('pedidos:observacionesPlaceholder')}
        value={cart.observaciones}
        onChangeText={cart.setObservaciones}
        multiline
        numberOfLines={3}
        {...({ testID: 'seller-pedido-observaciones' } as object)}
      />

      {error && (
        <View testID="seller-pedido-confirm-error">
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      <Button
        mode="contained"
        onPress={() => confirmSensitiveAction(() => onConfirm())}
        disabled={confirmDisabled}
        loading={submitting}
        testID={policyBlocked ? 'seller-pedido-confirm-blocked' : 'seller-pedido-confirm'}
        accessibilityLabel={t('pedidos:confirm')}
      >
        {submitting ? t('pedidos:confirming') : t('pedidos:confirm')}
      </Button>
      {submitting && <ActivityIndicator />}

      <NumpadSheet
        visible={numpad != null}
        mode={numpad?.mode === 'cantidad' ? 'cantidad' : 'dscto'}
        initialValue={
          numpad == null
            ? 0
            : numpad.mode === 'cantidad'
              ? numpad.line.cantidad
              : 'line' in numpad
                ? numpad.line.dscto
                : 0
        }
        precio={numpad != null && 'line' in numpad ? numpad.line.precio : 0}
        cantidadForSubtotal={numpad != null && 'line' in numpad ? numpad.line.cantidad : 1}
        dsctoForSubtotal={numpad != null && 'line' in numpad ? numpad.line.dscto : 0}
        title={
          numpad != null && 'line' in numpad
            ? numpad.line.descripcion
            : t('pedidos:numpad.globalDiscount')
        }
        locale={locale}
        onDismiss={() => setNumpad(null)}
        onConfirm={(value) => {
          if (!numpad) return
          if (numpad.mode === 'cantidad') {
            const capEnabled = policies?.sellerStockCapQtyToAvailable ?? true
            const capped = capQtyToStock(
              roundQtyToMultiplo(value, null),
              numpad.line.stock,
              capEnabled,
            )
            if (capped <= 0) {
              if (policies?.sellerStockZeroAction === 'block') {
                setNumpad(null)
                return
              }
              cart.setCantidad(numpad.line.articuloId, 0)
              setNumpad(null)
              return
            }
            cart.setCantidad(numpad.line.articuloId, capped)
            setNumpad(null)
            return
          }
          if ('scope' in numpad) {
            cart.setDsctoAll(value)
            setNumpad(null)
            return
          }
          cart.setDscto(numpad.line.articuloId, value)
          setNumpad(null)
        }}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 12 },
  line: {
    gap: 4,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  lineMain: { gap: 2 },
  meta: { opacity: 0.7, fontSize: 13 },
  total: { marginTop: 8 },
  label: { marginTop: 4 },
  segment: { marginBottom: 4 },
  error: { color: '#b91c1c' },
  swipeActions: { flexDirection: 'row', marginBottom: 8 },
  swipeBtn: { justifyContent: 'center', minWidth: 88, paddingHorizontal: 12 },
  swipeDscto: { backgroundColor: '#E65100' },
  swipeRemove: { backgroundColor: '#B71C1C' },
  swipeLabel: { color: '#fff', fontWeight: '700' },
})
