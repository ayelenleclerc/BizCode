import { Button, Dialog, RadioButton, Text, TextInput } from 'react-native-paper'
import { ScrollView, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { VoiceDraftLine } from './useVoiceOrder'

type Props = {
  visible: boolean
  drafts: VoiceDraftLine[]
  onSelect: (key: string, articuloId: number) => void
  onDiscard: (key: string) => void
  onQty: (key: string, qty: number) => void
  onConfirmAll: () => void
  onDismiss: () => void
}

/**
 * @en Confirmation sheet for spoken order lines; nothing is added until confirm (#266).
 * @es Hoja de confirmación de líneas dictadas; nada se agrega hasta confirmar (#266).
 * @pt-BR Folha de confirmação das linhas ditadas; nada entra até confirmar (#266).
 */
export function VoiceConfirmDialog({
  visible,
  drafts,
  onSelect,
  onDiscard,
  onQty,
  onConfirmAll,
  onDismiss,
}: Props) {
  const { t } = useTranslation('pedidos')
  const canConfirm = drafts.some((d) => d.selectedId != null)

  return (
    <Dialog visible={visible} onDismiss={onDismiss} testID="seller-voice-dialog">
      <Dialog.Title>{t('voice.confirmTitle')}</Dialog.Title>
      <Dialog.ScrollArea>
        <ScrollView accessibilityLabel={t('voice.confirmTitle')}>
          {drafts.map((draft) => (
            <View key={draft.key} style={{ marginBottom: 16 }} testID={`seller-voice-line-${draft.key}`}>
              <Text variant="titleSmall">{draft.phrase}</Text>
              <TextInput
                label={t('qty')}
                value={String(draft.qty)}
                keyboardType="decimal-pad"
                onChangeText={(raw) => {
                  const n = Number.parseFloat(raw.replace(',', '.'))
                  if (Number.isFinite(n) && n > 0) onQty(draft.key, n)
                }}
                testID={`seller-voice-qty-${draft.key}`}
                accessibilityLabel={t('qty')}
              />
              {draft.matches.length === 0 ? (
                <Text testID={`seller-voice-nomatch-${draft.key}`}>{t('voice.noMatch')}</Text>
              ) : (
                <RadioButton.Group
                  onValueChange={(v) => onSelect(draft.key, Number(v))}
                  value={draft.selectedId != null ? String(draft.selectedId) : ''}
                >
                  {draft.matches.map((m) => (
                    <RadioButton.Item
                      key={m.id}
                      label={m.descripcion}
                      value={String(m.id)}
                      accessibilityLabel={m.descripcion}
                    />
                  ))}
                </RadioButton.Group>
              )}
              <Button onPress={() => onDiscard(draft.key)} testID={`seller-voice-discard-${draft.key}`}>
                {t('voice.discard')}
              </Button>
            </View>
          ))}
        </ScrollView>
      </Dialog.ScrollArea>
      <Dialog.Actions>
        <Button onPress={onDismiss} testID="seller-voice-cancel">
          {t('voice.cancel')}
        </Button>
        <Button
          onPress={onConfirmAll}
          disabled={!canConfirm}
          testID="seller-voice-confirm"
          accessibilityLabel={t('voice.addConfirmed')}
        >
          {t('voice.addConfirmed')}
        </Button>
      </Dialog.Actions>
    </Dialog>
  )
}
