import { memo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import SignatureCanvas, { type SignatureViewRef } from 'react-native-signature-canvas'

type Props = {
  onChange: (dataUrl: string | null) => void
}

const WEB_STYLE = `
  .m-signature-pad { box-shadow: none; border: none; margin: 0; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { display: none; margin: 0; }
  body, html { height: 100%; background-color: #ffffff; }
`

/**
 * @en Native signature pad for proof of delivery (#161).
 * @es Lienzo de firma nativo para comprobante de entrega (#161).
 * @pt-BR Tela de assinatura nativa para comprovante de entrega (#161).
 */
function PodSignatureCanvas({ onChange }: Props) {
  const { t } = useTranslation('pod')
  const ref = useRef<SignatureViewRef | null>(null)

  return (
    <View testID="driver-pod-signature">
      <Text variant="labelLarge">{t('signatureLabel')}</Text>
      <View
        style={styles.pad}
        accessibilityLabel={t('signatureLabel')}
        accessibilityHint={t('signatureRequired')}
      >
        <SignatureCanvas
          ref={ref}
          style={styles.canvas}
          webStyle={WEB_STYLE}
          backgroundColor="#ffffff"
          penColor="#1e293b"
          autoClear={false}
          imageType="image/png"
          descriptionText=""
          onOK={(signature: string) => onChange(signature)}
          onEmpty={() => onChange(null)}
          onEnd={() => ref.current?.readSignature()}
        />
      </View>
      <Button
        mode="text"
        testID="driver-pod-signature-clear"
        accessibilityLabel={t('signatureClear')}
        onPress={() => {
          ref.current?.clearSignature()
          onChange(null)
        }}
      >
        {t('signatureClear')}
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  pad: {
    height: 200,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  canvas: { flex: 1 },
})

export default memo(PodSignatureCanvas)
