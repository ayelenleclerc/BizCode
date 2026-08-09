import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Button,
  Chip,
  Dialog,
  FAB,
  Portal,
  RadioButton,
  Searchbar,
  Text,
  TextInput,
  Title,
} from 'react-native-paper'
import type { DeliveryZone, VisitaDiaKpi, VisitaResultado, VisitaVendedorRow } from '@bizcode/types'
import { clientesAPI, listZonasEntrega, visitasAPI } from '../../src/api/sellerApi'
import { useAuth } from '../../src/auth/AuthContext'
import { mapApiErrorToUiState, type UiLoadState } from '../../src/lib/apiErrors'

const DEBOUNCE_MS = 300
const RESULTADOS: VisitaResultado[] = ['venta', 'sin_pedido', 'cliente_ausente', 'otro']

type ClienteSearchItem = {
  id: number
  codigo: number
  rsocial: string
  suspended?: boolean
}

/**
 * @en Local calendar date as YYYY-MM-DD for agenda list filter.
 * @es Fecha de calendario local como YYYY-MM-DD para filtrar la agenda.
 * @pt-BR Data local do calendário como YYYY-MM-DD para filtrar a agenda.
 */
function localYmd(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function notesRequired(resultado: VisitaResultado | null): boolean {
  return resultado === 'sin_pedido' || resultado === 'cliente_ausente'
}

function chipColor(estado: VisitaVendedorRow['estadoPlan']): string {
  if (estado === 'completada') return '#C8E6C9'
  if (estado === 'no_visitada') return '#FFCDD2'
  return '#FFF9C4'
}

export default function AgendaScreen() {
  const { t } = useTranslation(['agenda', 'common', 'clientes'])
  const router = useRouter()
  const { claims } = useAuth()
  const fecha = useMemo(() => localYmd(), [])

  const [items, setItems] = useState<VisitaVendedorRow[]>([])
  const [kpi, setKpi] = useState<VisitaDiaKpi | null>(null)
  const [state, setState] = useState<UiLoadState>('loading')
  const [errorDetail, setErrorDetail] = useState<string | null>(null)
  const [zonasById, setZonasById] = useState<Record<number, string>>({})

  const [addOpen, setAddOpen] = useState(false)
  const [addQuery, setAddQuery] = useState('')
  const [addItems, setAddItems] = useState<ClienteSearchItem[]>([])
  const [addState, setAddState] = useState<UiLoadState>('idle')
  const [addSaving, setAddSaving] = useState(false)
  const addReqId = useRef(0)

  const [resultVisit, setResultVisit] = useState<VisitaVendedorRow | null>(null)
  const [resultado, setResultado] = useState<VisitaResultado | null>(null)
  const [notas, setNotas] = useState('')
  const [pedidoIdText, setPedidoIdText] = useState('')
  const [resultError, setResultError] = useState<string | null>(null)
  const [resultSaving, setResultSaving] = useState(false)
  const resultOpenedAt = useRef<number | null>(null)

  const load = useCallback(async () => {
    setState('loading')
    setErrorDetail(null)
    try {
      const res = await visitasAPI.list({ fecha })
      const list = Array.isArray(res.data) ? res.data : []
      setItems(list)
      setKpi(res.kpi ?? null)
      setState(list.length === 0 ? 'empty' : 'success')
    } catch (err) {
      setItems([])
      setKpi(null)
      setState(mapApiErrorToUiState(err))
      setErrorDetail(err instanceof Error ? err.message : null)
    }
  }, [fecha])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void listZonasEntrega()
      .then((zones: DeliveryZone[]) => {
        const map: Record<number, string> = {}
        for (const z of zones) {
          map[z.id] = z.nombre
        }
        setZonasById(map)
      })
      .catch(() => setZonasById({}))
  }, [])

  const searchClientes = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setAddItems([])
      setAddState('idle')
      return
    }
    const id = ++addReqId.current
    setAddState('loading')
    try {
      const data = (await clientesAPI.list(trimmed)) as ClienteSearchItem[] | undefined
      if (id !== addReqId.current) return
      const list = Array.isArray(data) ? data : []
      setAddItems(list)
      setAddState(list.length === 0 ? 'empty' : 'success')
    } catch (err) {
      if (id !== addReqId.current) return
      setAddItems([])
      setAddState(mapApiErrorToUiState(err))
    }
  }, [])

  useEffect(() => {
    if (!addOpen) return
    const timer = setTimeout(() => {
      void searchClientes(addQuery)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [addOpen, addQuery, searchClientes])

  const openResult = (visit: VisitaVendedorRow) => {
    setResultVisit(visit)
    setResultado(visit.resultado)
    setNotas(visit.notasVisita ?? '')
    setPedidoIdText(visit.pedidoId != null ? String(visit.pedidoId) : '')
    setResultError(null)
    resultOpenedAt.current = Date.now()
  }

  const closeResult = () => {
    setResultVisit(null)
    setResultado(null)
    setNotas('')
    setPedidoIdText('')
    setResultError(null)
    resultOpenedAt.current = null
  }

  const saveResult = async () => {
    if (!resultVisit || !resultado) {
      setResultError(t('agenda:notasRequired'))
      return
    }
    if (notesRequired(resultado) && !notas.trim()) {
      setResultError(t('agenda:notasRequired'))
      return
    }
    let pedidoId: number | null | undefined
    if (resultado === 'venta' && pedidoIdText.trim()) {
      const parsed = Number.parseInt(pedidoIdText.trim(), 10)
      if (!Number.isInteger(parsed) || parsed < 1) {
        setResultError(t('common:errorGeneric'))
        return
      }
      pedidoId = parsed
    }
    const elapsedMs = resultOpenedAt.current != null ? Date.now() - resultOpenedAt.current : 0
    const duracionMinutos = Math.max(1, Math.round(elapsedMs / 60000))
    setResultSaving(true)
    setResultError(null)
    try {
      await visitasAPI.update(resultVisit.id, {
        estadoPlan: 'completada',
        resultado,
        notasVisita: notas.trim() || null,
        pedidoId: pedidoId ?? null,
        duracionMinutos,
      })
      closeResult()
      await load()
    } catch (err) {
      setResultError(err instanceof Error ? err.message : t('common:errorGeneric'))
    } finally {
      setResultSaving(false)
    }
  }

  const addSpontaneous = async (cliente: ClienteSearchItem) => {
    if (!claims?.userId) return
    setAddSaving(true)
    try {
      await visitasAPI.create({
        vendedorId: claims.userId,
        clienteId: cliente.id,
        fechaPlanificada: fecha,
      })
      setAddOpen(false)
      setAddQuery('')
      setAddItems([])
      await load()
    } catch (err) {
      setAddState(mapApiErrorToUiState(err))
    } finally {
      setAddSaving(false)
    }
  }

  return (
    <View style={styles.root} testID="seller-agenda">
      <Title accessibilityRole="header">{t('agenda:title')}</Title>
      <Text variant="bodySmall" style={styles.muted}>
        {t('agenda:routesLater')}
      </Text>

      {kpi != null && (
        <View
          style={styles.kpiRow}
          testID="seller-agenda-kpi"
          accessibilityLabel={t('agenda:title')}
        >
          <View style={styles.kpiCell} testID="seller-agenda-kpi-planificadas">
            <Text variant="labelSmall">{t('agenda:kpi.planificadas')}</Text>
            <Text variant="titleMedium">{kpi.planificadas}</Text>
          </View>
          <View style={styles.kpiCell} testID="seller-agenda-kpi-visitados">
            <Text variant="labelSmall">{t('agenda:kpi.visitados')}</Text>
            <Text variant="titleMedium">{kpi.visitados}</Text>
          </View>
          <View style={styles.kpiCell} testID="seller-agenda-kpi-pedidos">
            <Text variant="labelSmall">{t('agenda:kpi.pedidos')}</Text>
            <Text variant="titleMedium">{kpi.pedidos}</Text>
          </View>
          <View style={styles.kpiCell} testID="seller-agenda-kpi-conversion">
            <Text variant="labelSmall">{t('agenda:kpi.conversion')}</Text>
            <Text variant="titleMedium">{kpi.conversionPct}%</Text>
          </View>
        </View>
      )}

      {state === 'loading' && (
        <View
          testID="seller-agenda-loading"
          style={styles.centered}
          accessibilityLabel={t('common:loading')}
        >
          <ActivityIndicator />
        </View>
      )}
      {state === 'empty' && (
        <View testID="seller-agenda-empty">
          <Text style={styles.hint}>{t('agenda:empty')}</Text>
        </View>
      )}
      {(state === 'error' || state === 'offline' || state === 'forbidden') && (
        <View testID={`seller-agenda-${state}`} style={styles.centered}>
          <Text>
            {state === 'offline'
              ? t('common:errorOffline')
              : state === 'forbidden'
                ? t('common:errorForbidden')
                : t('common:errorGeneric')}
          </Text>
          {errorDetail ? <Text variant="bodySmall">{errorDetail}</Text> : null}
          <Button mode="text" onPress={() => void load()} testID="seller-agenda-retry">
            {t('common:retry')}
          </Button>
        </View>
      )}

      {(state === 'success' || state === 'empty') && items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          testID="seller-agenda-list"
          contentContainerStyle={{ paddingBottom: 88 }}
          renderItem={({ item }) => {
            const zoneId = item.cliente?.deliveryZoneId
            const zoneLabel =
              zoneId != null && zonasById[zoneId] ? zonasById[zoneId] : t('agenda:zonaUnknown')
            const lastBuy = item.ultimaCompraAt
              ? new Date(item.ultimaCompraAt).toLocaleDateString()
              : t('agenda:ultimaCompraNever')
            return (
              <View style={styles.row} testID={`seller-agenda-row-${item.id}`}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.cliente?.rsocial ?? String(item.clienteId)}
                  onPress={() => router.push(`/(app)/clientes/${item.clienteId}`)}
                  style={styles.rowMain}
                >
                  <Text variant="titleMedium">{item.cliente?.rsocial ?? `#${item.clienteId}`}</Text>
                  <Text variant="bodySmall">
                    {item.cliente?.domicilio?.trim() || t('clientes:datos.sinDomicilio')}
                  </Text>
                  <Text variant="bodySmall">
                    {zoneLabel} · {t('agenda:ultimaCompra')}: {lastBuy}
                  </Text>
                </Pressable>
                <View style={styles.rowActions}>
                  <Chip
                    compact
                    style={{ backgroundColor: chipColor(item.estadoPlan) }}
                    {...({ testID: `seller-agenda-estado-${item.id}` } as object)}
                  >
                    {t(`agenda:estado.${item.estadoPlan}`)}
                  </Chip>
                  {item.estadoPlan === 'pendiente' ? (
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => openResult(item)}
                      testID={`seller-agenda-result-${item.id}`}
                    >
                      {t('agenda:registerResult')}
                    </Button>
                  ) : null}
                </View>
              </View>
            )
          }}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setAddOpen(true)}
        accessibilityLabel={t('agenda:fabAdd')}
        {...({ testID: 'seller-agenda-fab' } as object)}
      />

      <Portal>
        <Dialog
          visible={addOpen}
          onDismiss={() => !addSaving && setAddOpen(false)}
          testID="seller-agenda-add-dialog"
        >
          <Dialog.Title>{t('agenda:addTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.hint}>{t('agenda:addHint')}</Text>
            <Searchbar
              placeholder={t('clientes:searchPlaceholder')}
              value={addQuery}
              onChangeText={setAddQuery}
              style={styles.search}
              {...({ testID: 'seller-agenda-add-search' } as object)}
            />
            {addState === 'loading' && <ActivityIndicator />}
            {addState === 'empty' && <Text>{t('clientes:empty')}</Text>}
            {addItems.map((c) => (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                testID={`seller-agenda-add-cliente-${c.id}`}
                style={styles.searchRow}
                disabled={addSaving || c.suspended}
                onPress={() => void addSpontaneous(c)}
              >
                <Text>{c.rsocial}</Text>
                <Text variant="bodySmall">#{c.codigo}</Text>
              </Pressable>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddOpen(false)} disabled={addSaving}>
              {t('common:cancel')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={resultVisit != null}
          onDismiss={() => !resultSaving && closeResult()}
          testID="seller-agenda-result-dialog"
        >
          <Dialog.Title>{t('agenda:resultTitle')}</Dialog.Title>
          <Dialog.ScrollArea>
            <View style={styles.dialogBody}>
              <RadioButton.Group
                onValueChange={(v) => setResultado(v as VisitaResultado)}
                value={resultado ?? ''}
              >
                {RESULTADOS.map((r) => (
                  <RadioButton.Item
                    key={r}
                    label={t(`agenda:resultado.${r}`)}
                    value={r}
                    {...({ testID: `seller-agenda-resultado-${r}` } as object)}
                  />
                ))}
              </RadioButton.Group>
              <TextInput
                label={t('agenda:notas')}
                value={notas}
                onChangeText={setNotas}
                multiline
                mode="outlined"
                testID="seller-agenda-notas"
              />
              {resultado === 'venta' ? (
                <>
                  <TextInput
                    label={t('agenda:pedidoId')}
                    value={pedidoIdText}
                    onChangeText={setPedidoIdText}
                    keyboardType="number-pad"
                    mode="outlined"
                    testID="seller-agenda-pedido-id"
                  />
                  <Button
                    mode="text"
                    onPress={() => {
                      if (!resultVisit) return
                      closeResult()
                      router.push(`/(app)/pedidos/nuevo?clienteId=${resultVisit.clienteId}`)
                    }}
                    testID="seller-agenda-create-order"
                  >
                    {t('agenda:createOrder')}
                  </Button>
                </>
              ) : null}
              {resultError ? (
                <Text style={styles.error} testID="seller-agenda-result-error">
                  {resultError}
                </Text>
              ) : null}
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={closeResult} disabled={resultSaving}>
              {t('common:cancel')}
            </Button>
            <Button
              onPress={() => void saveResult()}
              loading={resultSaving}
              disabled={resultSaving}
              testID="seller-agenda-save-result"
            >
              {resultSaving ? t('agenda:saving') : t('agenda:saveResult')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 12, gap: 8 },
  muted: { opacity: 0.7, marginBottom: 4 },
  hint: { paddingVertical: 8, opacity: 0.75 },
  centered: { padding: 24, alignItems: 'center', gap: 8 },
  kpiRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  kpiCell: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ECEFF1',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    gap: 8,
  },
  rowMain: { flex: 1, gap: 2 },
  rowActions: { alignItems: 'flex-end', gap: 6, maxWidth: 140 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  search: { marginVertical: 8 },
  searchRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  dialogBody: { paddingVertical: 8, gap: 8 },
  error: { color: '#B71C1C' },
})
