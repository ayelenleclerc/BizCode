import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Text, Title } from 'react-native-paper'

/**
 * @en Stop detail stub (#159); implementation in #160.
 * @es Stub detalle de parada (#159); implementación en #160.
 * @pt-BR Stub detalhe da parada (#159); implementação em #160.
 */
export default function RutaDetailScreen() {
  const { t } = useTranslation('ruta')
  const { id } = useLocalSearchParams<{ id: string }>()
  const stopId = typeof id === 'string' ? id : ''

  return (
    <View style={styles.root} testID="driver-ruta-detail">
      <Title>{t('stub.detailTitle')}</Title>
      <Text style={styles.body}>{t('stub.detailBody', { id: stopId || '—' })}</Text>
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
