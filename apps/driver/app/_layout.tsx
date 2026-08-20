import '../src/i18n'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../src/auth/AuthContext'
import { OfflineProvider } from '../src/offline/OfflineContext'

/**
 * @en Root layout: i18n + Paper + auth + offline sync for App Driver (#159/#164).
 * @es Layout raíz: i18n + Paper + auth + sync offline para App Driver (#159/#164).
 * @pt-BR Layout raiz: i18n + Paper + auth + sync offline para App Driver (#159/#164).
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider>
          <AuthProvider>
            <OfflineProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }} />
            </OfflineProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
