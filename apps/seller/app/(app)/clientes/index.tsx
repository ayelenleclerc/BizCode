import { Link } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { Button, Text, Title } from 'react-native-paper'

export default function ClientesListScreen() {
  return (
    <View style={styles.root} testID="seller-clientes-list">
      <Title>Clientes</Title>
      <Text>Listado de clientes (stub #167). La ficha llega en #168.</Text>
      <Link href="/(app)/clientes/demo" asChild>
        <Button mode="outlined" testID="seller-clientes-open-stub" accessibilityLabel="Abrir ficha de ejemplo">
          Abrir ficha ejemplo
        </Button>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
})
