import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { RutaProvider } from '../../../src/ruta/RutaContext'

export default function RutaLayout() {
  const { t } = useTranslation('ruta')

  return (
    <RutaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: t('title') }} />
        <Stack.Screen name="[id]" options={{ title: t('detail.title', { secuencia: '' }).trim() }} />
      </Stack>
    </RutaProvider>
  )
}
