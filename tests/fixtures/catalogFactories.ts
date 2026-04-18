/**
 * @en Reusable payloads and Prisma helpers for integration tests (PostgreSQL + real Prisma).
 * @es Cargas y ayudantes Prisma reutilizables para pruebas de integración.
 * @pt-BR Payloads e helpers Prisma reutilizáveis para testes de integração.
 */
import type { PrismaClient } from '@prisma/client'

/** Creates a rubro row; use before creating articulos that require rubroId. */
export async function createIntegrationRubro(
  prisma: PrismaClient,
  overrides: Partial<{ codigo: number; nombre: string }> = {},
) {
  const codigo = overrides.codigo ?? 9001
  const nombre = (overrides.nombre ?? 'Rubro int test').slice(0, 20)
  return prisma.rubro.create({
    data: { codigo, nombre },
  })
}

/** Valid POST /api/articulos body aligned with validateArticuloInput in server/createApp.ts */
export function buildArticuloCreateBody(rubroId: number, codigo = 42) {
  return {
    codigo,
    descripcion: 'Artículo integración',
    rubroId,
    condIva: '1' as const,
    umedida: 'UN',
    precioLista1: 100,
    precioLista2: 100,
    costo: 50,
    stock: 10,
    minimo: 0,
    activo: true,
  }
}
