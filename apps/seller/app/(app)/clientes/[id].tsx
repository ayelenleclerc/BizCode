import { useLocalSearchParams } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { Text, Title } from 'react-native-paper'

export default function ClienteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <View style={styles.root} testID="seller-cliente-detail">
      <Title>Ficha de cliente</Title>
      <Text>Stub ficha · id={String(id)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 8 },
})
