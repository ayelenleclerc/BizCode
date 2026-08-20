import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { Button, HelperText, Text, TextInput, Title } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import {
  POD_MAX_FIRMA_BYTES,
  POD_MAX_FOTO_BYTES,
  compressPhotoUri,
  compressSignatureDataUrl,
} from '../../lib/podMedia'
import PodSignatureCanvas from './PodSignatureCanvas'
import {
  buildDeliveredPodInput,
  canConfirmDelivered,
  mapPodSaveError,
  type DeliveredPodFields,
} from './podValidation'
import { useDeviceIntegrity } from '../../security/DeviceIntegrityContext'

type Props = {
  visible: boolean
  clienteName: string
  onClose: () => void
  onSubmit: (input: DeliveredPodFields) => Promise<void>
}

const STEP_KEYS = ['stepReceptor', 'stepSignature', 'stepPhoto', 'stepConfirm'] as const

/**
 * @en Four-step POD wizard: recipient, signature, optional photo, confirm (#161).
 * @es Wizard POD de 4 pasos: receptor, firma, foto opcional, confirmar (#161).
 * @pt-BR Assistente POD de 4 passos: receptor, assinatura, foto opcional, confirmar (#161).
 */
export default function PodDeliveryWizard({ visible, clienteName, onClose, onSubmit }: Props) {
  const { t } = useTranslation(['pod'])
  const { confirmSensitiveAction } = useDeviceIntegrity()
  const [step, setStep] = useState(0)
  const [receptorNombre, setReceptorNombre] = useState('')
  const [receptorDni, setReceptorDni] = useState('')
  const [notas, setNotas] = useState('')
  const [firmaDataUrl, setFirmaDataUrl] = useState<string | null>(null)
  const [fotoDataUrl, setFotoDataUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) return
    setStep(0)
    setReceptorNombre('')
    setReceptorDni('')
    setNotas('')
    setFirmaDataUrl(null)
    setFotoDataUrl(null)
    setSaving(false)
    setError(null)
  }, [visible])

  const stepLabel = t(`pod:${STEP_KEYS[step]}`)
  const canNextReceptor = receptorNombre.trim().length > 0
  const canNextSignature = firmaDataUrl != null && firmaDataUrl.length > 0
  const canConfirm = canConfirmDelivered(receptorNombre, firmaDataUrl)

  const attachPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    setError(null)
    try {
      const dataUrl = await compressPhotoUri(asset.uri, POD_MAX_FOTO_BYTES, {
        width: asset.width,
        height: asset.height,
      })
      setFotoDataUrl(dataUrl)
    } catch {
      setError(t('pod:errors.photoTooLarge'))
    }
  }

  const takePhoto = async () => {
    setError(null)
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      setError(t('pod:cameraDenied'))
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      cameraType: ImagePicker.CameraType.back,
    })
    if (result.canceled || !result.assets[0]) return
    await attachPhoto(result.assets[0])
  }

  const pickFromLibrary = async () => {
    setError(null)
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setError(t('pod:libraryDenied'))
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (result.canceled || !result.assets[0]) return
    await attachPhoto(result.assets[0])
  }

  const handleConfirm = async () => {
    if (!canConfirm || !firmaDataUrl) {
      setError(t('pod:signatureRequired'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const firmaBase64 = compressSignatureDataUrl(firmaDataUrl, POD_MAX_FIRMA_BYTES)
      await onSubmit(
        buildDeliveredPodInput({
          receptorNombre,
          receptorDni,
          firmaBase64,
          fotoBase64: fotoDataUrl,
          notasEntrega: notas,
        }),
      )
    } catch (err) {
      const key = mapPodSaveError(err)
      if (key === 'signatureRequired') {
        setError(t('pod:signatureRequired'))
      } else if (key === 'photoTooLarge') {
        setError(t('pod:errors.photoTooLarge'))
      } else if (key === 'firmaTooLarge') {
        setError(t('pod:errors.firmaTooLarge'))
      } else {
        setError(t('pod:errors.save'))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.root} testID="driver-pod-wizard">
          <Title>{t('pod:wizardTitle')}</Title>
          <Text>{clienteName}</Text>
          <View testID="driver-pod-step" accessibilityLiveRegion="polite">
            <Text>
            {t('pod:stepIndicator', { current: step + 1, total: 4, label: stepLabel })}
            </Text>
          </View>

          {step === 0 ? (
            <ScrollView contentContainerStyle={styles.stepBody}>
              <TextInput
                label={t('pod:receptorNombre')}
                value={receptorNombre}
                onChangeText={setReceptorNombre}
                testID="driver-pod-receptor-nombre"
              />
              <TextInput
                label={t('pod:receptorDni')}
                value={receptorDni}
                onChangeText={setReceptorDni}
                testID="driver-pod-receptor-dni"
              />
              <TextInput
                label={t('pod:notas')}
                value={notas}
                onChangeText={setNotas}
                testID="driver-pod-notas"
                multiline
              />
            </ScrollView>
          ) : null}

          {step === 1 ? (
            <View style={styles.stepBody}>
              <PodSignatureCanvas onChange={setFirmaDataUrl} />
            </View>
          ) : null}

          {step === 2 ? (
            <ScrollView contentContainerStyle={styles.stepBody}>
              <Text variant="labelLarge">{t('pod:photoLabel')}</Text>
              {fotoDataUrl ? (
                <Image
                  source={{ uri: fotoDataUrl }}
                  style={styles.preview}
                  accessibilityLabel={t('pod:summaryPhoto')}
                  testID="driver-pod-photo-preview"
                />
              ) : null}
              <Button
                mode="contained"
                icon="camera"
                testID="driver-pod-photo-capture"
                accessibilityLabel={t('pod:photoCapture')}
                onPress={() => void takePhoto()}
              >
                {fotoDataUrl ? t('pod:photoRetake') : t('pod:photoCapture')}
              </Button>
              <Button
                mode="outlined"
                icon="image"
                testID="driver-pod-photo-library"
                accessibilityLabel={t('pod:photoLibrary')}
                onPress={() => void pickFromLibrary()}
              >
                {t('pod:photoLibrary')}
              </Button>
              {fotoDataUrl ? (
                <Button
                  mode="text"
                  testID="driver-pod-photo-remove"
                  accessibilityLabel={t('pod:photoRemove')}
                  onPress={() => setFotoDataUrl(null)}
                >
                  {t('pod:photoRemove')}
                </Button>
              ) : null}
            </ScrollView>
          ) : null}

          {step === 3 ? (
            <ScrollView contentContainerStyle={styles.stepBody} testID="driver-pod-summary">
              <Text>{t('pod:summaryReceptor', { name: receptorNombre.trim() })}</Text>
              <Text>
                {receptorDni.trim()
                  ? t('pod:summaryDni', { dni: receptorDni.trim() })
                  : t('pod:summaryNoDni')}
              </Text>
              <Text>
                {notas.trim() ? t('pod:summaryNotes', { notes: notas.trim() }) : t('pod:summaryNoNotes')}
              </Text>
              <Text>{t('pod:summarySignature')}</Text>
              {firmaDataUrl ? (
                <Image
                  source={{ uri: firmaDataUrl }}
                  style={styles.signaturePreview}
                  accessibilityLabel={t('pod:summarySignature')}
                  testID="driver-pod-summary-signature"
                />
              ) : null}
              <Text>{fotoDataUrl ? t('pod:summaryPhoto') : t('pod:summaryNoPhoto')}</Text>
              {fotoDataUrl ? (
                <Image
                  source={{ uri: fotoDataUrl }}
                  style={styles.preview}
                  accessibilityLabel={t('pod:summaryPhoto')}
                  testID="driver-pod-summary-photo"
                />
              ) : null}
            </ScrollView>
          ) : null}

          {error ? (
            <HelperText type="error" visible testID="driver-pod-error">
              {error}
            </HelperText>
          ) : null}

          <View style={styles.actions}>
            <Button
              mode="text"
              testID="driver-pod-cancel"
              accessibilityLabel={t('pod:cancel')}
              onPress={onClose}
              disabled={saving}
            >
              {t('pod:cancel')}
            </Button>
            <View style={styles.nav}>
              {step > 0 ? (
                <Button
                  mode="outlined"
                  testID="driver-pod-back"
                  accessibilityLabel={t('pod:back')}
                  onPress={() => setStep((s) => s - 1)}
                  disabled={saving}
                >
                  {t('pod:back')}
                </Button>
              ) : null}
              {step < 3 ? (
                <Button
                  mode="contained"
                  testID="driver-pod-next"
                  accessibilityLabel={t('pod:next')}
                  onPress={() => setStep((s) => s + 1)}
                  disabled={
                    (step === 0 && !canNextReceptor) || (step === 1 && !canNextSignature) || saving
                  }
                >
                  {t('pod:next')}
                </Button>
              ) : (
                <Button
                  mode="contained"
                  testID="driver-pod-confirm"
                  accessibilityLabel={t('pod:confirmDelivery')}
                  onPress={() => confirmSensitiveAction(() => handleConfirm())}
                  loading={saving}
                  disabled={saving || !canConfirm}
                >
                  {error ? t('pod:retry') : t('pod:confirmDelivery')}
                </Button>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, padding: 16, gap: 12, backgroundColor: '#ffffff' },
  stepBody: { gap: 12, paddingBottom: 16, flexGrow: 1 },
  preview: { width: '100%', height: 180, borderRadius: 8, backgroundColor: '#e2e8f0' },
  signaturePreview: { width: '100%', height: 120, borderRadius: 8, backgroundColor: '#ffffff' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  nav: { flexDirection: 'row', gap: 8 },
})
