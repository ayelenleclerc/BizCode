import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function RutaLayout() {
  const { t } = useTranslation('ruta')

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('stub.listTitle') }} />
      <Stack.Screen name="[id]" options={{ title: t('stub.detailTitle') }} />
    </Stack>
  )
}
