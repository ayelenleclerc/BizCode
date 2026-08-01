import type { PrismaClient } from '@prisma/client'
import {
  buildMeliAuthorizeUrl,
  exchangeMeliAuthorizationCode,
  fetchMeliUserMe,
  MeliApiError,
  refreshMeliAccessToken,
  resolveMeliAppCredentials,
  revokeMeliApplication,
} from '../integrations/meli/meliOAuthClient'
import { signMeliOAuthState, verifyMeliOAuthState } from '../integrations/meli/meliOAuthState'
import { resolvePortalPublicBaseUrl } from '../portal/portalTokens'
import { MeliConfigService } from './MeliConfigService'
import type { ServiceResult } from './serviceResults'

const REFRESH_SKEW_MS = 30 * 60 * 1000

/**
 * @en Mercado Libre OAuth flow and token refresh orchestration (#183).
 * @es Orquestación del flujo OAuth Mercado Libre y refresh de tokens (#183).
 * @pt-BR Orquestração do fluxo OAuth Mercado Livre e refresh de tokens (#183).
 */
export class MeliOAuthService {
  private readonly config: MeliConfigService

  constructor(private readonly prisma: PrismaClient) {
    this.config = new MeliConfigService(prisma)
  }

  buildAuthorizeUrl(tenantId: number, userId: number): ServiceResult<{ authorizationUrl: string }> {
    try {
      const credentials = resolveMeliAppCredentials()
      const state = signMeliOAuthState(tenantId, userId)
      return {
        ok: true,
        data: {
          authorizationUrl: buildMeliAuthorizeUrl(credentials.clientId, credentials.redirectUri, state),
        },
      }
    } catch (err: unknown) {
      if (err instanceof MeliApiError) {
        return { ok: false, status: err.status, error: err.message }
      }
      return { ok: false, status: 500, error: 'Failed to build Mercado Libre authorize URL' }
    }
  }

  async handleCallback(code: string, state: string): Promise<ServiceResult<{ redirectUrl: string }>> {
    const payload = verifyMeliOAuthState(state)
    if (!payload) {
      return { ok: false, status: 400, error: 'Invalid or expired OAuth state' }
    }

    try {
      const credentials = resolveMeliAppCredentials()
      const tokens = await exchangeMeliAuthorizationCode(credentials, code)
      let sitio = 'MLA'
      let nickname: string | null = null
      try {
        const me = await fetchMeliUserMe(tokens.access_token)
        if (me.site_id?.trim()) sitio = me.site_id.trim()
        if (me.nickname?.trim()) nickname = me.nickname.trim()
      } catch {
        // Profile enrichment is best-effort; tokens remain valid.
      }

      const meliUserId = String(tokens.user_id)
      await this.config.upsertTokens(payload.tenantId, {
        meliUserId,
        sellerId: meliUserId,
        sitio,
        nickname,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresInSeconds: tokens.expires_in,
      })

      const redirectUrl = `${resolvePortalPublicBaseUrl()}/configuracion?meli=connected`
      return { ok: true, data: { redirectUrl } }
    } catch (err: unknown) {
      if (err instanceof MeliApiError) {
        return { ok: false, status: err.status >= 500 ? 502 : 422, error: err.message }
      }
      return { ok: false, status: 500, error: 'Failed to complete Mercado Libre OAuth' }
    }
  }

  async disconnect(tenantId: number): Promise<ServiceResult<{ disconnected: true }>> {
    const tokens = await this.config.getDecryptedTokens(tenantId)
    if (!tokens.ok) {
      return { ok: false, status: tokens.status, error: tokens.error }
    }

    try {
      const credentials = resolveMeliAppCredentials()
      try {
        await revokeMeliApplication(tokens.data.accessToken, tokens.data.meliUserId, credentials.clientId)
      } catch (err: unknown) {
        console.warn(
          '[meli-oauth] revoke_failed',
          err instanceof Error ? err.message : 'unknown',
          'tenant',
          tenantId,
        )
      }
      await this.config.deleteConfig(tenantId)
      return { ok: true, data: { disconnected: true } }
    } catch (err: unknown) {
      await this.config.deleteConfig(tenantId)
      if (err instanceof MeliApiError) {
        return { ok: true, data: { disconnected: true } }
      }
      return { ok: true, data: { disconnected: true } }
    }
  }

  async refreshTenantIfNeeded(tenantId: number, force = false): Promise<{ refreshed: boolean; error?: string }> {
    const row = await this.prisma.meliConfig.findUnique({ where: { tenantId } })
    if (!row || !row.activo) {
      return { refreshed: false }
    }
    const needsRefresh = force || row.tokenExpiresAt.getTime() - Date.now() <= REFRESH_SKEW_MS
    if (!needsRefresh) {
      return { refreshed: false }
    }

    try {
      const credentials = resolveMeliAppCredentials()
      const decrypted = await this.config.getDecryptedTokens(tenantId)
      if (!decrypted.ok) {
        return { refreshed: false, error: 'missing_tokens' }
      }
      const tokens = await refreshMeliAccessToken(credentials, decrypted.data.refreshToken)
      await this.config.upsertTokens(tenantId, {
        meliUserId: String(tokens.user_id || row.meliUserId),
        sellerId: row.sellerId,
        sitio: row.sitio,
        nickname: row.nickname,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresInSeconds: tokens.expires_in,
      })
      return { refreshed: true }
    } catch (err: unknown) {
      return {
        refreshed: false,
        error: err instanceof Error ? err.message : 'refresh_failed',
      }
    }
  }

  async refreshExpiringTokens(): Promise<{
    scanned: number
    refreshed: number
    errors: number
  }> {
    const cutoff = new Date(Date.now() + REFRESH_SKEW_MS)
    const rows = await this.prisma.meliConfig.findMany({
      where: { activo: true, tokenExpiresAt: { lte: cutoff } },
      select: { tenantId: true },
    })
    let refreshed = 0
    let errors = 0
    for (const row of rows) {
      const result = await this.refreshTenantIfNeeded(row.tenantId, true)
      if (result.refreshed) refreshed += 1
      else if (result.error) errors += 1
    }
    return { scanned: rows.length, refreshed, errors }
  }
}
