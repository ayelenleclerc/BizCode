import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Text, Title } from 'react-native-paper'

/**
 * @en Collections stub (#159); implementation in #162.
 * @es Stub cobros (#159); implementación en #162.
 * @pt-BR Stub cobranças (#159); implementação em #162.
 */
export default function CobrosScreen() {
  const { t } = useTranslation('cobros')

  return (
    <View style={styles.root} testID="driver-cobros-list">
      <Title>{t('stub.title')}</Title>
      <Text style={styles.body}>{t('stub.body')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  body: {
    lineHeight: 22,
  },
})
