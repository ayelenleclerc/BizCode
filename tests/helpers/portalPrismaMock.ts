import { createHmac, randomBytes } from 'node:crypto'
import { vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { getByTokenHashFilter, type TokenHashWhere } from './tokenHashFilter'

export const PORTAL_TEST_JWT_SECRET = 'portal-test-jwt-secret'
export const PORTAL_TEST_TENANT_SLUG = 'demo'
export const PORTAL_TEST_TENANT_ID = 1
export const PORTAL_TEST_CLIENTE_A_ID = 10
export const PORTAL_TEST_CLIENTE_B_ID = 20

export function hashPortalTestToken(token: string): string {
  return createHmac('sha256', PORTAL_TEST_JWT_SECRET).update(token).digest('hex')
}

type PortalMockOptions = {
  portalEnabled?: boolean
  clienteEmail?: string
}

export function createPortalPrismaMock(options: PortalMockOptions = {}): PrismaClient {
  const portalEnabled = options.portalEnabled ?? true
  const clienteEmail = options.clienteEmail ?? 'cliente@example.com'
  const magicLinkStore = new Map<string, { id: number; clienteId: number; expiresAt: Date; usedAt: Date | null }>()
  const sessionStore = new Map<string, { id: number; clienteId: number; expiresAt: Date }>()
  let magicLinkId = 1
  let sessionId = 1

  const clienteA = {
    id: PORTAL_TEST_CLIENTE_A_ID,
    tenantId: PORTAL_TEST_TENANT_ID,
    codigo: 1001,
    rsocial: 'Cliente A SA',
    fantasia: null,
    cuit: null,
    condIva: 'RI',
    domicilio: null,
    localidad: null,
    telef: null,
    email: clienteEmail,
    activo: true,
    creditDays: 30,
    creditLimit: null,
    balance: 0,
  }

  const clienteB = {
    ...clienteA,
    id: PORTAL_TEST_CLIENTE_B_ID,
    codigo: 1002,
    rsocial: 'Cliente B SA',
    email: 'otro@example.com',
  }

  return {
    tenant: {
      findUnique: vi.fn(async (args: { where: { slug?: string; id?: number }; include?: { portalConfig?: boolean } }) => {
        if (args.where.slug === PORTAL_TEST_TENANT_SLUG || args.where.id === PORTAL_TEST_TENANT_ID) {
          const base = {
            id: PORTAL_TEST_TENANT_ID,
            name: 'Demo Tenant',
            slug: PORTAL_TEST_TENANT_SLUG,
            active: true,
          }
          if (args.include?.portalConfig) {
            return {
              ...base,
              portalConfig: {
                id: 1,
                tenantId: PORTAL_TEST_TENANT_ID,
                enabled: portalEnabled,
                showPedidos: true,
                logoUrl: null,
                primaryColor: '#2563eb',
                footerText: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }
          }
          return base
        }
        return null
      }),
    },
    portalConfig: {
      upsert: vi.fn(),
      findUnique: vi.fn(async () => ({
        id: 1,
        tenantId: PORTAL_TEST_TENANT_ID,
        enabled: portalEnabled,
        showPedidos: true,
        logoUrl: null,
        primaryColor: '#2563eb',
        footerText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    },
    portalMagicLink: {
      create: vi.fn(async (args: { data: { tenantId: number; clienteId: number; tokenHash: string; expiresAt: Date } }) => {
        const id = magicLinkId++
        magicLinkStore.set(args.data.tokenHash, {
          id,
          clienteId: args.data.clienteId,
          expiresAt: args.data.expiresAt,
          usedAt: null,
        })
        return { id, ...args.data, usedAt: null, createdAt: new Date() }
      }),
      findFirst: vi.fn(async (args: {
        where: { tenantId: number; tokenHash: TokenHashWhere; usedAt: null; expiresAt: { gt: Date } }
      }) => {
        const hit = getByTokenHashFilter(magicLinkStore, args.where.tokenHash)
        if (!hit || hit.value.usedAt || hit.value.expiresAt <= new Date()) {
          return null
        }
        const row = hit.value
        const cliente = row.clienteId === PORTAL_TEST_CLIENTE_A_ID ? clienteA : clienteB
        return {
          id: row.id,
          tenantId: PORTAL_TEST_TENANT_ID,
          clienteId: row.clienteId,
          tokenHash: hit.hash,
          expiresAt: row.expiresAt,
          usedAt: row.usedAt,
          cliente,
        }
      }),
      update: vi.fn(async (args: { where: { id: number }; data: { usedAt: Date } }) => {
        for (const [hash, row] of magicLinkStore) {
          if (row.id === args.where.id) {
            magicLinkStore.set(hash, { ...row, usedAt: args.data.usedAt })
          }
        }
        return { id: args.where.id }
      }),
    },
    portalSession: {
      create: vi.fn(async (args: { data: { tenantId: number; clienteId: number; tokenHash: string; expiresAt: Date } }) => {
        const id = sessionId++
        sessionStore.set(args.data.tokenHash, {
          id,
          clienteId: args.data.clienteId,
          expiresAt: args.data.expiresAt,
        })
        return { id, ...args.data, revokedAt: null, createdAt: new Date(), lastSeenAt: new Date() }
      }),
      findFirst: vi.fn(async (args: {
        where: { tokenHash: TokenHashWhere; tenantId: number; revokedAt: null; expiresAt: { gt: Date } }
      }) => {
        const hit = getByTokenHashFilter(sessionStore, args.where.tokenHash)
        if (!hit || hit.value.expiresAt <= new Date()) {
          return null
        }
        const row = hit.value
        const cliente = row.clienteId === PORTAL_TEST_CLIENTE_A_ID ? clienteA : clienteB
        return {
          id: row.id,
          tenantId: PORTAL_TEST_TENANT_ID,
          clienteId: row.clienteId,
          cliente,
        }
      }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    cliente: {
      findFirst: vi.fn(async (args?: { where?: Record<string, unknown> }) => {
        const where = args?.where ?? {}
        if (where.id === PORTAL_TEST_CLIENTE_B_ID) return clienteB
        if (where.id === PORTAL_TEST_CLIENTE_A_ID) return clienteA
        if (where.email) {
          const emailFilter = where.email as { equals?: string }
          const email = String(emailFilter.equals ?? '').toLowerCase()
          if (email === clienteEmail.toLowerCase()) return clienteA
          if (email === clienteB.email?.toLowerCase()) return clienteB
        }
        if (where.tenantId === PORTAL_TEST_TENANT_ID && where.activo === true && !where.id) {
          return clienteA
        }
        return null
      }),
      findMany: vi.fn().mockResolvedValue([clienteA]),
    },
    pedido: {
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    reciboCobroImputacion: { groupBy: vi.fn().mockResolvedValue([]) },
    movimientoClienteCC: { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) },
    paramEmpresa: { findUnique: vi.fn().mockResolvedValue({ nombre: 'Demo', cuit: '20-12345678-9' }) },
    $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
    appUser: { count: vi.fn().mockResolvedValue(1) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
  } as unknown as PrismaClient
}

export function createPortalMagicToken(): string {
  return randomBytes(32).toString('hex')
}
