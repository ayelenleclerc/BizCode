import { useCallback, useEffect, useState } from 'react'
import { Linking, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Banner, Button, Text } from 'react-native-paper'
import {
  buildPedidoWhatsAppShare,
  type PedidoWhatsAppItem,
  type SellerPolicies,
  type WhatsAppSharePreview,
} from '@bizcode/types'
import { pedidosAPI } from '../api/sellerApi'

type OfflineSnapshot = {
  telef?: string | null
  items: PedidoWhatsAppItem[]
  total: number
  empresa?: string
  template?: string | null
}

type Props = {
  pedidoId: number
  locale: string
  snapshot?: OfflineSnapshot | null
  policies?: SellerPolicies | null
}

/**
 * @en WhatsApp confirmation CTA after Seller order confirm (#265). Link (wa.me) or Twilio.
 * @es CTA WhatsApp tras confirmar pedido Seller (#265). Link (wa.me) o Twilio.
 * @pt-BR CTA WhatsApp após confirmar pedido Seller (#265). Link (wa.me) ou Twilio.
 */
export function PedidoWhatsAppButton({ pedidoId, locale, snapshot, policies }: Props) {
  const { t } = useTranslation(['pedidos', 'common'])
  const pending = pedidoId < 0
  const [preview, setPreview] = useState<WhatsAppSharePreview | null>(null)
  const [loading, setLoading] = useState(!pending)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (pending) {
      const local = buildPedidoWhatsAppShare({
        numero: pedidoId,
        fecha: new Date(),
        total: snapshot?.total ?? 0,
        empresa: snapshot?.empresa ?? '',
        items: snapshot?.items ?? [],
        telef: snapshot?.telef,
        template: snapshot?.template ?? policies?.sellerWhatsappTemplate,
        locale,
        twilioAvailable: false,
      })
      setPreview(local)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    void pedidosAPI
      .getWhatsAppShare(pedidoId, locale)
      .then((data) => {
        if (!cancelled) setPreview(data)
      })
      .catch(() => {
        if (!cancelled) setPreview(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [pedidoId, pending, locale, snapshot, policies?.sellerWhatsappTemplate])

  const noPhone = !preview?.phone
  const disabled = loading || noPhone || sending

  const onPress = useCallback(async () => {
    if (!preview || noPhone || sending) return
    setError(null)
    if (pending || !preview.twilioAvailable) {
      if (!preview.waMeUrl) return
      try {
        await Linking.openURL(preview.waMeUrl)
        if (!pending) {
          await pedidosAPI.sendWhatsApp(pedidoId, { canal: 'link' }, locale).catch(() => undefined)
        }
      } catch {
        setError(t('pedidos:whatsapp.twilioError'))
      }
      return
    }
    setSending(true)
    try {
      await pedidosAPI.sendWhatsApp(pedidoId, { canal: 'twilio' }, locale)
    } catch {
      setError(t('pedidos:whatsapp.twilioError'))
    } finally {
      setSending(false)
    }
  }, [preview, noPhone, sending, pending, pedidoId, locale, t])

  return (
    <View>
      {error ? (
        <Banner visible icon="alert" testID="seller-pedido-whatsapp-error">
          {error}
        </Banner>
      ) : null}
      <Button
        mode="contained"
        onPress={() => void onPress()}
        disabled={disabled}
        loading={sending}
        accessibilityLabel={t('pedidos:whatsapp.send')}
        accessibilityHint={noPhone ? t('pedidos:whatsapp.noPhone') : undefined}
        {...({
          testID: noPhone ? 'seller-pedido-whatsapp-disabled' : 'seller-pedido-whatsapp',
        } as object)}
      >
        {sending ? t('pedidos:whatsapp.sending') : t('pedidos:whatsapp.send')}
      </Button>
      {noPhone && !loading ? (
        <Text {...({ testID: 'seller-pedido-whatsapp-no-phone' } as object)}>
          {t('pedidos:whatsapp.noPhone')}
        </Text>
      ) : null}
    </View>
  )
}
