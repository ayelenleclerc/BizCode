import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '../src/auth/AuthContext'

export default function Index() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} testID="seller-boot-loading">
        <ActivityIndicator accessibilityLabel="Cargando sesión" />
      </View>
    )
  }
  if (status === 'forbidden') {
    return <Redirect href="/access-denied" />
  }
  if (status === 'authenticated') {
    return <Redirect href="/(app)/clientes" />
  }
  return <Redirect href="/(auth)/login" />
}
