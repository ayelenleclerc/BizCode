import type { ChequeInputDTO, CobroTransferInfo, FormaPagoDTO } from '@bizcode/api-client'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Linking, Platform, ScrollView, Share, StyleSheet, View } from 'react-native'
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Dialog,
  HelperText,
  Portal,
  RadioButton,
  Text,
  TextInput,
  Title,
} from 'react-native-paper'
import { driverCobrosApi, driverFormasPagoApi } from '../../../src/api/driverApi'
import { enqueueCobroCreate } from '../../../src/offline/actions'
import { getOfflineDb } from '../../../src/offline/db'
import { isOnline } from '../../../src/offline/network'
import { useOffline } from '../../../src/offline/OfflineContext'
import { loadFormasPagoCache, loadTransferInfoCache } from '../../../src/offline/repos'
import {
  canSubmitWithoutOverSaldoDialog,
  formatMoney,
  needsOverSaldoConfirm,
  parseMoney,
  sumSelectedPendiente,
  todayYmd,
} from '../../../src/cobros/cobroAmount'
import {
  findFormaPago,
  isChequeForma,
  isTransferForma,
  pickDefaultFormaPagoId,
} from '../../../src/cobros/formaPagoMatch'
import { buildCobroReceiptText, buildCobroWaMeUrl } from '../../../src/cobros/whatsappReceipt'
import { mapApiErrorToUiState } from '../../../src/lib/apiErrors'
import { useRuta } from '../../../src/ruta/RutaContext'

function parseClienteId(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return null
  const n = Number.parseInt(value, 10)
  return Number.isInteger(n) && n > 0 ? n : null
}

/**
 * @en App Driver collection at delivery: scoped POST /api/cobros, WhatsApp receipt text (#162).
 * @es Cobro en entrega App Driver: POST /api/cobros acotado, texto de recibo WhatsApp (#162).
 * @pt-BR Cobrança na entrega App Driver: POST /api/cobros restrito, texto de recibo WhatsApp (#162).
 */
export default function CobrosScreen() {
  const { t } = useTranslation(['cobros', 'common'])
  const router = useRouter()
  const { clienteId: clienteIdParam } = useLocalSearchParams<{ clienteId?: string | string[] }>()
  const clienteId = parseClienteId(clienteIdParam)
  const { status, reparto, load } = useRuta()
  const { refreshMeta } = useOffline()

  useEffect(() => {
    if (status === 'idle') {
      void load()
    }
  }, [load, status])

  if (!clienteId) {
    return (
      <View style={styles.centered} testID="driver-cobros-empty">
        <Title>{t('cobros:empty.title')}</Title>
        <Text>{t('cobros:empty.body')}</Text>
        <Button
          mode="contained"
          onPress={() => router.push('/(app)/ruta')}
          accessibilityLabel={t('cobros:empty.goRoute')}
          testID="driver-cobros-go-ruta"
        >
          {t('cobros:empty.goRoute')}
        </Button>
      </View>
    )
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <View style={styles.centered} testID="driver-cobros-loading" accessibilityLabel={t('common:loading')}>
        <ActivityIndicator />
      </View>
    )
  }

  if (status === 'offline' || status === 'error' || status === 'forbidden') {
    const messageKey =
      status === 'offline' ? 'offline' : status === 'forbidden' ? 'forbidden' : 'loadError'
    return (
      <View style={styles.centered} testID="driver-cobros-error">
        <Text>{t(`cobros:${messageKey}`)}</Text>
        <Button mode="contained" onPress={() => void load()} accessibilityLabel={t('common:retry')}>
          {t('common:retry')}
        </Button>
      </View>
    )
  }

  const stop = reparto?.items.find((item) => item.ordenEntrega.clienteId === clienteId)
  if (!stop) {
    return (
      <View style={styles.centered} testID="driver-cobros-not-found">
        <Text>{t('cobros:notFound')}</Text>
        <Button
          mode="contained"
          onPress={() => router.push('/(app)/ruta')}
          accessibilityLabel={t('cobros:empty.goRoute')}
        >
          {t('cobros:empty.goRoute')}
        </Button>
      </View>
    )
  }

  return <CobroForm clienteId={clienteId} onQueued={refreshMeta} />
}

function CobroForm({ clienteId, onQueued }: { clienteId: number; onQueued: () => Promise<void> }) {
  const { t } = useTranslation(['cobros', 'common'])
  const { reparto, load } = useRuta()
  const stop = reparto?.items.find((item) => item.ordenEntrega.clienteId === clienteId)
  const cliente = stop?.ordenEntrega.cliente
  const facturas = cliente?.deuda?.facturasPendientes ?? []
  const saldo = parseMoney(cliente?.deuda?.saldo ?? cliente?.balance)

  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set(facturas.map((f) => f.facturaId)))
  const [montoText, setMontoText] = useState(() => formatMoney(sumSelectedPendiente(facturas, selectedIds)))
  const [formas, setFormas] = useState<FormaPagoDTO[]>([])
  const [formaPagoId, setFormaPagoId] = useState<number | null>(null)
  const [transferInfo, setTransferInfo] = useState<CobroTransferInfo | null>(null)
  const [referencia, setReferencia] = useState('')
  const [nota, setNota] = useState('')
  const [chequeBanco, setChequeBanco] = useState('')
  const [chequeNumero, setChequeNumero] = useState('')
  const [chequeVencimiento, setChequeVencimiento] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [overSaldoOpen, setOverSaldoOpen] = useState(false)
  const [successNumero, setSuccessNumero] = useState<number | null>(null)
  const [receiptText, setReceiptText] = useState('')

  const selectedForma = findFormaPago(formas, formaPagoId)
  const chequeMode = selectedForma ? isChequeForma(selectedForma) : false
  const transferMode = selectedForma ? isTransferForma(selectedForma) : false
  const monto = parseMoney(montoText)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const online = await isOnline()
      if (online) {
        const rows = await driverFormasPagoApi.list()
        if (!cancelled && rows) {
          setFormas(rows)
          setFormaPagoId((prev) => prev ?? pickDefaultFormaPagoId(rows))
        }
        const info = await driverCobrosApi.getTransferInfo()
        if (!cancelled) setTransferInfo(info)
        return
      }
      const db = await getOfflineDb()
      const rows = await loadFormasPagoCache(db)
      if (!cancelled) {
        setFormas(rows)
        setFormaPagoId((prev) => prev ?? pickDefaultFormaPagoId(rows))
        setTransferInfo(await loadTransferInfoCache(db))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const toggleFactura = useCallback(
    (facturaId: number) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(facturaId)) next.delete(facturaId)
        else next.add(facturaId)
        setMontoText(formatMoney(sumSelectedPendiente(facturas, next)))
        return next
      })
    },
    [facturas],
  )

  const buildChequeNuevo = useCallback((): ChequeInputDTO | null => {
    if (!chequeMode || !cliente) return null
    return {
      tipo: 'recibido',
      modalidad: 'fisico',
      numero: chequeNumero.trim(),
      banco: chequeBanco.trim(),
      libradorNombre: cliente.rsocial,
      monto,
      fechaEmision: todayYmd(),
      fechaVencimiento: chequeVencimiento.trim(),
      clienteId: cliente.id,
    }
  }, [chequeBanco, chequeMode, chequeNumero, chequeVencimiento, cliente, monto])

  const submitCobro = useCallback(
    async (overSaldoConfirmed: boolean) => {
      if (!cliente) return
      if (chequeMode && (!chequeBanco.trim() || !chequeNumero.trim() || !chequeVencimiento.trim())) {
        setFormError(t('cobros:cheque.required'))
        return
      }
      if (!canSubmitWithoutOverSaldoDialog(monto, saldo, overSaldoConfirmed)) {
        if (needsOverSaldoConfirm(monto, saldo)) {
          setOverSaldoOpen(true)
        }
        return
      }
      setSaving(true)
      setFormError(null)
      try {
        const body = {
          clienteId: cliente.id,
          fecha: todayYmd(),
          monto,
          formaPagoId,
          referencia: referencia.trim() || null,
          nota: nota.trim() || null,
          chequeNuevo: buildChequeNuevo(),
        }
        const online = await isOnline()
        if (!online) {
          await enqueueCobroCreate(body)
          await onQueued()
          setFormError(t('cobros:queued'))
          return
        }
        const result = await driverCobrosApi.create(body)
        const cobroId = result?.cobro.id ?? 0
        const formaLabel = selectedForma?.descripcion ?? ''
        const text = buildCobroReceiptText({
          template: t('cobros:whatsapp.template'),
          empresa: t('cobros:empresaName'),
          cliente: cliente.rsocial,
          fecha: todayYmd(),
          importe: formatMoney(monto),
          forma: formaLabel,
          numero: cobroId,
        })
        setReceiptText(text)
        setSuccessNumero(cobroId)
        await load()
      } catch (err) {
        const ui = mapApiErrorToUiState(err)
        setFormError(
          ui === 'offline' ? t('cobros:offline') : ui === 'forbidden' ? t('cobros:forbidden') : t('cobros:error'),
        )
      } finally {
        setSaving(false)
      }
    },
    [
      buildChequeNuevo,
      chequeBanco,
      chequeMode,
      chequeNumero,
      chequeVencimiento,
      cliente,
      formaPagoId,
      load,
      monto,
      nota,
      onQueued,
      referencia,
      saldo,
      selectedForma,
      t,
    ],
  )

  const onWhatsApp = useCallback(async () => {
    const url = buildCobroWaMeUrl(cliente?.telef, receiptText)
    if (!url) return
    await Linking.openURL(url)
  }, [cliente?.telef, receiptText])

  const onShare = useCallback(async () => {
    await Share.share({ message: receiptText })
  }, [receiptText])

  if (!cliente) return null

  if (successNumero != null) {
    const waUrl = buildCobroWaMeUrl(cliente.telef, receiptText)
    return (
      <ScrollView contentContainerStyle={styles.root} testID="driver-cobros-success">
        <Title>{t('cobros:success', { numero: successNumero })}</Title>
        <TextInput
          label={t('cobros:whatsapp.label')}
          value={receiptText}
          onChangeText={setReceiptText}
          multiline
          {...({
            testID: 'driver-cobros-whatsapp-text',
            accessibilityLabel: t('cobros:whatsapp.label'),
          } as object)}
        />
        {waUrl ? (
          <Button
            mode="contained"
            onPress={() => void onWhatsApp()}
            accessibilityLabel={t('cobros:whatsapp.send')}
            testID="driver-cobros-whatsapp"
          >
            {t('cobros:whatsapp.send')}
          </Button>
        ) : (
          <View testID="driver-cobros-whatsapp-no-phone">
            <Text>{t('cobros:whatsapp.noPhone')}</Text>
          </View>
        )}
        <Button
          mode="outlined"
          onPress={() => void onShare()}
          accessibilityLabel={t('cobros:whatsapp.share')}
          testID="driver-cobros-share"
        >
          {t('cobros:whatsapp.share')}
        </Button>
      </ScrollView>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.root} testID="driver-cobros-form" keyboardShouldPersistTaps="handled">
        <View testID="driver-cobros-cliente" accessibilityRole="header" accessibilityLabel={t('cobros:headerCliente')}>
          <Title>{cliente.rsocial}</Title>
          <View testID="driver-cobros-saldo">
            <Text>{t('cobros:saldo', { saldo: formatMoney(saldo) })}</Text>
          </View>
        </View>

        <Text variant="titleMedium">{t('cobros:invoices')}</Text>
        {facturas.length === 0 ? (
          <Text>{t('cobros:noInvoices')}</Text>
        ) : (
          facturas.map((factura) => (
            <Checkbox.Item
              key={factura.facturaId}
              label={t('cobros:invoiceLabel', { ref: factura.facturaRef, pendiente: factura.pendiente })}
              status={selectedIds.has(factura.facturaId) ? 'checked' : 'unchecked'}
              onPress={() => toggleFactura(factura.facturaId)}
              accessibilityLabel={t('cobros:invoiceLabel', {
                ref: factura.facturaRef,
                pendiente: factura.pendiente,
              })}
              testID={`driver-cobros-factura-${factura.facturaId}`}
            />
          ))
        )}

        <TextInput
          label={t('cobros:amount')}
          value={montoText}
          onChangeText={setMontoText}
          {...({
            keyboardType: 'decimal-pad',
            testID: 'driver-cobros-monto',
            accessibilityLabel: t('cobros:amount'),
          } as object)}
        />

        <Text variant="titleMedium">{t('cobros:forma')}</Text>
        <RadioButton.Group
          onValueChange={(value) => setFormaPagoId(Number.parseInt(value, 10))}
          value={formaPagoId != null ? String(formaPagoId) : ''}
        >
          {formas.map((fp) => (
            <RadioButton.Item
              key={fp.id}
              label={fp.descripcion}
              value={String(fp.id)}
              accessibilityLabel={fp.descripcion}
              testID={`driver-cobros-forma-${fp.id}`}
            />
          ))}
        </RadioButton.Group>

        {transferMode ? (
          <View testID="driver-cobros-transfer">
            <Text variant="titleMedium">{t('cobros:transfer.title')}</Text>
            {transferInfo ? (
              <View testID="driver-cobros-transfer-info">
                <Text>{t('cobros:transfer.banco', { banco: transferInfo.banco })}</Text>
                <Text>{t('cobros:transfer.cbu', { cbu: transferInfo.cbu })}</Text>
                {transferInfo.alias ? (
                  <Text>{t('cobros:transfer.alias', { alias: transferInfo.alias })}</Text>
                ) : null}
              </View>
            ) : (
              <View testID="driver-cobros-transfer-missing">
                <Text>{t('cobros:transfer.missing')}</Text>
              </View>
            )}
            <TextInput
              label={t('cobros:referencia')}
              value={referencia}
              onChangeText={setReferencia}
              {...({
                testID: 'driver-cobros-referencia',
                accessibilityLabel: t('cobros:referencia'),
              } as object)}
            />
          </View>
        ) : null}

        {chequeMode ? (
          <View testID="driver-cobros-cheque">
            <TextInput
              label={t('cobros:cheque.banco')}
              value={chequeBanco}
              onChangeText={setChequeBanco}
              {...({
                testID: 'driver-cobros-cheque-banco',
                accessibilityLabel: t('cobros:cheque.banco'),
              } as object)}
            />
            <TextInput
              label={t('cobros:cheque.numero')}
              value={chequeNumero}
              onChangeText={setChequeNumero}
              {...({
                testID: 'driver-cobros-cheque-numero',
                accessibilityLabel: t('cobros:cheque.numero'),
              } as object)}
            />
            <TextInput
              label={t('cobros:cheque.vencimiento')}
              value={chequeVencimiento}
              onChangeText={setChequeVencimiento}
              {...({
                placeholder: 'YYYY-MM-DD',
                testID: 'driver-cobros-cheque-vencimiento',
                accessibilityLabel: t('cobros:cheque.vencimiento'),
              } as object)}
            />
          </View>
        ) : null}

        <TextInput
          label={t('cobros:nota')}
          value={nota}
          onChangeText={setNota}
          multiline
          {...({
            testID: 'driver-cobros-nota',
            accessibilityLabel: t('cobros:nota'),
          } as object)}
        />

        {formError ? (
          <View testID="driver-cobros-form-error" accessibilityLiveRegion="polite">
            <HelperText type="error" visible>
              {formError}
            </HelperText>
          </View>
        ) : null}

        <Button
          mode="contained"
          onPress={() => void submitCobro(false)}
          loading={saving}
          disabled={saving || monto <= 0}
          accessibilityLabel={t('cobros:submit')}
          testID="driver-cobros-submit"
        >
          {saving ? t('cobros:submitting') : t('cobros:submit')}
        </Button>
      </ScrollView>

      <Portal>
        <Dialog
          visible={overSaldoOpen}
          onDismiss={() => setOverSaldoOpen(false)}
          testID="driver-cobros-over-saldo-dialog"
        >
          <Dialog.Title>{t('cobros:overSaldo.title')}</Dialog.Title>
          <Dialog.Content>
            <Text>
              {t('cobros:overSaldo.body', { monto: formatMoney(monto), saldo: formatMoney(saldo) })}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOverSaldoOpen(false)} accessibilityLabel={t('common:cancel')}>
              {t('common:cancel')}
            </Button>
            <Button
              onPress={() => {
                setOverSaldoOpen(false)
                void submitCobro(true)
              }}
              accessibilityLabel={t('cobros:overSaldo.confirm')}
              testID="driver-cobros-confirm-over"
            >
              {t('cobros:overSaldo.confirm')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flexGrow: 1, padding: 16, gap: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
})
