import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'

function navigateFromData(
  router: ReturnType<typeof useRouter>,
  data: Record<string, unknown> | undefined,
): void {
  if (!data || typeof data.type !== 'string') {
    return
  }

  if (
    data.type === 'reparto_assigned' ||
    data.type === 'reparto_stop_added' ||
    data.type === 'reparto_stop_removed'
  ) {
    if (typeof data.itemId === 'number') {
      router.push(`/(app)/ruta/${data.itemId}`)
      return
    }
    router.push('/(app)/ruta')
    return
  }

  if (data.type === 'chat_message' && typeof data.fromUserId === 'number') {
    router.push(`/(app)/mensajes/${data.fromUserId}`)
  }
}

/**
 * @en Handles notification taps and deep-links into route/chat screens (#165).
 * @es Maneja taps de notificación y navega a ruta/chat (#165).
 * @pt-BR Trata toques na notificação e navega para rota/chat (#165).
 */
export function usePushNotificationNavigation(enabled: boolean): void {
  const router = useRouter()
  const responseSub = useRef<{ remove: () => void } | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      const data = response?.notification.request.content.data as
        | Record<string, unknown>
        | undefined
      navigateFromData(router, data)
    })

    responseSub.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>
      navigateFromData(router, data)
    })

    return () => {
      responseSub.current?.remove()
      responseSub.current = null
    }
  }, [enabled, router])
}
