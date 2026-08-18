import { createCobrosAPI, createFormasPagoAPI, createRepartosAPI } from '@bizcode/api-client'
import { driverHttp } from './http'

/**
 * @en Repartos API bound to App Driver Bearer HTTP (#160).
 * @es API de repartos ligada al HTTP Bearer de App Driver (#160).
 * @pt-BR API de repartos ligada ao HTTP Bearer do App Driver (#160).
 */
export const driverRepartosApi = createRepartosAPI(driverHttp)

/**
 * @en Collections API bound to App Driver Bearer HTTP (#162).
 * @es API de cobros ligada al HTTP Bearer de App Driver (#162).
 * @pt-BR API de cobranças ligada ao HTTP Bearer do App Driver (#162).
 */
export const driverCobrosApi = createCobrosAPI(driverHttp)

/**
 * @en Payment methods API bound to App Driver Bearer HTTP (#162).
 * @es API de formas de pago ligada al HTTP Bearer de App Driver (#162).
 * @pt-BR API de formas de pagamento ligada ao HTTP Bearer do App Driver (#162).
 */
export const driverFormasPagoApi = createFormasPagoAPI(driverHttp)
