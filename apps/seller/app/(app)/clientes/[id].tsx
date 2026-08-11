import { useCallback, useEffect, useMemo, useState } from 'react'
import { Linking, ScrollView, StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Banner,
  Button,
  Chip,
  Dialog,
  List,
  Portal,
  ProgressBar,
  SegmentedButtons,
  Text,
} from 'react-native-paper'
import type {
  ClienteCuentaCorrienteSaldo,
  EstadoCredito,
  FacturaPendienteCliente,
  PedidoRow,
  SellerPolicies,
} from '@bizcode/types'
import { clientesAPI, listZonasEntrega, pedidosAPI, sellerAlertsAPI } from '../../../src/api/sellerApi'
import { ackCreditAlert, isCreditAlertAcked } from '../../../src/alerts/creditSessionAck'
import { isCreditBlocked } from '../../../src/alerts/policyGates'
import {
  isModuleNotEnabledError,
  mapApiErrorToUiState,
  type UiLoadState,
} from '../../../src/lib/apiErrors'
import { computeDaysPastDue, creditUsagePercent } from '../../../src/lib/daysPastDue'
import { formatMoney, parseMoney } from '../../../src/lib/money'

type ClienteDetail = {
  id: number
  codigo: number
  rsocial: string
  telef?: string | null
  email?: string | null
  domicilio?: string | null
  localidad?: string | null
  balance?: number | string
  creditLimit?: number | string | null
  creditDays?: number
  score?: number
  suspended?: boolean
  deliveryZoneId?: number | null
}

type TabKey = 'cuenta' | 'pedidos' | 'datos'

type OverdueInvoice = FacturaPendienteCliente & { daysPastDue: number }

function nivelColor(nivel: EstadoCredito['nivel']): string {
  if (nivel === 'rojo') return '#B71C1C'
  if (nivel === 'naranja') return '#E65100'
  if (nivel === 'amarillo') return '#F9A825'
  return '#1B5E20'
}

export default function ClienteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const clienteId = Number.parseInt(String(id), 10)
  const { t, i18n } = useTranslation(['clientes', 'common'])
  const router = useRouter()

  const [tab, setTab] = useState<TabKey>('cuenta')
  const [state, setState] = useState<UiLoadState>('loading')
  const [cliente, setCliente] = useState<ClienteDetail | null>(null)
  const [saldoCc, setSaldoCc] = useState<ClienteCuentaCorrienteSaldo | null>(null)
  const [ledgerFallback, setLedgerFallback] = useState(false)
  const [overdue, setOverdue] = useState<OverdueInvoice[]>([])
  const [receiptsUnavailable, setReceiptsUnavailable] = useState(false)
  const [pedidos, setPedidos] = useState<PedidoRow[]>([])
  const [zonaNombre, setZonaNombre] = useState<string | null>(null)
  const [estadoCredito, setEstadoCredito] = useState<EstadoCredito | null>(null)
  const [policies, setPolicies] = useState<SellerPolicies | null>(null)
  const [creditDialogVisible, setCreditDialogVisible] = useState(false)
  const [creditAsOfOffline, setCreditAsOfOffline] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!Number.isInteger(clienteId) || clienteId < 1) {
      setState('not_found')
      return
    }
    setState('loading')
    try {
      const [
        clienteRaw,
        pedidosRes,
        saldoResult,
        facturasResult,
        zonasResult,
        creditoResult,
        policiesResult,
      ] = await Promise.all([
        clientesAPI.get(clienteId) as Promise<ClienteDetail | null | undefined>,
        pedidosAPI.list({ clienteId, limit: 10 }),
        clientesAPI.cuentaCorrienteSaldo(clienteId).then(
          (data) => ({ ok: true as const, data }),
          (err: unknown) => ({ ok: false as const, err }),
        ),
        clientesAPI.facturasPendientes(clienteId).then(
          (data) => ({ ok: true as const, data }),
          (err: unknown) => ({ ok: false as const, err }),
        ),
        listZonasEntrega().then(
          (data) => ({ ok: true as const, data }),
          (err: unknown) => ({ ok: false as const, err }),
        ),
        sellerAlertsAPI.getEstadoCredito(clienteId).then(
          (data) => ({ ok: true as const, data }),
          (err: unknown) => ({ ok: false as const, err }),
        ),
        sellerAlertsAPI.getSellerPolicies().then(
          (data) => ({ ok: true as const, data }),
          (err: unknown) => ({ ok: false as const, err }),
        ),
      ])

      if (!clienteRaw) {
        setState('not_found')
        return
      }

      setCliente(clienteRaw)
      setPedidos(Array.isArray(pedidosRes.data) ? pedidosRes.data.slice(0, 10) : [])
      try {
        const { getOfflineDb } = await import('../../../src/offline/db')
        const { upsertCliente, upsertPedidoCache, upsertEstadoCredito } = await import(
          '../../../src/offline/repos'
        )
        const db = await getOfflineDb()
        await upsertCliente(db, clienteRaw as unknown as Record<string, unknown>)
        for (const p of Array.isArray(pedidosRes.data) ? pedidosRes.data.slice(0, 10) : []) {
          await upsertPedidoCache(db, p as unknown as Record<string, unknown>)
        }
        if (creditoResult.ok) {
          await upsertEstadoCredito(
            db,
            clienteId,
            creditoResult.data as unknown as Record<string, unknown>,
          )
        }
      } catch {
        // cache best-effort
      }

      if (saldoResult.ok && saldoResult.data) {
        setSaldoCc(saldoResult.data)
        setLedgerFallback(false)
      } else {
        setSaldoCc(null)
        setLedgerFallback(
          !saldoResult.ok
            && (isModuleNotEnabledError(saldoResult.err)
              || mapApiErrorToUiState(saldoResult.err) === 'forbidden'),
        )
      }

      if (facturasResult.ok && facturasResult.data) {
        const creditDays = clienteRaw.creditDays ?? 0
        const now = new Date()
        const rows: OverdueInvoice[] = facturasResult.data
          .map((f) => {
            const days = computeDaysPastDue(new Date(f.fecha), creditDays, now)
            return { ...f, daysPastDue: days }
          })
          .filter((f) => parseMoney(f.pendiente) > 0 && f.daysPastDue > 0)
          .sort((a, b) => b.daysPastDue - a.daysPastDue)
        setOverdue(rows)
        setReceiptsUnavailable(false)
      } else {
        setOverdue([])
        setReceiptsUnavailable(true)
      }

      if (zonasResult.ok && clienteRaw.deliveryZoneId != null) {
        const zone = zonasResult.data.find((z) => z.id === clienteRaw.deliveryZoneId)
        setZonaNombre(zone?.nombre ?? null)
      } else {
        setZonaNombre(null)
      }

      const credit = creditoResult.ok ? creditoResult.data : null
      const pols = policiesResult.ok ? policiesResult.data : null
      setEstadoCredito(credit)
      setPolicies(pols)
      setCreditAsOfOffline(null)
      if (credit && credit.nivel !== 'ok' && !isCreditAlertAcked(clienteId)) {
        setCreditDialogVisible(true)
      } else {
        setCreditDialogVisible(false)
      }

      setState('success')
    } catch (err) {
      try {
        const { getOfflineDb } = await import('../../../src/offline/db')
        const {
          getClienteLocal,
          listPedidosByClienteLocal,
          getEstadoCreditoLocal,
          getSellerPoliciesLocal,
        } = await import('../../../src/offline/repos')
        const db = await getOfflineDb()
        const cached = (await getClienteLocal(db, clienteId)) as ClienteDetail | null
        if (!cached) {
          setState(mapApiErrorToUiState(err))
          return
        }
        const pedCached = (await listPedidosByClienteLocal(db, clienteId, 10)) as PedidoRow[]
        const creditCached = (await getEstadoCreditoLocal(db, clienteId)) as EstadoCredito | null
        const polsCached = (await getSellerPoliciesLocal(db)) as SellerPolicies | null
        setCliente(cached)
        setPedidos(pedCached)
        setSaldoCc(null)
        setLedgerFallback(true)
        setOverdue([])
        setReceiptsUnavailable(true)
        setZonaNombre(null)
        setEstadoCredito(creditCached)
        setPolicies(polsCached)
        setCreditAsOfOffline(creditCached?.asOf ?? null)
        if (creditCached && creditCached.nivel !== 'ok' && !isCreditAlertAcked(clienteId)) {
          setCreditDialogVisible(true)
        }
        setState('success')
      } catch {
        setState(mapApiErrorToUiState(err))
      }
    }
  }, [clienteId])

  useEffect(() => {
    void load()
  }, [load])

  const balance = useMemo(() => {
    if (estadoCredito) return parseMoney(estadoCredito.deudaTotal)
    if (saldoCc) return parseMoney(saldoCc.saldo)
    return parseMoney(cliente?.balance)
  }, [estadoCredito, saldoCc, cliente])

  const creditLimit = useMemo(() => {
    if (estadoCredito?.limiteCredito != null) return parseMoney(estadoCredito.limiteCredito)
    if (saldoCc?.creditLimit != null) return parseMoney(saldoCc.creditLimit)
    if (cliente?.creditLimit != null) return parseMoney(cliente.creditLimit)
    return null
  }, [estadoCredito, saldoCc, cliente])

  const usage = creditUsagePercent(balance, creditLimit)
  const suspended = Boolean(cliente?.suspended)
  const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'pt-BR' ? 'pt-BR' : 'es-AR'
  const creditBlocked = isCreditBlocked(estadoCredito?.nivel, policies)

  const scoreColor = (score: number) => {
    if (score < 40) return '#B71C1C'
    if (score < 70) return '#F9A825'
    return '#1B5E20'
  }

  const scoreLabel = (score: number) => {
    if (score < 40) return t('clientes:score.low')
    if (score < 70) return t('clientes:score.mid')
    return t('clientes:score.high')
  }

  if (state === 'loading') {
    return (
      <View
        style={styles.centered}
        testID="seller-cliente-detail-loading"
        accessibilityLabel={t('common:loading')}
      >
        <ActivityIndicator />
      </View>
    )
  }

  if (state === 'not_found' || state === 'forbidden' || state === 'offline' || state === 'error') {
    return (
      <View style={styles.centered} testID={`seller-cliente-detail-${state}`}>
        <Text>
          {state === 'not_found'
            ? t('common:errorNotFound')
            : state === 'forbidden'
              ? t('common:errorForbidden')
              : state === 'offline'
                ? t('common:errorOffline')
                : t('common:errorGeneric')}
        </Text>
        <Button mode="outlined" onPress={() => void load()} testID="seller-cliente-detail-retry">
          {t('common:retry')}
        </Button>
      </View>
    )
  }

  if (!cliente) {
    return null
  }

  return (
    <View style={styles.root} testID="seller-cliente-detail">
      <Portal>
        <Dialog
          visible={creditDialogVisible}
          dismissable={!creditBlocked}
          onDismiss={() => {
            if (creditBlocked) return
            ackCreditAlert(clienteId)
            setCreditDialogVisible(false)
          }}
          testID="seller-cliente-credit-alert"
        >
          <Dialog.Title
            style={{ color: estadoCredito ? nivelColor(estadoCredito.nivel) : undefined }}
            {...({ testID: `seller-cliente-credit-nivel-${estadoCredito?.nivel ?? 'ok'}` } as object)}
          >
            {t(`clientes:creditAlert.title.${estadoCredito?.nivel ?? 'ok'}`)}
          </Dialog.Title>
          <Dialog.Content>
            {creditAsOfOffline ? (
              <Text style={styles.asOf} testID="seller-cliente-credit-asof">
                {t('clientes:creditAlert.asOf', {
                  when: new Date(creditAsOfOffline).toLocaleString(locale),
                })}
              </Text>
            ) : null}
            <Text>
              {t('clientes:creditAlert.deudaTotal', {
                amount: formatMoney(estadoCredito?.deudaTotal ?? balance, locale),
              })}
            </Text>
            <Text>
              {t('clientes:creditAlert.deudaVencida', {
                amount: formatMoney(estadoCredito?.deudaVencida ?? 0, locale),
              })}
            </Text>
            <Text>
              {t('clientes:creditAlert.disponible', {
                amount:
                  estadoCredito?.disponible != null
                    ? formatMoney(estadoCredito.disponible, locale)
                    : t('clientes:cuenta.sinLimite'),
              })}
            </Text>
            {creditBlocked ? (
              <Text style={styles.blockHint} testID="seller-cliente-credit-blocked-hint">
                {t('clientes:creditAlert.blockedHint')}
              </Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => router.back()}
              testID="seller-cliente-credit-back"
              accessibilityLabel={t('clientes:creditAlert.back')}
            >
              {t('clientes:creditAlert.back')}
            </Button>
            <Button
              onPress={() => {
                ackCreditAlert(clienteId)
                setCreditDialogVisible(false)
                setTab('cuenta')
              }}
              testID="seller-cliente-credit-ver-cuenta"
              accessibilityLabel={t('clientes:creditAlert.verCuenta')}
            >
              {t('clientes:creditAlert.verCuenta')}
            </Button>
            {!creditBlocked ? (
              <Button
                mode="contained"
                onPress={() => {
                  ackCreditAlert(clienteId)
                  setCreditDialogVisible(false)
                }}
                testID="seller-cliente-credit-continue"
                accessibilityLabel={t('clientes:creditAlert.continue')}
              >
                {t('clientes:creditAlert.continue')}
              </Button>
            ) : null}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.header}>
        <View testID="seller-cliente-detail-name">
          <Text variant="headlineSmall">{cliente.rsocial}</Text>
        </View>
        <Text variant="bodySmall">#{cliente.codigo}</Text>
        {suspended ? (
          <Chip
            compact
            style={styles.suspendedChip}
            {...({ testID: 'seller-cliente-suspended-badge' } as object)}
          >
            {t('clientes:statusSuspended')}
          </Chip>
        ) : null}
        {estadoCredito && estadoCredito.nivel !== 'ok' ? (
          <Chip
            compact
            style={{ backgroundColor: nivelColor(estadoCredito.nivel), alignSelf: 'flex-start' }}
            textStyle={{ color: '#fff' }}
            {...({ testID: 'seller-cliente-credit-chip' } as object)}
          >
            {t(`clientes:creditAlert.chip.${estadoCredito.nivel}`)}
          </Chip>
        ) : null}
      </View>

      {suspended ? (
        <Banner visible icon="alert" {...({ testID: 'seller-cliente-suspended-banner' } as object)}>
          {t('clientes:suspendedBanner')}
        </Banner>
      ) : null}

      <Button
        mode="contained"
        disabled={suspended || creditBlocked}
        testID="seller-cliente-nuevo-pedido"
        accessibilityLabel={t('clientes:nuevoPedido')}
        onPress={() => {
          if (suspended || creditBlocked) return
          router.push(`/(app)/pedidos/nuevo?clienteId=${cliente.id}`)
        }}
        style={styles.cta}
      >
        {t('clientes:nuevoPedido')}
      </Button>

      <SegmentedButtons
        value={tab}
        onValueChange={(v) => setTab(v as TabKey)}
        buttons={[
          { value: 'cuenta', label: t('clientes:tabs.cuenta') },
          { value: 'pedidos', label: t('clientes:tabs.pedidos') },
          { value: 'datos', label: t('clientes:tabs.datos') },
        ]}
        style={styles.tabs}
      />

      <ScrollView contentContainerStyle={styles.tabBody}>
        {tab === 'cuenta' && (
          <View testID="seller-cliente-tab-cuenta-body" style={styles.section}>
            {ledgerFallback ? (
              <View testID="seller-cliente-ledger-fallback">
                <Text variant="bodySmall">{t('clientes:cuenta.ledgerUnavailable')}</Text>
              </View>
            ) : null}
            <Text variant="titleMedium">{t('clientes:cuenta.saldoActual')}</Text>
            <View testID="seller-cliente-saldo">
              <Text
                variant="headlineMedium"
                style={{ color: balance < 0 ? '#1B5E20' : balance > 0 ? '#B71C1C' : undefined }}
              >
                {formatMoney(balance, locale)}
              </Text>
            </View>
            <Text variant="titleSmall" style={styles.mt}>
              {t('clientes:cuenta.limiteCredito')}
            </Text>
            {creditLimit == null ? (
              <View testID="seller-cliente-sin-limite">
                <Text>{t('clientes:cuenta.sinLimite')}</Text>
              </View>
            ) : (
              <>
                <View testID="seller-cliente-limite">
                  <Text>{formatMoney(creditLimit, locale)}</Text>
                </View>
                {usage != null ? (
                  <>
                    <ProgressBar
                      progress={usage / 100}
                      style={styles.progress}
                      {...({
                        testID: 'seller-cliente-credit-bar',
                        accessibilityLabel: t('clientes:cuenta.usoCredito', {
                          pct: Math.round(usage),
                        }),
                      } as object)}
                    />
                    <Text>{t('clientes:cuenta.usoCredito', { pct: Math.round(usage) })}</Text>
                  </>
                ) : null}
              </>
            )}

            <Text variant="titleMedium" style={styles.mt}>
              {t('clientes:cuenta.facturasVencidas')}
            </Text>
            {receiptsUnavailable ? (
              <View testID="seller-cliente-receipts-unavailable">
                <Text>{t('clientes:cuenta.receiptsUnavailable')}</Text>
              </View>
            ) : overdue.length === 0 ? (
              <View testID="seller-cliente-sin-vencidas">
                <Text>{t('clientes:cuenta.sinVencidas')}</Text>
              </View>
            ) : (
              overdue.map((inv) => (
                <List.Item
                  key={inv.facturaId}
                  title={inv.facturaRef}
                  description={t('clientes:cuenta.diasMora', { days: inv.daysPastDue })}
                  right={() => <Text>{formatMoney(inv.pendiente, locale)}</Text>}
                  {...({ testID: `seller-cliente-vencida-${inv.facturaId}` } as object)}
                />
              ))
            )}
          </View>
        )}

        {tab === 'pedidos' && (
          <View testID="seller-cliente-tab-pedidos-body" style={styles.section}>
            <Text variant="titleMedium">{t('clientes:pedidos.title')}</Text>
            {pedidos.length === 0 ? (
              <View testID="seller-cliente-pedidos-empty">
                <Text>{t('clientes:pedidos.empty')}</Text>
              </View>
            ) : (
              pedidos.map((p) => (
                <List.Item
                  key={p.id}
                  title={`#${p.id} · ${p.estado}`}
                  description={`${t('clientes:pedidos.total')}: ${formatMoney(p.total, locale)}`}
                  onPress={() => router.push(`/(app)/pedidos/${p.id}`)}
                  right={(props) => <List.Icon {...props} icon="chevron-right" />}
                  {...({
                    testID: `seller-cliente-pedido-${p.id}`,
                    accessibilityRole: 'button',
                  } as object)}
                />
              ))
            )}
          </View>
        )}

        {tab === 'datos' && (
          <View testID="seller-cliente-tab-datos-body" style={styles.section}>
            <List.Item
              title={t('clientes:datos.telefono')}
              description={cliente.telef?.trim() || t('clientes:datos.sinTelefono')}
              onPress={() => {
                const phone = cliente.telef?.trim()
                if (!phone) return
                void Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`)
              }}
              disabled={!cliente.telef?.trim()}
              left={(props) => <List.Icon {...props} icon="phone" />}
              {...({
                testID: 'seller-cliente-telefono',
                accessibilityLabel: cliente.telef?.trim()
                  ? t('clientes:datos.call', { phone: cliente.telef.trim() })
                  : t('clientes:datos.sinTelefono'),
              } as object)}
            />
            <List.Item
              title={t('clientes:datos.email')}
              description={cliente.email?.trim() || t('clientes:datos.sinEmail')}
              {...({ testID: 'seller-cliente-email' } as object)}
            />
            <List.Item
              title={t('clientes:datos.domicilio')}
              description={cliente.domicilio?.trim() || t('clientes:datos.sinDomicilio')}
              {...({ testID: 'seller-cliente-domicilio' } as object)}
            />
            <List.Item
              title={t('clientes:datos.zona')}
              description={zonaNombre || t('clientes:datos.zonaUnknown')}
              {...({ testID: 'seller-cliente-zona' } as object)}
            />
            <View
              style={styles.scoreBlock}
              testID="seller-cliente-score"
              accessibilityLabel={scoreLabel(cliente.score ?? 50)}
            >
              <Text variant="titleSmall">{t('clientes:datos.score')}</Text>
              <Text variant="headlineSmall" style={{ color: scoreColor(cliente.score ?? 50) }}>
                {cliente.score ?? 50}
              </Text>
              <Text>{scoreLabel(cliente.score ?? 50)}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  header: { paddingHorizontal: 16, paddingTop: 12, gap: 4 },
  suspendedChip: { backgroundColor: '#FFCDD2', alignSelf: 'flex-start' },
  cta: { marginHorizontal: 16, marginTop: 8 },
  tabs: { marginHorizontal: 12, marginTop: 12 },
  tabBody: { padding: 16, paddingBottom: 40 },
  section: { gap: 8 },
  mt: { marginTop: 12 },
  progress: { height: 8, borderRadius: 4, marginVertical: 8 },
  scoreBlock: { marginTop: 16, gap: 4 },
  asOf: { opacity: 0.7, marginBottom: 8, fontSize: 12 },
  blockHint: { marginTop: 8, color: '#B71C1C' },
})
