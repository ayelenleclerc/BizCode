import { useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Haptics from 'expo-haptics'
import { Text } from 'react-native-paper'
import { formatMoney } from '../lib/money'
import { lineSubtotal } from './cartMath'
import {
  appendNumpadDigit,
  backspaceNumpad,
  decimalSeparatorForLocale,
  formatInitialBuffer,
  parseNumpadBuffer,
  validateDscto,
  type DecimalSeparator,
} from './numpadParse'

export type NumpadMode = 'cantidad' | 'dscto'

export type NumpadSheetProps = {
  visible: boolean
  mode: NumpadMode
  initialValue: number
  precio: number
  cantidadForSubtotal: number
  dsctoForSubtotal: number
  title?: string
  subtitle?: string
  decimalSeparator?: DecimalSeparator
  locale?: string
  onConfirm: (value: number) => void
  onDismiss: () => void
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

/**
 * @en Bottom-sheet numeric keypad for qty / line discount (#264). Draft stays local until confirm.
 * @es Teclado numérico bottom-sheet para cantidad / dto. de línea (#264). El draft es local hasta confirmar.
 * @pt-BR Teclado numérico bottom-sheet para quantidade / desc. de linha (#264). O draft é local até confirmar.
 */
export function NumpadSheet({
  visible,
  mode,
  initialValue,
  precio,
  cantidadForSubtotal,
  dsctoForSubtotal,
  title,
  subtitle,
  decimalSeparator,
  locale = 'es-AR',
  onConfirm,
  onDismiss,
}: NumpadSheetProps) {
  const { t, i18n } = useTranslation(['pedidos', 'common'])
  const sep = decimalSeparator ?? decimalSeparatorForLocale(i18n.language)
  const [buffer, setBuffer] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) return
    setBuffer(formatInitialBuffer(initialValue, sep))
    setError(null)
  }, [visible, initialValue, sep])

  const parsed = parseNumpadBuffer(buffer, sep)
  const liveCantidad = mode === 'cantidad' ? (parsed ?? 0) : cantidadForSubtotal
  const liveDsctoRaw = mode === 'dscto' ? (parsed ?? 0) : dsctoForSubtotal
  const liveDscto = Math.min(100, Math.max(0, liveDsctoRaw))
  const subtotal = useMemo(
    () => lineSubtotal({ cantidad: liveCantidad, precio, dscto: liveDscto }),
    [liveCantidad, precio, liveDscto],
  )

  const onKey = (key: string) => {
    setError(null)
    setBuffer((prev) => appendNumpadDigit(prev, key, sep))
  }

  const onBackspace = () => {
    setError(null)
    setBuffer((prev) => backspaceNumpad(prev))
  }

  const handleConfirm = async () => {
    const value = parseNumpadBuffer(buffer, sep)
    if (value == null) {
      setError(mode === 'dscto' ? t('pedidos:numpad.errorRange') : t('pedidos:numpad.errorQty'))
      return
    }
    if (mode === 'dscto') {
      const check = validateDscto(value)
      if (!check.ok) {
        setError(t('pedidos:numpad.errorRange'))
        return
      }
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      } catch {
        // haptics optional
      }
      onConfirm(check.value)
      return
    }
    if (value <= 0) {
      setError(t('pedidos:numpad.errorQty'))
      return
    }
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } catch {
      // haptics optional
    }
    onConfirm(value)
  }

  const heading =
    title ?? (mode === 'dscto' ? t('pedidos:numpad.dsctoTitle') : t('pedidos:numpad.qtyTitle'))

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDismiss}
      testID="seller-numpad"
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={t('common:cancel')}
          testID="seller-numpad-dismiss"
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View testID="seller-numpad-title">
            <Text variant="titleMedium">{heading}</Text>
          </View>
          {subtitle ? (
            <View testID="seller-numpad-subtitle">
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          ) : null}
          <View testID="seller-numpad-display">
            <Text variant="headlineMedium" style={styles.display}>
              {buffer || '0'}
              {mode === 'dscto' ? '%' : ''}
            </Text>
          </View>
          <View testID="seller-numpad-unit-price">
            <Text style={styles.meta}>
              {t('pedidos:numpad.unitPrice', { price: formatMoney(precio, locale) })}
            </Text>
          </View>
          <View testID="seller-numpad-subtotal">
            <Text style={styles.meta}>
              {t('pedidos:numpad.subtotal', { amount: formatMoney(subtotal, locale) })}
            </Text>
          </View>
          {mode === 'dscto' || dsctoForSubtotal > 0 ? (
            <View testID="seller-numpad-dscto-indicator">
              <Text style={styles.meta}>
                {t('pedidos:numpad.discountActive', {
                  pct: mode === 'dscto' ? (parsed ?? dsctoForSubtotal) : dsctoForSubtotal,
                })}
              </Text>
            </View>
          ) : null}
          {error ? (
            <View testID="seller-numpad-error">
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.grid}>
            {DIGITS.map((d) => (
              <Pressable
                key={d}
                onPress={() => onKey(d)}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
                accessibilityRole="button"
                accessibilityLabel={d}
                testID={`seller-numpad-key-${d}`}
              >
                <Text style={styles.keyLabel}>{d}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => onKey(sep)}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              accessibilityRole="button"
              accessibilityLabel={sep}
              testID="seller-numpad-key-sep"
            >
              <Text style={styles.keyLabel}>{sep}</Text>
            </Pressable>
            <Pressable
              onPress={() => onKey('0')}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              accessibilityRole="button"
              accessibilityLabel="0"
              testID="seller-numpad-key-0"
            >
              <Text style={styles.keyLabel}>0</Text>
            </Pressable>
            <Pressable
              onPress={onBackspace}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              accessibilityRole="button"
              accessibilityLabel={t('pedidos:numpad.backspace')}
              testID="seller-numpad-key-back"
            >
              <Text style={styles.keyLabel}>⌫</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => void handleConfirm()}
            style={({ pressed }) => [styles.confirm, pressed && styles.keyPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('pedidos:numpad.confirm')}
            testID="seller-numpad-confirm"
          >
            <Text style={styles.confirmLabel}>{t('pedidos:numpad.confirm')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const KEY_MIN = 48

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 6,
  },
  subtitle: { opacity: 0.75 },
  display: { fontWeight: '700', marginTop: 4 },
  meta: { opacity: 0.75, fontSize: 14 },
  error: { color: '#b91c1c', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  key: {
    width: '33.33%',
    minHeight: KEY_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  keyPressed: { opacity: 0.6 },
  keyLabel: { fontSize: 22, fontWeight: '600' },
  confirm: {
    marginTop: 8,
    minHeight: KEY_MIN,
    borderRadius: 8,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: { color: '#fff', fontSize: 18, fontWeight: '700' },
})
