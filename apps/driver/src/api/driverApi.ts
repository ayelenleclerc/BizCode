import { createRepartosAPI } from '@bizcode/api-client'
import { driverHttp } from './http'

/**
 * @en Repartos API bound to App Driver Bearer HTTP (#160).
 * @es API de repartos ligada al HTTP Bearer de App Driver (#160).
 * @pt-BR API de repartos ligada ao HTTP Bearer do App Driver (#160).
 */
export const driverRepartosApi = createRepartosAPI(driverHttp)
