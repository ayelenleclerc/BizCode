import { useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { Button, Text, Title } from 'react-native-paper'
import { useAuth } from '../src/auth/AuthContext'

export default function AccessDeniedScreen() {
  const { logout, claims } = useAuth()
  const router = useRouter()

  return (
    <View style={styles.root} testID="seller-access-denied" accessibilityRole="alert">
      <Title>Acceso solo vendedor</Title>
      <Text style={styles.body}>
        Esta aplicación es para roles seller, manager u owner.
        {claims?.role ? ` Tu rol actual es «${claims.role}».` : ''}
      </Text>
      <Button
        mode="contained"
        testID="seller-access-denied-logout"
        accessibilityLabel="Volver al inicio de sesión"
        onPress={() => {
          void (async () => {
            await logout()
            router.replace('/(auth)/login')
          })()
        }}
      >
        Volver al login
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#FFF7ED',
  },
  body: {
    lineHeight: 22,
  },
})
