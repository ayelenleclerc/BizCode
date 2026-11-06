import { describe, expect, it } from 'vitest'
import { Prisma } from '@prisma/client'
import {
  isPrismaUniqueViolation,
  isProcessedPaymentComplete,
  MP_PROCESSED_ESTADO_PROCESSING,
} from '../../../apps/server/services/mercadoPagoPaymentIdempotency'

describe('mercadoPagoPaymentIdempotency helpers (#446)', () => {
  it('detects Prisma unique violations', () => {
    const err = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    })
    expect(isPrismaUniqueViolation(err)).toBe(true)
    expect(isPrismaUniqueViolation(new Error('other'))).toBe(false)
  })

  it('treats processing as incomplete and other estados as complete', () => {
    expect(
      isProcessedPaymentComplete({ estado: MP_PROCESSED_ESTADO_PROCESSING, reciboCobroId: null }),
    ).toBe(false)
    expect(isProcessedPaymentComplete({ estado: 'approved', reciboCobroId: 1 })).toBe(true)
    expect(isProcessedPaymentComplete({ estado: 'approved', reciboCobroId: null })).toBe(true)
    expect(isProcessedPaymentComplete({ estado: 'rejected', reciboCobroId: null })).toBe(true)
  })
})
