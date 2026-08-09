import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native-paper'

/**
 * @en Catalog tab hint — order-taking catalog lives in New order flow (#169).
 * @es Pista del tab catálogo — el catálogo de toma de pedido está en Nuevo pedido (#169).
 * @pt-BR Dica da aba catálogo — o catálogo de tomada de pedido fica em Novo pedido (#169).
 */
export default function CatalogoScreen() {
  const { t } = useTranslation(['pedidos', 'common'])
  return (
    <View style={styles.root} testID="seller-catalogo">
      <Text variant="titleMedium">{t('common:tabs.catalogo')}</Text>
      <Text style={styles.hint}>{t('pedidos:selectClient')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 8 },
  hint: { opacity: 0.7 },
})
