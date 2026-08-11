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
  Searchbar,
  Text,
  TextInput,
  Title,
} from 'react-native-paper'
import MapView, { Marker } from 'react-native-maps'
import type {
  FeriadoRow,
  RutaDiaStats,
  RutaParadaRow,
  RutaVendedorRow,
  VendedorZonaRow,
} from '@bizcode/types'
import { clientesAPI, rutasAPI } from '../../src/api/sellerApi'
import { useAuth } from '../../src/auth/AuthContext'
import { mapApiErrorToUiState, type UiLoadState } from '../../src/lib/apiErrors'
import { useOffline } from '../../src/offline/OfflineContext'
import {
  enqueueRutaCreate,
  enqueueRutaParadaPatch,
  enqueueRutaParadasReplace,
} from '../../src/offline/actions'

const DEBOUNCE_MS = 300
const MAX_PARADAS = 50

type ClienteSearchItem = {
  id: number
  codigo: number
  rsocial: string
  deliveryZoneId?: number | null
  suspended?: boolean
}

/**
 * @en Local calendar date as YYYY-MM-DD.
 * @es Fecha de calendario local como YYYY-MM-DD.
 * @pt-BR Data local do calendário como YYYY-MM-DD.
 */
function localYmd(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function chipColor(estado: RutaParadaRow['estado']): string {
  if (estado === 'visitado') return '#C8E6C9'
  if (estado === 'no_visitado') return '#FFCDD2'
  if (estado === 'postergado') return '#BBDEFB'
  return '#FFF9C4'
}

/**
 * @en Seller “Mi Ruta Hoy” screen (#267) — ordered stops, holiday banner, map, offline.
 * @es Pantalla Seller “Mi Ruta Hoy” (#267) — paradas, feriado, mapa, offline.
 * @pt-BR Tela Seller “Minha Rota Hoje” (#267) — paradas, feriado, mapa, offline.
 */
export default function AgendaScreen() {
  const { t } = useTranslation(['agenda', 'common', 'clientes'])
  const router = useRouter()
  const { claims } = useAuth()
  const offline = useOffline()
  const fecha = useMemo(() => localYmd(), [])
  const userId = claims?.userId ?? 0

  const [ruta, setRuta] = useState<RutaVendedorRow | null>(null)
  const [stats, setStats] = useState<RutaDiaStats | null>(null)
  const [feriados, setFeriados] = useState<FeriadoRow[]>([])
  const [zonas, setZonas] = useState<VendedorZonaRow[]>([])
  const [zoneFilter, setZoneFilter] = useState<number | null>(null)
  const [state, setState] = useState<UiLoadState>('loading')
  const [errorDetail, setErrorDetail] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [completedOpen, setCompletedOpen] = useState(false)

  const [addOpen, setAddOpen] = useState(false)
  const [addQuery, setAddQuery] = useState('')
  const [addItems, setAddItems] = useState<ClienteSearchItem[]>([])
  const [addState, setAddState] = useState<UiLoadState>('idle')
  const addReqId = useRef(0)

  const [motivoParada, setMotivoParada] = useState<RutaParadaRow | null>(null)
  const [motivoText, setMotivoText] = useState('')
  const [motivoError, setMotivoError] = useState<string | null>(null)

  const paradas = ruta?.paradas ?? []
  const doneCount = paradas.filter((p) => p.estado === 'visitado' || p.estado === 'no_visitado').length
  const zoneIds = useMemo(() => new Set(zonas.map((z) => z.deliveryZoneId)), [zonas])
  const mapped = useMemo(
    () =>
      paradas.filter(
        (p) =>
          p.cliente?.latitud != null &&
          p.cliente?.longitud != null &&
          Number.isFinite(Number(p.cliente.latitud)) &&
          Number.isFinite(Number(p.cliente.longitud)),
      ),
    [paradas],
  )

  const cacheRuta = useCallback(async (row: RutaVendedorRow | null) => {
    if (!row) return
    try {
      const { getOfflineDb } = await import('../../src/offline/db')
      const { upsertRuta, upsertFeriado } = await import('../../src/offline/repos')
      const db = await getOfflineDb()
      await upsertRuta(db, row as unknown as Record<string, unknown>)
      for (const f of feriados) {
        await upsertFeriado(db, f as unknown as Record<string, unknown>)
      }
    } catch {
      // best-effort
    }
  }, [feriados])

  const load = useCallback(async () => {
    setState('loading')
    setErrorDetail(null)
    try {
      const [rutaRes, feriadoRes, zonaRes] = await Promise.all([
        rutasAPI.getRuta({ fecha }),
        rutasAPI.listFeriados({ fecha }),
        rutasAPI.listVendedorZonas(),
      ])
      let current = rutaRes
      if (!current && userId > 0) {
        current = await rutasAPI.createRuta({ vendedorId: userId, fecha, clienteIds: [] })
      }
      setRuta(current)
      setFeriados(feriadoRes.data ?? [])
      setZonas(zonaRes.data ?? [])
      if (current) {
        const st = await rutasAPI.getRutaStats(current.id)
        setStats(st)
        await cacheRuta(current)
      } else {
        setStats(null)
      }
      const list = current?.paradas ?? []
      setState(list.length === 0 ? 'empty' : 'success')
    } catch (err) {
      const ui = mapApiErrorToUiState(err)
      if (ui === 'offline' || !offline.online) {
        try {
          const { getOfflineDb } = await import('../../src/offline/db')
          const { getRutaByFechaLocal, listFeriadosOnDateLocal } = await import('../../src/offline/repos')
          const db = await getOfflineDb()
          const cached = await getRutaByFechaLocal(db, fecha)
          const fer = await listFeriadosOnDateLocal(db, fecha)
          if (cached) {
            setRuta(cached as unknown as RutaVendedorRow)
            setFeriados(fer as unknown as FeriadoRow[])
            setState((cached.paradas as unknown[])?.length ? 'success' : 'empty')
            return
          }
        } catch {
          // fall through
        }
      }
      setState(ui)
      setErrorDetail(err instanceof Error ? err.message : t('loadError'))
    }
  }, [cacheRuta, fecha, offline.online, t, userId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!ruta || !stats) return
    if (ruta.paradas.length > 0 && stats.pendientes === 0 && stats.postergados === 0) {
      setCompletedOpen(true)
    }
  }, [ruta, stats])

  const persistParadas = async (nextParadas: RutaParadaRow[]) => {
    if (!ruta) return
    if (nextParadas.length > MAX_PARADAS) {
      setErrorDetail(t('maxStops'))
      return
    }
    const body = {
      paradas: nextParadas.map((p, index) => ({
        clienteId: p.clienteId,
        orden: index,
        estado: p.estado,
        motivo: p.motivo,
      })),
    }
    const optimistic: RutaVendedorRow = {
      ...ruta,
      paradas: nextParadas.map((p, index) => ({ ...p, orden: index })),
    }
    setRuta(optimistic)
    setSaving(true)
    try {
      if (!offline.online || ruta.id < 0) {
        await enqueueRutaParadasReplace({
          rutaId: ruta.id,
          body,
          nextRuta: optimistic as unknown as Record<string, unknown>,
        })
        return
      }
      const updated = await rutasAPI.replaceParadas(ruta.id, body)
      setRuta(updated)
      await cacheRuta(updated)
      const st = await rutasAPI.getRutaStats(updated.id)
      setStats(st)
    } catch (err) {
      if (!offline.online || mapApiErrorToUiState(err) === 'offline') {
        await enqueueRutaParadasReplace({
          rutaId: ruta.id,
          body,
          nextRuta: optimistic as unknown as Record<string, unknown>,
        })
        return
      }
      setErrorDetail(err instanceof Error ? err.message : t('loadError'))
      await load()
    } finally {
      setSaving(false)
    }
  }

  const patchParada = async (parada: RutaParadaRow, body: Record<string, unknown>) => {
    if (!ruta) return
    setSaving(true)
    const optimistic: RutaVendedorRow = {
      ...ruta,
      paradas: ruta.paradas.map((p) =>
        p.id === parada.id
          ? {
              ...p,
              estado: String(body.estado ?? p.estado) as RutaParadaRow['estado'],
              motivo: (body.motivo as string | null | undefined) ?? p.motivo,
            }
          : p,
      ),
    }
    setRuta(optimistic)
    try {
      if (!offline.online || ruta.id < 0) {
        await enqueueRutaParadaPatch({
          rutaId: ruta.id,
          paradaId: parada.id,
          body,
          nextRuta: optimistic as unknown as Record<string, unknown>,
        })
        return
      }
      const updated = await rutasAPI.patchParada(ruta.id, parada.id, body)
      setRuta(updated)
      await cacheRuta(updated)
      const st = await rutasAPI.getRutaStats(updated.id)
      setStats(st)
    } catch (err) {
      if (!offline.online || mapApiErrorToUiState(err) === 'offline') {
        await enqueueRutaParadaPatch({
          rutaId: ruta.id,
          paradaId: parada.id,
          body,
          nextRuta: optimistic as unknown as Record<string, unknown>,
        })
        return
      }
      setErrorDetail(err instanceof Error ? err.message : t('loadError'))
      await load()
    } finally {
      setSaving(false)
    }
  }

  const moveParada = async (index: number, dir: -1 | 1) => {
    const next = [...paradas]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    const tmp = next[index]
    next[index] = next[target]
    next[target] = tmp
    await persistParadas(next)
  }

  const searchAdd = useCallback(
    async (q: string) => {
      const req = ++addReqId.current
      setAddState('loading')
      try {
        const res = await clientesAPI.list({ q: q.trim() || undefined, limit: 30 })
        if (req !== addReqId.current) return
        let items = (res.data ?? []) as ClienteSearchItem[]
        if (zoneIds.size > 0) {
          items = items.filter((c) => c.deliveryZoneId != null && zoneIds.has(c.deliveryZoneId))
        }
        if (zoneFilter != null) {
          items = items.filter((c) => c.deliveryZoneId === zoneFilter)
        }
        const existing = new Set(paradas.map((p) => p.clienteId))
        items = items.filter((c) => !existing.has(c.id) && !c.suspended)
        setAddItems(items)
        setAddState(items.length === 0 ? 'empty' : 'success')
      } catch {
        if (req !== addReqId.current) return
        setAddState('error')
      }
    },
    [paradas, zoneFilter, zoneIds],
  )

  useEffect(() => {
    if (!addOpen) return
    const h = setTimeout(() => void searchAdd(addQuery), DEBOUNCE_MS)
    return () => clearTimeout(h)
  }, [addOpen, addQuery, searchAdd])

  const addCliente = async (cliente: ClienteSearchItem) => {
    if (!ruta) return
    if (paradas.length >= MAX_PARADAS) {
      setErrorDetail(t('maxStops'))
      return
    }
    const next: RutaParadaRow[] = [
      ...paradas,
      {
        id: -Date.now(),
        rutaId: ruta.id,
        clienteId: cliente.id,
        orden: paradas.length,
        estado: 'pendiente',
        motivo: null,
        visitaId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cliente: {
          id: cliente.id,
          codigo: cliente.codigo,
          rsocial: cliente.rsocial,
          domicilio: null,
          localidad: null,
          deliveryZoneId: cliente.deliveryZoneId ?? null,
          latitud: null,
          longitud: null,
        },
      },
    ]
    setAddOpen(false)
    await persistParadas(next)
  }

  const createEmptyRouteOffline = async () => {
    if (userId < 1) return
    setSaving(true)
    try {
      const localId = await enqueueRutaCreate({
        body: { vendedorId: userId, fecha, clienteIds: [] },
      })
      setRuta({
        id: localId,
        tenantId: 0,
        vendedorId: userId,
        fecha,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paradas: [],
      })
      setState('empty')
    } finally {
      setSaving(false)
    }
  }

  const holidayName = feriados[0]?.nombre

  return (
    <View style={styles.root} testID="seller-ruta-hoy">
      <Title style={styles.title} testID="seller-ruta-title">
        {t('title')}
      </Title>

      {holidayName ? (
        <Chip icon="calendar-alert" style={styles.banner} testID="seller-ruta-feriado">
          {t('holidayBanner', { nombre: holidayName })}
        </Chip>
      ) : null}

      {ruta ? (
        <Text style={styles.progress} testID="seller-ruta-progress">
          {t('progress', { done: doneCount, total: paradas.length })}
        </Text>
      ) : null}

      {state === 'loading' ? (
        <ActivityIndicator testID="seller-ruta-loading" style={{ marginTop: 24 }} />
      ) : null}

      {state === 'error' || state === 'forbidden' ? (
        <View style={styles.center}>
          <Text testID="seller-ruta-error">{errorDetail ?? t('loadError')}</Text>
          <Button onPress={() => void load()}>{t('common:retry', { defaultValue: 'Retry' })}</Button>
        </View>
      ) : null}

      {!ruta && state !== 'loading' && !offline.online ? (
        <View style={styles.center}>
          <Button mode="contained" onPress={() => void createEmptyRouteOffline()} testID="seller-ruta-create-offline">
            {t('createRoute')}
          </Button>
        </View>
      ) : null}

      {zonas.length === 0 && state !== 'loading' ? (
        <Text style={styles.hint} testID="seller-ruta-no-zones">
          {t('noZones')}
        </Text>
      ) : null}

      {showMap && mapped.length > 0 ? (
        <View style={styles.mapWrap} testID="seller-ruta-map">
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: Number(mapped[0].cliente!.latitud),
              longitude: Number(mapped[0].cliente!.longitud),
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
          >
            {mapped.map((p) => (
              <Marker
                key={p.id}
                coordinate={{
                  latitude: Number(p.cliente!.latitud),
                  longitude: Number(p.cliente!.longitud),
                }}
                title={p.cliente?.rsocial}
                description={t(`estado.${p.estado}`)}
                onCalloutPress={() => router.push(`/(app)/clientes/${p.clienteId}`)}
              />
            ))}
          </MapView>
        </View>
      ) : showMap && paradas.length > 0 ? (
        <Text style={styles.hint} testID="seller-ruta-map-empty">
          {t('mapUnavailable')}
        </Text>
      ) : null}

      <Button compact onPress={() => setShowMap((v) => !v)} testID="seller-ruta-toggle-map">
        {t('mapTitle')}
      </Button>

      {(state === 'success' || state === 'empty') && ruta ? (
        <FlatList
          data={paradas}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.hint} testID="seller-ruta-empty">
              {t('empty')}
            </Text>
          }
          renderItem={({ item, index }) => (
            <View style={styles.card} testID={`seller-ruta-parada-${item.id}`}>
              <Pressable onPress={() => router.push(`/(app)/clientes/${item.clienteId}`)}>
                <Text variant="titleMedium">
                  {index + 1}. {item.cliente?.rsocial ?? `#${item.clienteId}`}
                </Text>
                <Text>{item.cliente?.domicilio}</Text>
              </Pressable>
              <Chip style={{ backgroundColor: chipColor(item.estado), alignSelf: 'flex-start', marginTop: 4 }}>
                {t(`estado.${item.estado}`)}
              </Chip>
              <View style={styles.row}>
                <Button
                  compact
                  disabled={index === 0 || saving}
                  onPress={() => void moveParada(index, -1)}
                  testID={`seller-ruta-up-${item.id}`}
                >
                  {t('actions.moveUp')}
                </Button>
                <Button
                  compact
                  disabled={index === paradas.length - 1 || saving}
                  onPress={() => void moveParada(index, 1)}
                  testID={`seller-ruta-down-${item.id}`}
                >
                  {t('actions.moveDown')}
                </Button>
              </View>
              {item.estado === 'pendiente' ? (
                <View style={styles.row}>
                  <Button
                    mode="contained"
                    compact
                    disabled={saving}
                    onPress={() => {
                      void patchParada(item, { estado: 'visitado' }).then(() => {
                        router.push(`/(app)/pedidos/nuevo?clienteId=${item.clienteId}`)
                      })
                    }}
                    testID={`seller-ruta-visitado-${item.id}`}
                  >
                    {t('actions.visitado')}
                  </Button>
                  <Button
                    compact
                    disabled={saving}
                    onPress={() => void patchParada(item, { estado: 'postergado' })}
                    testID={`seller-ruta-postergar-${item.id}`}
                  >
                    {t('actions.postergar')}
                  </Button>
                  <Button
                    compact
                    disabled={saving}
                    onPress={() => {
                      setMotivoParada(item)
                      setMotivoText('')
                      setMotivoError(null)
                    }}
                    testID={`seller-ruta-no-visitado-${item.id}`}
                  >
                    {t('actions.noVisitado')}
                  </Button>
                </View>
              ) : null}
              <Button
                compact
                disabled={saving || item.estado === 'visitado'}
                onPress={() => void persistParadas(paradas.filter((p) => p.id !== item.id))}
                testID={`seller-ruta-remove-${item.id}`}
              >
                {t('actions.remove')}
              </Button>
            </View>
          )}
        />
      ) : null}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setAddOpen(true)}
        disabled={!ruta || saving}
        testID="seller-ruta-fab-add"
        accessibilityLabel={t('fabAdd')}
      />

      <Portal>
        <Dialog visible={addOpen} onDismiss={() => setAddOpen(false)} testID="seller-ruta-add-dialog">
          <Dialog.Title>{t('addTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('addHint')}</Text>
            <Searchbar
              value={addQuery}
              onChangeText={setAddQuery}
              style={{ marginVertical: 8 }}
              testID="seller-ruta-add-search"
            />
            {zonas.length > 0 ? (
              <View style={styles.row}>
                <Chip
                  selected={zoneFilter == null}
                  onPress={() => setZoneFilter(null)}
                  testID="seller-ruta-zone-all"
                >
                  {t('zoneAll')}
                </Chip>
                {zonas.map((z) => (
                  <Chip
                    key={z.id}
                    selected={zoneFilter === z.deliveryZoneId}
                    onPress={() => setZoneFilter(z.deliveryZoneId)}
                    testID={`seller-ruta-zone-${z.deliveryZoneId}`}
                  >
                    {z.deliveryZone?.nombre ?? z.deliveryZoneId}
                  </Chip>
                ))}
              </View>
            ) : null}
            {addState === 'loading' ? <ActivityIndicator /> : null}
            <FlatList
              data={addItems}
              keyExtractor={(c) => String(c.id)}
              style={{ maxHeight: 240 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => void addCliente(item)}
                  style={styles.addRow}
                  testID={`seller-ruta-add-cliente-${item.id}`}
                >
                  <Text>
                    {item.codigo} — {item.rsocial}
                  </Text>
                </Pressable>
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddOpen(false)}>{t('common:cancel', { defaultValue: 'Cancel' })}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={motivoParada != null} onDismiss={() => setMotivoParada(null)}>
          <Dialog.Title>{t('motivoTitle')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={motivoText}
              onChangeText={setMotivoText}
              mode="outlined"
              testID="seller-ruta-motivo-input"
            />
            {motivoError ? <Text style={{ color: '#b00020' }}>{motivoError}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setMotivoParada(null)}>{t('common:cancel', { defaultValue: 'Cancel' })}</Button>
            <Button
              onPress={() => {
                if (!motivoParada) return
                if (motivoText.trim().length < 1) {
                  setMotivoError(t('motivoRequired'))
                  return
                }
                const p = motivoParada
                setMotivoParada(null)
                void patchParada(p, { estado: 'no_visitado', motivo: motivoText.trim() })
              }}
              testID="seller-ruta-motivo-save"
            >
              {t('motivoSave')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={completedOpen} onDismiss={() => setCompletedOpen(false)} testID="seller-ruta-completed">
          <Dialog.Title>{t('completedTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text>
              {t('completedBody', {
                visitados: stats?.visitados ?? 0,
                pedidos: stats?.pedidos ?? 0,
                conversion: stats?.conversionPct ?? 0,
              })}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCompletedOpen(false)} testID="seller-ruta-completed-ok">
              {t('completedOk')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 12 },
  title: { marginBottom: 8 },
  banner: { marginBottom: 8, backgroundColor: '#FFE0B2' },
  progress: { marginBottom: 8, fontWeight: '600' },
  hint: { marginVertical: 8, opacity: 0.8 },
  center: { marginTop: 24, alignItems: 'center', gap: 8 },
  card: {
    padding: 12,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  mapWrap: { height: 180, borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  map: { flex: 1 },
  addRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd' },
})
