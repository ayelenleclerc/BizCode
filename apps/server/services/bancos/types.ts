/**
 * @en Normalized parsed bank movement before persistence (#190).
 * @es Movimiento bancario normalizado antes de persistir (#190).
 * @pt-BR Movimento bancário normalizado antes de persistir (#190).
 */
export type ParsedMovimiento = {
  fecha: Date
  descripcion: string
  importe: string
  tipo: 'debito' | 'credito'
  saldo: string | null
  referencia: string | null
}
