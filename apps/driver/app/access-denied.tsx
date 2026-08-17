import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Button, Text, Title } from 'react-native-paper'
import { useAuth } from '../src/auth/AuthContext'

export default function AccessDeniedScreen() {
  const { t } = useTranslation('common')
  const { logout, claims } = useAuth()
  const router = useRouter()

  return (
    <View style={styles.root} testID="driver-access-denied" accessibilityRole="alert">
      <Title>{t('accessDenied.title')}</Title>
      <Text style={styles.body}>
        {t('accessDenied.body')}
        {claims?.role ? ` (${claims.role})` : ''}
      </Text>
      <Button
        mode="contained"
        testID="driver-access-denied-logout"
        accessibilityLabel={t('accessDenied.back')}
        onPress={() => {
          void (async () => {
            await logout()
            router.replace('/(auth)/login')
          })()
        }}
      >
        {t('accessDenied.back')}
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
    backgroundColor: '#EFF6FF',
  },
  body: {
    lineHeight: 22,
  },
})
