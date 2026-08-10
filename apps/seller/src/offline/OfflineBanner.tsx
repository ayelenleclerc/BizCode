import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Banner, Text } from 'react-native-paper'
import { useOffline } from './OfflineContext'

/**
 * @en Offline / sync status banner for App Seller.
 * @es Banner de estado offline / sync para App Seller.
 * @pt-BR Banner de status offline / sync para App Seller.
 */
export function OfflineBanner() {
  const { t } = useTranslation('common')
  const { online, cacheDay, pendingCount, syncStatus, hydrating, runSync, runHydrate } = useOffline()

  if (hydrating) {
    return (
      <Banner visible icon="cloud-download" testID="seller-offline-hydrating">
        {t('offline.hydrating')}
      </Banner>
    )
  }

  if (!online) {
    return (
      <Banner
        visible
        icon="cloud-off-outline"
        testID="seller-offline-banner"
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
    return (
      <Banner
        visible
        icon={syncStatus === 'ok' ? 'cloud-check' : 'cloud-sync'}
        testID="seller-offline-sync-banner"
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
            ? t('offline.syncError')
            : t('offline.pending', { count: pendingCount })}
      </Banner>
    )
  }

  if (syncStatus === 'ok' && cacheDay) {
    return (
      <View style={styles.okRow} testID="seller-offline-synced" accessibilityRole="text">
        <Text variant="labelSmall">{t('offline.synced')}</Text>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  okRow: { paddingHorizontal: 12, paddingVertical: 4, opacity: 0.75 },
})
