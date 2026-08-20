import { Stack } from 'expo-router'

/**
 * @en Stack for chat deep-link screens (hidden from tab bar) (#165).
 * @es Stack para pantallas de chat por deep link (oculto en tabs) (#165).
 * @pt-BR Stack para telas de chat via deep link (oculto nas tabs) (#165).
 */
export default function MensajesLayout() {
  return <Stack screenOptions={{ headerShown: true }} />
}
