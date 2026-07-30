import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import {
  detectBruteForceLogins,
  processClassifiedAuditEvents,
  processForbiddenBursts,
  runSecurityMonitorTick,
} from '../../../apps/server/security/securityMonitor'
import {
  recordForbiddenResponse,
  resetForbiddenBurstCountersForTests,
} from '../../../apps/server/security/forbiddenBurstCounter'

vi.mock('../../../apps/server/security/securityAlertDispatch', () => ({
  dispatchSecurityAlert: vi.fn().mockResolvedValue(undefined),
}))

import { dispatchSecurityAlert } from '../../../apps/server/security/securityAlertDispatch'

describe('securityMonitor (#221)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetForbiddenBurstCountersForTests()
  })

  it('detects brute force from LoginAttempt and dispatches a critical alert', async () => {
    const failures = Array.from({ length: 5 }, (_, i) => ({
      tenantId: 3,
      username: 'attacker',
      ipAddress: '203.0.113.10',
      createdAt: new Date(),
      id: i + 1,
    }))
    const prisma = {
      loginAttempt: {
        findMany: vi.fn().mockResolvedValue(failures),
      },
      securityAlertDedupe: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({}),
      },
      auditEvent: {
        create: vi.fn().mockResolvedValue({ id: 1 }),
      },
    } as unknown as PrismaClient

    const fired = await detectBruteForceLogins(prisma)
    expect(fired).toBe(1)
    expect(dispatchSecurityAlert).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({
        securityEventType: 'brute_force_login',
        severity: 'critical',
        username: 'attacker',
        tenantId: 3,
      }),
    )
  })

  it('does not alert below brute-force threshold', async () => {
    const prisma = {
      loginAttempt: {
        findMany: vi.fn().mockResolvedValue([
          { tenantId: 3, username: 'u', ipAddress: '1.1.1.1', createdAt: new Date() },
          { tenantId: 3, username: 'u', ipAddress: '1.1.1.1', createdAt: new Date() },
        ]),
      },
      securityAlertDedupe: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      auditEvent: { create: vi.fn() },
    } as unknown as PrismaClient

    const fired = await detectBruteForceLogins(prisma)
    expect(fired).toBe(0)
    expect(dispatchSecurityAlert).not.toHaveBeenCalled()
  })

  it('flushes forbidden bursts into alerts', async () => {
    for (let i = 0; i < 10; i++) {
      recordForbiddenResponse('198.51.100.2')
    }
    const prisma = {
      securityAlertDedupe: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({}),
      },
      tenant: {
        findFirst: vi.fn().mockResolvedValue({ id: 11 }),
      },
      auditEvent: {
        create: vi.fn().mockResolvedValue({ id: 2 }),
      },
    } as unknown as PrismaClient

    const fired = await processForbiddenBursts(prisma)
    expect(fired).toBe(1)
    expect(dispatchSecurityAlert).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({
        securityEventType: 'forbidden_burst',
        ipAddress: '198.51.100.2',
      }),
    )
  })

  it('alerts on classified critical audit events and advances cursor', async () => {
    const prisma = {
      securityMonitorCursor: {
        findUnique: vi.fn().mockResolvedValue({ id: 'default', lastAuditEventId: 10 }),
        upsert: vi.fn().mockResolvedValue({}),
      },
      auditEvent: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 11,
            tenantId: 5,
            action: 'user_update',
            resource: 'user',
            resourceId: '9',
            ipAddress: '203.0.113.5',
            securityEventType: 'role_escalation',
            severity: 'critical',
            metadata: { role: 'owner' },
          },
        ]),
        create: vi.fn(),
      },
      securityAlertDedupe: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({}),
      },
      loginAttempt: { findMany: vi.fn().mockResolvedValue([]) },
      tenant: { findFirst: vi.fn().mockResolvedValue({ id: 11 }) },
    } as unknown as PrismaClient

    const fired = await processClassifiedAuditEvents(prisma)
    expect(fired).toBe(1)
    expect(prisma.securityMonitorCursor.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { lastAuditEventId: 11 },
      }),
    )
    expect(dispatchSecurityAlert).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({ securityEventType: 'role_escalation', tenantId: 5 }),
    )
  })

  it('runSecurityMonitorTick swallows errors and stays re-entrant safe', async () => {
    const prisma = {
      loginAttempt: { findMany: vi.fn().mockRejectedValue(new Error('db down')) },
      securityMonitorCursor: { findUnique: vi.fn(), upsert: vi.fn() },
      auditEvent: { findMany: vi.fn(), create: vi.fn() },
      securityAlertDedupe: { findUnique: vi.fn(), upsert: vi.fn() },
      tenant: { findFirst: vi.fn() },
    } as unknown as PrismaClient

    await expect(runSecurityMonitorTick(prisma)).resolves.toBeUndefined()
  })
})
