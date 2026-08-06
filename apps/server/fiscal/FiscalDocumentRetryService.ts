/**
 * @en Retries fiscal authorization for invoices stuck in `estadoCae = 'pending'`,
 *   generalizing `ArcaService.retryPending` through `FiscalDocumentService` so every
 *   attempt is also recorded on the corresponding `FiscalDocument` row (#378).
 * @es Reintenta la autorización fiscal de facturas en `estadoCae = 'pending'`,
 *   generalizando `ArcaService.retryPending` a través de `FiscalDocumentService` para
 *   que cada intento también quede registrado en la fila `FiscalDocument` correspondiente (#378).
 * @pt-BR Reprocessa a autorização fiscal de faturas em `estadoCae = 'pending'`,
 *   generalizando `ArcaService.retryPending` através de `FiscalDocumentService` para
 *   que cada tentativa também seja registrada na linha `FiscalDocument` correspondente (#378).
 */

import type { PrismaClient } from '@prisma/client'
import { FiscalDocumentService } from './FiscalDocumentService'

export type FiscalRetryPendingSummary = {
  processed: number
  issued: number
  failed: number
}

const PENDING_BATCH_SIZE = 50

export class FiscalDocumentRetryService {
  private readonly fiscalDocumentService: FiscalDocumentService

  constructor(private readonly prisma: PrismaClient) {
    this.fiscalDocumentService = new FiscalDocumentService(prisma)
  }

  async retryPending(tenantId: number): Promise<FiscalRetryPendingSummary> {
    const pendingFacturas = await this.prisma.factura.findMany({
      where: { tenantId, estadoCae: 'pending' },
      select: { id: true },
      take: PENDING_BATCH_SIZE,
    })
    let issued = 0
    let failed = 0
    for (const factura of pendingFacturas) {
      const result = await this.fiscalDocumentService.authorizeInvoice(tenantId, factura.id)
      if (result.ok) issued += 1
      else failed += 1
    }
    return { processed: pendingFacturas.length, issued, failed }
  }
}
