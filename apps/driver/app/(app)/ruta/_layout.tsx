import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function RutaLayout() {
  const { t } = useTranslation(['ruta', 'devolucion'])

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('title') }} />
      <Stack.Screen name="rendicion" options={{ title: t('devolucion:rendicion.title') }} />
      <Stack.Screen name="[id]" options={{ title: t('detail.title', { secuencia: '' }).trim() }} />
    </Stack>
  )
}
