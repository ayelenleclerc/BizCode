import '../src/i18n'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../src/auth/AuthContext'
import { OfflineProvider } from '../src/offline/OfflineContext'
import { DeviceIntegrityProvider } from '../src/security/DeviceIntegrityContext'

/**
 * @en Root layout: i18n + Paper + auth + offline sync + device integrity for App Driver (#159/#164/#220).
 * @es Layout raíz: i18n + Paper + auth + sync offline + integridad de dispositivo para App Driver (#159/#164/#220).
 * @pt-BR Layout raiz: i18n + Paper + auth + sync offline + integridade do dispositivo para App Driver (#159/#164/#220).
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider>
          <AuthProvider>
            <DeviceIntegrityProvider>
              <OfflineProvider>
                <StatusBar style="dark" />
                <Stack screenOptions={{ headerShown: false }} />
              </OfflineProvider>
            </DeviceIntegrityProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
