import { StyleSheet, View } from 'react-native'
import { Text, Title } from 'react-native-paper'

export default function CatalogoScreen() {
  return (
    <View style={styles.root} testID="seller-catalogo">
      <Title>Catálogo</Title>
      <Text>Catálogo de productos (stub #167).</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 8 },
})
