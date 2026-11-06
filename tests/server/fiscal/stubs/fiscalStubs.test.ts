/**
 * @en `FiscalAdapterNotImplementedError` remains for future capability-only stubs (#378, ADR-0018).
 *   ARCA / Mexico SAT / Uruguay DGI / Chile SII are homologación mocks (#133/#210/#207/#208).
 * @es `FiscalAdapterNotImplementedError` permanece para stubs futuros (#378, ADR-0018).
 *   ARCA / SAT México / DGI Uruguay / SII Chile son mocks de homologación (#133/#210/#207/#208).
 * @pt-BR `FiscalAdapterNotImplementedError` permanece para stubs futuros (#378, ADR-0018).
 *   ARCA / SAT México / DGI Uruguai / SII Chile são mocks de homologação (#133/#210/#207/#208).
 */

import { describe, expect, it } from 'vitest'
import { FiscalAdapterNotImplementedError } from '../../../../apps/server/fiscal/stubs/FiscalAdapterNotImplementedError'

describe('FiscalAdapterNotImplementedError (#378)', () => {
  it('names the provider and operation in the message', () => {
    const err = new FiscalAdapterNotImplementedError('chile_sii', 'authorizeDocument')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('FiscalAdapterNotImplementedError')
    expect(err.message).toMatch(/chile_sii/)
    expect(err.message).toMatch(/authorizeDocument/)
  })
})
