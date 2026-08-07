import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../src/auth/AuthContext'

/**
 * @en Root layout: Paper + auth session bootstrap for App Seller (#167).
 * @es Layout raíz: Paper + bootstrap de sesión auth para App Seller (#167).
 * @pt-BR Layout raiz: Paper + bootstrap de sessão auth para App Seller (#167).
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
