import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Text, Title } from 'react-native-paper'

/**
 * @en Collections stub (#162); may receive clienteId from route detail (#160).
 * @es Stub cobros (#162); puede recibir clienteId desde el detalle de ruta (#160).
 * @pt-BR Stub cobranças (#162); pode receber clienteId do detalhe da rota (#160).
 */
export default function CobrosScreen() {
  const { t } = useTranslation('cobros')
  const { clienteId } = useLocalSearchParams<{ clienteId?: string }>()

  return (
    <View style={styles.root} testID="driver-cobros-list">
      <Title>{t('stub.title')}</Title>
      <Text style={styles.body}>{t('stub.body')}</Text>
      {clienteId ? (
        <View testID="driver-cobros-cliente">
          <Text>{clienteId}</Text>
        </View>
      ) : null}
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
