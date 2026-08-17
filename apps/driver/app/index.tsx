import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../src/auth/AuthContext'

export default function Index() {
  const { t } = useTranslation('common')
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} testID="driver-boot-loading">
        <ActivityIndicator accessibilityLabel={t('loading')} />
      </View>
    )
  }
  if (status === 'forbidden') {
    return <Redirect href="/access-denied" />
  }
  if (status === 'authenticated') {
    return <Redirect href="/(app)/ruta" />
  }
  return <Redirect href="/(auth)/login" />
}
