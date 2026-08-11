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
    (data.type === 'pedido_confirmed' || data.type === 'pedido_cancelled') &&
    typeof data.pedidoId === 'number'
  ) {
    router.push(`/(app)/pedidos/${data.pedidoId}`)
    return
  }
  if (
    (data.type === 'cliente_credit_alert' || data.type === 'cliente_payment_received') &&
    typeof data.clienteId === 'number'
  ) {
    router.push(`/(app)/clientes/${data.clienteId}`)
  }
}

/**
 * @en Handles notification taps and deep-links into pedido/cliente screens (#172).
 * @es Maneja taps de notificación y navega a pedido/cliente (#172).
 * @pt-BR Trata toques na notificação e navega para pedido/cliente (#172).
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
