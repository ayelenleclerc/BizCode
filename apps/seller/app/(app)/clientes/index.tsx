import { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Button, Chip, Searchbar, Text } from 'react-native-paper'
import { clientesAPI } from '../../../src/api/sellerApi'
import { mapApiErrorToUiState, type UiLoadState } from '../../../src/lib/apiErrors'
import { formatMoney, parseMoney } from '../../../src/lib/money'

type ClienteListItem = {
  id: number
  codigo: number
  rsocial: string
  localidad?: string | null
  balance?: number | string
  suspended?: boolean
  activo?: boolean
}

const DEBOUNCE_MS = 300

export default function ClientesListScreen() {
  const { t } = useTranslation(['clientes', 'common'])
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ClienteListItem[]>([])
  const [state, setState] = useState<UiLoadState>('idle')
  const [errorDetail, setErrorDetail] = useState<string | null>(null)
  const reqId = useRef(0)

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setItems([])
      setState('idle')
      setErrorDetail(null)
      return
    }
    const id = ++reqId.current
    setState('loading')
    setErrorDetail(null)
    try {
      const data = (await clientesAPI.list(trimmed)) as ClienteListItem[] | undefined
      if (id !== reqId.current) return
      const list = Array.isArray(data) ? data : []
      setItems(list)
      setState(list.length === 0 ? 'empty' : 'success')
    } catch (err) {
      if (id !== reqId.current) return
      setItems([])
      setState(mapApiErrorToUiState(err))
      setErrorDetail(err instanceof Error ? err.message : null)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void search(query)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query, search])

  return (
    <View style={styles.root} testID="seller-clientes-list">
      <Searchbar
        placeholder={t('clientes:searchPlaceholder')}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        {...({
          testID: 'seller-clientes-search',
          accessibilityLabel: t('clientes:searchPlaceholder'),
        } as object)}
      />

      {state === 'idle' && (
        <View testID="seller-clientes-hint">
          <Text style={styles.hint}>{t('clientes:emptyHint')}</Text>
        </View>
      )}
      {state === 'loading' && (
        <View
          testID="seller-clientes-loading"
          style={styles.centered}
          accessibilityLabel={t('common:loading')}
        >
          <ActivityIndicator />
        </View>
      )}
      {state === 'empty' && (
        <View testID="seller-clientes-empty">
          <Text style={styles.hint}>{t('clientes:empty')}</Text>
        </View>
      )}
      {(state === 'error' || state === 'offline' || state === 'forbidden') && (
        <View testID={`seller-clientes-${state}`} style={styles.centered}>
          <Text>
            {state === 'offline'
              ? t('common:errorOffline')
              : state === 'forbidden'
                ? t('common:errorForbidden')
                : t('common:errorGeneric')}
          </Text>
          {errorDetail ? <Text variant="bodySmall">{errorDetail}</Text> : null}
          <Button mode="text" onPress={() => void search(query)} testID="seller-clientes-retry">
            {t('common:retry')}
          </Button>
        </View>
      )}

      {(state === 'success' || state === 'empty') && items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          testID="seller-clientes-results"
          renderItem={({ item }) => {
            const suspended = Boolean(item.suspended)
            const balance = parseMoney(item.balance)
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.rsocial}
                testID={`seller-cliente-row-${item.id}`}
                onPress={() => router.push(`/(app)/clientes/${item.id}`)}
                style={styles.row}
              >
                <View style={styles.rowMain}>
                  <Text variant="titleMedium">{item.rsocial}</Text>
                  <Text variant="bodySmall">
                    {item.localidad?.trim() || t('clientes:localidadUnknown')} · #{item.codigo}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: balance < 0 ? '#1B5E20' : balance > 0 ? '#B71C1C' : undefined }}
                  >
                    {t('clientes:saldo')}: {formatMoney(balance)}
                  </Text>
                </View>
                <Chip
                  compact
                  style={{ backgroundColor: suspended ? '#FFCDD2' : '#C8E6C9' }}
                  {...({ testID: `seller-cliente-status-${item.id}` } as object)}
                >
                  {suspended ? t('clientes:statusSuspended') : t('clientes:statusActive')}
                </Chip>
              </Pressable>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 12, gap: 8 },
  search: { marginBottom: 4 },
  hint: { padding: 16, opacity: 0.7 },
  centered: { padding: 24, alignItems: 'center', gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    gap: 8,
  },
  rowMain: { flex: 1, gap: 2 },
})
