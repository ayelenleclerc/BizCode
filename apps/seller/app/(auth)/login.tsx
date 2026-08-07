import { Redirect, useRouter } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { Button, HelperText, Text, TextInput, Title } from 'react-native-paper'
import { useAuth } from '../../src/auth/AuthContext'

export default function LoginScreen() {
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
      setLocalError('Completá tenant, usuario y contraseña.')
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
        <Title>BizCode Seller</Title>
        <Text style={styles.subtitle}>Ingresá con tu cuenta de campo</Text>

        <TextInput
          label="Tenant"
          value={tenantSlug}
          onChangeText={setTenantSlug}
          mode="outlined"
          style={styles.field}
          // Paper TextInput forwards RN TextInput props at runtime (#167).
          {...({
            autoCapitalize: 'none',
            autoCorrect: false,
            testID: 'seller-login-tenant',
            accessibilityLabel: 'Slug del tenant',
          } as object)}
        />
        <TextInput
          label="Usuario"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={styles.field}
          {...({
            autoCapitalize: 'none',
            autoCorrect: false,
            testID: 'seller-login-username',
            accessibilityLabel: 'Nombre de usuario',
          } as object)}
        />
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.field}
          {...({
            secureTextEntry: true,
            testID: 'seller-login-password',
            accessibilityLabel: 'Contraseña',
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
          accessibilityLabel="Iniciar sesión"
        >
          Iniciar sesión
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
  subtitle: {
    marginBottom: 12,
    opacity: 0.75,
  },
  field: {
    marginBottom: 4,
  },
})
