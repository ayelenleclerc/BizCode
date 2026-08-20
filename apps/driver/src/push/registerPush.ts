import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { createPushNotificationsAPI } from '@bizcode/api-client'
import { driverHttp } from '../api/http'

const pushApi = createPushNotificationsAPI(driverHttp)

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

/**
 * @en Registers Expo push token with the API when permissions allow (#165).
 * @es Registra el token Expo push en la API si hay permiso (#165).
 * @pt-BR Registra o token Expo push na API se houver permissão (#165).
 */
export async function registerDriverPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null
  }

  const current = await Notifications.getPermissionsAsync()
  let status = current.status
  if (status !== 'granted') {
    const asked = await Notifications.requestPermissionsAsync()
    status = asked.status
  }
  if (status !== 'granted') {
    return null
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    undefined

  const tokenResponse = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync()

  const token = tokenResponse.data
  await pushApi.registerToken({
    token,
    platform: Platform.OS,
  })
  return token
}

/**
 * @en Unregisters a previously stored Expo push token (#165).
 * @es Desregistra un token Expo push previamente guardado (#165).
 * @pt-BR Remove o registro de um token Expo push previamente salvo (#165).
 */
export async function unregisterDriverPushToken(token: string | null): Promise<void> {
  if (!token) {
    return
  }
  try {
    await pushApi.unregisterToken(token)
  } catch {
    /* logout must proceed even if unregister fails */
  }
}

export { pushApi as driverPushApi }
