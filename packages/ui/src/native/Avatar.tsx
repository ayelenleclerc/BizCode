import { View } from 'react-native'
import { Avatar as PaperAvatar } from 'react-native-paper'
import type { AvatarPropsBase } from '../types'

export type AvatarProps = AvatarPropsBase

/**
 * @en Paper Avatar showing image or initials on native (#157).
 * @es Avatar de Paper con imagen o iniciales en native (#157).
 * @pt-BR Avatar do Paper com imagem ou iniciais no native (#157).
 */
export function Avatar({
  initials = '?',
  imageUrl,
  size = 40,
  testID = 'ui-avatar',
  accessibilityLabel,
}: AvatarProps) {
  const label = accessibilityLabel ?? initials

  if (imageUrl) {
    return (
      <View testID={testID} accessibilityLabel={label}>
        <PaperAvatar.Image size={size} source={{ uri: imageUrl }} />
      </View>
    )
  }

  return (
    <View testID={testID} accessibilityLabel={label}>
      <PaperAvatar.Text size={size} label={initials.slice(0, 2).toUpperCase()} />
    </View>
  )
}
