import { Redirect, Tabs, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { IconButton } from 'react-native-paper'
import { useAuth } from '../../src/auth/AuthContext'
import { OfflineBanner } from '../../src/offline/OfflineBanner'
import { DeviceIntegrityBanner } from '../../src/security/DeviceIntegrityBanner'
import { PedidoCartProvider } from '../../src/pedidos/CartContext'
import { usePushNotificationNavigation } from '../../src/push/usePushNotificationNavigation'

export default function AppLayout() {
  const { t } = useTranslation('common')
  const { status, logout } = useAuth()
  const router = useRouter()
  usePushNotificationNavigation(status === 'authenticated')

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
      testID="seller-logout"
      onPress={() => {
        void (async () => {
          await logout()
          router.replace('/(auth)/login')
        })()
      }}
    />
  )

  return (
    <PedidoCartProvider>
      <View style={{ flex: 1 }}>
        <DeviceIntegrityBanner />
        <OfflineBanner />
        <Tabs
          screenOptions={{
            headerRight: logoutButton,
          }}
        >
          <Tabs.Screen name="clientes" options={{ title: t('tabs.clientes') }} />
          <Tabs.Screen name="pedidos" options={{ title: t('tabs.pedidos') }} />
          <Tabs.Screen name="catalogo" options={{ title: t('tabs.catalogo') }} />
          <Tabs.Screen name="agenda" options={{ title: t('tabs.agenda') }} />
          <Tabs.Screen name="perfil" options={{ title: t('tabs.perfil') }} />
        </Tabs>
      </View>
    </PedidoCartProvider>
  )
}
