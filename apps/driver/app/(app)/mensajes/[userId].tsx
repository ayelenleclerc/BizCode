import { createChatAPI } from '@bizcode/api-client'
import type { ChatMessageDTO } from '@bizcode/types'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Button, Text, TextInput } from 'react-native-paper'
import { driverHttp } from '../../../src/api/http'
import { mapApiErrorToUiState } from '../../../src/lib/apiErrors'

const chatApi = createChatAPI(driverHttp)
const POLL_MS = 8000

function errorMessageKey(err: unknown): string {
  const state = mapApiErrorToUiState(err)
  if (state === 'offline') return 'errorOffline'
  if (state === 'forbidden') return 'errorForbidden'
  if (state === 'not_found') return 'errorNotFound'
  return 'errorGeneric'
}

/**
 * @en Minimal chat thread for push deep links (#165).
 * @es Conversación mínima para deep links de push (#165).
 * @pt-BR Conversa mínima para deep links de push (#165).
 */
export default function MensajesThreadScreen() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { userId } = useLocalSearchParams<{ userId: string }>()
  const otherUserId = Number.parseInt(typeof userId === 'string' ? userId : '', 10)
  const [messages, setMessages] = useState<ChatMessageDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!Number.isFinite(otherUserId) || otherUserId < 1) {
      setError(t('errorNotFound'))
      setLoading(false)
      return
    }
    try {
      const rows = await chatApi.messages(otherUserId, { limit: 50 })
      setMessages(rows)
      setError(null)
    } catch (err) {
      setError(t(errorMessageKey(err)))
    } finally {
      setLoading(false)
    }
  }, [otherUserId, t])

  useEffect(() => {
    void load()
    const timer = setInterval(() => {
      void load()
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [load])

  const sorted = useMemo(
    () => [...messages].sort((a, b) => a.id - b.id),
    [messages],
  )

  const handleSend = async () => {
    const content = draft.trim()
    if (content.length === 0 || content.length > 1000 || !Number.isFinite(otherUserId)) return
    setSending(true)
    setError(null)
    try {
      const msg = await chatApi.send(otherUserId, content)
      setDraft('')
      setMessages((prev) => [...prev, msg])
    } catch (err) {
      setError(t(errorMessageKey(err)))
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered} accessibilityLabel={t('loading')}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="driver-chat-thread"
    >
      <View style={styles.header}>
        <Button mode="text" onPress={() => router.back()} accessibilityLabel={t('cancel')}>
          {t('cancel')}
        </Button>
        <Text variant="titleMedium">{t('chat.title', { userId: otherUserId })}</Text>
      </View>

      {error ? (
        <View accessibilityRole="alert" testID="driver-chat-error">
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={sorted}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.bubble} testID={`driver-chat-msg-${item.id}`}>
            <Text variant="bodyMedium">{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('chat.empty')}</Text>}
      />

      <View style={styles.composer}>
        <TextInput
          mode="outlined"
          value={draft}
          onChangeText={setDraft}
          placeholder={t('chat.placeholder')}
          style={styles.input}
          testID="driver-chat-input"
        />
        <Button
          mode="contained"
          disabled={sending || draft.trim().length === 0}
          onPress={() => void handleSend()}
          testID="driver-chat-send"
        >
          {t('chat.send')}
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  list: { flexGrow: 1, paddingBottom: 12, gap: 8 },
  bubble: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  composer: { gap: 8, paddingTop: 8 },
  input: { backgroundColor: 'transparent' },
  error: { color: '#b91c1c', marginBottom: 8 },
  empty: { opacity: 0.7, textAlign: 'center', marginTop: 24 },
})
