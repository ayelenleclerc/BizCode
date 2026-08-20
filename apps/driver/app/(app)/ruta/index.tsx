import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Button, Chip, Text, Title } from 'react-native-paper'
import { useRuta } from '../../../src/ruta/RutaContext'
import { useOffline } from '../../../src/offline/OfflineContext'
import { countBultos, hasDebt } from '../../../src/ruta/stopView'
import type { RepartoItemEstado, RepartoItemRow } from '@bizcode/types'

/**
 * @en Driver day-route list ordered by RepartoItem.secuencia (#160).
 * @es Lista de ruta del día ordenada por RepartoItem.secuencia (#160).
 * @pt-BR Lista da rota do dia ordenada por RepartoItem.secuencia (#160).
 */
export default function RutaIndexScreen() {
  const { t } = useTranslation(['ruta', 'common', 'devolucion'])
  const router = useRouter()
  const { status, reparto, load } = useRuta()
  const { pendingStopIds } = useOffline()

  useEffect(() => {
    void load()
  }, [load])

  if (status === 'loading' || status === 'idle') {
    return (
      <View style={styles.centered} testID="driver-ruta-loading" accessibilityLabel={t('common:loading')}>
        <ActivityIndicator />
      </View>
    )
  }

  if (status === 'offline' || status === 'error' || status === 'forbidden') {
    const messageKey =
      status === 'offline' ? 'offline' : status === 'forbidden' ? 'forbidden' : 'loadError'
    return (
      <View style={styles.centered} testID="driver-ruta-error">
        <Text>{t(`ruta:${messageKey}`)}</Text>
        <Button mode="contained" onPress={() => void load()} accessibilityLabel={t('common:retry')}>
          {t('common:retry')}
        </Button>
      </View>
    )
  }

  const items = reparto?.items ?? []
  const progress = reparto?.progress ?? { delivered: 0, total: items.length }

  return (
    <View style={styles.root} testID="driver-ruta-list">
      <View testID="driver-ruta-title">
        <Title>{t('ruta:title')}</Title>
      </View>
      {reparto ? (
        <View testID="driver-ruta-progress">
          <Text>
            {t('ruta:progress', { delivered: progress.delivered, total: progress.total })}
          </Text>
        </View>
      ) : null}
      {reparto?.estado === 'planned' ? <Text>{t('ruta:plannedBanner')}</Text> : null}
      {reparto ? (
        <Button
          mode="outlined"
          testID="driver-ruta-rendicion"
          accessibilityLabel={t('devolucion:rendicion.open')}
          onPress={() => router.push('/(app)/ruta/rendicion')}
        >
          {t('devolucion:rendicion.open')}
        </Button>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        initialNumToRender={12}
        windowSize={8}
        ListEmptyComponent={
          <View testID="driver-ruta-empty">
            <Text style={styles.empty}>{t('ruta:empty')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <StopRow
            item={item}
            pendingSync={pendingStopIds.has(item.id)}
            onPress={() => router.push(`/(app)/ruta/${item.id}`)}
          />
        )}
      />
    </View>
  )
}

function StopRow({
  item,
  pendingSync,
  onPress,
}: {
  item: RepartoItemRow
  pendingSync: boolean
  onPress: () => void
}) {
  const { t } = useTranslation('ruta')
  const cliente = item.ordenEntrega.cliente
  const bultos = countBultos(item)
  const debt = hasDebt(cliente?.balance ?? cliente?.deuda?.saldo)
  const estado = item.estado as RepartoItemEstado

  return (
    <Pressable
      onPress={onPress}
      testID={`driver-ruta-parada-${item.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${item.secuencia} ${cliente?.rsocial ?? ''}`}
      style={styles.row}
    >
      <Text variant="headlineMedium" style={styles.seq}>
        {item.secuencia}
      </Text>
      <View style={styles.rowBody}>
        <Text variant="titleMedium">{cliente?.rsocial ?? '—'}</Text>
        <Text>{cliente?.domicilio ?? ''}</Text>
        <Text>{t('bultos', { count: bultos })}</Text>
        <View style={styles.chips}>
          <Chip compact testID={`driver-ruta-estado-${item.id}`}>
            {t(`estado.${estado}`)}
          </Chip>
          {debt ? (
            <Chip compact selected testID={`driver-ruta-deuda-${item.id}`}>
              {t('debtBadge')}
            </Chip>
          ) : null}
          {pendingSync ? (
            <Chip compact testID={`driver-ruta-pending-sync-${item.id}`}>
              {t('pendingSync')}
            </Chip>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  empty: { padding: 24, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  seq: { minWidth: 36, textAlign: 'center' },
  rowBody: { flex: 1, gap: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
})
