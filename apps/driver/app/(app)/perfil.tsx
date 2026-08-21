import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Button, List, Switch, Text } from 'react-native-paper'
import { Spinner } from '@bizcode/ui/native'
import { useAuth } from '../../src/auth/AuthContext'
import { driverPushApi } from '../../src/push/registerPush'
import { mapApiErrorToUiState } from '../../src/lib/apiErrors'

function errorMessageKey(err: unknown): string {
  const state = mapApiErrorToUiState(err)
  if (state === 'offline') return 'errorOffline'
  if (state === 'forbidden') return 'errorForbidden'
  if (state === 'not_found') return 'errorNotFound'
  return 'errorGeneric'
}

const TOGGLE_TYPES = [
  'reparto_assigned',
  'reparto_stop_added',
  'reparto_stop_removed',
  'chat_message',
] as const

type ToggleType = (typeof TOGGLE_TYPES)[number]

/**
 * @en Profile screen with session claims and push mute toggles (#165).
 * @es Pantalla perfil con claims de sesión y toggles push (#165).
 * @pt-BR Tela perfil com claims de sessão e toggles push (#165).
 */
export default function PerfilScreen() {
  const { t } = useTranslation('common')
  const { claims, logout } = useAuth()
  const router = useRouter()
  const [prefsLoading, setPrefsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [prefsError, setPrefsError] = useState<string | null>(null)
  const [muted, setMuted] = useState<Set<string>>(new Set())

  const loadPrefs = useCallback(async () => {
    setPrefsLoading(true)
    setPrefsError(null)
    try {
      const prefs = await driverPushApi.getPreferences()
      setMuted(new Set(prefs.mutedTypes))
    } catch (err) {
      setPrefsError(t(errorMessageKey(err)))
    } finally {
      setPrefsLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadPrefs()
  }, [loadPrefs])

  const toggle = async (type: ToggleType, enabled: boolean) => {
    const next = new Set(muted)
    if (enabled) {
      next.delete(type)
    } else {
      next.add(type)
    }
    setMuted(next)
    setSaving(true)
    setPrefsError(null)
    try {
      const prefs = await driverPushApi.updatePreferences([...next])
      setMuted(new Set(prefs.mutedTypes))
    } catch (err) {
      setPrefsError(t(errorMessageKey(err)))
      await loadPrefs()
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.root} testID="driver-perfil">
      <List.Section>
        <List.Subheader>{t('perfil.title')}</List.Subheader>
        {claims?.username ? (
          <List.Item
            title={t('perfil.username')}
            description={claims.username}
            testID="driver-perfil-username"
          />
        ) : null}
        {claims?.role ? (
          <List.Item title={t('perfil.role')} description={claims.role} testID="driver-perfil-role" />
        ) : null}
      </List.Section>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t('perfil.pushSection')}
      </Text>
      {prefsLoading ? (
        <Spinner label={t('loading')} testID="driver-perfil-push-loading" />
      ) : (
        <>
          {prefsError ? (
            <View accessibilityRole="alert" testID="driver-perfil-push-error">
              <Text style={styles.error}>{prefsError}</Text>
            </View>
          ) : null}
          {TOGGLE_TYPES.map((type) => {
            const enabled = !muted.has(type)
            return (
              <View key={type} testID={`driver-push-toggle-${type}`}>
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
        </>
      )}

      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon="logout"
          testID="driver-perfil-logout"
          accessibilityLabel={t('logout')}
          onPress={() => {
            void (async () => {
              await logout()
              router.replace('/(auth)/login')
            })()
          }}
        >
          {t('logout')}
        </Button>
        <Text variant="bodySmall" style={styles.hint}>
          {claims?.userId != null ? `ID ${claims.userId}` : ''}
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  actions: {
    gap: 8,
  },
  hint: {
    opacity: 0.6,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 8,
  },
})
