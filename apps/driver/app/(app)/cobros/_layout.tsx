import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function CobrosLayout() {
  const { t } = useTranslation('cobros')

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('stub.title') }} />
    </Stack>
  )
}
