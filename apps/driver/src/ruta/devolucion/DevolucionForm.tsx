import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, Modal, ScrollView, StyleSheet, View } from 'react-native'
import { Button, HelperText, Text, TextInput, Title } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import type { DevolucionEntregaRegisterInput, MotivoDevolucionEntrega, OrdenEntregaLineItem } from '@bizcode/types'
import { POD_MAX_FOTO_BYTES, compressPhotoUri } from '../../lib/podMedia'
import { clampReturnQty } from './qtyClamp'

type Props = {
  visible: boolean
  motivo: MotivoDevolucionEntrega
  articles: OrdenEntregaLineItem[]
  onClose: () => void
  onSubmit: (input: DevolucionEntregaRegisterInput) => Promise<void>
}

/**
 * @en Return form for rechazo / damaged goods: line qtys, optional notes, photo (#163).
 * @es Formulario de devolución para rechazo / dañado: cantidades, notas, foto (#163).
 * @pt-BR Formulário de devolução para recusa / avaria: quantidades, notas, foto (#163).
 */
export default function DevolucionForm({ visible, motivo, articles, onClose, onSubmit }: Props) {
  const { t } = useTranslation(['devolucion', 'common', 'pod'])
  const [qtys, setQtys] = useState<Record<number, string>>({})
  const [detalle, setDetalle] = useState('')
  const [fotoDataUrl, setFotoDataUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) return
    const next: Record<number, string> = {}
    for (const row of articles) {
      next[row.id] = String(row.cantidad)
    }
    setQtys(next)
    setDetalle('')
    setFotoDataUrl(null)
    setSaving(false)
    setError(null)
  }, [visible, articles])

  const lineas = useMemo(() => {
    const out: DevolucionEntregaRegisterInput['lineas'] = []
    for (const row of articles) {
      const parsed = Number.parseFloat(qtys[row.id] ?? '')
      const qty = clampReturnQty(parsed, row.cantidad)
      if (qty == null) return null
      out.push({ articuloId: row.articulo.id, facturaItemId: row.id, cantidad: qty })
    }
    return out
  }, [articles, qtys])

  const fotoRequired = motivo === 'producto_dañado'
  const canSubmit = lineas != null && lineas.length > 0 && (!fotoRequired || fotoDataUrl != null) && !saving

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
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setError(t('pod:libraryDenied'))
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 })
    if (result.canceled || !result.assets[0]) return
    await attachPhoto(result.assets[0])
  }

  const handleSubmit = async () => {
    if (lineas == null || lineas.length === 0) {
      setError(t('devolucion:invalidQty'))
      return
    }
    if (fotoRequired && fotoDataUrl == null) {
      setError(t('devolucion:photoRequired'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        motivo,
        motivoDetalle: detalle.trim() || null,
        fotoBase64: fotoDataUrl,
        lineas,
      })
    } catch {
      setError(t('devolucion:saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.root} testID="driver-devolucion-form">
        <Title>{t('devolucion:formTitle')}</Title>
        <Text>{t(`devolucion:motivo.${motivo}`)}</Text>
        {articles.map((row) => (
          <View
            key={row.id}
            style={styles.line}
            accessibilityLabel={t('devolucion:qtyLabel', { max: row.cantidad })}
          >
            <Text>{row.articulo.descripcion}</Text>
            <TextInput
              label={t('devolucion:qtyLabel', { max: row.cantidad })}
              value={qtys[row.id] ?? ''}
              onChangeText={(v: string) => setQtys((prev) => ({ ...prev, [row.id]: v }))}
              testID={`driver-devolucion-qty-${row.id}`}
            />
          </View>
        ))}
        <TextInput
          label={t('devolucion:detalle')}
          value={detalle}
          onChangeText={setDetalle}
          multiline
          testID="driver-devolucion-detalle"
        />
        {fotoRequired ? <HelperText type="info">{t('devolucion:photoRequiredHint')}</HelperText> : null}
        <View style={styles.row}>
          <Button onPress={() => void takePhoto()} accessibilityLabel={t('pod:photoCapture')}>
            {t('pod:photoCapture')}
          </Button>
          <Button onPress={() => void pickFromLibrary()} accessibilityLabel={t('pod:photoLibrary')}>
            {t('pod:photoLibrary')}
          </Button>
        </View>
        {fotoDataUrl ? (
          <Image source={{ uri: fotoDataUrl }} style={styles.preview} accessibilityIgnoresInvertColors />
        ) : null}
        {error ? (
          <HelperText type="error" testID="driver-devolucion-error">
            {error}
          </HelperText>
        ) : null}
        <View style={styles.row}>
          <Button onPress={onClose}>{t('common:cancel')}</Button>
          <Button
            mode="contained"
            disabled={!canSubmit}
            loading={saving}
            onPress={() => void handleSubmit()}
            testID="driver-devolucion-submit"
          >
            {t('devolucion:confirm')}
          </Button>
        </View>
      </ScrollView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 12 },
  line: { gap: 4 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  preview: { width: 160, height: 120, borderRadius: 8 },
})
