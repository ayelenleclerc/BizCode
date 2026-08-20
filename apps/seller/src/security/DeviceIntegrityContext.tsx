import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import { detectCompromisedDevice } from './deviceIntegrity'

type DeviceIntegrityContextValue = {
  compromised: boolean
  checked: boolean
  /**
   * @en Runs action after optional confirm when device looks rooted/jailbroken.
   * @es Ejecuta la acción tras confirmación opcional si el dispositivo parece rooteado/jailbroken.
   * @pt-BR Executa a ação após confirmação opcional se o dispositivo parecer root/jailbreak.
   */
  confirmSensitiveAction: (onProceed: () => void | Promise<void>) => void
}

const DeviceIntegrityContext = createContext<DeviceIntegrityContextValue | null>(null)

/**
 * @en Provides root/jailbreak status and soft-gate for sensitive Driver actions (#220).
 * @es Provee estado root/jailbreak y soft-gate para acciones sensibles del Driver (#220).
 * @pt-BR Fornece status root/jailbreak e soft-gate para ações sensíveis do Driver (#220).
 */
export function DeviceIntegrityProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common')
  const [compromised, setCompromised] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const status = detectCompromisedDevice()
    setCompromised(status.compromised)
    setChecked(status.checked)
  }, [])

  const confirmSensitiveAction = useCallback(
    (onProceed: () => void | Promise<void>) => {
      if (!compromised) {
        void onProceed()
        return
      }
      Alert.alert(t('security.compromisedTitle'), t('security.compromisedSensitiveBody'), [
        { text: t('security.cancel'), style: 'cancel' },
        {
          text: t('security.continueAnyway'),
          style: 'destructive',
          onPress: () => {
            void onProceed()
          },
        },
      ])
    },
    [compromised, t],
  )

  const value = useMemo(
    () => ({ compromised, checked, confirmSensitiveAction }),
    [compromised, checked, confirmSensitiveAction],
  )

  return (
    <DeviceIntegrityContext.Provider value={value}>{children}</DeviceIntegrityContext.Provider>
  )
}

export function useDeviceIntegrity(): DeviceIntegrityContextValue {
  const ctx = useContext(DeviceIntegrityContext)
  if (!ctx) {
    throw new Error('useDeviceIntegrity must be used within DeviceIntegrityProvider')
  }
  return ctx
}
