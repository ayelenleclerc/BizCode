import { useCallback, useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Button, Text } from 'react-native-paper'
import type { PedidoRow } from '@bizcode/types'
import { pedidosAPI } from '../../../src/api/sellerApi'
import { mapApiErrorToUiState, type UiLoadState } from '../../../src/lib/apiErrors'
import { formatMoney } from '../../../src/lib/money'

export default function PedidosListScreen() {
  const { t, i18n } = useTranslation(['pedidos', 'common'])
  const router = useRouter()
  const [items, setItems] = useState<PedidoRow[]>([])
  const [state, setState] = useState<UiLoadState>('loading')
  const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'pt-BR' ? 'pt-BR' : 'es-AR'

  const load = useCallback(async () => {
    setState('loading')
    try {
      const res = await pedidosAPI.list({ limit: 50 })
      const list = Array.isArray(res.data) ? res.data : []
      setItems(list)
      setState(list.length === 0 ? 'empty' : 'success')
    } catch (err) {
      setItems([])
      setState(mapApiErrorToUiState(err))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <View style={styles.root} testID="seller-pedidos-list">
      <Text style={styles.hint}>{t('pedidos:listHint')}</Text>

      {state === 'loading' && (
        <View style={styles.centered} testID="seller-pedidos-loading">
          <ActivityIndicator />
        </View>
      )}
      {state === 'empty' && (
        <View testID="seller-pedidos-empty">
          <Text>{t('pedidos:listEmpty')}</Text>
        </View>
      )}
      {(state === 'error' || state === 'offline' || state === 'forbidden') && (
        <View style={styles.centered} testID={`seller-pedidos-${state}`}>
          <Text>
            {state === 'offline'
              ? t('common:errorOffline')
              : state === 'forbidden'
                ? t('common:errorForbidden')
                : t('common:errorGeneric')}
          </Text>
          <Button onPress={() => void load()}>{t('common:retry')}</Button>
        </View>
      )}

      {state === 'success' && (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          testID="seller-pedidos-flatlist"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(app)/pedidos/${item.id}`)}
              testID={`seller-pedido-row-${item.id}`}
              accessibilityRole="button"
            >
              <View style={styles.row}>
                <Text variant="titleSmall">#{item.id}</Text>
                <Text style={styles.meta}>
                  {t('pedidos:estado')}: {item.estado} · {formatMoney(item.total, locale)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 8 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  hint: { opacity: 0.7 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    gap: 2,
  },
  meta: { opacity: 0.7, fontSize: 13 },
})
