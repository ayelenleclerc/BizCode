import type { MotivoNoEntrega } from '@bizcode/types'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, StyleSheet, View } from 'react-native'
import { Button, Dialog, HelperText, List, Portal, RadioButton, Text, Title } from 'react-native-paper'
import { useRuta } from '../../../src/ruta/RutaContext'
import { digitsOnly, hasDebt, mapsUrl } from '../../../src/ruta/stopView'

const MOTIVOS: MotivoNoEntrega[] = [
  'ausente',
  'rechazo',
  'domicilio_incorrecto',
  'producto_dañado',
  'otro',
]

/**
 * @en Stop detail: customer, lines, debt, native maps/dialer, not-delivered (#160).
 * @es Detalle de parada: cliente, renglones, deuda, mapas/llamada, no entrega (#160).
 * @pt-BR Detalhe da parada: cliente, linhas, dívida, mapas/ligação, não entrega (#160).
 */
export default function RutaDetailScreen() {
  const { t } = useTranslation(['ruta', 'common'])
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { reparto, markNotDelivered } = useRuta()
  const itemId = Number.parseInt(typeof id === 'string' ? id : '', 10)
  const item = reparto?.items.find((row) => row.id === itemId)
  const [motivoOpen, setMotivoOpen] = useState(false)
  const [motivo, setMotivo] = useState<MotivoNoEntrega>('ausente')
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (!item) {
    return (
      <View style={styles.root} testID="driver-ruta-detail">
        <Text>{t('ruta:empty')}</Text>
      </View>
    )
  }

  const cliente = item.ordenEntrega.cliente
  const phone = digitsOnly(cliente?.telef)
  const mapLink = mapsUrl({
    latitud: cliente?.latitud,
    longitud: cliente?.longitud,
    domicilio: cliente?.domicilio,
    localidad: cliente?.localidad,
  })
  const articles = item.ordenEntrega.items ?? []
  const facturas = cliente?.deuda?.facturasPendientes ?? []
  const debt = hasDebt(cliente?.balance ?? cliente?.deuda?.saldo)
  const canMutate = reparto?.estado === 'on_route' && item.estado === 'pending'

  const onNotDelivered = async () => {
    setActionError(null)
    setSaving(true)
    try {
      await markNotDelivered(item.id, motivo)
      setMotivoOpen(false)
    } catch {
      setActionError(t('ruta:detail.notDeliveredError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.root} testID="driver-ruta-detail">
      <Title>{t('ruta:detail.title', { secuencia: item.secuencia })}</Title>
      <Text variant="titleMedium">{cliente?.rsocial ?? '—'}</Text>
      <Text>
        {t('ruta:detail.address')}: {cliente?.domicilio ?? '—'}
      </Text>

      {phone ? (
        <Button
          mode="outlined"
          icon="phone"
          testID="driver-ruta-call"
          accessibilityLabel={t('ruta:detail.call')}
          onPress={() => void Linking.openURL(`tel:${phone}`)}
        >
          {t('ruta:detail.call')}
        </Button>
      ) : null}

      {mapLink ? (
        <Button
          mode="outlined"
          icon="map"
          testID="driver-ruta-maps"
          accessibilityLabel={t('ruta:detail.maps')}
          onPress={() => void Linking.openURL(mapLink)}
        >
          {t('ruta:detail.maps')}
        </Button>
      ) : null}

      <List.Section>
        <List.Subheader>{t('ruta:detail.articles')}</List.Subheader>
        {articles.length === 0 ? <Text>{t('ruta:detail.noArticles')}</Text> : null}
        {articles.map((line) => (
          <List.Item
            key={line.id}
            title={line.articulo.descripcion}
            description={`${line.articulo.codigo} · ${line.cantidad}`}
          />
        ))}
      </List.Section>

      <List.Section>
        <List.Subheader>{t('ruta:detail.debt')}</List.Subheader>
        <Text>{t('ruta:detail.saldo', { saldo: cliente?.deuda?.saldo ?? cliente?.balance ?? '0.00' })}</Text>
        {facturas.length === 0 ? <Text>{t('ruta:detail.noDebt')}</Text> : null}
        {facturas.map((f) => (
          <List.Item key={f.facturaId} title={f.facturaRef} description={f.pendiente} />
        ))}
      </List.Section>

      {reparto?.estado === 'planned' ? <HelperText type="info" visible>{t('ruta:detail.plannedBlock')}</HelperText> : null}
      {actionError ? <HelperText type="error" visible>{actionError}</HelperText> : null}

      <Button mode="contained" disabled testID="driver-ruta-entregar" accessibilityLabel={t('ruta:detail.deliver')}>
        {t('ruta:detail.deliver')}
      </Button>
      <HelperText type="info" visible>
        {t('ruta:detail.deliverHint')}
      </HelperText>

      <Button
        mode="outlined"
        testID="driver-ruta-no-entregar"
        disabled={!canMutate || saving}
        accessibilityLabel={t('ruta:detail.notDelivered')}
        onPress={() => setMotivoOpen(true)}
      >
        {t('ruta:detail.notDelivered')}
      </Button>

      {debt ? (
        <Button
          mode="text"
          testID="driver-ruta-cobrar"
          accessibilityLabel={t('ruta:detail.collect')}
          onPress={() => router.push(`/(app)/cobros?clienteId=${cliente?.id ?? ''}`)}
        >
          {t('ruta:detail.collect')}
        </Button>
      ) : null}

      <Portal>
        <Dialog visible={motivoOpen} onDismiss={() => setMotivoOpen(false)} testID="driver-ruta-motivo-dialog">
          <Dialog.Title>{t('ruta:detail.motivoTitle')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(v) => setMotivo(v as MotivoNoEntrega)} value={motivo}>
              {MOTIVOS.map((key) => (
                <RadioButton.Item key={key} label={t(`ruta:detail.motivo.${key}`)} value={key} />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setMotivoOpen(false)}>{t('common:cancel')}</Button>
            <Button testID="driver-ruta-motivo-confirm" loading={saving} onPress={() => void onNotDelivered()}>
              {t('ruta:detail.confirmMotivo')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 12 },
})
