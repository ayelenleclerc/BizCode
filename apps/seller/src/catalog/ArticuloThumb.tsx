import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { Image } from 'expo-image'
import { articuloInitials } from './thumbUrl'
import { resolveThumbUriSync } from './thumbCache'

type ArticuloThumbProps = {
  articuloId: number
  descripcion: string
  urlThumb?: string | null
  grayscale?: boolean
  size: number
  testID?: string
}

/**
 * @en Catalog thumb or initials placeholder (#257).
 * @es Thumb de catálogo o placeholder de iniciales (#257).
 * @pt-BR Thumb do catálogo ou placeholder de iniciais (#257).
 */
export function ArticuloThumb({
  articuloId,
  descripcion,
  urlThumb,
  grayscale = false,
  size,
  testID,
}: ArticuloThumbProps) {
  const uri = resolveThumbUriSync(articuloId, urlThumb)
  const initials = articuloInitials(descripcion)
  if (!uri) {
    return (
      <View
        style={[styles.placeholder, { width: size, height: size }]}
        testID={testID ?? `seller-pedido-thumb-placeholder-${articuloId}`}
        accessibilityLabel={initials}
      >
        <Text style={styles.initials}>{initials}</Text>
      </View>
    )
  }
  return (
    <Image
      source={{ uri }}
      style={[styles.img, { width: size, height: size }, grayscale ? styles.gray : null]}
      contentFit="cover"
      transition={150}
      testID={testID ?? `seller-pedido-thumb-${articuloId}`}
      accessibilityLabel={descripcion}
    />
  )
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  initials: { fontWeight: '700', fontSize: 16, color: '#334155' },
  img: { borderRadius: 8, backgroundColor: '#E2E8F0' },
  gray: { opacity: 0.45 },
})
