/**
 * @en Thrown by capability-only stub adapters (Uruguay DGI, Mexico SAT/PAC) when a
 *   caller attempts a live operation that has no evidenced implementation (#378).
 * @es Lanzado por los adapters stub de capacidades (Uruguay DGI, México SAT/PAC) cuando
 *   se intenta una operación real sin implementación evidenciada (#378).
 * @pt-BR Lançado pelos adapters stub de capacidades (Uruguai DGI, México SAT/PAC) quando
 *   uma operação real é tentada sem implementação evidenciada (#378).
 */
export class FiscalAdapterNotImplementedError extends Error {
  constructor(provider: string, operation: string) {
    super(
      `Fiscal provider "${provider}" does not implement "${operation}" yet — Not evidenced in current codebase (capability stub only, #378).`,
    )
    this.name = 'FiscalAdapterNotImplementedError'
  }
}
