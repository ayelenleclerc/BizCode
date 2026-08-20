import NetInfo from '@react-native-community/netinfo'

/**
 * @en True when the device reports an internet-reachable connection.
 * @es True si el dispositivo reporta conexión con internet alcanzable.
 * @pt-BR True se o dispositivo reporta conexão com internet alcançável.
 */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch()
  if (state.isConnected === false) return false
  if (state.isInternetReachable === false) return false
  return true
}

/**
 * @en Subscribe to connectivity changes; returns unsubscribe.
 * @es Suscribe a cambios de conectividad; retorna unsubscribe.
 * @pt-BR Inscreve-se em mudanças de conectividade; retorna unsubscribe.
 */
export function subscribeNetwork(onChange: (online: boolean) => void): () => void {
  return NetInfo.addEventListener((state) => {
    const online = state.isConnected !== false && state.isInternetReachable !== false
    onChange(online)
  })
}
