import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function PedidosLayout() {
  const { t } = useTranslation(['common', 'clientes'])
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('common:tabs.pedidos') }} />
      <Stack.Screen name="nuevo" options={{ title: t('clientes:nuevoPedido') }} />
      <Stack.Screen name="[id]" options={{ title: t('clientes:pedidos.detailTitle', { id: '' }).trim() }} />
    </Stack>
  )
}
