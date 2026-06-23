/**
 * @en Resolves the system user id for automated jobs and webhooks (#176).
 * @es Resuelve el id de usuario sistema para jobs y webhooks automáticos (#176).
 * @pt-BR Resolve o id de usuário sistema para jobs e webhooks automáticos (#176).
 */
export function resolveSystemUserId(): number {
  const raw = process.env.BIZCODE_SYSTEM_USER_ID
  if (raw) {
    const id = Number.parseInt(raw, 10)
    if (Number.isInteger(id) && id > 0) {
      return id
    }
  }
  return 1
}
