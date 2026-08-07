import { Redirect, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { Button, HelperText, TextInput, Title } from 'react-native-paper'
import { useAuth } from '../../src/auth/AuthContext'

export default function LoginScreen() {
  const { t } = useTranslation('common')
  const { status, login, error } = useAuth()
  const router = useRouter()
  const [tenantSlug, setTenantSlug] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  if (status === 'authenticated') {
    return <Redirect href="/(app)/clientes" />
  }
  if (status === 'forbidden') {
    return <Redirect href="/access-denied" />
  }

  const onSubmit = async () => {
    setLocalError(null)
    if (!tenantSlug.trim() || !username.trim() || !password) {
      setLocalError(t('login.failed'))
      return
    }
    setSubmitting(true)
    try {
      await login({
        tenantSlug: tenantSlug.trim(),
        username: username.trim(),
        password,
      })
      router.replace('/(app)/clientes')
    } catch {
      // Error message is surfaced via auth context / local helper.
    } finally {
      setSubmitting(false)
    }
  }

  const displayError = localError ?? error

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="seller-login-screen"
    >
      <View style={styles.card}>
        <Title>{t('login.title')}</Title>

        <TextInput
          label={t('login.tenant')}
          value={tenantSlug}
          onChangeText={setTenantSlug}
          mode="outlined"
          style={styles.field}
          {...({
            autoCapitalize: 'none',
            autoCorrect: false,
            testID: 'seller-login-tenant',
            accessibilityLabel: t('login.tenant'),
          } as object)}
        />
        <TextInput
          label={t('login.username')}
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={styles.field}
          {...({
            autoCapitalize: 'none',
            autoCorrect: false,
            testID: 'seller-login-username',
            accessibilityLabel: t('login.username'),
          } as object)}
        />
        <TextInput
          label={t('login.password')}
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.field}
          {...({
            secureTextEntry: true,
            testID: 'seller-login-password',
            accessibilityLabel: t('login.password'),
          } as object)}
        />

        {displayError ? (
          <View testID="seller-login-error" accessibilityLiveRegion="polite">
            <HelperText type="error" visible>
              {displayError}
            </HelperText>
          </View>
        ) : null}

        <Button
          mode="contained"
          onPress={() => {
            void onSubmit()
          }}
          loading={submitting}
          disabled={submitting}
          testID="seller-login-submit"
          accessibilityLabel={t('login.submit')}
        >
          {t('login.submit')}
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F0FDFA',
  },
  card: {
    gap: 8,
  },
  field: {
    marginBottom: 4,
  },
})
