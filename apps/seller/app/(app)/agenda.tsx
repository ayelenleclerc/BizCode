import { StyleSheet, View } from 'react-native'
import { Text, Title } from 'react-native-paper'

export default function AgendaScreen() {
  return (
    <View style={styles.root} testID="seller-agenda">
      <Title>Agenda</Title>
      <Text>Agenda de visitas (stub #167). Rutas en #267.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 8 },
})
