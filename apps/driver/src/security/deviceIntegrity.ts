import { Platform } from 'react-native'

export type DeviceIntegrityStatus = {
  compromised: boolean
  checked: boolean
}

/**
 * @en Detects jailbreak/root via jail-monkey when native module is present (#220). Soft signal only.
 * @es Detecta jailbreak/root vía jail-monkey si el módulo nativo existe (#220). Solo señal suave.
 * @pt-BR Detecta jailbreak/root via jail-monkey se o módulo nativo existir (#220). Sinal suave apenas.
 */
export function detectCompromisedDevice(): DeviceIntegrityStatus {
  if (Platform.OS === 'web') {
    return { compromised: false, checked: true }
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional native; Expo Go/web skip
    const JailMonkey = require('jail-monkey') as {
      default?: { isJailBroken?: () => boolean }
      isJailBroken?: () => boolean
    }
    const api = JailMonkey.default ?? JailMonkey
    const compromised = Boolean(api.isJailBroken?.())
    return { compromised, checked: true }
  } catch {
    return { compromised: false, checked: true }
  }
}
