import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from './serviceResults'
import {
  ClienteCuentaCorrienteService,
  type ClienteCuentaCorrienteFilters,
} from './ClienteCuentaCorrienteService'
import { buildEstadoCuentaClientePdfBuffer } from '../finance/estadoCuentaClientePdf'

/**
 * @en Customer ledger wrapper scoped to portal clienteId (#240).
 * @es Envoltorio de cuenta corriente acotado al cliente del portal (#240).
 * @pt-BR Wrapper de conta corrente limitado ao cliente do portal (#240).
 */
export class PortalCuentaCorrienteService {
  private readonly cc: ClienteCuentaCorrienteService

  constructor(prisma: PrismaClient) {
    this.cc = new ClienteCuentaCorrienteService(prisma)
  }

  async getCuentaCorriente(
    tenantId: number,
    portalClienteId: number,
    filters: ClienteCuentaCorrienteFilters,
  ) {
    return this.cc.getStatement(tenantId, portalClienteId, filters)
  }

  async getEstadoCuentaPdf(
    tenantId: number,
    portalClienteId: number,
    from?: Date,
    to?: Date,
  ): Promise<ServiceResult<Buffer>> {
    const data = await this.cc.getEstadoCuentaPdfData(tenantId, portalClienteId, from, to)
    if (!data) {
      return { ok: false, status: 404, error: 'Cliente not found' }
    }
    const buffer = await buildEstadoCuentaClientePdfBuffer(data)
    return { ok: true, data: buffer }
  }
}
