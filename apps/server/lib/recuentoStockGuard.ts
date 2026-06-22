import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../services/serviceResults'

/**
 * @en Blocks stock mutations while a physical inventory count is in progress.
 * @es Bloquea mutaciones de stock mientras hay un recuento físico en curso.
 * @pt-BR Bloqueia mutações de estoque enquanto houver contagem física em andamento.
 */
export async function assertNoOpenRecuento(
  prisma: PrismaClient,
  tenantId: number,
): Promise<ServiceResult<void>> {
  const open = await prisma.recuento.findFirst({
    where: { tenantId, estado: 'in_progress' },
    select: { id: true },
  })
  if (open) {
    return { ok: false, status: 422, error: 'RECUENTO_IN_PROGRESS' }
  }
  return { ok: true, data: undefined }
}
