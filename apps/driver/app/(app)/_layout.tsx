import { Redirect, Tabs, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { IconButton } from 'react-native-paper'
import { useAuth } from '../../src/auth/AuthContext'
import { OfflineBanner } from '../../src/offline/OfflineBanner'
import { RutaProvider } from '../../src/ruta/RutaContext'

export default function AppLayout() {
  const { t } = useTranslation('common')
  const { status, logout } = useAuth()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        accessibilityLabel={t('loading')}
      >
        <ActivityIndicator />
      </View>
    )
  }
  if (status === 'anonymous') {
    return <Redirect href="/(auth)/login" />
  }
  if (status === 'forbidden') {
    return <Redirect href="/access-denied" />
  }

  const logoutButton = () => (
    <IconButton
      icon="logout"
      accessibilityLabel={t('logout')}
      testID="driver-logout"
      onPress={() => {
        void (async () => {
          await logout()
          router.replace('/(auth)/login')
        })()
      }}
    />
  )

  return (
    <RutaProvider>
      <OfflineBanner />
      <Tabs
        screenOptions={{
          headerRight: logoutButton,
        }}
      >
        <Tabs.Screen name="ruta" options={{ title: t('tabs.ruta') }} />
        <Tabs.Screen name="cobros" options={{ title: t('tabs.cobros') }} />
        <Tabs.Screen name="perfil" options={{ title: t('tabs.perfil') }} />
      </Tabs>
    </RutaProvider>
  )
}
