import { useTranslation } from 'react-i18next'
import { Banner } from 'react-native-paper'
import { useDeviceIntegrity } from './DeviceIntegrityContext'

/**
 * @en Visible warning when the device appears rooted or jailbroken (#220).
 * @es Advertencia visible si el dispositivo parece rooteado o jailbroken (#220).
 * @pt-BR Aviso visível se o dispositivo parecer com root ou jailbreak (#220).
 */
export function DeviceIntegrityBanner() {
  const { t } = useTranslation('common')
  const { compromised, checked } = useDeviceIntegrity()
  if (!checked || !compromised) return null
  return (
    <Banner visible icon="shield-alert" testID="driver-device-integrity-banner">
      {t('security.compromisedBanner')}
    </Banner>
  )
}
