/**
 * @en Session ack for credit alert dialogs (#256).
 * @es Ack de sesión para diálogos de alerta de crédito (#256).
 * @pt-BR Ack de sessão para diálogos de alerta de crédito (#256).
 */
const acked = new Set<number>()

export function isCreditAlertAcked(clienteId: number): boolean {
  return acked.has(clienteId)
}

export function ackCreditAlert(clienteId: number): void {
  if (Number.isInteger(clienteId) && clienteId > 0) {
    acked.add(clienteId)
  }
}

/** @en Test helper. @es Helper de test. @pt-BR Helper de teste. */
export function resetCreditAlertAcks(): void {
  acked.clear()
}
