/**
 * @en Orchestrates fiscal authorization (e.g. CAE) for invoices and credit notes across
 *   providers, persisting one auditable `FiscalDocument` row per attempt (#378, ADR-0018).
 *   Delegates the actual authorization call to the resolved `FiscalProviderAdapter`
 *   (ARCA today); never talks to AFIP/DGI/SAT directly.
 * @es Orquesta la autorización fiscal (ej. CAE) de facturas y notas de crédito entre
 *   proveedores, persistiendo una fila `FiscalDocument` auditable por intento (#378,
 *   ADR-0018). Delega la llamada real de autorización al `FiscalProviderAdapter`
 *   resuelto (ARCA hoy); nunca habla directo con AFIP/DGI/SAT.
 * @pt-BR Orquestra a autorização fiscal (ex. CAE) de faturas e notas de crédito entre
 *   provedores, persistindo uma linha `FiscalDocument` auditável por tentativa (#378,
 *   ADR-0018). Delega a chamada real de autorização ao `FiscalProviderAdapter`
 *   resolvido (ARCA hoje); nunca fala direto com AFIP/DGI/SAT.
 */

import type { FiscalDocument, Prisma, PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../services/serviceResults'
import { FiscalProviderConfigService } from './FiscalProviderConfigService'
import { getFiscalProviderAdapter } from './fiscalProviderRegistry'
import { bootstrapFiscalProviders } from './bootstrapFiscalProviders'
import type { FiscalDocumentType, FiscalProviderCode } from './types'

export type FiscalAuthorizationOutcome = {
  fiscalDocumentId: number
  status: string
  authorizationCode?: string
  authorizationExpiresAt?: Date
  provider: FiscalProviderCode
}

const RETRY_BACKOFF_MINUTES = 15

export class FiscalDocumentService {
  private readonly providerConfig: FiscalProviderConfigService

  constructor(private readonly prisma: PrismaClient) {
    bootstrapFiscalProviders()
    this.providerConfig = new FiscalProviderConfigService(prisma)
  }

  async authorizeInvoice(tenantId: number, facturaId: number): Promise<ServiceResult<FiscalAuthorizationOutcome>> {
    return this.authorize(tenantId, 'invoice', facturaId)
  }

  async authorizeCreditNote(
    tenantId: number,
    notaCreditoId: number,
  ): Promise<ServiceResult<FiscalAuthorizationOutcome>> {
    return this.authorize(tenantId, 'credit_note', notaCreditoId)
  }

  /**
   * @en Cancels a previously authorized fiscal document (Mexico SAT requires reasonCode) (#210).
   * @es Cancela un documento fiscal previamente autorizado (SAT México exige reasonCode) (#210).
   * @pt-BR Cancela um documento fiscal previamente autorizado (SAT México exige reasonCode) (#210).
   */
  async cancelDocument(
    tenantId: number,
    documentType: FiscalDocumentType,
    documentId: number,
    reasonCode?: string,
  ): Promise<ServiceResult<FiscalAuthorizationOutcome>> {
    const providerResult = await this.providerConfig.resolveDefaultProvider(tenantId)
    if (!providerResult.ok) return providerResult
    const provider = providerResult.data

    const adapter = getFiscalProviderAdapter(provider, this.prisma)
    if (!adapter) return { ok: false, status: 501, error: 'FISCAL_PROVIDER_ADAPTER_NOT_REGISTERED' }
    if (!adapter.cancel || !adapter.getCapabilities().supportsCancel) {
      return { ok: false, status: 501, error: 'FISCAL_CANCEL_NOT_SUPPORTED' }
    }

    const fiscalDocument = await this.prisma.fiscalDocument.findFirst({
      where: {
        tenantId,
        documentType,
        status: 'authorized',
        ...(documentType === 'invoice' ? { invoiceId: documentId } : { notaCreditoId: documentId }),
      },
      orderBy: { id: 'desc' },
    })
    if (!fiscalDocument) {
      return { ok: false, status: 404, error: 'FISCAL_DOCUMENT_NOT_AUTHORIZED' }
    }

    try {
      const result = await adapter.cancel(tenantId, documentType, documentId, { reasonCode })
      if (!result.ok) return result

      const updated = await this.prisma.fiscalDocument.update({
        where: { id: fiscalDocument.id },
        data: {
          status: 'cancelled',
          cancelReasonCode: reasonCode ?? null,
          cancelledAt: new Date(),
          errorCode: null,
          errorMessage: null,
          nextRetryAt: null,
        },
      })
      return { ok: true, data: toOutcome(updated, provider) }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, status: 502, error: message }
    }
  }

  private async authorize(
    tenantId: number,
    documentType: FiscalDocumentType,
    documentId: number,
  ): Promise<ServiceResult<FiscalAuthorizationOutcome>> {
    const providerResult = await this.providerConfig.resolveDefaultProvider(tenantId)
    if (!providerResult.ok) return providerResult
    const provider = providerResult.data

    const adapter = getFiscalProviderAdapter(provider, this.prisma)
    if (!adapter) return { ok: false, status: 501, error: 'FISCAL_PROVIDER_ADAPTER_NOT_REGISTERED' }

    const idempotencyKey = buildIdempotencyKey(provider, documentType, documentId)
    const existing = await this.prisma.fiscalDocument.findUnique({
      where: { tenantId_idempotencyKey: { tenantId, idempotencyKey } },
    })
    if (existing && existing.status === 'authorized') {
      return { ok: true, data: toOutcome(existing, provider) }
    }

    const fiscalDocument = await this.upsertAttempt(existing, {
      tenantId,
      provider,
      countryCode: adapter.countryCode,
      documentType,
      documentId,
      idempotencyKey,
    })

    try {
      const result = await adapter.authorizeDocument({
        tenantId,
        documentType,
        invoiceId: documentType === 'invoice' ? documentId : undefined,
        notaCreditoId: documentType === 'credit_note' ? documentId : undefined,
        idempotencyKey,
      })

      if (!result.ok) {
        await this.prisma.fiscalDocument.update({
          where: { id: fiscalDocument.id },
          data: {
            status: 'failed',
            errorCode: String(result.status),
            errorMessage: result.error,
            nextRetryAt: nextRetryAt(),
          },
        })
        return { ok: false, status: result.status, error: result.error }
      }

      const updated = await this.prisma.fiscalDocument.update({
        where: { id: fiscalDocument.id },
        data: {
          status: result.data.status,
          authorizationCode: result.data.authorizationCode,
          authorizationExpiresAt: result.data.authorizationExpiresAt,
          documentNumber: result.data.documentNumber,
          responsePayload: toJsonInput(result.data.raw),
          authorizedAt: result.data.status === 'authorized' ? new Date() : null,
          errorCode: null,
          errorMessage: null,
          nextRetryAt: result.data.status === 'authorized' ? null : nextRetryAt(),
        },
      })
      return { ok: true, data: toOutcome(updated, provider) }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      await this.prisma.fiscalDocument.update({
        where: { id: fiscalDocument.id },
        data: { status: 'failed', errorCode: 'ADAPTER_ERROR', errorMessage: message, nextRetryAt: nextRetryAt() },
      })
      return { ok: false, status: 502, error: message }
    }
  }

  private async upsertAttempt(
    existing: FiscalDocument | null,
    input: {
      tenantId: number
      provider: FiscalProviderCode
      countryCode: string
      documentType: FiscalDocumentType
      documentId: number
      idempotencyKey: string
    },
  ): Promise<FiscalDocument> {
    if (existing) {
      return this.prisma.fiscalDocument.update({
        where: { id: existing.id },
        data: { status: 'pending', attemptCount: existing.attemptCount + 1, lastAttemptAt: new Date() },
      })
    }
    return this.prisma.fiscalDocument.create({
      data: {
        tenantId: input.tenantId,
        invoiceId: input.documentType === 'invoice' ? input.documentId : undefined,
        notaCreditoId: input.documentType === 'credit_note' ? input.documentId : undefined,
        providerCode: input.provider,
        countryCode: input.countryCode,
        environment: 'homologacion',
        documentType: input.documentType,
        status: 'pending',
        idempotencyKey: input.idempotencyKey,
        attemptCount: 1,
        lastAttemptAt: new Date(),
      },
    })
  }
}

function buildIdempotencyKey(
  provider: FiscalProviderCode,
  documentType: FiscalDocumentType,
  documentId: number,
): string {
  const noun = documentType === 'invoice' ? 'factura' : 'nota_credito'
  return `${provider}:${noun}:${documentId}`
}

function toOutcome(doc: FiscalDocument, provider: FiscalProviderCode): FiscalAuthorizationOutcome {
  return {
    fiscalDocumentId: doc.id,
    status: doc.status,
    authorizationCode: doc.authorizationCode ?? undefined,
    authorizationExpiresAt: doc.authorizationExpiresAt ?? undefined,
    provider,
  }
}

function nextRetryAt(): Date {
  return new Date(Date.now() + RETRY_BACKOFF_MINUTES * 60 * 1000)
}

function toJsonInput(raw: unknown): Prisma.InputJsonValue | undefined {
  if (raw === undefined) return undefined
  return JSON.parse(JSON.stringify(raw)) as Prisma.InputJsonValue
}
