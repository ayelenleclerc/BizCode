import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { List, Switch, Text } from 'react-native-paper'
import { Spinner } from '@bizcode/ui/native'
import { sellerPushApi } from '../../src/push/registerPush'
import { mapApiErrorToUiState } from '../../src/lib/apiErrors'

function errorMessageKey(err: unknown): string {
  const state = mapApiErrorToUiState(err)
  if (state === 'offline') return 'errorOffline'
  if (state === 'forbidden') return 'errorForbidden'
  if (state === 'not_found') return 'errorNotFound'
  return 'errorGeneric'
}

const TOGGLE_TYPES = [
  'pedido_confirmed',
  'pedido_cancelled',
  'cliente_credit_alert',
  'cliente_payment_received',
  'chat_message',
] as const

type ToggleType = (typeof TOGGLE_TYPES)[number]

/**
 * @en Profile screen: mute mobile push notifications by type (#172).
 * @es Perfil: silenciar push móvil por tipo (#172).
 * @pt-BR Perfil: silenciar push móvel por tipo (#172).
 */
export default function PerfilScreen() {
  const { t } = useTranslation('common')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [muted, setMuted] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const prefs = await sellerPushApi.getPreferences()
      setMuted(new Set(prefs.mutedTypes))
    } catch (err) {
      setError(t(errorMessageKey(err)))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const toggle = async (type: ToggleType, enabled: boolean) => {
    const next = new Set(muted)
    if (enabled) {
      next.delete(type)
    } else {
      next.add(type)
    }
    setMuted(next)
    setSaving(true)
    setError(null)
    try {
      const prefs = await sellerPushApi.updatePreferences([...next])
      setMuted(new Set(prefs.mutedTypes))
    } catch (err) {
      setError(t(errorMessageKey(err)))
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered} accessibilityLabel={t('loading')}>
        <Spinner label={t('loading')} testID="seller-perfil-loading" />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container} testID="seller-perfil">
      <Text variant="titleLarge" style={styles.title}>
        {t('perfil.title')}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {t('perfil.pushSection')}
      </Text>
      {error ? (
        <View accessibilityRole="alert" testID="seller-perfil-error">
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
      {TOGGLE_TYPES.map((type) => {
        const enabled = !muted.has(type)
        return (
          <View key={type} testID={`seller-push-toggle-${type}`}>
            <List.Item
              title={t(`perfil.pushTypes.${type}`)}
              description={enabled ? t('perfil.enabled') : t('perfil.muted')}
              right={() => (
                <Switch
                  value={enabled}
                  disabled={saving}
                  onValueChange={(value: boolean) => {
                    void toggle(type, value)
                  }}
                />
              )}
            />
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { marginBottom: 8 },
  subtitle: { marginBottom: 16, opacity: 0.8 },
  error: { color: '#b91c1c', marginBottom: 12 },
})
