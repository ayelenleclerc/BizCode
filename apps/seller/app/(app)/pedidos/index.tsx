import { Link } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { Button, Text, Title } from 'react-native-paper'

export default function PedidosListScreen() {
  return (
    <View style={styles.root} testID="seller-pedidos-list">
      <Title>Pedidos</Title>
      <Text>Listado de pedidos (stub #167).</Text>
      <Link href="/(app)/pedidos/nuevo" asChild>
        <Button mode="contained" testID="seller-pedidos-nuevo" accessibilityLabel="Crear nuevo pedido">
          Nuevo pedido
        </Button>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
})
