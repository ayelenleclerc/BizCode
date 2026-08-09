import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { PedidoCartProvider } from '../../../src/pedidos/CartContext'

export default function PedidosLayout() {
  const { t } = useTranslation(['common', 'clientes', 'pedidos'])
  return (
    <PedidoCartProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: t('common:tabs.pedidos') }} />
        <Stack.Screen name="nuevo" options={{ title: t('pedidos:title') }} />
        <Stack.Screen name="resumen" options={{ title: t('pedidos:summaryTitle') }} />
        <Stack.Screen name="[id]" options={{ title: t('clientes:pedidos.detailTitle', { id: '' }).trim() }} />
      </Stack>
    </PedidoCartProvider>
  )
}
