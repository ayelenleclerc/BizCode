import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { chatAPI, type ChatConversation, type ChatMessageDTO } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const POLL_MS = 15_000

export default function ChatPage() {
  const { t } = useTranslation('chat')
  const { claims } = useAuth()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessageDTO[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedConversation = useMemo(
    () => conversations.find((entry) => entry.user.id === selectedUserId) ?? null,
    [conversations, selectedUserId],
  )

  useEffect(() => {
    let cancelled = false
    const pullConversations = () => {
      chatAPI
        .conversations()
        .then((data) => {
          if (cancelled) return
          setConversations(data)
          if (selectedUserId === null && data.length > 0) {
            setSelectedUserId(data[0].user.id)
          }
        })
        .catch((err) => {
          if (cancelled) return
          setError(err instanceof Error ? err.message : t('errors.loadConversations'))
        })
    }
    pullConversations()
    const interval = setInterval(pullConversations, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [selectedUserId, t])

  useEffect(() => {
    if (selectedUserId === null) return
    let cancelled = false
    setLoading(true)
    setError(null)
    chatAPI
      .messages(selectedUserId)
      .then((data) => {
        if (!cancelled) setMessages(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('errors.loadMessages'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedUserId, t])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (selectedUserId === null || content.trim().length === 0) return
    setSending(true)
    setError(null)
    try {
      const created = await chatAPI.send(selectedUserId, content.trim())
      setMessages((prev) => [...prev, created])
      setContent('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('errors.send'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-8 h-full flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[32rem]">
        <section className="border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 overflow-auto">
          <h2 className="px-4 py-3 text-sm font-semibold border-b border-slate-200 dark:border-slate-700">
            {t('conversations')}
          </h2>
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400">{t('emptyConversations')}</p>
          ) : (
            <ul>
              {conversations.map((entry) => (
                <li key={entry.user.id}>
                  <button
                    type="button"
                    data-testid={`chat-conversation-${entry.user.id}`}
                    onClick={() => setSelectedUserId(entry.user.id)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 ${
                      selectedUserId === entry.user.id ? 'bg-slate-100 dark:bg-slate-700' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{entry.user.username}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {entry.lastMessage?.preview ?? t('noMessages')}
                    </p>
                    {entry.unreadCount > 0 && (
                      <span className="inline-flex mt-1 px-2 py-0.5 text-[10px] rounded-full bg-blue-600 text-white">
                        {t('unread', { count: entry.unreadCount })}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 flex flex-col">
          <header className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-semibold">
              {selectedConversation ? t('withUser', { username: selectedConversation.user.username }) : t('selectConversation')}
            </h2>
          </header>

          <div className="flex-1 overflow-auto p-4 space-y-2" data-testid="chat-message-list">
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('loading')}</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('emptyMessages')}</p>
            ) : (
              messages.map((message) => {
                const mine = claims != null && message.fromUserId === claims.userId
                return (
                  <div
                    key={message.id}
                    className={`max-w-[80%] px-3 py-2 rounded text-sm ${
                      mine
                        ? 'ml-auto bg-blue-600 text-white'
                        : 'mr-auto bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-[10px] mt-1 ${mine ? 'text-blue-100' : 'text-slate-500 dark:text-slate-300'}`}>
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                )
              })
            )}
          </div>

          <form onSubmit={onSubmit} className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input
              data-testid="chat-message-input"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={t('messagePlaceholder')}
              className="flex-1 px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              disabled={selectedUserId === null || sending}
            />
            <button
              type="submit"
              data-testid="chat-send-button"
              disabled={selectedUserId === null || content.trim().length === 0 || sending}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white"
            >
              {sending ? t('sending') : t('send')}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

