import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function ClientesLayout() {
  const { t } = useTranslation('clientes')
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('listTitle') }} />
      <Stack.Screen name="[id]" options={{ title: t('detailTitle') }} />
    </Stack>
  )
}
