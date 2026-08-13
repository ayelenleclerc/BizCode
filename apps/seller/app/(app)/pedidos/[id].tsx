import { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Button, List, Text } from 'react-native-paper'
import type { PedidoRow } from '@bizcode/types'
import { pedidosAPI } from '../../../src/api/sellerApi'
import { PedidoWhatsAppButton } from '../../../src/pedidos/PedidoWhatsAppButton'
import { mapApiErrorToUiState, type UiLoadState } from '../../../src/lib/apiErrors'
import { formatMoney } from '../../../src/lib/money'

/**
 * @en Read-only commercial order detail for App Seller (#168).
 * @es Detalle de pedido comercial solo lectura para App Seller (#168).
 * @pt-BR Detalhe de pedido comercial somente leitura para App Seller (#168).
 */
export default function PedidoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const pedidoId = Number.parseInt(String(id), 10)
  const { t, i18n } = useTranslation(['clientes', 'pedidos', 'common'])
  const [state, setState] = useState<UiLoadState>('loading')
  const [pedido, setPedido] = useState<PedidoRow | null>(null)

  const load = useCallback(async () => {
    if (!Number.isInteger(pedidoId) || pedidoId < 1) {
      setState('not_found')
      return
    }
    setState('loading')
    try {
      const row = await pedidosAPI.get(pedidoId)
      setPedido(row)
      setState('success')
    } catch (err) {
      setPedido(null)
      setState(mapApiErrorToUiState(err))
    }
  }, [pedidoId])

  useEffect(() => {
    void load()
  }, [load])

  const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'pt-BR' ? 'pt-BR' : 'es-AR'

  if (state === 'loading') {
    return (
      <View
        style={styles.centered}
        testID="seller-pedido-detail-loading"
        accessibilityLabel={t('common:loading')}
      >
        <ActivityIndicator />
      </View>
    )
  }

  if (state !== 'success' || !pedido) {
    return (
      <View style={styles.centered} testID={`seller-pedido-detail-${state}`}>
        <Text>
          {state === 'not_found'
            ? t('common:errorNotFound')
            : state === 'forbidden'
              ? t('common:errorForbidden')
              : state === 'offline'
                ? t('common:errorOffline')
                : t('common:errorGeneric')}
        </Text>
        <Button mode="outlined" onPress={() => void load()} testID="seller-pedido-detail-retry">
          {t('common:retry')}
        </Button>
      </View>
    )
  }

  const items = Array.isArray(pedido.items) ? pedido.items : []

  return (
    <ScrollView contentContainerStyle={styles.root} testID="seller-pedido-detail">
      <View testID="seller-pedido-detail-title">
        <Text variant="headlineSmall">{t('clientes:pedidos.detailTitle', { id: pedido.id })}</Text>
      </View>
      <List.Item
        title={t('clientes:pedidos.estado')}
        description={pedido.estado}
        {...({ testID: 'seller-pedido-estado' } as object)}
      />
      <List.Item
        title={t('clientes:pedidos.total')}
        description={formatMoney(pedido.total, locale)}
        {...({ testID: 'seller-pedido-total' } as object)}
      />
      <List.Item
        title={t('clientes:pedidos.createdAt')}
        description={new Date(pedido.createdAt).toLocaleString(locale)}
        {...({ testID: 'seller-pedido-created' } as object)}
      />
      {pedido.cliente ? (
        <List.Item
          title={pedido.cliente.rsocial}
          description={`#${pedido.cliente.codigo}`}
          {...({ testID: 'seller-pedido-cliente' } as object)}
        />
      ) : null}
      <Text variant="titleMedium" style={styles.mt}>
        {t('clientes:pedidos.items')}
      </Text>
      {items.length === 0 ? (
        <View testID="seller-pedido-no-items">
          <Text>{t('clientes:pedidos.noItems')}</Text>
        </View>
      ) : (
        items.map((raw, index) => {
          const line = raw as {
            articuloId?: number
            cantidad?: number | string
            precio?: number | string
          }
          return (
            <List.Item
              key={`${line.articuloId ?? index}`}
              title={`Art. ${line.articuloId ?? '—'}`}
              description={`${line.cantidad ?? '—'} × ${formatMoney(line.precio, locale)}`}
              {...({ testID: `seller-pedido-item-${index}` } as object)}
            />
          )
        })
      )}
      <View style={styles.mt}>
        <PedidoWhatsAppButton pedidoId={pedido.id} locale={i18n.language} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 4, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  mt: { marginTop: 16 },
})
