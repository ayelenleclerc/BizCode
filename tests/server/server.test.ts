import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Application } from 'express'
import type { PrismaClient } from '@prisma/client'
import type { Server } from 'node:http'
import { initializeAppConfig, resetAppConfigCache } from '../../apps/server/config/env'

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    $disconnect = vi.fn().mockResolvedValue(undefined)
  },
}))

import * as server from '../../apps/server/server'

function ensureTestConfig(overrides: Record<string, string | undefined> = {}): void {
  resetAppConfigCache()
  initializeAppConfig({
    DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://bizcode_test@localhost:5432/bizcode_test',
    JWT_SECRET: process.env.JWT_SECRET ?? 'test-jwt-secret',
    NODE_ENV: 'test',
    ...overrides,
  })
}

describe('server bootstrap', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    if (!process.env.DATABASE_URL?.trim()) {
      process.env.DATABASE_URL = 'postgresql://bizcode_test@localhost:5432/bizcode_test_placeholder'
    }
    ensureTestConfig()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetAppConfigCache()
  })

  it('createServerInstance returns app wired to the given prisma', () => {
    const disconnect = vi.fn()
    const prisma = { $disconnect: disconnect } as unknown as PrismaClient
    const { app, prisma: p } = server.createServerInstance(prisma)
    expect(app).toBeDefined()
    expect(p).toBe(prisma)
  })

  it('bindHttpServer calls listen on loopback outside production and skips SIGINT when registerSigint is false', () => {
    const listen = vi.fn((...args: unknown[]) => {
      const cb = args.find((a) => typeof a === 'function') as (() => void) | undefined
      cb?.()
      return { close: vi.fn() } as unknown as Server
    })
    const app = { listen } as unknown as Application
    const disconnect = vi.fn().mockResolvedValue(undefined)
    const prisma = { $disconnect: disconnect } as unknown as PrismaClient

    server.bindHttpServer(app, prisma, 0, { registerSigint: false })

    expect(listen).toHaveBeenCalledWith(0, '127.0.0.1', expect.any(Function))
  })

  it('bindHttpServer uses explicit BIZCODE_LISTEN_HOST when set', () => {
    ensureTestConfig({ BIZCODE_LISTEN_HOST: '0.0.0.0' })
    const listen = vi.fn((...args: unknown[]) => {
      const cb = args.find((a) => typeof a === 'function') as (() => void) | undefined
      cb?.()
      return { close: vi.fn() } as unknown as Server
    })
    const app = { listen } as unknown as Application
    const prisma = { $disconnect: vi.fn() } as unknown as PrismaClient

    server.bindHttpServer(app, prisma, 0, { registerSigint: false })

    expect(listen).toHaveBeenCalledWith(0, '0.0.0.0', expect.any(Function))
  })

  it('bindHttpServer omits host in production when BIZCODE_LISTEN_HOST unset', () => {
    ensureTestConfig({ NODE_ENV: 'production', REDIS_URL: 'redis://127.0.0.1:6379', BIZCODE_FISCAL_ENCRYPTION_KEY: 'fiscal-key-32chars-minimum!!!!!!', BIZCODE_MFA_ENCRYPTION_KEY: 'mfa-key-32chars-minimum!!!!!!!!!' })
    const listen = vi.fn((...args: unknown[]) => {
      const cb = args.find((a) => typeof a === 'function') as (() => void) | undefined
      cb?.()
      return { close: vi.fn() } as unknown as Server
    })
    const app = { listen } as unknown as Application
    const prisma = { $disconnect: vi.fn() } as unknown as PrismaClient

    server.bindHttpServer(app, prisma, 0, { registerSigint: false, startSecurityMonitor: false })

    expect(listen).toHaveBeenCalledWith(0, expect.any(Function))
  })

  it('bindHttpServer registers SIGINT and disconnects prisma', async () => {
    const listen = vi.fn((...args: unknown[]) => {
      const cb = args.find((a) => typeof a === 'function') as (() => void) | undefined
      cb?.()
      return { close: vi.fn() } as unknown as Server
    })
    const app = { listen } as unknown as Application
    const disconnect = vi.fn().mockResolvedValue(undefined)
    const prisma = { $disconnect: disconnect } as unknown as PrismaClient
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)

    process.removeAllListeners('SIGINT')
    server.bindHttpServer(app, prisma, 0, { registerSigint: true })

    process.emit('SIGINT')
    await vi.waitFor(() => expect(disconnect).toHaveBeenCalled())
    expect(exitSpy).toHaveBeenCalledWith(0)
  })

  it('startServer listens on an ephemeral port using mocked PrismaClient', async () => {
    const srv = server.startServer(0, { registerSigint: false, startSecurityMonitor: false })
    await new Promise<void>((resolve) => {
      srv.once('listening', resolve)
    })
    expect(srv.address()).toBeTruthy()
    await new Promise<void>((resolve, reject) => {
      srv.close((err) => (err ? reject(err) : resolve()))
    })
  })
})
