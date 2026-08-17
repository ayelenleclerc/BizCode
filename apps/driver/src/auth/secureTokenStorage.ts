import * as SecureStore from 'expo-secure-store'
import type { TokenStorage } from '@bizcode/api-client'

const ACCESS_KEY = 'bizcode_driver_access'
const REFRESH_KEY = 'bizcode_driver_refresh'

/**
 * @en Expo SecureStore adapter for dual Bearer auth (#159); never use AsyncStorage for tokens.
 * @es Adaptador SecureStore de Expo para auth Bearer dual (#159); nunca usar AsyncStorage para tokens.
 * @pt-BR Adapter SecureStore do Expo para auth Bearer dual (#159); nunca usar AsyncStorage para tokens.
 */
export const secureTokenStorage: TokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_KEY),
  setTokens: async ({ accessToken, refreshToken }) => {
    await SecureStore.setItemAsync(ACCESS_KEY, accessToken)
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken)
  },
  clearTokens: async () => {
    await SecureStore.deleteItemAsync(ACCESS_KEY)
    await SecureStore.deleteItemAsync(REFRESH_KEY)
  },
}
