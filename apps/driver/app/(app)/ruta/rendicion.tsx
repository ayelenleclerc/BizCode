import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Button, HelperText, Text, Title } from 'react-native-paper'
import type { DevolucionEntregaPublic } from '@bizcode/types'
import { driverRepartosApi } from '../../../src/api/driverApi'
import { mapApiErrorToUiState, type UiLoadState } from '../../../src/lib/apiErrors'
import { useOffline } from '../../../src/offline/OfflineContext'
import { useDeviceIntegrity } from '../../../src/security/DeviceIntegrityContext'
import { useRuta } from '../../../src/ruta/RutaContext'

/**
 * @en End-of-day remittance of pending delivery returns (#163).
 * @es Rendición de fin de día de devoluciones pendientes (#163).
 * @pt-BR Prestação de fim de dia das devoluções pendentes (#163).
 */
export default function RendicionDevolucionesScreen() {
  const { t } = useTranslation(['devolucion', 'common'])
  const { reparto } = useRuta()
  const { online } = useOffline()
  const { confirmSensitiveAction } = useDeviceIntegrity()
  const [status, setStatus] = useState<UiLoadState>('idle')
  const [rows, setRows] = useState<DevolucionEntregaPublic[]>([])
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const loadList = useCallback(async () => {
    if (!reparto) {
      setStatus('empty')
      setRows([])
      return
    }
    setStatus('loading')
    setActionError(null)
    try {
      const list = (await driverRepartosApi.listDevoluciones(reparto.id)) ?? []
      setRows(list)
      setStatus(list.length === 0 ? 'empty' : 'success')
    } catch (err) {
      setStatus(mapApiErrorToUiState(err))
    }
  }, [reparto])

  useEffect(() => {
    void loadList()
  }, [loadList])

  const pending = rows.filter((row) => row.estado === 'registered')

  const onRemit = async () => {
    if (!reparto) return
    setSaving(true)
    setActionError(null)
    setSuccess(false)
    try {
      await driverRepartosApi.remitDevoluciones(reparto.id)
      setSuccess(true)
      await loadList()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message === 'LOTE_REQUIRED') {
        setActionError(t('devolucion:rendicion.loteRequired'))
      } else {
        setActionError(t('devolucion:rendicion.saveError'))
      }
    } finally {
      setSaving(false)
    }
  }

  if (!online) {
    return (
      <View style={styles.centered} testID="driver-rendicion-offline">
        <Text>{t('devolucion:rendicion.needsOnline')}</Text>
      </View>
    )
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <View style={styles.centered} testID="driver-rendicion-loading" accessibilityLabel={t('common:loading')}>
        <ActivityIndicator />
      </View>
    )
  }

  if (status === 'offline' || status === 'error' || status === 'forbidden' || status === 'not_found') {
    return (
      <View style={styles.centered} testID="driver-rendicion-error">
        <Text>{t('devolucion:rendicion.loadError')}</Text>
        <Button mode="contained" onPress={() => void loadList()} accessibilityLabel={t('common:retry')}>
          {t('common:retry')}
        </Button>
      </View>
    )
  }

  return (
    <View style={styles.root} testID="driver-rendicion">
      <Title>{t('devolucion:rendicion.title')}</Title>
      {success ? <HelperText type="info">{t('devolucion:rendicion.success')}</HelperText> : null}
      {actionError ? (
        <HelperText type="error" testID="driver-rendicion-error-msg">
          {actionError}
        </HelperText>
      ) : null}
      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <View testID="driver-rendicion-empty">
            <Text>{t('devolucion:rendicion.empty')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row} testID={`driver-rendicion-item-${item.id}`}>
            <Text>
              #{item.repartoItemId} · {t(`devolucion:motivo.${item.motivo}`)} ·{' '}
              {item.estado === 'registered'
                ? t('devolucion:rendicion.registered')
                : t('devolucion:rendicion.remitted')}
            </Text>
          </View>
        )}
      />
      <Button
        mode="contained"
        disabled={pending.length === 0 || saving}
        loading={saving}
        onPress={() => confirmSensitiveAction(() => onRemit())}
        testID="driver-rendicion-confirm"
        accessibilityLabel={t('devolucion:rendicion.confirm')}
      >
        {t('devolucion:rendicion.confirm')}
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, gap: 12 },
  row: { paddingVertical: 8 },
})
