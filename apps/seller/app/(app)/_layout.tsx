import { Redirect, Tabs, useRouter } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { IconButton } from 'react-native-paper'
import { useAuth } from '../../src/auth/AuthContext'

export default function AppLayout() {
  const { status, logout } = useAuth()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator accessibilityLabel="Cargando" />
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
      accessibilityLabel="Cerrar sesión"
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
    <Tabs
      screenOptions={{
        headerRight: logoutButton,
      }}
    >
      <Tabs.Screen name="clientes" options={{ title: 'Clientes' }} />
      <Tabs.Screen name="pedidos" options={{ title: 'Pedidos' }} />
      <Tabs.Screen name="catalogo" options={{ title: 'Catálogo' }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda' }} />
    </Tabs>
  )
}
