import { StyleSheet, View } from 'react-native'
import { Text, Title } from 'react-native-paper'

export default function NuevoPedidoScreen() {
  return (
    <View style={styles.root} testID="seller-pedido-nuevo">
      <Title>Nuevo pedido</Title>
      <Text>Stub de alta de pedido (#167). Carrito offline en #169.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 8 },
})
