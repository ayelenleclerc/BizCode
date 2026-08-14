import { useCallback, useState } from 'react'
import type { ArticuloListItem } from '@bizcode/api-client'
import { voiceAPI } from '../api/sellerApi'
import { filterSellableArticulos } from '../catalog/filterSellable'
import { isOnline } from '../offline/network'
import { applySpokenUnitConversion } from './applySpokenUnitConversion'
import { parseSpokenOrder, type SpokenLocale } from './parseSpokenOrder'
import { rankArticuloMatches } from './rankArticuloMatches'
import { recordAudioClip, requestMicPermission, transcribeOnDevice, type MicPermission } from './speechCapture'

export type VoiceDraftLine = {
  key: string
  phrase: string
  qty: number
  matches: ArticuloListItem[]
  selectedId: number | null
}

export type VoiceUiState = 'idle' | 'recording' | 'matching' | 'confirm' | 'empty' | 'error' | 'denied'

/**
 * @en Hybrid speech-to-order: Whisper when online, on-device STT otherwise (#266).
 * @es Pedido por voz híbrido: Whisper online, STT on-device si no (#266).
 * @pt-BR Pedido por voz híbrido: Whisper online, STT on-device senão (#266).
 */
export function useVoiceOrder(params: {
  locale: SpokenLocale
  loadCatalog: () => Promise<ArticuloListItem[]>
}) {
  const [permission, setPermission] = useState<MicPermission>('unavailable')
  const [state, setState] = useState<VoiceUiState>('idle')
  const [drafts, setDrafts] = useState<VoiceDraftLine[]>([])

  const ensurePermission = useCallback(async (): Promise<MicPermission> => {
    const next = await requestMicPermission()
    setPermission(next)
    return next
  }, [])

  const capture = useCallback(async () => {
    const perm = await ensurePermission()
    if (perm === 'denied' || perm === 'unavailable') {
      setState('denied')
      return
    }
    setState('recording')
    let text = ''
    try {
      const online = await isOnline()
      if (online) {
        try {
          const clip = await recordAudioClip()
          if (clip) {
            text = await voiceAPI.transcribe(clip, params.locale)
          }
        } catch {
          text = ''
        }
      }
      if (!text.trim()) {
        text = await transcribeOnDevice(params.locale)
      }
    } catch {
      setState('error')
      return
    }
    setState('matching')
    const lines = parseSpokenOrder(text, params.locale)
    if (lines.length === 0) {
      setDrafts([])
      setState('empty')
      return
    }
    let catalog: ArticuloListItem[] = []
    try {
      catalog = filterSellableArticulos(await params.loadCatalog())
    } catch {
      catalog = []
    }
    const next: VoiceDraftLine[] = lines.map((line, index) => {
      const ranked = rankArticuloMatches(line.phrase, catalog)
      const selected = ranked[0]?.item
      const qty = selected
        ? applySpokenUnitConversion(line.qty, line.unitHint, {
            unidadBase: selected.unidadBase,
            factorConversion: selected.factorConversion as number | undefined,
          })
        : line.qty
      return {
        key: `${index}-${line.phrase}`,
        phrase: line.phrase,
        qty,
        matches: ranked.map((r) => r.item),
        selectedId: selected?.id ?? null,
      }
    })
    setDrafts(next)
    setState('confirm')
  }, [ensurePermission, params.locale, params.loadCatalog])

  const selectMatch = useCallback((key: string, articuloId: number) => {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, selectedId: articuloId } : d)))
  }, [])

  const discard = useCallback((key: string) => {
    setDrafts((prev) => prev.filter((d) => d.key !== key))
  }, [])

  const setQty = useCallback((key: string, qty: number) => {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, qty } : d)))
  }, [])

  const close = useCallback(() => {
    setDrafts([])
    setState('idle')
  }, [])

  return {
    permission,
    state,
    drafts,
    ensurePermission,
    capture,
    selectMatch,
    discard,
    setQty,
    close,
  }
}
