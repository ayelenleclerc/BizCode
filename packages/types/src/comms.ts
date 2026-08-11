export type AppNotification = {
  id: number
  tenantId: number
  userId: number
  type: string
  payload: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

/** @deprecated Use AppNotification — alias for issue #155 naming */
export type Notification = AppNotification

export type ChatConversation = {
  user: {
    id: number
    username: string
    role: string
  }
  unreadCount: number
  lastMessage: {
    id: number
    fromUserId: number
    toUserId: number
    preview: string
    createdAt: string
  } | null
}

export type ChatMessageDTO = {
  id: number
  tenantId: number
  fromUserId: number
  toUserId: number
  content: string
  createdAt: string
}

/** @deprecated Use ChatMessageDTO — alias for issue #155 naming */
export type ChatMessage = ChatMessageDTO

export type AuditEventDTO = {
  id: number
  tenantId: number
  userId: number | null
  username: string | null
  action: string
  resource: string
  resourceId: string | null
  ipAddress: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

/** @deprecated Use AuditEventDTO — alias for issue #155 naming */
export type AuditEvent = AuditEventDTO

export type AuditEventsListParams = {
  userId?: number
  action?: string
  resource?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export type AuditEventListResult = {
  data: AuditEventDTO[]
  total: number
  limit: number
  offset: number
}

/** @en Registered Expo/device push token (#172). */
export type DevicePushTokenDTO = {
  token: string
  platform: string | null
}

/** @en User mute preferences for mobile push (#172). */
export type PushPreferencesDTO = {
  mutedTypes: string[]
  muteableTypes: string[]
}
