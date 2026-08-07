import '../src/i18n'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../src/auth/AuthContext'

/**
 * @en Root layout: i18n + Paper + auth session for App Seller (#167/#168).
 * @es Layout raíz: i18n + Paper + sesión auth para App Seller (#167/#168).
 * @pt-BR Layout raiz: i18n + Paper + sessão auth para App Seller (#167/#168).
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
