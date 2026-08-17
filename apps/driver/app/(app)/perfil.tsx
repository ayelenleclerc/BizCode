import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Button, List, Text } from 'react-native-paper'
import { useAuth } from '../../src/auth/AuthContext'

/**
 * @en Profile screen with session claims (#159); push toggles deferred to #165.
 * @es Pantalla perfil con claims de sesión (#159); toggles push diferidos a #165.
 * @pt-BR Tela perfil com claims de sessão (#159); toggles push adiados para #165.
 */
export default function PerfilScreen() {
  const { t } = useTranslation('common')
  const { claims, logout } = useAuth()
  const router = useRouter()

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
  actions: {
    gap: 8,
  },
  hint: {
    opacity: 0.6,
  },
})
