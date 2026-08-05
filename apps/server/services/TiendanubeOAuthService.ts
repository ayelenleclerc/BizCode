import type { PrismaClient } from '@prisma/client'
import {
  buildTiendanubeAuthorizeUrl,
  exchangeTiendanubeAuthorizationCode,
  fetchTiendanubeStore,
  resolveTiendanubeAppCredentials,
  TiendanubeApiError,
} from '../integrations/tiendanube/tiendanubeOAuthClient'
import { ensureTiendanubeOrderPaidWebhook } from '../integrations/tiendanube/tiendanubeApiClient'
import {
  signTiendanubeOAuthState,
  verifyTiendanubeOAuthState,
} from '../integrations/tiendanube/tiendanubeOAuthState'
import { resolvePortalPublicBaseUrl } from '../portal/portalTokens'
import { resolveTiendanubeNotificationUrl } from '../lib/publicUrls'
import { TiendanubeConfigService } from './TiendanubeConfigService'
import type { ServiceResult } from './serviceResults'

/**
 * @en Tiendanube OAuth flow orchestration (#187).
 * @es Orquestación del flujo OAuth Tiendanube (#187).
 * @pt-BR Orquestração do fluxo OAuth Tiendanube (#187).
 */
export class TiendanubeOAuthService {
  private readonly config: TiendanubeConfigService

  constructor(prisma: PrismaClient) {
    this.config = new TiendanubeConfigService(prisma)
  }

  buildAuthorizeUrl(tenantId: number, userId: number): ServiceResult<{ authorizationUrl: string }> {
    try {
      const credentials = resolveTiendanubeAppCredentials()
      const state = signTiendanubeOAuthState(tenantId, userId)
      return {
        ok: true,
        data: {
          authorizationUrl: buildTiendanubeAuthorizeUrl(credentials.clientId, state),
        },
      }
    } catch (err: unknown) {
      if (err instanceof TiendanubeApiError) {
        return { ok: false, status: err.status, error: err.message }
      }
      return { ok: false, status: 500, error: 'Failed to build Tiendanube authorize URL' }
    }
  }

  async handleCallback(code: string, state: string): Promise<ServiceResult<{ redirectUrl: string }>> {
    const payload = verifyTiendanubeOAuthState(state)
    if (!payload) {
      return { ok: false, status: 400, error: 'Invalid or expired OAuth state' }
    }

    try {
      const credentials = resolveTiendanubeAppCredentials()
      const tokens = await exchangeTiendanubeAuthorizationCode(credentials, code)
      const storeId = String(tokens.user_id)
      let storeName: string | null = null
      let storeUrl: string | null = null
      try {
        const store = await fetchTiendanubeStore(storeId, tokens.access_token)
        if (store.name?.trim()) storeName = store.name.trim().slice(0, 120)
        const url = store.url_with_protocol?.trim() || store.original_domain?.trim()
        if (url) storeUrl = url.slice(0, 255)
      } catch {
        // Profile enrichment is best-effort.
      }

      await this.config.upsertTokens(payload.tenantId, {
        storeId,
        accessToken: tokens.access_token,
        storeName,
        storeUrl,
      })

      try {
        await ensureTiendanubeOrderPaidWebhook(
          storeId,
          tokens.access_token,
          resolveTiendanubeNotificationUrl(),
        )
      } catch (err: unknown) {
        console.warn(
          '[tiendanube-oauth] webhook_register_failed',
          err instanceof Error ? err.message : err,
        )
      }

      const redirectUrl = `${resolvePortalPublicBaseUrl()}/configuracion?tiendanube=connected`
      return { ok: true, data: { redirectUrl } }
    } catch (err: unknown) {
      if (err instanceof TiendanubeApiError) {
        return { ok: false, status: err.status >= 500 ? 502 : 422, error: err.message }
      }
      return { ok: false, status: 500, error: 'Failed to complete Tiendanube OAuth' }
    }
  }

  async disconnect(tenantId: number): Promise<ServiceResult<{ disconnected: true }>> {
    const tokens = await this.config.getDecryptedToken(tenantId)
    if (!tokens.ok) {
      return { ok: false, status: tokens.status, error: tokens.error }
    }
    // No public revoke endpoint evidenced in TN docs used for #187 — delete local credentials.
    await this.config.deleteConfig(tenantId)
    return { ok: true, data: { disconnected: true } }
  }
}
