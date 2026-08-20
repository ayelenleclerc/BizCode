import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Banner, Text } from 'react-native-paper'
import { useOffline } from './OfflineContext'
import { isSyncConflictError } from './types'

/**
 * @en Offline / sync status banner for App Driver (#164).
 * @es Banner de estado offline / sync para App Driver (#164).
 * @pt-BR Banner de status offline / sync para App Driver (#164).
 */
export function OfflineBanner() {
  const { t } = useTranslation('common')
  const { online, cacheDay, pendingCount, syncStatus, lastError, hydrating, runSync, runHydrate } =
    useOffline()

  if (hydrating) {
    return (
      <Banner visible icon="cloud-download" testID="driver-offline-hydrating">
        {t('offline.hydrating')}
      </Banner>
    )
  }

  if (!online) {
    return (
      <Banner
        visible
        icon="cloud-off-outline"
        testID="driver-offline-banner"
        actions={[
          {
            label: t('offline.retrySync'),
            onPress: () => {
              void runSync()
            },
          },
        ]}
      >
        {t('offline.banner', { date: cacheDay ?? '—' })}
        {pendingCount > 0 ? ` · ${t('offline.pending', { count: pendingCount })}` : ''}
      </Banner>
    )
  }

  if (pendingCount > 0 || syncStatus === 'syncing' || syncStatus === 'error') {
    const conflict = lastError != null && isSyncConflictError(lastError)
    return (
      <Banner
        visible
        icon={syncStatus === 'ok' ? 'cloud-check' : 'cloud-sync'}
        testID="driver-offline-sync-banner"
        actions={[
          {
            label: t('offline.retrySync'),
            onPress: () => {
              void (syncStatus === 'error' ? runHydrate() : runSync())
            },
          },
        ]}
      >
        {syncStatus === 'syncing'
          ? t('offline.syncing', { count: pendingCount })
          : syncStatus === 'error'
            ? conflict
              ? t('offline.syncConflict')
              : t('offline.syncError')
            : t('offline.pending', { count: pendingCount })}
      </Banner>
    )
  }

  if (syncStatus === 'ok' && cacheDay) {
    return (
      <View style={styles.okRow} testID="driver-offline-synced" accessibilityRole="text">
        <Text variant="labelSmall">{t('offline.synced')}</Text>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  okRow: { paddingHorizontal: 12, paddingVertical: 4, opacity: 0.75 },
})
