import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Text, Title } from 'react-native-paper'

/**
 * @en Route list stub (#159); data in #160.
 * @es Stub lista de ruta (#159); datos en #160.
 * @pt-BR Stub lista de rota (#159); dados em #160.
 */
export default function RutaIndexScreen() {
  const { t } = useTranslation('ruta')

  return (
    <View style={styles.root} testID="driver-ruta-list">
      <Title>{t('stub.listTitle')}</Title>
      <Text style={styles.body}>{t('stub.listBody')}</Text>
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
