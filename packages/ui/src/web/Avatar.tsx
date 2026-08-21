import type { AvatarPropsBase } from '../types'

export type AvatarProps = AvatarPropsBase

/**
 * @en Circular avatar showing image or initials on web (#157).
 * @es Avatar circular con imagen o iniciales en web (#157).
 * @pt-BR Avatar circular com imagem ou iniciais na web (#157).
 */
export function Avatar({
  initials = '?',
  imageUrl,
  size = 40,
  testID = 'ui-avatar',
  accessibilityLabel,
}: AvatarProps) {
  const dim = { width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.4)) }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={accessibilityLabel ?? initials}
        data-testid={testID}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={accessibilityLabel ?? initials}
      data-testid={testID}
      className="inline-flex items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100"
      style={dim}
    >
      {initials.slice(0, 2).toUpperCase()}
    </span>
  )
}
