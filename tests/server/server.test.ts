import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Application } from 'express'
import type { PrismaClient } from '@prisma/client'
import type { Server } from 'node:http'

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    $disconnect = vi.fn().mockResolvedValue(undefined)
  },
}))

import * as server from '../../server'

describe('server bootstrap', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('createServerInstance returns app wired to the given prisma', () => {
    const disconnect = vi.fn()
    const prisma = { $disconnect: disconnect } as unknown as PrismaClient
    const { app, prisma: p } = server.createServerInstance(prisma)
    expect(app).toBeDefined()
    expect(p).toBe(prisma)
  })

  it('bindHttpServer calls listen and skips SIGINT when registerSigint is false', () => {
    const listen = vi.fn((_port: number, cb?: () => void) => {
      cb?.()
      return { close: vi.fn() } as unknown as Server
    })
    const app = { listen } as unknown as Application
    const disconnect = vi.fn().mockResolvedValue(undefined)
    const prisma = { $disconnect: disconnect } as unknown as PrismaClient

    server.bindHttpServer(app, prisma, 0, { registerSigint: false })

    expect(listen).toHaveBeenCalledWith(0, expect.any(Function))
  })

  it('bindHttpServer registers SIGINT and disconnects prisma', async () => {
    const listen = vi.fn((_port: number, cb?: () => void) => {
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
    const srv = server.startServer(0, { registerSigint: false })
    await new Promise<void>((resolve) => {
      srv.once('listening', resolve)
    })
    expect(srv.address()).toBeTruthy()
    await new Promise<void>((resolve, reject) => {
      srv.close((err) => (err ? reject(err) : resolve()))
    })
  })
})
