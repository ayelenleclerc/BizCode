/** Contrato HTTP vs docs/api/openapi.yaml (Ajv + spec dereferenciado). Entorno: node (vitest.config). */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import { createEmptyDocumentoCompraPreview } from '../../apps/server/lib/documentoCompraTypes'
import { assertMatchesOpenApi } from './validate-openapi-response'
import {
  createMovimientoClienteCCPrismaMock,
  extendClientePrismaForCc,
} from '../helpers/movimientoClienteCcPrismaMock'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'
import { clearTenantFeaturesCache } from '../../apps/server/services/tenantConfigCache'

vi.mock('../../apps/server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../../apps/server/integrations/mercadopago/mercadoPagoApiClient')
  >()
  return {
    ...actual,
    createMercadoPagoPreference: vi.fn(),
    createMercadoPagoInstoreQr: vi.fn(),
    fetchMercadoPagoPayment: vi.fn(),
    searchMercadoPagoPayments: vi.fn().mockResolvedValue({
      paging: { total: 0, limit: 50, offset: 0 },
      results: [],
    }),
  }
})

vi.mock('../../apps/server/lib/mercadopagoQrImage', () => ({
  mercadoPagoQrPayloadToBase64: vi.fn().mockResolvedValue('base64png'),
}))

import { createMercadoPagoInstoreQr, createMercadoPagoPreference } from '../../apps/server/integrations/mercadopago/mercadoPagoApiClient'
import {
  buildMercadoPagoSignatureManifest,
  computeMercadoPagoSignatureHmac,
} from '../../apps/server/lib/mercadopagoSignature'
import {
  buildMeliSignatureManifest,
  computeMeliSignatureHmac,
} from '../../apps/server/lib/meliWebhookSignature'

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  if (value === undefined || value === null) return false
  return typeof value === 'object' && !Array.isArray(value)
}

const rubroRow = { id: 1, codigo: 1, nombre: 'General' }

const clienteRow = {
  id: 1,
  codigo: 1,
  rsocial: 'ACME SA',
  fantasia: null,
  cuit: null,
  condIva: 'RI',
  domicilio: null,
  localidad: null,
  cpost: null,
  telef: null,
  email: null,
  activo: true,
}

const articuloRow = {
  id: 1,
  codigo: 1,
  descripcion: 'Producto',
  rubroId: 1,
  rubro: rubroRow,
  condIva: '1',
  umedida: 'U',
  precioLista1: 10,
  precioLista2: 10,
  costo: 5,
  stock: 0,
  minimo: 0,
  activo: true,
}

const formaPagoRow = { id: 1, codigo: 1, descripcion: 'Contado', vto_dias: 0 }

const proveedorRow = {
  id: 1,
  codigo: 5001,
  rsocial: 'Proveedor API SA',
  fantasia: null,
  cuit: null,
  condIva: 'RI',
  telef: null,
  email: null,
  activo: true,
}

const proveedorCatalogoRow = {
  id: 7,
  tenantId: 1,
  proveedorId: 1,
  articuloId: 1,
  codigoProveedor: 'AG-1000',
  descripcion: 'Aceite girasol',
  precioLista: new Decimal(1250),
  precioListaFecha: new Date('2026-06-01T00:00:00.000Z'),
  unidadCompra: 'caja x12',
  multiplo: new Decimal(1),
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  articulo: { id: 1, codigo: 1, descripcion: 'Producto' },
  proveedor: { id: 1, codigo: 5001, rsocial: 'Proveedor API SA' },
}

const facturaRow = {
  id: 1,
  fecha: new Date('2025-01-15T12:00:00.000Z').toISOString(),
  tipo: 'A',
  prefijo: 'A',
  numero: 1,
  clienteId: 1,
  formaPagoId: null,
  neto1: 100,
  neto2: 0,
  neto3: 0,
  iva1: 21,
  iva2: 0,
  total: 121,
  estado: 'A',
  items: [] as unknown[],
}

const notaCreditoContractRow = {
  id: 1,
  tenantId: 1,
  facturaOrigenId: 1,
  motivo: 'Nota motivo suficientemente largo',
  monto: 121,
  cae: null,
  caeVto: null,
  estadoCae: 'not_required',
  createdById: null,
  createdAt: new Date('2025-01-15T12:00:00.000Z'),
  facturaOrigen: {
    id: 1,
    tipo: 'A',
    prefijo: 'A',
    numero: 1,
    clienteId: 1,
    fecha: new Date('2025-01-15T12:00:00.000Z'),
    total: 121,
    estado: 'N',
  },
}

const clienteInput = {
  codigo: 1,
  rsocial: 'ACME SA',
  condIva: 'RI',
  activo: true,
}

const articuloInput = {
  codigo: 1,
  descripcion: 'Producto',
  rubroId: 1,
  condIva: '1',
  umedida: 'UN',
  precioLista1: 10,
  precioLista2: 10,
  costo: 5,
  stock: 0,
  minimo: 0,
  activo: true,
}

const proveedorInput = {
  codigo: 5001,
  rsocial: 'Proveedor API SA',
  condIva: 'RI',
  activo: true,
}

const ordenCompraContractRow = {
  id: 1,
  tenantId: 1,
  proveedorId: 1,
  estado: 'draft',
  total: new Decimal(20),
  fechaEstimada: null,
  nota: null,
  proveedor: { id: 1, codigo: 1, rsocial: 'Prov' },
  items: [
    {
      id: 10,
      ordenCompraId: 1,
      articuloId: 1,
      codigoProveedor: 'PROV-001',
      descripcionProveedor: 'Prod proveedor',
      cantidad: 2,
      cantidadRecibida: 0,
      costoUnitario: new Decimal(10),
      subtotal: new Decimal(20),
      articulo: { id: 1, codigo: 1, descripcion: 'Prod' },
    },
  ],
}

const repartoContractRow = {
  id: 1,
  tenantId: 1,
  fecha: new Date('2026-05-20T10:00:00.000Z'),
  choferId: 2,
  estado: 'planned',
  vehiculo: 'ABC123',
  observaciones: null,
  closedAt: null,
  createdAt: new Date('2026-05-20T10:00:00.000Z'),
  updatedAt: new Date('2026-05-20T10:00:00.000Z'),
  chofer: { id: 2, username: 'driver1', role: 'driver' },
  items: [
    {
      id: 10,
      ordenEntregaId: 1,
      secuencia: 1,
      estado: 'pending',
      entregadoAt: null,
      motivoNoEntrega: null,
      receptorNombre: null,
      receptorDni: null,
      notasEntrega: null,
      podMedia: null,
      ordenEntrega: {
        id: 1,
        tenantId: 1,
        clienteId: 1,
        zonaId: null,
        driverId: 2,
        facturaId: null,
        fecha: new Date('2026-05-20T10:00:00.000Z'),
        estado: 'assigned',
        nota: null,
        cliente: { id: 1, codigo: 1, rsocial: 'ACME SA' },
        zona: null,
        driver: { id: 2, username: 'driver1', role: 'driver' },
        factura: null,
      },
    },
  ],
  progress: { total: 1, delivered: 0, pending: 1 },
}

const recuentoContractRow = {
  id: 1,
  tenantId: 1,
  operadorId: 1,
  estado: 'in_progress',
  fecha: new Date('2026-05-20T10:00:00.000Z'),
  closedAt: null,
  createdAt: new Date('2026-05-20T10:00:00.000Z'),
  updatedAt: new Date('2026-05-20T10:00:00.000Z'),
  operador: { id: 1, username: 'owner1' },
  items: [
    {
      id: 10,
      recuentoId: 1,
      articuloId: 1,
      cantSistema: 5,
      cantFisica: null,
      articulo: { id: 1, codigo: 1, descripcion: 'Prod' },
    },
  ],
}

function buildPrisma(): PrismaClient {
  const facturaCreate = vi.fn().mockResolvedValue(facturaRow)
  // tx-level cliente.update: returns the financial summary the route uses for the credit check
  const txClienteUpdate = vi.fn().mockResolvedValue({ id: 1, rsocial: 'ACME SA', balance: 121, creditLimit: null })
  const clienteTxCreate = vi.fn().mockResolvedValue(clienteRow)
  const rubroTxCreate = vi.fn().mockResolvedValue(rubroRow)
  const articuloTxCreate = vi.fn().mockResolvedValue(articuloRow)
  const proveedorTxCreate = vi.fn().mockResolvedValue(proveedorRow)

  const p = {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: extendClientePrismaForCc({
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn((args?: unknown) => {
        const w = isObjectRecord(args) && 'where' in args
          ? (args as { where?: { codigo?: { in?: number[] } } }).where
          : undefined
        if (w?.codigo && typeof w.codigo === 'object' && Array.isArray(w.codigo.in)) {
          return Promise.resolve([])
        }
        return Promise.resolve([clienteRow])
      }),
      findFirst: vi.fn().mockResolvedValue(clienteRow),
      findUnique: vi.fn().mockResolvedValue(clienteRow),
      create: vi.fn().mockResolvedValue(clienteRow),
      update: vi.fn().mockResolvedValue(clienteRow), // PUT /api/clientes/:id returns full row
    }),
    articulo: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn((args?: unknown) => {
        const w = isObjectRecord(args) && 'where' in args
          ? (args as {
              where?: { codigo?: { in?: number[] }; id?: { in?: number[] } }
            }).where
          : undefined
        if (w?.id && typeof w.id === 'object' && Array.isArray(w.id.in)) {
          if (w.id.in.length === 0) return Promise.resolve([])
          return Promise.resolve(w.id.in.map((id: number) => ({ id })))
        }
        if (w?.codigo && typeof w.codigo === 'object' && Array.isArray(w.codigo.in)) {
          return Promise.resolve([])
        }
        return Promise.resolve([articuloRow])
      }),
      findFirst: vi.fn().mockResolvedValue(articuloRow),
      findUnique: vi.fn().mockResolvedValue(articuloRow),
      create: vi.fn().mockResolvedValue(articuloRow),
      update: vi.fn().mockResolvedValue(articuloRow),
      upsert: vi.fn().mockResolvedValue(articuloRow),
    },
    stockAjuste: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({
        id: 1,
        cantidad: -1,
        motivo: 'Test',
        createdAt: new Date('2026-05-18T12:00:00.000Z'),
        user: { id: 1, username: 'owner1' },
      }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    rubro: {
      count: vi.fn().mockResolvedValue(1),
      findFirst: vi.fn().mockResolvedValue(rubroRow),
      findMany: vi.fn().mockImplementation((args?: unknown) => {
        const a = isObjectRecord(args)
          ? (args as { where?: { codigo?: { in?: number[] } }; select?: Record<string, boolean> })
          : {}
        if (a.where?.codigo && typeof a.where.codigo === 'object' && Array.isArray(a.where.codigo.in)) {
          return Promise.resolve([])
        }
        const sel = a.select
        if (sel && 'codigo' in sel && 'id' in sel) {
          return Promise.resolve([{ id: rubroRow.id, codigo: rubroRow.codigo }])
        }
        return Promise.resolve([rubroRow])
      }),
      create: vi.fn().mockResolvedValue(rubroRow),
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue(rubroRow),
    },
    formaPago: {
      findMany: vi.fn().mockResolvedValue([formaPagoRow]),
    },
    factura: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: facturaCreate,
      update: vi.fn().mockResolvedValue(facturaRow),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    notaCredito: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    documentoCompraImportado: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        usuarioId: 1,
        archivoNombre: 'factura.pdf',
        archivoMime: 'application/pdf',
        archivoPath: '',
        tipoArchivo: 'pdf',
        tier: 0,
        confianza: 0,
        estado: 'procesando',
        datosExtraidos: createEmptyDocumentoCompraPreview(),
        comprobanteCompraId: null,
        errores: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      update: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 1,
          tenantId: 1,
          usuarioId: 1,
          archivoNombre: 'factura.pdf',
          archivoMime: 'application/pdf',
          archivoPath: '1/1/factura.pdf',
          tipoArchivo: 'pdf',
          tier: 0,
          confianza: 0,
          estado: 'confirmado',
          datosExtraidos: createEmptyDocumentoCompraPreview(),
          comprobanteCompraId: 1,
          errores: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        }),
      ),
      findFirst: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        usuarioId: 1,
        archivoNombre: 'factura.pdf',
        archivoMime: 'application/pdf',
        archivoPath: '1/1/factura.pdf',
        tipoArchivo: 'pdf',
        tier: 0,
        confianza: 0,
        estado: 'pendiente_revision',
        datosExtraidos: createEmptyDocumentoCompraPreview(),
        comprobanteCompraId: null,
        errores: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    regimenRetencion: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        tipo: 'ganancias',
        subtipo: 'retencion',
        nombre: 'Ganancias',
        alicuota: new Decimal(4.5),
        alicuotaMin: null,
        provincia: null,
        activo: true,
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        updatedAt: new Date('2026-06-01T00:00:00.000Z'),
      }),
      findFirst: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        tipo: 'ganancias',
        subtipo: 'retencion',
        nombre: 'Ganancias',
        alicuota: new Decimal(4.5),
        alicuotaMin: null,
        provincia: null,
        activo: true,
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        updatedAt: new Date('2026-06-01T00:00:00.000Z'),
      }),
      update: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        tipo: 'ganancias',
        subtipo: 'retencion',
        nombre: 'Ganancias',
        alicuota: new Decimal(4.5),
        alicuotaMin: null,
        provincia: null,
        activo: false,
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        updatedAt: new Date('2026-06-01T00:00:00.000Z'),
      }),
    },
    fiscalRetencionesConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        esAgenteRetencionGanancias: true,
        esAgenteRetencionIVA: false,
        esAgenteRetencionIIBB: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    retencionAplicada: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    presentacionRetencion: {
      create: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        formato: 'sicore',
        periodo: '2026-06',
        totalOperaciones: 0,
        totalImporte: new Decimal(0),
        archivoHash: 'hash',
        archivoContenido: '',
        presentadoAt: null,
        createdAt: new Date(),
      }),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
    },
    comprobanteCompra: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        proveedorId: 1,
        ordenCompraId: null,
        fecha: new Date('2026-05-10T12:00:00.000Z'),
        tipo: 'B',
        prefijo: '0001',
        numero: 1,
        neto1: 100,
        neto2: 0,
        neto3: 0,
        iva1: 21,
        iva2: 0,
        total: 121,
        cae: null,
        caeVto: null,
        estado: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    movimientoProveedorCC: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        proveedorId: 1,
        tipo: 'factura_compra',
        referencia: 'B-0001-1',
        monto: 121,
        saldoPost: 121,
        fecha: new Date('2026-05-10T12:00:00.000Z'),
        usuarioId: 1,
        notas: null,
        comprobanteCompraId: 1,
        reciboPagoId: null,
        createdAt: new Date(),
      }),
    },
    movimientoClienteCC: {
      findFirst: vi.fn().mockResolvedValue({
        id: 1,
        saldoPost: new Decimal(100),
      }),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 1,
          tenantId: 1,
          clienteId: 1,
          tipo: 'factura',
          referencia: 'A-0001-1',
          monto: new Decimal(100),
          saldoPost: new Decimal(100),
          fecha: new Date('2026-05-10T12:00:00.000Z'),
          usuarioId: 1,
          notas: null,
          facturaId: 1,
          cobroId: null,
          notaCreditoId: null,
          chequeId: null,
          retencionAplicadaId: null,
          createdAt: new Date(),
        },
      ]),
      count: vi.fn().mockResolvedValue(1),
      create: vi.fn().mockResolvedValue({
        id: 2,
        tenantId: 1,
        clienteId: 1,
        tipo: 'ajuste',
        referencia: 'ajuste_manual',
        monto: new Decimal(-10),
        saldoPost: new Decimal(90),
        fecha: new Date(),
        usuarioId: 1,
        notas: 'test',
        facturaId: null,
        cobroId: null,
        notaCreditoId: null,
        chequeId: null,
        retencionAplicadaId: null,
        createdAt: new Date(),
      }),
    },
    paramEmpresa: {
      findFirst: vi.fn().mockResolvedValue({
        nombre: 'Demo Co',
        cuit: '20-12345678-6',
        domicilio: 'Calle 1',
        logoUrl: null,
      }),
      findUnique: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        nombre: 'Demo Co',
        cuit: '20-12345678-6',
        domicilio: null,
        puntoVenta: 1,
        tipoFactura: 'B',
        logoUrl: null,
        recordatorioDiasGracia: 0,
        timezone: 'America/Argentina/Buenos_Aires',
        recordatorioHoraInicio: 8,
        recordatorioHoraFin: 18,
      }),
      upsert: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        nombre: 'Demo Co',
        cuit: '20-12345678-6',
        domicilio: 'Calle 1',
        puntoVenta: 2,
        tipoFactura: 'A',
        logoUrl: null,
        recordatorioDiasGracia: 0,
        timezone: 'America/Argentina/Buenos_Aires',
        recordatorioHoraInicio: 8,
        recordatorioHoraFin: 18,
      }),
    },
    reciboPagoFactura: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    reciboPago: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 1,
          tenantId: 1,
          numero: 1,
          proveedorId: 1,
          fecha: new Date('2026-06-01T12:00:00.000Z'),
          total: new Decimal(100),
          metodoPago: 'transferencia',
          cbu: null,
          referencia: 'TRX-1',
          estado: 'emitido',
          notas: null,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          proveedor: { id: 1, codigo: 5001, rsocial: 'Proveedor API SA', cuit: null },
          usuario: { id: 1, username: 'owner1' },
          facturas: [
            {
              id: 1,
              comprobanteCompraId: 1,
              facturaRef: 'B-0001-1',
              monto: new Decimal(100),
            },
          ],
          retencionesAplicadas: [],
        },
      ]),
      findFirst: vi.fn().mockImplementation(async (args?: { where?: Record<string, unknown> }) => {
        if (args?.where && 'numero' in args.where) return null
        return {
          id: 1,
          tenantId: 1,
          numero: 1,
          proveedorId: 1,
          fecha: new Date('2026-06-01T12:00:00.000Z'),
          total: new Decimal(100),
          metodoPago: 'transferencia',
          cbu: null,
          referencia: 'TRX-1',
          estado: 'emitido',
          notas: null,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          proveedor: { id: 1, codigo: 5001, rsocial: 'Proveedor API SA', cuit: null },
          usuario: { id: 1, username: 'owner1' },
          facturas: [
            {
              id: 1,
              comprobanteCompraId: 1,
              facturaRef: 'B-0001-1',
              monto: new Decimal(100),
            },
          ],
          retencionesAplicadas: [],
        }
      }),
      create: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        numero: 1,
        proveedorId: 1,
        fecha: new Date('2026-06-01T12:00:00.000Z'),
        total: new Decimal(100),
        metodoPago: 'transferencia',
        cbu: null,
        referencia: 'TRX-1',
        estado: 'emitido',
        notas: null,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        proveedor: { id: 1, codigo: 5001, rsocial: 'Proveedor API SA', cuit: null },
        usuario: { id: 1, username: 'owner1' },
        facturas: [
          {
            id: 1,
            comprobanteCompraId: 1,
            facturaRef: 'B-0001-1',
            monto: new Decimal(100),
          },
        ],
        retencionesAplicadas: [],
      }),
      update: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        numero: 1,
        proveedorId: 1,
        fecha: new Date('2026-06-01T12:00:00.000Z'),
        total: new Decimal(100),
        metodoPago: 'transferencia',
        cbu: null,
        referencia: 'TRX-1',
        estado: 'anulado',
        notas: null,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        proveedor: { id: 1, codigo: 5001, rsocial: 'Proveedor API SA', cuit: null },
        usuario: { id: 1, username: 'owner1' },
        facturas: [
          {
            id: 1,
            comprobanteCompraId: 1,
            facturaRef: 'B-0001-1',
            monto: new Decimal(100),
          },
        ],
        retencionesAplicadas: [],
      }),
    },
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    reciboCobro: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 1,
          tenantId: 1,
          numero: 1,
          clienteId: 1,
          fecha: new Date('2026-06-01T12:00:00.000Z'),
          totalCobrado: new Decimal(100),
          concepto: null,
          estado: 'emitido',
          anulacionMotivo: null,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          cliente: { id: 1, codigo: 1, rsocial: 'ACME SA', cuit: null },
          usuario: { id: 1, username: 'owner1' },
          formas: [
            {
              id: 1,
              reciboCobroId: 1,
              tipo: 'efectivo',
              importe: new Decimal(100),
              chequeId: null,
              referencia: null,
              banco: null,
              cheque: null,
            },
          ],
          imputaciones: [
            {
              id: 1,
              reciboCobroId: 1,
              facturaId: 1,
              importe: new Decimal(100),
              saldoPrevio: new Decimal(121),
              saldoPostPago: new Decimal(21),
              factura: { id: 1, tipo: 'A', prefijo: 'A', numero: 1 },
            },
          ],
          retencionesAplicadas: [],
        },
      ]),
      findFirst: vi.fn().mockImplementation(async (args?: { where?: Record<string, unknown> }) => {
        if (args?.where && 'numero' in args.where) return null
        return {
          id: 1,
          tenantId: 1,
          numero: 1,
          clienteId: 1,
          fecha: new Date('2026-06-01T12:00:00.000Z'),
          totalCobrado: new Decimal(100),
          concepto: null,
          estado: 'emitido',
          anulacionMotivo: null,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          cliente: { id: 1, codigo: 1, rsocial: 'ACME SA', cuit: null },
          usuario: { id: 1, username: 'owner1' },
          formas: [
            {
              id: 1,
              reciboCobroId: 1,
              tipo: 'efectivo',
              importe: new Decimal(100),
              chequeId: null,
              referencia: null,
              banco: null,
              cheque: null,
            },
          ],
          imputaciones: [
            {
              id: 1,
              reciboCobroId: 1,
              facturaId: 1,
              importe: new Decimal(100),
              saldoPrevio: new Decimal(121),
              saldoPostPago: new Decimal(21),
              factura: { id: 1, tipo: 'A', prefijo: 'A', numero: 1 },
            },
          ],
          retencionesAplicadas: [],
        }
      }),
      findFirstOrThrow: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        numero: 1,
        clienteId: 1,
        fecha: new Date('2026-06-01T12:00:00.000Z'),
        totalCobrado: new Decimal(100),
        concepto: null,
        estado: 'emitido',
        anulacionMotivo: null,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        cliente: { id: 1, codigo: 1, rsocial: 'ACME SA', cuit: null },
        usuario: { id: 1, username: 'owner1' },
        formas: [
          {
            id: 1,
            reciboCobroId: 1,
            tipo: 'efectivo',
            importe: new Decimal(100),
            chequeId: null,
            referencia: null,
            banco: null,
            cheque: null,
          },
        ],
        imputaciones: [
          {
            id: 1,
            reciboCobroId: 1,
            facturaId: 1,
            importe: new Decimal(100),
            saldoPrevio: new Decimal(121),
            saldoPostPago: new Decimal(21),
            factura: { id: 1, tipo: 'A', prefijo: 'A', numero: 1 },
          },
        ],
        retencionesAplicadas: [],
      }),
      create: vi.fn().mockResolvedValue({ id: 1, numero: 1 }),
      update: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        numero: 1,
        clienteId: 1,
        fecha: new Date('2026-06-01T12:00:00.000Z'),
        totalCobrado: new Decimal(100),
        concepto: null,
        estado: 'anulado',
        anulacionMotivo: 'Contract void',
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        cliente: { id: 1, codigo: 1, rsocial: 'ACME SA', cuit: null },
        usuario: { id: 1, username: 'owner1' },
        formas: [],
        imputaciones: [],
        retencionesAplicadas: [],
      }),
    },
    cobro: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    cuentaBancaria: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    remito: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 1,
          tenantId: 1,
          prefijo: '0001',
          numero: 1,
          tipo: 'remito_x',
          estado: 'emitido',
          clienteId: 1,
          proveedorId: null,
          facturaId: null,
          pedidoId: null,
          ordenEntregaId: null,
          fecha: new Date('2026-06-10T12:00:00.000Z'),
          fechaEntrega: null,
          observaciones: null,
          firmadoPor: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          cliente: { id: 1, codigo: 1, rsocial: 'Cliente SA', cuit: null, domicilio: null },
          proveedor: null,
          factura: null,
          pedido: null,
          ordenEntrega: null,
          items: [
            {
              id: 1,
              articuloId: 1,
              descripcion: 'Articulo',
              cantidad: 1,
              unidad: 'UN',
              articulo: { id: 1, codigo: 1, descripcion: 'Articulo', umedida: 'UN' },
            },
          ],
        },
      ]),
      findFirst: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        prefijo: '0001',
        numero: 1,
        tipo: 'remito_x',
        estado: 'emitido',
        clienteId: 1,
        proveedorId: null,
        facturaId: null,
        pedidoId: null,
        ordenEntregaId: null,
        fecha: new Date('2026-06-10T12:00:00.000Z'),
        fechaEntrega: null,
        observaciones: null,
        firmadoPor: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        cliente: { id: 1, codigo: 1, rsocial: 'Cliente SA', cuit: null, domicilio: null },
        proveedor: null,
        items: [
          {
            id: 1,
            articuloId: 1,
            descripcion: 'Articulo',
            cantidad: 1,
            unidad: 'UN',
          },
        ],
      }),
      create: vi.fn(),
      update: vi.fn(),
    },
    remitoItem: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    cheque: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 1,
          tenantId: 1,
          tipo: 'recibido',
          modalidad: 'fisico',
          numero: '12345678',
          banco: 'Galicia',
          sucursal: null,
          cbuOrigen: null,
          libradorNombre: 'Cliente SA',
          libradorCuit: null,
          monto: new Decimal(15000),
          moneda: 'ARS',
          fechaEmision: new Date('2026-06-01T12:00:00.000Z'),
          fechaVencimiento: new Date('2026-06-15T12:00:00.000Z'),
          estado: 'en_cartera',
          clienteId: 1,
          proveedorId: null,
          observaciones: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          cliente: { id: 1, codigo: 1, rsocial: 'Cliente SA', cuit: null },
          proveedor: null,
          movimientos: [],
        },
      ]),
      findFirst: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        tipo: 'recibido',
        modalidad: 'fisico',
        numero: '12345678',
        banco: 'Galicia',
        monto: new Decimal(15000),
        estado: 'en_cartera',
        clienteId: 1,
      }),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 1 }, _sum: { monto: new Decimal(15000) } }),
      create: vi.fn(),
      update: vi.fn(),
    },
    chequeMov: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    ordenCompra: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([ordenCompraContractRow]),
      findFirst: vi.fn().mockResolvedValue(ordenCompraContractRow),
      create: vi.fn().mockResolvedValue(ordenCompraContractRow),
      update: vi.fn().mockResolvedValue(ordenCompraContractRow),
      groupBy: vi.fn().mockResolvedValue([
        { proveedorId: 1, _max: { updatedAt: new Date('2026-05-20T00:00:00.000Z') } },
      ]),
    },
    ordenCompraItem: { deleteMany: vi.fn(), update: vi.fn() },
    recuento: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([recuentoContractRow]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(recuentoContractRow),
      update: vi.fn().mockResolvedValue({ ...recuentoContractRow, estado: 'closed', closedAt: new Date() }),
    },
    recuentoItem: { update: vi.fn().mockResolvedValue({}) },
    reparto: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([repartoContractRow]),
      findFirst: vi.fn().mockResolvedValue(repartoContractRow),
      create: vi.fn().mockResolvedValue(repartoContractRow),
      update: vi.fn().mockResolvedValue({ ...repartoContractRow, estado: 'on_route' }),
    },
    repartoUbicacion: {
      create: vi.fn().mockResolvedValue({
        lat: { toString: () => '-34.6037' },
        lng: { toString: () => '-58.3816' },
        recordedAt: new Date('2026-05-26T12:00:00.000Z'),
      }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
    },
    repartoItem: {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    ordenEntrega: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      create: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        clienteId: 1,
        zonaId: null,
        driverId: null,
        facturaId: null,
        fecha: new Date('2026-05-16T12:00:00.000Z'),
        estado: 'pending',
        nota: null,
        cliente: { id: 1, codigo: 1, rsocial: 'ACME SA' },
        zona: null,
        driver: null,
        factura: null,
      }),
      update: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        clienteId: 1,
        estado: 'delivered',
        fecha: new Date('2026-05-16T12:00:00.000Z'),
        cliente: { id: 1, codigo: 1, rsocial: 'ACME SA' },
      }),
    },
    tenantFiscalConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
    },
    cobroRecordatorio: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([{ id: 1 }]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    notification: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Demo', slug: 'demo', active: true }),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        businessType: 'mayorista',
        rubros: [],
        plan: 'pro',
        modules: [],
        integrations: [],
        updatedAt: new Date(),
      }),
    },
    mercadoPagoConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
    },
    paymentProviderConfig: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    paymentTransaction: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    meliConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    meliPublicacion: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    meliWebhookEvent: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    mercadoPagoProcessedPayment: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    mercadoPagoReconciliationEntry: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      findUniqueOrThrow: vi.fn(),
    },
    proveedorArticulo: {
      findMany: vi.fn().mockResolvedValue([proveedorCatalogoRow]),
      findFirst: vi.fn().mockResolvedValue(proveedorCatalogoRow),
      create: vi.fn().mockResolvedValue(proveedorCatalogoRow),
      update: vi.fn().mockResolvedValue(proveedorCatalogoRow),
    },
    proveedor: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn((args?: unknown) => {
        const w = isObjectRecord(args) && 'where' in args
          ? (args as { where?: { codigo?: { in?: number[] } } }).where
          : undefined
        if (w?.codigo && typeof w.codigo === 'object' && Array.isArray(w.codigo.in)) {
          return Promise.resolve([])
        }
        return Promise.resolve([proveedorRow])
      }),
      findFirst: vi.fn().mockResolvedValue(proveedorRow),
      findUnique: vi.fn().mockResolvedValue(proveedorRow),
      create: vi.fn().mockResolvedValue(proveedorRow),
      update: vi.fn().mockResolvedValue(proveedorRow),
    },
    // $transaction: shares facturaCreate so mockRejectedValueOnce propagates for 500 tests
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        const tx = {
          factura: { create: facturaCreate },
          cliente: extendClientePrismaForCc({
            update: txClienteUpdate,
            create: clienteTxCreate,
            findFirstOrThrow: vi.fn().mockResolvedValue({
              id: 1,
              rsocial: 'ACME SA',
              balance: new Decimal(121),
              creditLimit: null,
            }),
          }),
          movimientoClienteCC: createMovimientoClienteCCPrismaMock(),
          retencionAplicada: { create: vi.fn().mockResolvedValue({ id: 1 }) },
          rubro: {
            create: rubroTxCreate,
            findUnique: vi.fn().mockResolvedValue(null),
            upsert: vi.fn().mockResolvedValue(rubroRow),
          },
          articulo: {
            create: articuloTxCreate,
            update: vi.fn().mockResolvedValue(articuloRow),
            findUnique: vi.fn().mockResolvedValue(null),
            upsert: vi.fn().mockResolvedValue(articuloRow),
          },
          proveedor: { create: proveedorTxCreate },
          comprobanteCompra: {
            create: vi.fn().mockResolvedValue({
              id: 1,
              tenantId: 1,
              proveedorId: 1,
              ordenCompraId: null,
              fecha: new Date('2026-05-10T12:00:00.000Z'),
              tipo: 'B',
              prefijo: '0001',
              numero: 1,
              neto1: 100,
              neto2: 0,
              neto3: 0,
              iva1: 21,
              iva2: 0,
              total: 121,
              cae: null,
              caeVto: null,
              estado: 'A',
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
          },
          movimientoProveedorCC: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({
              id: 1,
              tenantId: 1,
              proveedorId: 1,
              tipo: 'factura_compra',
              referencia: 'B-0001-1',
              monto: 121,
              saldoPost: 121,
              fecha: new Date('2026-05-10T12:00:00.000Z'),
              usuarioId: 1,
              notas: null,
              comprobanteCompraId: 1,
              reciboPagoId: null,
              createdAt: new Date(),
            }),
          },
          reciboPago: {
            findFirst: vi.fn().mockResolvedValue(null),
            findFirstOrThrow: vi.fn().mockResolvedValue({
              id: 1,
              tenantId: 1,
              numero: 1,
              proveedorId: 1,
              fecha: new Date('2026-06-01T12:00:00.000Z'),
              total: new Decimal(100),
              metodoPago: 'transferencia',
              cbu: null,
              referencia: 'TRX-1',
              estado: 'emitido',
              notas: null,
              usuarioId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              proveedor: { id: 1, codigo: 5001, rsocial: 'Proveedor API SA', cuit: null },
              usuario: { id: 1, username: 'owner1' },
              facturas: [
                {
                  id: 1,
                  comprobanteCompraId: 1,
                  facturaRef: 'B-0001-1',
                  monto: new Decimal(100),
                },
              ],
              retencionesAplicadas: [],
            }),
            create: vi.fn().mockResolvedValue({
              id: 1,
              tenantId: 1,
              numero: 1,
              proveedorId: 1,
              fecha: new Date('2026-06-01T12:00:00.000Z'),
              total: new Decimal(100),
              metodoPago: 'transferencia',
              cbu: null,
              referencia: 'TRX-1',
              estado: 'emitido',
              notas: null,
              usuarioId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              proveedor: { id: 1, codigo: 5001, rsocial: 'Proveedor API SA', cuit: null },
              usuario: { id: 1, username: 'owner1' },
              facturas: [
                {
                  id: 1,
                  comprobanteCompraId: 1,
                  facturaRef: 'B-0001-1',
                  monto: new Decimal(100),
                },
              ],
              retencionesAplicadas: [],
            }),
            update: vi.fn().mockResolvedValue({
              id: 1,
              tenantId: 1,
              numero: 1,
              proveedorId: 1,
              fecha: new Date('2026-06-01T12:00:00.000Z'),
              total: new Decimal(100),
              metodoPago: 'transferencia',
              cbu: null,
              referencia: 'TRX-1',
              estado: 'anulado',
              notas: null,
              usuarioId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              proveedor: { id: 1, codigo: 5001, rsocial: 'Proveedor API SA', cuit: null },
              usuario: { id: 1, username: 'owner1' },
              facturas: [
                {
                  id: 1,
                  comprobanteCompraId: 1,
                  facturaRef: 'B-0001-1',
                  monto: new Decimal(100),
                },
              ],
              retencionesAplicadas: [],
            }),
          },
          reciboCobro: {
            findFirst: vi.fn().mockResolvedValue(null),
            findFirstOrThrow: vi.fn().mockResolvedValue({
              id: 1,
              tenantId: 1,
              numero: 1,
              clienteId: 1,
              fecha: new Date('2026-06-01T12:00:00.000Z'),
              totalCobrado: new Decimal(100),
              concepto: null,
              estado: 'emitido',
              anulacionMotivo: null,
              usuarioId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              cliente: { id: 1, codigo: 1, rsocial: 'ACME SA', cuit: null },
              usuario: { id: 1, username: 'owner1' },
              formas: [
                {
                  id: 1,
                  reciboCobroId: 1,
                  tipo: 'efectivo',
                  importe: new Decimal(100),
                  chequeId: null,
                  referencia: null,
                  banco: null,
                  cheque: null,
                },
              ],
              imputaciones: [
                {
                  id: 1,
                  reciboCobroId: 1,
                  facturaId: 1,
                  importe: new Decimal(100),
                  saldoPrevio: new Decimal(121),
                  saldoPostPago: new Decimal(21),
                  factura: { id: 1, tipo: 'A', prefijo: 'A', numero: 1 },
                },
              ],
              retencionesAplicadas: [],
            }),
            create: vi.fn().mockResolvedValue({
              id: 1,
              tenantId: 1,
              numero: 1,
              clienteId: 1,
              fecha: new Date('2026-06-01T12:00:00.000Z'),
              totalCobrado: new Decimal(100),
              concepto: null,
              estado: 'emitido',
              anulacionMotivo: null,
              usuarioId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              cliente: { id: 1, codigo: 1, rsocial: 'ACME SA', cuit: null },
              usuario: { id: 1, username: 'owner1' },
              formas: [
                {
                  id: 1,
                  reciboCobroId: 1,
                  tipo: 'efectivo',
                  importe: new Decimal(100),
                  chequeId: null,
                  referencia: null,
                  banco: null,
                  cheque: null,
                },
              ],
              imputaciones: [
                {
                  id: 1,
                  reciboCobroId: 1,
                  facturaId: 1,
                  importe: new Decimal(100),
                  saldoPrevio: new Decimal(121),
                  saldoPostPago: new Decimal(21),
                  factura: { id: 1, tipo: 'A', prefijo: 'A', numero: 1 },
                },
              ],
              retencionesAplicadas: [],
            }),
            update: vi.fn().mockResolvedValue({
              id: 1,
              tenantId: 1,
              numero: 1,
              clienteId: 1,
              fecha: new Date('2026-06-01T12:00:00.000Z'),
              totalCobrado: new Decimal(100),
              concepto: null,
              estado: 'anulado',
              anulacionMotivo: 'Contract void test',
              usuarioId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              cliente: { id: 1, codigo: 1, rsocial: 'ACME SA', cuit: null },
              usuario: { id: 1, username: 'owner1' },
              formas: [],
              imputaciones: [],
              retencionesAplicadas: [],
            }),
          },
          cheque: { create: vi.fn(), findFirst: vi.fn().mockResolvedValue(null) },
          chequeMov: { create: vi.fn() },
          retencionConstanciaSequence: {
            findUnique: vi.fn().mockResolvedValue(null),
            upsert: vi.fn().mockResolvedValue({ lastNum: 1 }),
          },
          stockAjuste: {
            create: vi.fn().mockResolvedValue({
              id: 1,
              cantidad: -1,
              motivo: 'Test',
              createdAt: new Date(),
              user: { id: 1, username: 'owner1' },
            }),
          },
        }
        return arg(tx)
      }
      return arg
    }),
    $queryRaw: vi.fn().mockResolvedValue([]),
  } as unknown as PrismaClient

  return p
}

describe('API — contrato OpenAPI', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    prisma = buildPrisma()
  })

  afterEach(() => {
    delete process.env.BIZCODE_TEST_ROLE
    delete process.env.BIZCODE_TEST_AUTH_BYPASS
  })

  it('GET /api/health', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/health').expect(200)
    await assertMatchesOpenApi('/api/health', 'get', '200', res.body)
  })

  it('GET /api/metrics', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'auditor'
    process.env.METRICS_ENABLED = 'true'
    const app = createApp(prisma)
    const res = await request(app).get('/api/metrics').expect(200)
    await assertMatchesOpenApi('/api/metrics', 'get', '200', res.body)
  })

  it('GET /api/modules/catalog', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/modules/catalog').expect(200)
    await assertMatchesOpenApi('/api/modules/catalog', 'get', '200', res.body)
    expect(res.body.data.modules.length).toBeGreaterThanOrEqual(45)
  })

  it('GET /api/clientes', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes').expect(200)
    await assertMatchesOpenApi('/api/clientes', 'get', '200', res.body)
    expect(res.body).toMatchObject({
      success: true,
      total: 1,
      limit: 100,
      offset: 0,
      data: expect.any(Array),
    })
  })

  it('GET /api/clientes?q numérico (rama filtro en query OR)', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes').query({ q: '42' }).expect(200)
    await assertMatchesOpenApi('/api/clientes', 'get', '200', res.body)
    expect(res.body).toMatchObject({ total: 1, limit: 100, offset: 0 })
  })

  it('GET /api/clientes refleja limit y offset de query en la respuesta', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes').query({ limit: '25', offset: '7' }).expect(200)
    await assertMatchesOpenApi('/api/clientes', 'get', '200', res.body)
    expect(res.body).toMatchObject({ total: 1, limit: 25, offset: 7 })
  })

  it('GET /api/clientes/:id', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1').expect(200)
    await assertMatchesOpenApi('/api/clientes/{id}', 'get', '200', res.body)
  })

  it('POST /api/clientes', async () => {
    const app = createApp(prisma)
    const res = await request(app).post('/api/clientes').send(clienteInput).expect(200)
    await assertMatchesOpenApi('/api/clientes', 'post', '200', res.body)
  })

  it('POST /api/clientes/import', async () => {
    const app = createApp(prisma)
    const header =
      'codigo,rsocial,condIva,activo,fantasia,cuit,domicilio,localidad,cpost,telef,email,creditLimit,creditDays,suspended,deliveryZoneId'
    const row = '2001,Import Co SA,RI,true,,,,,,,,,0,false,'
    const res = await request(app)
      .post('/api/clientes/import')
      .attach('file', Buffer.from(`${header}\n${row}\n`, 'utf8'), 'clientes.csv')
      .expect(200)
    await assertMatchesOpenApi('/api/clientes/import', 'post', '200', res.body)
    expect(res.body.data.created).toBe(1)
    expect(res.body.data.skipped).toBe(0)
    expect(res.body.data.errors).toEqual([])
  })

  it('PUT /api/clientes/:id', async () => {
    const app = createApp(prisma)
    const res = await request(app).put('/api/clientes/1').send(clienteInput).expect(200)
    await assertMatchesOpenApi('/api/clientes/{id}', 'put', '200', res.body)
  })

  it('GET /api/articulos', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos').expect(200)
    await assertMatchesOpenApi('/api/articulos', 'get', '200', res.body)
  })

  it('GET /api/articulos?q numérico (rama filtro en query OR)', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos').query({ q: '7' }).expect(200)
    await assertMatchesOpenApi('/api/articulos', 'get', '200', res.body)
  })

  it('GET /api/articulos/:id', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos/1').expect(200)
    await assertMatchesOpenApi('/api/articulos/{id}', 'get', '200', res.body)
  })

  it('POST /api/articulos', async () => {
    const app = createApp(prisma)
    const res = await request(app).post('/api/articulos').send(articuloInput).expect(200)
    await assertMatchesOpenApi('/api/articulos', 'post', '200', res.body)
  })

  it('PUT /api/articulos/:id', async () => {
    const app = createApp(prisma)
    const res = await request(app).put('/api/articulos/1').send(articuloInput).expect(200)
    await assertMatchesOpenApi('/api/articulos/{id}', 'put', '200', res.body)
  })

  it('GET /api/articulos/:id/stock-historial', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    ;(prisma.stockAjuste.count as ReturnType<typeof vi.fn>).mockResolvedValueOnce(1)
    ;(prisma.stockAjuste.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: 1,
        cantidad: -2,
        motivo: 'Merma',
        createdAt: new Date('2026-05-18T12:00:00.000Z'),
        user: { id: 1, username: 'owner1' },
      },
    ])
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos/1/stock-historial').expect(200)
    await assertMatchesOpenApi('/api/articulos/{id}/stock-historial', 'get', '200', res.body)
  })

  it('POST /api/articulos/:id/stock-ajuste', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    // Ownership middleware + StockAjusteService both call findFirst (#215).
    ;(prisma.articulo.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...articuloRow,
      stock: 10,
      minimo: 0,
      controlLote: false,
    })
    const articuloUpdate = vi.fn().mockResolvedValue({ ...articuloRow, stock: 9 })
    prisma.$transaction = vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return arg({
          articulo: { update: articuloUpdate },
          stockAjuste: {
            create: vi.fn().mockResolvedValue({
              id: 1,
              cantidad: -1,
              motivo: 'Test',
              createdAt: new Date('2026-05-18T12:00:00.000Z'),
              user: { id: 1, username: 'owner1' },
            }),
          },
        })
      }
      return arg
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/articulos/1/stock-ajuste')
      .send({ cantidad: -1, motivo: 'Test' })
      .expect(200)
    await assertMatchesOpenApi('/api/articulos/{id}/stock-ajuste', 'post', '200', res.body)
  })

  it('GET /api/rubros', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/rubros').expect(200)
    await assertMatchesOpenApi('/api/rubros', 'get', '200', res.body)
  })

  it('POST /api/rubros', async () => {
    const app = createApp(prisma)
    const res = await request(app).post('/api/rubros').send({ codigo: 1, nombre: 'X' }).expect(200)
    await assertMatchesOpenApi('/api/rubros', 'post', '200', res.body)
  })

  it('POST /api/rubros/import', async () => {
    const app = createApp(prisma)
    const header = 'codigo,nombre'
    const row = '55,Contract rubro nm'
    const res = await request(app)
      .post('/api/rubros/import')
      .attach('file', Buffer.from(`${header}\n${row}\n`, 'utf8'), 'rubros.csv')
      .expect(200)
    await assertMatchesOpenApi('/api/rubros/import', 'post', '200', res.body)
    expect(res.body.data.created).toBe(1)
  })

  it('POST /api/articulos/import', async () => {
    const app = createApp(prisma)
    const header =
      'codigo,descripcion,rubroCodigo,condIva,umedida,precioLista1,precioLista2,costo,stock,minimo,activo'
    const row = '888,Contract articulo,1,1,UN,10,10,5,0,0,true'
    const res = await request(app)
      .post('/api/articulos/import')
      .attach('file', Buffer.from(`${header}\n${row}\n`, 'utf8'), 'art.csv')
      .expect(200)
    await assertMatchesOpenApi('/api/articulos/import', 'post', '200', res.body)
    expect(res.body.data.created).toBe(1)
  })

  it('GET /api/proveedores', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores').expect(200)
    await assertMatchesOpenApi('/api/proveedores', 'get', '200', res.body)
  })

  it('GET /api/proveedores/{id}', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1').expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}', 'get', '200', res.body)
  })

  it('POST /api/proveedores', async () => {
    const app = createApp(prisma)
    const res = await request(app).post('/api/proveedores').send(proveedorInput).expect(200)
    await assertMatchesOpenApi('/api/proveedores', 'post', '200', res.body)
  })

  it('PUT /api/proveedores/{id}', async () => {
    const app = createApp(prisma)
    const res = await request(app).put('/api/proveedores/1').send(proveedorInput).expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}', 'put', '200', res.body)
  })

  it('GET /api/proveedores/{id}/cuenta-corriente', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1/cuenta-corriente').expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}/cuenta-corriente', 'get', '200', res.body)
    expect(res.body.data.serie).toHaveLength(6)
  })

  it('GET /api/proveedores/{id}/cuenta-corriente/saldo', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1/cuenta-corriente/saldo').expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}/cuenta-corriente/saldo', 'get', '200', res.body)
  })

  it('POST /api/proveedores/{id}/cuenta-corriente/ajuste', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/proveedores/1/cuenta-corriente/ajuste')
      .send({ monto: -10, motivo: 'Contract test adjustment' })
      .expect(201)
    await assertMatchesOpenApi('/api/proveedores/{id}/cuenta-corriente/ajuste', 'post', '201', res.body)
  })

  it('GET /api/clientes/{id}/cuenta-corriente', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/cuenta-corriente').expect(200)
    await assertMatchesOpenApi('/api/clientes/{id}/cuenta-corriente', 'get', '200', res.body)
    expect(res.body.data.serie).toHaveLength(6)
  })

  it('GET /api/clientes/{id}/cuenta-corriente/saldo', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/cuenta-corriente/saldo').expect(200)
    await assertMatchesOpenApi('/api/clientes/{id}/cuenta-corriente/saldo', 'get', '200', res.body)
  })

  it('GET /api/clientes/{id}/cuenta-corriente/antiguedad', async () => {
    vi.mocked(prisma.cliente.findFirst).mockResolvedValueOnce({
      ...clienteRow,
      creditDays: 30,
    } as never)
    vi.mocked(prisma.factura.findMany).mockResolvedValueOnce([
      {
        id: 1,
        total: new Decimal(121),
        fecha: new Date('2026-01-01'),
      },
    ] as never)
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/cuenta-corriente/antiguedad').expect(200)
    await assertMatchesOpenApi('/api/clientes/{id}/cuenta-corriente/antiguedad', 'get', '200', res.body)
  })

  it('POST /api/clientes/{id}/cuenta-corriente/ajuste', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/clientes/1/cuenta-corriente/ajuste')
      .send({ monto: -10, motivo: 'Contract test adjustment' })
      .expect(201)
    await assertMatchesOpenApi('/api/clientes/{id}/cuenta-corriente/ajuste', 'post', '201', res.body)
  })

  it('GET /api/clientes/{id}/cuenta-corriente/estado-de-cuenta/pdf returns application/pdf', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/clientes/1/cuenta-corriente/estado-de-cuenta/pdf')
      .expect(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
  })

  it('GET /api/clientes/{id}/facturas-pendientes', async () => {
    vi.mocked(prisma.factura.findMany).mockResolvedValueOnce([
      {
        id: 1,
        tenantId: 1,
        clienteId: 1,
        fecha: new Date('2026-05-10T12:00:00.000Z'),
        tipo: 'A',
        prefijo: 'A',
        numero: 1,
        total: new Decimal(121),
        estado: 'A',
      },
    ] as never)
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/facturas-pendientes').expect(200)
    await assertMatchesOpenApi('/api/clientes/{id}/facturas-pendientes', 'get', '200', res.body)
  })

  it('GET /api/clientes/{id}/recibos', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/recibos').expect(200)
    await assertMatchesOpenApi('/api/clientes/{id}/recibos', 'get', '200', res.body)
  })

  it('POST /api/clientes/{id}/recibos', async () => {
    vi.mocked(prisma.factura.findMany).mockResolvedValue([
      {
        id: 1,
        tenantId: 1,
        clienteId: 1,
        fecha: new Date('2026-05-10T12:00:00.000Z'),
        tipo: 'A',
        prefijo: 'A',
        numero: 1,
        total: new Decimal(121),
        estado: 'A',
      },
    ] as never)
    vi.mocked(prisma.cliente.findFirst).mockResolvedValue({
      ...clienteRow,
      creditDays: 30,
      score: 50,
    } as never)
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/clientes/1/recibos')
      .send({
        fecha: '2026-06-01',
        totalCobrado: 100,
        fifo: true,
        formas: [{ tipo: 'efectivo', importe: 100 }],
      })
      .expect(201)
    await assertMatchesOpenApi('/api/clientes/{id}/recibos', 'post', '201', res.body)
  })

  it('POST /api/clientes/{id}/recibos/{reciboId}/anular', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/clientes/1/recibos/1/anular')
      .send({ anulacionMotivo: 'Contract void test' })
      .expect(200)
    await assertMatchesOpenApi('/api/clientes/{id}/recibos/{reciboId}/anular', 'post', '200', res.body)
  })

  it('GET /api/clientes/{id}/recibos/{reciboId}/pdf returns application/pdf', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/recibos/1/pdf').expect(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
  })

  it('POST /api/clientes/{id}/cuenta-corriente/estado-de-cuenta/enviar', async () => {
    vi.mocked(prisma.cliente.findFirst).mockResolvedValueOnce({
      ...clienteRow,
      email: 'cliente@example.com',
    } as never)
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/clientes/1/cuenta-corriente/estado-de-cuenta/enviar')
      .send({ email: 'cliente@example.com' })
      .expect(200)
    await assertMatchesOpenApi(
      '/api/clientes/{id}/cuenta-corriente/estado-de-cuenta/enviar',
      'post',
      '200',
      res.body,
    )
  })

  it('GET /api/proveedores/{id}/historial', async () => {
    vi.mocked(prisma.comprobanteCompra.findMany).mockResolvedValueOnce([
      {
        id: 1,
        fecha: new Date('2026-06-01'),
        tipo: 'B',
        prefijo: '0001',
        numero: 1,
        total: new Decimal(100),
        ordenCompraId: null,
      },
    ] as never)
    vi.mocked(prisma.ordenCompra.findMany).mockResolvedValue([])
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1/historial?dias=90').expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}/historial', 'get', '200', res.body)
  })

  it('GET /api/proveedores/{id}/articulos', async () => {
    vi.mocked(prisma.ordenCompra.findMany).mockResolvedValueOnce([
      {
        updatedAt: new Date('2026-06-05'),
        items: [
          {
            cantidadRecibida: 2,
            costoUnitario: new Decimal(50),
            articulo: { id: 1, codigo: 100, descripcion: 'Item A' },
          },
        ],
      },
    ] as never)
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1/articulos?dias=30').expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}/articulos', 'get', '200', res.body)
  })

  it('GET /api/articulos/{id}/proveedores', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos/1/proveedores').expect(200)
    await assertMatchesOpenApi('/api/articulos/{id}/proveedores', 'get', '200', res.body)
    expect(res.body.data.proveedores).toHaveLength(1)
  })

  it('GET /api/proveedores/comparar', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/comparar?articuloId=1').expect(200)
    await assertMatchesOpenApi('/api/proveedores/comparar', 'get', '200', res.body)
    expect(res.body.data.proveedorMasBaratoId).toBe(1)
  })

  it('GET /api/proveedores/{id}/catalogo', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1/catalogo').expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}/catalogo', 'get', '200', res.body)
    expect(res.body.data.items).toHaveLength(1)
  })

  it('POST /api/proveedores/{id}/catalogo', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/proveedores/1/catalogo')
      .send({
        articuloId: 1,
        codigoProveedor: 'AG-1000',
        precioLista: 1250,
      })
      .expect(201)
    await assertMatchesOpenApi('/api/proveedores/{id}/catalogo', 'post', '201', res.body)
  })

  it('PUT /api/proveedores/{id}/catalogo/{articuloId}', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .put('/api/proveedores/1/catalogo/1')
      .send({ precioLista: 1300 })
      .expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}/catalogo/{articuloId}', 'put', '200', res.body)
  })

  it('GET /api/proveedores/{id}/pagos/comprobantes-pendientes', async () => {
    vi.mocked(prisma.comprobanteCompra.findMany).mockResolvedValueOnce([
      {
        id: 1,
        tenantId: 1,
        proveedorId: 1,
        ordenCompraId: null,
        fecha: new Date('2026-05-10T12:00:00.000Z'),
        tipo: 'B',
        prefijo: '0001',
        numero: 1,
        neto1: new Decimal(100),
        neto2: new Decimal(0),
        neto3: new Decimal(0),
        iva1: new Decimal(21),
        iva2: new Decimal(0),
        total: new Decimal(121),
        cae: null,
        caeVto: null,
        estado: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as never)
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/proveedores/1/pagos/comprobantes-pendientes')
      .expect(200)
    await assertMatchesOpenApi(
      '/api/proveedores/{id}/pagos/comprobantes-pendientes',
      'get',
      '200',
      res.body,
    )
  })

  it('GET /api/proveedores/{id}/pagos', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1/pagos').expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}/pagos', 'get', '200', res.body)
  })

  it('POST /api/proveedores/{id}/pagos', async () => {
    vi.mocked(prisma.comprobanteCompra.findMany).mockResolvedValueOnce([
      {
        id: 1,
        tenantId: 1,
        proveedorId: 1,
        ordenCompraId: null,
        fecha: new Date('2026-05-10T12:00:00.000Z'),
        tipo: 'B',
        prefijo: '0001',
        numero: 1,
        neto1: new Decimal(100),
        neto2: new Decimal(0),
        neto3: new Decimal(0),
        iva1: new Decimal(21),
        iva2: new Decimal(0),
        total: new Decimal(121),
        cae: null,
        caeVto: null,
        estado: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as never)
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/proveedores/1/pagos')
      .send({
        fecha: '2026-06-01',
        total: 100,
        metodoPago: 'transferencia',
        facturas: [{ comprobanteCompraId: 1, facturaRef: 'B-0001-1', monto: 100 }],
      })
      .expect(201)
    await assertMatchesOpenApi('/api/proveedores/{id}/pagos', 'post', '201', res.body)
  })

  it('POST /api/proveedores/{id}/pagos/{reciboId}/anular', async () => {
    const app = createApp(prisma)
    const res = await request(app).post('/api/proveedores/1/pagos/1/anular').expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}/pagos/{reciboId}/anular', 'post', '200', res.body)
  })

  it('POST /api/proveedores/import', async () => {
    const app = createApp(prisma)
    const header = 'codigo,rsocial,condIva,activo,fantasia,cuit,telef,email'
    const row = '5100,Contract CSV SA,RI,true,,,,'
    const res = await request(app)
      .post('/api/proveedores/import')
      .attach('file', Buffer.from(`${header}\n${row}\n`, 'utf8'), 'prov.csv')
      .expect(200)
    await assertMatchesOpenApi('/api/proveedores/import', 'post', '200', res.body)
    expect(res.body.data.created).toBe(1)
  })

  it('GET /api/formas-pago', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/formas-pago').expect(200)
    await assertMatchesOpenApi('/api/formas-pago', 'get', '200', res.body)
  })

  it('GET /api/notas-credito', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/notas-credito')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(200)
    await assertMatchesOpenApi('/api/notas-credito', 'get', '200', res.body)
    expect(res.body).toMatchObject({ success: true, total: 0, data: [] })
  })

  it('GET /api/notas-credito with rows', async () => {
    vi.mocked(prisma.notaCredito.count).mockResolvedValue(1)
    vi.mocked(prisma.notaCredito.findMany).mockResolvedValue([notaCreditoContractRow] as never)
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/notas-credito')
      .query({ from: '2025-01-01', to: '2025-12-31' })
      .expect(200)
    await assertMatchesOpenApi('/api/notas-credito', 'get', '200', res.body)
    expect(res.body.data).toHaveLength(1)
  })

  it('GET /api/notas-credito/{id} — 404', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/notas-credito/999').expect(404)
    await assertMatchesOpenApi('/api/notas-credito/{id}', 'get', '404', res.body)
  })

  it('GET /api/notas-credito/{id}', async () => {
    vi.mocked(prisma.notaCredito.findFirst).mockResolvedValue(notaCreditoContractRow as never)
    const app = createApp(prisma)
    const res = await request(app).get('/api/notas-credito/1').expect(200)
    await assertMatchesOpenApi('/api/notas-credito/{id}', 'get', '200', res.body)
    expect(res.body.data.id).toBe(1)
  })

  it('GET /api/contabilidad/libro-iva-ventas preview', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/contabilidad/libro-iva-ventas')
      .query({ periodo: '2026-05', format: 'preview' })
      .expect(200)
    await assertMatchesOpenApi('/api/contabilidad/libro-iva-ventas', 'get', '200', res.body)
    expect(res.body.data.periodo).toBe('2026-05')
  })

  it('GET /api/contabilidad/libro-iva-compras preview', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/contabilidad/libro-iva-compras')
      .query({ periodo: '2026-05', format: 'preview' })
      .expect(200)
    await assertMatchesOpenApi('/api/contabilidad/libro-iva-compras', 'get', '200', res.body)
    expect(res.body.data.periodo).toBe('2026-05')
  })

  it('GET /api/documentos-compra/verificar-duplicado', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/documentos-compra/verificar-duplicado')
      .query({ proveedorId: 1, tipo: 'B', prefijo: '0001', numero: 7 })
      .expect(200)
    await assertMatchesOpenApi('/api/documentos-compra/verificar-duplicado', 'get', '200', res.body)
    expect(res.body.data.duplicado).toBe(false)
  })

  it('GET /api/documentos-compra/cola', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/documentos-compra/cola').expect(200)
    await assertMatchesOpenApi('/api/documentos-compra/cola', 'get', '200', res.body)
    expect(res.body.data.procesando).toBe(0)
  })

  it('GET /api/fiscal/regimenes', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/fiscal/regimenes').expect(200)
    await assertMatchesOpenApi('/api/fiscal/regimenes', 'get', '200', res.body)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('POST /api/fiscal/regimenes', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/fiscal/regimenes')
      .send({
        tipo: 'ganancias',
        subtipo: 'retencion',
        nombre: 'Ganancias servicios',
        alicuota: 4.5,
      })
      .expect(201)
    await assertMatchesOpenApi('/api/fiscal/regimenes', 'post', '201', res.body)
    expect(res.body.data.id).toBe(1)
  })

  it('GET /api/fiscal/config-retenciones', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/fiscal/config-retenciones').expect(200)
    await assertMatchesOpenApi('/api/fiscal/config-retenciones', 'get', '200', res.body)
    expect(res.body.data.esAgenteRetencionGanancias).toBe(false)
  })

  it('GET /api/fiscal/retenciones', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/fiscal/retenciones').expect(200)
    await assertMatchesOpenApi('/api/fiscal/retenciones', 'get', '200', res.body)
    expect(res.body.total).toBe(0)
  })

  it('GET /api/fiscal/retenciones/preview', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/fiscal/retenciones/preview')
      .query({ entidadTipo: 'proveedor', entidadId: 1, monto: 1000 })
      .expect(200)
    await assertMatchesOpenApi('/api/fiscal/retenciones/preview', 'get', '200', res.body)
  })

  it('GET /api/proveedores/{id}/pagos/{reciboId}/retenciones', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1/pagos/1/retenciones').expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}/pagos/{reciboId}/retenciones', 'get', '200', res.body)
  })

  it('GET /api/remitos', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/remitos').expect(200)
    await assertMatchesOpenApi('/api/remitos', 'get', '200', res.body)
  })

  it('GET /api/cheques', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/cheques').expect(200)
    await assertMatchesOpenApi('/api/cheques', 'get', '200', res.body)
  })

  it('GET /api/cheques/resumen', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/cheques/resumen').expect(200)
    await assertMatchesOpenApi('/api/cheques/resumen', 'get', '200', res.body)
  })

  it('GET /api/cobros/{id}/retenciones', async () => {
    vi.mocked(prisma.cobro.findFirst).mockResolvedValueOnce({ id: 1, tenantId: 1 } as never)
    vi.mocked(prisma.retencionAplicada.findMany).mockResolvedValueOnce([])
    const app = createApp(prisma)
    const res = await request(app).get('/api/cobros/1/retenciones').expect(200)
    await assertMatchesOpenApi('/api/cobros/{id}/retenciones', 'get', '200', res.body)
  })

  it('GET /api/cobros/transfer-info', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/cobros/transfer-info')
      .set('x-bizcode-channel', 'field')
      .expect(200)
    await assertMatchesOpenApi('/api/cobros/transfer-info', 'get', '200', res.body)
    expect(res.body).toEqual({ success: true, data: null })
  })

  it('GET /api/fiscal/retenciones/export returns text/plain', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/fiscal/retenciones/export?format=sicore').expect(200)
    expect(res.headers['content-type']).toMatch(/text\/plain/)
  })

  it('GET /api/fiscal/presentaciones/preview', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/fiscal/presentaciones/preview?formato=sicore&periodo=2026-06')
      .expect(200)
    await assertMatchesOpenApi('/api/fiscal/presentaciones/preview', 'get', '200', res.body)
  })

  it('GET /api/fiscal/presentaciones', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/fiscal/presentaciones').expect(200)
    await assertMatchesOpenApi('/api/fiscal/presentaciones', 'get', '200', res.body)
  })

  it('GET /api/fiscal/retenciones/{id}/comprobante/pdf returns application/pdf', async () => {
    vi.mocked(prisma.retencionAplicada.findFirst).mockResolvedValueOnce({
      id: 1,
      tenantId: 1,
      regimenId: 1,
      tipo: 'retencion',
      entidadTipo: 'proveedor',
      entidadId: 1,
      facturaId: null,
      cobroId: null,
      reciboPagoId: 1,
      baseImponible: new Decimal(100),
      alicuota: new Decimal(4.5),
      importe: new Decimal(4.5),
      constanciaNum: 'ganancias-00001',
      createdAt: new Date(),
      regimen: { nombre: 'Ganancias', tipo: 'ganancias' },
      reciboPago: { fecha: new Date(), proveedorId: 1, estado: 'emitido' },
    } as never)
    vi.mocked(prisma.proveedor.findFirst).mockResolvedValueOnce({
      ...proveedorRow,
      rsocial: 'Proveedor API SA',
      cuit: '30-12345678-9',
    } as never)
    const app = createApp(prisma)
    const res = await request(app).get('/api/fiscal/retenciones/1/comprobante/pdf').expect(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
    expect(res.body.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('GET /api/documentos-compra/templates', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/documentos-compra/templates').expect(200)
    await assertMatchesOpenApi('/api/documentos-compra/templates', 'get', '200', res.body)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('POST /api/documentos-compra/templates', async () => {
    const app = createApp(prisma)
    const yaml =
      'issuer: test-contract-template\nkeywords:\n  - FACTURA\nfields:\n  vat_id:\n    regex: "([0-9]{11})"\n'
    const res = await request(app)
      .post('/api/documentos-compra/templates')
      .send({ content: yaml })
      .expect(201)
    await assertMatchesOpenApi('/api/documentos-compra/templates', 'post', '201', res.body)
    expect(res.body.data.issuer).toBe('test-contract-template')
  })

  it('POST /api/documentos-compra/procesar-lote', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/documentos-compra/procesar-lote')
      .attach('files', Buffer.from('%PDF-1.4'), { filename: 'a.pdf', contentType: 'application/pdf' })
      .attach('files', Buffer.from('%PDF-1.4'), { filename: 'b.pdf', contentType: 'application/pdf' })
      .expect(201)
    await assertMatchesOpenApi('/api/documentos-compra/procesar-lote', 'post', '201', res.body)
    expect(res.body.data).toHaveLength(2)
  })

  it('POST /api/documentos-compra/confirmar', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/documentos-compra/confirmar')
      .send({
        documentoId: 1,
        fecha: '2026-05-10T12:00:00.000Z',
        tipo: 'B',
        prefijo: '0001',
        numero: 2,
        proveedorId: 1,
        neto1: 100,
        neto2: 0,
        neto3: 0,
        iva1: 21,
        iva2: 0,
        total: 121,
      })
      .expect(201)
    await assertMatchesOpenApi('/api/documentos-compra/confirmar', 'post', '201', res.body)
  })

  it('POST /api/comprobantes-compra', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/comprobantes-compra')
      .send({
        fecha: '2026-05-10T12:00:00.000Z',
        tipo: 'B',
        prefijo: '0001',
        numero: 1,
        proveedorId: 1,
        neto1: 100,
        neto2: 0,
        neto3: 0,
        iva1: 21,
        iva2: 0,
        total: 121,
      })
      .expect(201)
    await assertMatchesOpenApi('/api/comprobantes-compra', 'post', '201', res.body)
    expect(res.body.data.id).toBe(1)
  })

  it('GET /api/facturas', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/facturas').expect(200)
    await assertMatchesOpenApi('/api/facturas', 'get', '200', res.body)
  })

  it('POST /api/facturas', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/facturas')
      .send({
        fecha: '2025-01-15',
        tipo: 'A',
        prefijo: 'A',
        numero: 1,
        clienteId: 1,
        neto1: 100,
        neto2: 0,
        neto3: 0,
        iva1: 21,
        iva2: 0,
        total: 121,
        items: [
          {
            articuloId: 1,
            cantidad: 1,
            precio: 100,
            dscto: 0,
            subtotal: 100,
          },
        ],
      })
      .expect(200)
    await assertMatchesOpenApi('/api/facturas', 'post', '200', res.body)
  })

  it('GET /api/arca/config', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const p = buildPrisma()
    vi.mocked(p.tenantFiscalConfig.findUnique).mockResolvedValue({
      cuit: '20123456789',
      ambiente: 'homologacion',
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/arca/config').expect(200)
    await assertMatchesOpenApi('/api/arca/config', 'get', '200', res.body)
  })

  it('GET /api/facturas/:id/pdf/preview returns application/pdf', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const p = buildPrisma()
    vi.mocked(p.factura.findFirst).mockResolvedValue({
      id: 1,
      tipo: 'A',
      prefijo: '0001',
      numero: 1,
      fecha: new Date('2025-01-15T12:00:00.000Z'),
      total: 121,
      neto1: 100,
      neto2: 0,
      neto3: 0,
      iva1: 21,
      iva2: 0,
      estadoCae: 'pending',
      cae: null,
      caeVto: null,
      cliente: { rsocial: 'ACME SA', cuit: null, domicilio: null, condIva: 'CF' },
      items: [],
    } as never)
    vi.mocked(p.paramEmpresa.findUnique).mockResolvedValue({
      nombre: 'Demo',
      cuit: '30-12345678-9',
      domicilio: null,
      condicionIva: 'RI',
      ingresosBrutos: null,
      fechaInicioActividades: null,
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/facturas/1/pdf/preview').expect(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
    expect(res.body.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('POST /api/facturas/:id/print', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const p = buildPrisma()
    vi.mocked(p.factura.findFirst).mockResolvedValue({
      id: 7,
      tipo: 'B',
      prefijo: '0001',
      numero: 77,
      total: 1200,
    } as never)
    const app = createApp(p)
    const res = await request(app).post('/api/facturas/7/print').send({ device: 'thermal' }).expect(200)
    await assertMatchesOpenApi('/api/facturas/{id}/print', 'post', '200', res.body)
  })

  it('GET /api/facturas/:id/mp', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    const p = buildPrisma()
    vi.mocked(p.tenantConfig.findUnique).mockResolvedValue({
      tenantId: 1,
      businessType: 'mayorista',
      rubros: [],
      plan: 'pro',
      modules: [],
      integrations: ['mercadopago'],
      updatedAt: new Date(),
    } as never)
    vi.mocked(p.mercadoPagoConfig.findUnique).mockResolvedValue({
      activo: true,
      sandboxMode: true,
      accessTokenEncrypted: encryptFiscalSecret('token'),
    } as never)
    vi.mocked(p.factura.findFirst).mockResolvedValue({
      id: 7,
      clienteId: 1,
      tipo: 'B',
      prefijo: '0001',
      numero: 77,
      total: new Decimal('1200'),
      mpPreferenceId: null,
      mpPaymentLink: null,
      mpEstado: null,
      mpPagadoAt: null,
      mpPreferenceExpiresAt: null,
      mpQrData: null,
      mpQrOrderId: null,
      mpQrExpiresAt: null,
    } as never)
    vi.mocked(p.reciboCobroImputacion.groupBy).mockResolvedValue([])
    const app = createApp(p)
    const res = await request(app).get('/api/facturas/7/mp').expect(200)
    await assertMatchesOpenApi('/api/facturas/{id}/mp', 'get', '200', res.body)
  })

  it('POST /api/facturas/:id/mp/preference', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    vi.mocked(createMercadoPagoPreference).mockResolvedValue({
      id: 'pref-contract',
      init_point: 'https://mp.test/prod',
      sandbox_init_point: 'https://mp.test/pay',
    })
    const p = buildPrisma()
    vi.mocked(p.tenantConfig.findUnique).mockResolvedValue({
      tenantId: 1,
      businessType: 'mayorista',
      rubros: [],
      plan: 'pro',
      modules: [],
      integrations: ['mercadopago'],
      updatedAt: new Date(),
    } as never)
    vi.mocked(p.mercadoPagoConfig.findUnique).mockResolvedValue({
      activo: true,
      sandboxMode: true,
      accessTokenEncrypted: encryptFiscalSecret('token'),
    } as never)
    vi.mocked(p.factura.findFirst).mockResolvedValue({
      id: 7,
      tenantId: 1,
      clienteId: 1,
      tipo: 'B',
      prefijo: '0001',
      numero: 77,
      total: new Decimal('1200'),
      estado: 'A',
      mpPreferenceId: null,
      mpPaymentLink: null,
      mpEstado: null,
      mpPagadoAt: null,
      mpPreferenceExpiresAt: null,
      cliente: { rsocial: 'ACME SA' },
    } as never)
    vi.mocked(p.factura.update).mockResolvedValue({
      tipo: 'B',
      prefijo: '0001',
      numero: 77,
      mpPreferenceId: 'pref-contract',
      mpPaymentLink: 'https://mp.test/pay',
      mpEstado: 'pending',
      mpPagadoAt: null,
      mpPreferenceExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      mpQrData: null,
      mpQrOrderId: null,
      mpQrExpiresAt: null,
    } as never)
    vi.mocked(p.reciboCobroImputacion.groupBy).mockResolvedValue([])
    const app = createApp(p)
    const res = await request(app).post('/api/facturas/7/mp/preference').expect(201)
    await assertMatchesOpenApi('/api/facturas/{id}/mp/preference', 'post', '201', res.body)
  })

  it('POST /api/facturas/:id/mp/qr', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    vi.mocked(createMercadoPagoInstoreQr).mockResolvedValue({
      qr_data: '000201010212',
      in_store_order_id: 'order-contract',
    })
    const p = buildPrisma()
    vi.mocked(p.tenantConfig.findUnique).mockResolvedValue({
      tenantId: 1,
      businessType: 'mayorista',
      rubros: [],
      plan: 'pro',
      modules: [],
      integrations: ['mercadopago'],
      updatedAt: new Date(),
    } as never)
    vi.mocked(p.mercadoPagoConfig.findUnique).mockResolvedValue({
      activo: true,
      sandboxMode: true,
      accessTokenEncrypted: encryptFiscalSecret('token'),
      collectorId: '12345',
      externalPosId: 'pos-demo',
    } as never)
    vi.mocked(p.factura.findFirst).mockResolvedValue({
      id: 7,
      tenantId: 1,
      clienteId: 1,
      tipo: 'B',
      prefijo: '0001',
      numero: 77,
      total: new Decimal('1200'),
      estado: 'A',
      mpPreferenceId: null,
      mpPaymentLink: null,
      mpEstado: null,
      mpPagadoAt: null,
      mpPreferenceExpiresAt: null,
      mpQrData: null,
      mpQrOrderId: null,
      mpQrExpiresAt: null,
      cliente: { rsocial: 'ACME SA' },
    } as never)
    vi.mocked(p.factura.update).mockResolvedValue({
      tipo: 'B',
      prefijo: '0001',
      numero: 77,
      mpPreferenceId: null,
      mpPaymentLink: null,
      mpEstado: 'pending',
      mpPagadoAt: null,
      mpPreferenceExpiresAt: null,
      mpQrData: '000201010212',
      mpQrOrderId: 'order-contract',
      mpQrExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    } as never)
    vi.mocked(p.reciboCobroImputacion.groupBy).mockResolvedValue([])
    const app = createApp(p)
    const res = await request(app).post('/api/facturas/7/mp/qr').expect(201)
    await assertMatchesOpenApi('/api/facturas/{id}/mp/qr', 'post', '201', res.body)
  })

  it('GET /api/configuracion/mercadopago/qr-estatico', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    const p = buildPrisma()
    vi.mocked(p.tenantConfig.findUnique).mockResolvedValue({
      tenantId: 1,
      businessType: 'mayorista',
      rubros: [],
      plan: 'pro',
      modules: [],
      integrations: ['mercadopago'],
      updatedAt: new Date(),
    } as never)
    vi.mocked(p.mercadoPagoConfig.findUnique).mockResolvedValue({
      activo: true,
      staticQrData: '000201010212',
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/configuracion/mercadopago/qr-estatico').expect(200)
    await assertMatchesOpenApi('/api/configuracion/mercadopago/qr-estatico', 'get', '200', res.body)
  })

  it('GET /api/mercadopago/pagos-sin-reconciliar', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    const p = buildPrisma()
    vi.mocked(p.tenantConfig.findUnique).mockResolvedValue({
      tenantId: 1,
      businessType: 'mayorista',
      rubros: [],
      plan: 'pro',
      modules: [],
      integrations: ['mercadopago'],
      updatedAt: new Date(),
    } as never)
    vi.mocked(p.mercadoPagoReconciliationEntry.findMany).mockResolvedValue([
      {
        mpPaymentId: '9001',
        transactionAmount: new Decimal('1500.00'),
        currencyId: 'ARS',
        paymentDate: new Date('2026-06-10T12:00:00.000Z'),
        payerName: 'Juan Perez',
        payerEmail: 'payer@example.com',
        payerIdentification: '20123456789',
        preferenceId: null,
        externalReference: null,
        createdAt: new Date('2026-06-10T12:00:00.000Z'),
      },
    ] as never)
    const app = createApp(p)
    const res = await request(app).get('/api/mercadopago/pagos-sin-reconciliar').expect(200)
    await assertMatchesOpenApi('/api/mercadopago/pagos-sin-reconciliar', 'get', '200', res.body)
  })

  it('POST /api/mercadopago/reconciliacion/run', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    const p = buildPrisma()
    vi.mocked(p.tenantConfig.findUnique).mockResolvedValue({
      tenantId: 1,
      businessType: 'mayorista',
      rubros: [],
      plan: 'pro',
      modules: [],
      integrations: ['mercadopago'],
      updatedAt: new Date(),
    } as never)
    vi.mocked(p.mercadoPagoConfig.findUnique).mockResolvedValue({
      activo: true,
      accessTokenEncrypted: encryptFiscalSecret('TEST-access-token'),
    } as never)
    vi.mocked(p.paramEmpresa.findUnique).mockResolvedValue({
      timezone: 'America/Argentina/Buenos_Aires',
    } as never)
    const app = createApp(p)
    const res = await request(app).post('/api/mercadopago/reconciliacion/run').expect(200)
    await assertMatchesOpenApi('/api/mercadopago/reconciliacion/run', 'post', '200', res.body)
  })

  it('POST /api/mercadopago/ignorar', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    const p = buildPrisma()
    vi.mocked(p.tenantConfig.findUnique).mockResolvedValue({
      tenantId: 1,
      businessType: 'mayorista',
      rubros: [],
      plan: 'pro',
      modules: [],
      integrations: ['mercadopago'],
      updatedAt: new Date(),
    } as never)
    vi.mocked(p.mercadoPagoReconciliationEntry.findUnique).mockResolvedValue({
      mpPaymentId: '9001',
      estado: 'pending',
      transactionAmount: new Decimal('1500.00'),
      currencyId: 'ARS',
      paymentDate: new Date('2026-06-10T12:00:00.000Z'),
      payerName: 'Juan Perez',
      payerEmail: 'payer@example.com',
      payerIdentification: '20123456789',
      preferenceId: null,
      externalReference: null,
      createdAt: new Date('2026-06-10T12:00:00.000Z'),
    } as never)
    const app = createApp(p)
    const res = await request(app)
      .post('/api/mercadopago/ignorar')
      .send({ mpPaymentId: '9001' })
      .expect(200)
    await assertMatchesOpenApi('/api/mercadopago/ignorar', 'post', '200', res.body)
  })

  it('POST /api/webhooks/mercadopago returns 400 for invalid signature', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app)
      .post('/api/webhooks/mercadopago')
      .set('x-signature', 'ts=1,v1=bad')
      .set('x-request-id', 'req-contract-1')
      .query({ 'data.id': '12345678' })
      .send({ type: 'payment', data: { id: '12345678' } })
      .expect(400)
    await assertMatchesOpenApi('/api/webhooks/mercadopago', 'post', '400', res.body)
  })

  it('POST /api/webhooks/mercadopago returns 200 for valid signature', async () => {
    const secret = 'whsec-contract'
    const paymentId = '12345678'
    const requestId = 'req-contract-2'
    const ts = '1704908010'
    const manifest = buildMercadoPagoSignatureManifest(paymentId, requestId, ts)
    const v1 = computeMercadoPagoSignatureHmac(secret, manifest)
    const p = buildPrisma()
    vi.mocked(p.mercadoPagoConfig.findMany).mockResolvedValue([
      {
        tenantId: 1,
        webhookSecretEncrypted: encryptFiscalSecret(secret),
      },
    ] as never)
    const app = createApp(p)
    const res = await request(app)
      .post('/api/webhooks/mercadopago')
      .set('x-signature', `ts=${ts},v1=${v1}`)
      .set('x-request-id', requestId)
      .query({ 'data.id': paymentId })
      .send({ type: 'payment', data: { id: paymentId } })
      .expect(200)
    await assertMatchesOpenApi('/api/webhooks/mercadopago', 'post', '200', res.body)
  })

  it('POST /api/webhooks/meli returns 400 for invalid signature', async () => {
    process.env.MELI_WEBHOOK_SECRET = 'meli-whsec-contract'
    const app = createApp(buildPrisma())
    const res = await request(app)
      .post('/api/webhooks/meli')
      .set('x-signature', 'ts=1,v1=bad')
      .set('x-request-id', 'req-meli-contract-1')
      .query({ 'data.id': '2000003509' })
      .send({
        resource: '/orders/2000003509',
        topic: 'orders_v2',
        user_id: 999,
      })
      .expect(400)
    await assertMatchesOpenApi('/api/webhooks/meli', 'post', '400', res.body)
  })

  it('POST /api/webhooks/meli returns 200 for valid signature', async () => {
    const secret = 'meli-whsec-contract'
    process.env.MELI_WEBHOOK_SECRET = secret
    const orderId = '2000003509'
    const requestId = 'req-meli-contract-2'
    const ts = '1704908010'
    const manifest = buildMeliSignatureManifest(orderId, requestId, ts)
    const v1 = computeMeliSignatureHmac(secret, manifest)
    const app = createApp(buildPrisma())
    const res = await request(app)
      .post('/api/webhooks/meli')
      .set('x-signature', `ts=${ts},v1=${v1}`)
      .set('x-request-id', requestId)
      .query({ 'data.id': orderId })
      .send({
        resource: `/orders/${orderId}`,
        topic: 'orders_v2',
        user_id: 999,
      })
      .expect(200)
    await assertMatchesOpenApi('/api/webhooks/meli', 'post', '200', res.body)
  })

  it('GET /api/configuracion/meli', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    process.env.MELI_CLIENT_ID = 'meli-app'
    process.env.MELI_CLIENT_SECRET = 'meli-secret'
    clearTenantFeaturesCache()
    const p = buildPrisma()
    vi.mocked(p.tenantConfig.findUnique).mockResolvedValue({
      tenantId: 1,
      businessType: 'mayorista',
      rubros: [],
      plan: 'pro',
      modules: [],
      integrations: ['meli'],
      updatedAt: new Date(),
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/configuracion/meli').expect(200)
    await assertMatchesOpenApi('/api/configuracion/meli', 'get', '200', res.body)
  })

  it('GET /api/oauth/meli/authorize', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    process.env.MELI_CLIENT_ID = 'meli-app'
    process.env.MELI_CLIENT_SECRET = 'meli-secret'
    clearTenantFeaturesCache()
    const p = buildPrisma()
    vi.mocked(p.tenantConfig.findUnique).mockResolvedValue({
      tenantId: 1,
      businessType: 'mayorista',
      rubros: [],
      plan: 'pro',
      modules: [],
      integrations: ['meli'],
      updatedAt: new Date(),
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/oauth/meli/authorize').expect(200)
    await assertMatchesOpenApi('/api/oauth/meli/authorize', 'get', '200', res.body)
  })

  it('GET /api/articulos/:id/meli', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    const p = buildPrisma()
    vi.mocked(p.tenantConfig.findUnique).mockResolvedValue({
      tenantId: 1,
      businessType: 'mayorista',
      rubros: [],
      plan: 'pro',
      modules: [],
      integrations: ['meli'],
      updatedAt: new Date(),
    } as never)
    vi.mocked(p.articulo.findFirst).mockResolvedValue({
      id: 1,
      tenantId: 1,
      imagenes: [],
      meliPublicacion: null,
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/articulos/1/meli').expect(200)
    await assertMatchesOpenApi('/api/articulos/{id}/meli', 'get', '200', res.body)
  })

  it('GET /api/printing/status', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrisma())
    const res = await request(app).get('/api/printing/status').expect(200)
    await assertMatchesOpenApi('/api/printing/status', 'get', '200', res.body)
  })

  it('POST /api/printing/test', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrisma())
    const res = await request(app).post('/api/printing/test').send({ device: 'thermal' }).expect(200)
    await assertMatchesOpenApi('/api/printing/test', 'post', '200', res.body)
  })

  it('GET /api/facturas/:id/ticket returns application/pdf', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const p = buildPrisma()
    vi.mocked(p.factura.findFirst).mockResolvedValue({
      id: 2,
      tipo: 'B',
      prefijo: '0001',
      numero: 2,
      fecha: new Date('2025-01-15T12:00:00.000Z'),
      total: 50,
      neto1: 50,
      neto2: 0,
      neto3: 0,
      iva1: 0,
      iva2: 0,
      estadoCae: 'pending',
      cae: null,
      caeVto: null,
      cliente: { rsocial: 'Cliente', cuit: '20123456789', domicilio: null, condIva: 'RI' },
      items: [
        {
          cantidad: 1,
          precio: 50,
          dscto: 0,
          subtotal: 50,
          articulo: { descripcion: 'Item' },
        },
      ],
    } as never)
    vi.mocked(p.paramEmpresa.findUnique).mockResolvedValue({
      nombre: 'Demo',
      cuit: '30-12345678-9',
      domicilio: null,
      condicionIva: 'RI',
      ingresosBrutos: null,
      fechaInicioActividades: null,
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/facturas/2/ticket').expect(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
    expect(res.body.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('GET /api/clientes devuelve 500 cuando Prisma falla', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.findMany).mockRejectedValueOnce(new Error('db down'))
    const app = createApp(p)
    const res = await request(app).get('/api/clientes').expect(500)
    await assertMatchesOpenApi('/api/clientes', 'get', '500', res.body)
  })

  it('500 con rechazo no-Error serializa el mensaje vía String()', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.findMany).mockRejectedValueOnce('fallo-plano')
    const res = await request(createApp(p)).get('/api/clientes').expect(500)
    expect(res.body).toEqual({ success: false, error: 'fallo-plano' })
    await assertMatchesOpenApi('/api/clientes', 'get', '500', res.body)
  })

  it('GET /api/reportes/aging', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
    const app = createApp(prisma)
    const res = await request(app).get('/api/reportes/aging').expect(200)
    await assertMatchesOpenApi('/api/reportes/aging', 'get', '200', res.body)
    expect(res.body.data.buckets).toHaveLength(4)
  })

  it('GET /api/reportes/cuenta-corriente/{clienteId}', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
    const p = buildPrisma()
    vi.mocked(p.cliente.findFirst).mockResolvedValueOnce({
      ...clienteRow,
      balance: new Decimal(0),
      balanceInicial: new Decimal(0),
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/reportes/cuenta-corriente/1').expect(200)
    await assertMatchesOpenApi('/api/reportes/cuenta-corriente/{clienteId}', 'get', '200', res.body)
  })

  it('GET /api/reportes/ventas', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/reportes/ventas')
      .query({ from: '2026-01-01', to: '2026-01-31', agrupar: 'dia' })
      .expect(200)
    await assertMatchesOpenApi('/api/reportes/ventas', 'get', '200', res.body)
  })

  it('GET /api/reportes/stock-critico', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const app = createApp(prisma)
    const res = await request(app).get('/api/reportes/stock-critico').expect(200)
    await assertMatchesOpenApi('/api/reportes/stock-critico', 'get', '200', res.body)
  })

  it('GET /api/reportes/cobranzas', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/reportes/cobranzas')
      .query({ from: '2026-01-01', to: '2026-01-31' })
      .expect(200)
    await assertMatchesOpenApi('/api/reportes/cobranzas', 'get', '200', res.body)
  })

  it('GET /api/compras', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const app = createApp(prisma)
    const res = await request(app).get('/api/compras').expect(200)
    await assertMatchesOpenApi('/api/compras', 'get', '200', res.body)
  })

  it('POST /api/compras', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.proveedor.findFirst).mockResolvedValueOnce({ id: 1 } as never)
    vi.mocked(p.articulo.count).mockResolvedValueOnce(1)
    const app = createApp(p)
    const res = await request(app)
      .post('/api/compras')
      .send({
        proveedorId: 1,
        items: [{ articuloId: 1, cantidad: 2, costoUnitario: 10 }],
      })
      .expect(201)
    await assertMatchesOpenApi('/api/compras', 'post', '201', res.body)
  })

  it('GET /api/compras/{id}', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const app = createApp(prisma)
    const res = await request(app).get('/api/compras/1').expect(200)
    await assertMatchesOpenApi('/api/compras/{id}', 'get', '200', res.body)
  })

  it('PUT /api/compras/{id}', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.ordenCompra.findFirst).mockResolvedValueOnce({ id: 1, estado: 'draft' } as never)
    vi.mocked(p.ordenCompra.update).mockResolvedValueOnce({
      ...ordenCompraContractRow,
      nota: 'Contract note',
    } as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app).put('/api/compras/1').send({ nota: 'Contract note' }).expect(200)
    await assertMatchesOpenApi('/api/compras/{id}', 'put', '200', res.body)
  })

  it('POST /api/compras/{id}/send', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.ordenCompra.update).mockResolvedValueOnce({
      ...ordenCompraContractRow,
      estado: 'sent',
    } as never)
    const app = createApp(p)
    const res = await request(app).post('/api/compras/1/send').expect(200)
    await assertMatchesOpenApi('/api/compras/{id}/send', 'post', '200', res.body)
  })

  it('POST /api/compras/{id}/cancel', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.ordenCompra.findFirst).mockResolvedValueOnce({ id: 1, estado: 'sent' } as never)
    vi.mocked(p.ordenCompra.update).mockResolvedValueOnce({
      ...ordenCompraContractRow,
      estado: 'cancelled',
    } as never)
    const app = createApp(p)
    const res = await request(app).post('/api/compras/1/cancel').expect(200)
    await assertMatchesOpenApi('/api/compras/{id}/cancel', 'post', '200', res.body)
  })

  it('POST /api/compras/{id}/receive', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const sentRow = { ...ordenCompraContractRow, estado: 'sent' }
    const p = buildPrisma()
    vi.mocked(p.ordenCompra.findFirst).mockResolvedValueOnce({
      ...sentRow,
      items: ordenCompraContractRow.items.map((i) => ({ ...i, cantidadRecibida: 0 })),
    } as never)
    vi.mocked(p.ordenCompra.update).mockResolvedValueOnce({
      ...sentRow,
      estado: 'received',
      items: ordenCompraContractRow.items.map((i) => ({ ...i, cantidadRecibida: i.cantidad })),
    } as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app)
      .post('/api/compras/1/receive')
      .send({ lines: [{ itemId: 10, cantidad: 2 }] })
      .expect(200)
    await assertMatchesOpenApi('/api/compras/{id}/receive', 'post', '200', res.body)
  })

  it('GET /api/compras/{id}/pdf returns application/pdf', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.proveedor.findFirst).mockResolvedValueOnce({
      id: 1,
      codigo: 1,
      rsocial: 'Prov SA',
      cuit: '30-71234567-8',
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/compras/1/pdf').expect(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
    expect(res.body.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('GET /api/recuentos', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.recuento.findMany).mockResolvedValueOnce([recuentoContractRow] as never)
    const app = createApp(p)
    const res = await request(app).get('/api/recuentos').expect(200)
    await assertMatchesOpenApi('/api/recuentos', 'get', '200', res.body)
  })

  it('POST /api/recuentos', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.recuento.findFirst).mockResolvedValueOnce(null)
    const app = createApp(p)
    const res = await request(app).post('/api/recuentos').expect(201)
    await assertMatchesOpenApi('/api/recuentos', 'post', '201', res.body)
  })

  it('GET /api/recuentos/{id}', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.recuento.findFirst).mockResolvedValueOnce(recuentoContractRow as never)
    const app = createApp(p)
    const res = await request(app).get('/api/recuentos/1').expect(200)
    await assertMatchesOpenApi('/api/recuentos/{id}', 'get', '200', res.body)
  })

  it('PUT /api/recuentos/{id}/items', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.recuento.findFirst)
      .mockResolvedValueOnce(recuentoContractRow as never)
      .mockResolvedValueOnce({
        ...recuentoContractRow,
        items: [{ ...recuentoContractRow.items[0], cantFisica: 5 }],
      } as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app)
      .put('/api/recuentos/1/items')
      .send({ lines: [{ articuloId: 1, cantFisica: 5 }] })
      .expect(200)
    await assertMatchesOpenApi('/api/recuentos/{id}/items', 'put', '200', res.body)
  })

  it('POST /api/recuentos/{id}/close', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    const counted = {
      ...recuentoContractRow,
      items: [{ ...recuentoContractRow.items[0], cantFisica: 5 }],
    }
    const closed = { ...counted, estado: 'closed', closedAt: new Date() }
    vi.mocked(p.recuento.findFirst)
      .mockResolvedValueOnce(counted as never)
      .mockResolvedValueOnce(closed as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app).post('/api/recuentos/1/close').expect(200)
    await assertMatchesOpenApi('/api/recuentos/{id}/close', 'post', '200', res.body)
  })

  it('GET /api/repartos', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.reparto.findMany).mockResolvedValueOnce([repartoContractRow] as never)
    const app = createApp(p)
    const res = await request(app).get('/api/repartos').query({ fecha: '2026-05-20' }).expect(200)
    await assertMatchesOpenApi('/api/repartos', 'get', '200', res.body)
  })

  it('POST /api/repartos', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.appUser.findFirst).mockResolvedValueOnce({ id: 2, role: 'driver' } as never)
    vi.mocked(p.ordenEntrega.findMany).mockResolvedValueOnce([{ id: 1, estado: 'ready' }] as never)
    vi.mocked(p.repartoItem.findFirst).mockResolvedValueOnce(null)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app)
      .post('/api/repartos')
      .send({ fecha: '2026-05-20', choferId: 2, ordenEntregaIds: [1] })
      .expect(201)
    await assertMatchesOpenApi('/api/repartos', 'post', '201', res.body)
  })

  it('GET /api/repartos/activos', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    const activo = {
      ...repartoContractRow,
      estado: 'on_route',
      items: [
        {
          ...repartoContractRow.items[0],
          estado: 'pending',
          ordenEntrega: {
            ...repartoContractRow.items[0].ordenEntrega,
            cliente: {
              ...repartoContractRow.items[0].ordenEntrega.cliente,
              domicilio: 'Av. Demo 123',
            },
          },
        },
      ],
    }
    vi.mocked(p.reparto.findMany).mockResolvedValueOnce([activo] as never)
    const app = createApp(p)
    const res = await request(app).get('/api/repartos/activos').expect(200)
    await assertMatchesOpenApi('/api/repartos/activos', 'get', '200', res.body)
  })

  it('GET /api/repartos/mi-reparto', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = '2'
    const p = buildPrisma()
    vi.mocked(p.reparto.findFirst).mockResolvedValueOnce(repartoContractRow as never)
    const app = createApp(p)
    const res = await request(app).get('/api/repartos/mi-reparto').query({ fecha: '2026-05-20' }).expect(200)
    await assertMatchesOpenApi('/api/repartos/mi-reparto', 'get', '200', res.body)
  })

  it('POST /api/repartos/{id}/ubicacion', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = '2'
    const p = buildPrisma()
    vi.mocked(p.reparto.findFirst).mockResolvedValueOnce({
      id: 1,
      choferId: 2,
      estado: 'on_route',
      tenantId: 1,
    } as never)
    const app = createApp(p)
    const res = await request(app)
      .post('/api/repartos/1/ubicacion')
      .send({ lat: -34.6037, lng: -58.3816 })
      .expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}/ubicacion', 'post', '200', res.body)
  })

  it('GET /api/repartos/{id}/ubicacion/ultima', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.reparto.findFirst).mockResolvedValueOnce({
      id: 1,
      choferId: 2,
      tenantId: 1,
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/repartos/1/ubicacion/ultima').expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}/ubicacion/ultima', 'get', '200', res.body)
  })

  it('GET /api/repartos/{id}', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.reparto.findFirst).mockResolvedValueOnce(repartoContractRow as never)
    const app = createApp(p)
    const res = await request(app).get('/api/repartos/1').expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}', 'get', '200', res.body)
  })

  it('POST /api/repartos/{id}/iniciar', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.reparto.findFirst)
      .mockResolvedValueOnce({
        ...repartoContractRow,
        items: [{ id: 10, ordenEntregaId: 1, estado: 'pending' }],
      } as never)
      .mockResolvedValueOnce({ ...repartoContractRow, estado: 'on_route' } as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app).post('/api/repartos/1/iniciar').expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}/iniciar', 'post', '200', res.body)
  })

  it('POST /api/repartos/{id}/cerrar', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    const onRoute = {
      ...repartoContractRow,
      estado: 'on_route',
      items: [{ ...repartoContractRow.items[0], id: 10, estado: 'pending' }],
    }
    const closed = {
      ...onRoute,
      estado: 'completed',
      closedAt: new Date(),
      items: [{ ...onRoute.items[0], estado: 'not_delivered' }],
      progress: { total: 1, delivered: 0, pending: 0 },
    }
    vi.mocked(p.reparto.findFirst).mockResolvedValueOnce(onRoute as never)
    vi.mocked(p.reparto.update).mockResolvedValueOnce(closed as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app).post('/api/repartos/1/cerrar').expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}/cerrar', 'post', '200', res.body)
  })

  const TEST_FIRMA =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

  it('PUT /api/repartos/{id}/items/{itemId}', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = '2'
    const p = buildPrisma()
    const itemRow = {
      ...repartoContractRow.items[0],
      repartoId: 1,
      estado: 'pending',
      podMedia: { firmaBase64: TEST_FIRMA },
      receptorNombre: 'Juan Pérez',
    }
    vi.mocked(p.reparto.findFirst).mockResolvedValueOnce({
      id: 1,
      estado: 'on_route',
      choferId: 2,
      tenantId: 1,
    } as never)
    vi.mocked(p.repartoItem.findFirst).mockResolvedValueOnce({
      ...itemRow,
      ordenEntrega: repartoContractRow.items[0].ordenEntrega,
    } as never)
    vi.mocked(p.repartoItem.update).mockResolvedValueOnce({
      ...itemRow,
      estado: 'delivered',
      entregadoAt: new Date(),
    } as never)
    vi.mocked(p.ordenEntrega.update).mockResolvedValueOnce({} as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app)
      .put('/api/repartos/1/items/10')
      .send({
        outcome: 'delivered',
        receptorNombre: 'Juan Pérez',
        firmaBase64: TEST_FIRMA,
      })
      .expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}/items/{itemId}', 'put', '200', res.body)
    expect(res.body.data.hasPod).toBe(true)
  })

  it('GET /api/repartos/{id}/items/{itemId}/pod', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    const itemRow = {
      ...repartoContractRow.items[0],
      repartoId: 1,
      estado: 'delivered',
      podMedia: { firmaBase64: TEST_FIRMA },
      receptorNombre: 'Juan Pérez',
    }
    vi.mocked(p.repartoItem.findFirst).mockResolvedValueOnce({
      ...itemRow,
      ordenEntrega: repartoContractRow.items[0].ordenEntrega,
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/repartos/1/items/10/pod').expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}/items/{itemId}/pod', 'get', '200', res.body)
    expect(res.body.data.podMedia?.firmaBase64).toBe(TEST_FIRMA)
  })

  it('GET /api/dashboard/ventas-historico', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const p = buildPrisma()
    vi.mocked(p.$queryRaw)
      .mockReset()
      .mockResolvedValueOnce([{ period: '2026-05-01', count: BigInt(2), total: '150.00' }])
      .mockResolvedValueOnce([
        {
          articuloId: 1,
          codigo: 100,
          descripcion: 'Item',
          quantity: BigInt(3),
          total: '150.00',
        },
      ])
      .mockResolvedValueOnce([
        { vendedorId: 1, username: 'owner', count: BigInt(2), total: '150.00' },
      ])
    const app = createApp(p)
    const res = await request(app)
      .get('/api/dashboard/ventas-historico')
      .query({ from: '2026-05-01', to: '2026-05-20', groupBy: 'day' })
      .expect(200)
    await assertMatchesOpenApi('/api/dashboard/ventas-historico', 'get', '200', res.body)
  })

  it('GET /api/cobranzas/vencidas', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
    const app = createApp(prisma)
    const res = await request(app).get('/api/cobranzas/vencidas').expect(200)
    await assertMatchesOpenApi('/api/cobranzas/vencidas', 'get', '200', res.body)
  })

  it('POST /api/cobranzas/recordatorios', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
    const p = buildPrisma()
    vi.mocked(p.factura.findFirst).mockResolvedValueOnce({
      id: 1,
      tenantId: 1,
      clienteId: 1,
      total: 1500,
      fecha: new Date('2020-01-01'),
      estado: 'A',
      cliente: { rsocial: 'ACME SA', creditDays: 0 },
    } as never)
    const app = createApp(p)
    const res = await request(app)
      .post('/api/cobranzas/recordatorios')
      .send({ facturaId: 1, canal: 'email' })
      .expect(201)
    await assertMatchesOpenApi('/api/cobranzas/recordatorios', 'post', '201', res.body)
  })

  it('GET /api/ordenes-entrega', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const app = createApp(prisma)
    const res = await request(app).get('/api/ordenes-entrega').expect(200)
    await assertMatchesOpenApi('/api/ordenes-entrega', 'get', '200', res.body)
  })

  it('POST /api/ordenes-entrega', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/ordenes-entrega')
      .send({ clienteId: 1, fecha: '2026-05-16' })
      .expect(201)
    await assertMatchesOpenApi('/api/ordenes-entrega', 'post', '201', res.body)
  })

  it('POST /api/ordenes-entrega/:id/iniciar-picking', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_op'
    process.env.BIZCODE_TEST_USER_ID = '7'
    vi.mocked(prisma.ordenEntrega.findFirst).mockResolvedValueOnce({
      id: 1,
      tenantId: 1,
      facturaId: null,
      clienteId: 1,
      zonaId: null,
      driverId: null,
      pickerUserId: null,
      pickingIniciadoAt: null,
      pickingListoAt: null,
      fecha: new Date('2026-05-16'),
      estado: 'pending',
      nota: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)
    vi.mocked(prisma.ordenEntrega.update).mockResolvedValueOnce({
      id: 1,
      tenantId: 1,
      facturaId: null,
      clienteId: 1,
      zonaId: null,
      driverId: null,
      pickerUserId: 7,
      pickingIniciadoAt: new Date(),
      pickingListoAt: null,
      fecha: new Date('2026-05-16'),
      estado: 'picking',
      nota: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      cliente: { id: 1, codigo: 1, rsocial: 'Cliente' },
      zona: null,
      driver: null,
      picker: { id: 7, username: 'wh1', role: 'warehouse_op' },
      factura: null,
    } as never)
    const app = createApp(prisma)
    const res = await request(app).post('/api/ordenes-entrega/1/iniciar-picking').expect(200)
    await assertMatchesOpenApi('/api/ordenes-entrega/{id}/iniciar-picking', 'post', '200', res.body)
  })

  it('POST /api/ordenes-entrega/:id/lista', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_op'
    process.env.BIZCODE_TEST_USER_ID = '7'
    vi.mocked(prisma.ordenEntrega.findFirst).mockResolvedValueOnce({
      id: 1,
      tenantId: 1,
      estado: 'picking',
      pickerUserId: 7,
      driverId: null,
      clienteId: 1,
      facturaId: null,
      zonaId: null,
      pickingIniciadoAt: new Date(),
      pickingListoAt: null,
      fecha: new Date(),
      nota: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)
    vi.mocked(prisma.ordenEntrega.update).mockResolvedValueOnce({
      id: 1,
      tenantId: 1,
      facturaId: null,
      clienteId: 1,
      zonaId: null,
      driverId: null,
      pickerUserId: 7,
      pickingIniciadoAt: new Date(),
      pickingListoAt: new Date(),
      fecha: new Date('2026-05-16'),
      estado: 'ready',
      nota: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      cliente: { id: 1, codigo: 1, rsocial: 'Cliente' },
      zona: null,
      driver: null,
      picker: { id: 7, username: 'wh1', role: 'warehouse_op' },
      factura: null,
    } as never)
    const app = createApp(prisma)
    const res = await request(app).post('/api/ordenes-entrega/1/lista').expect(200)
    await assertMatchesOpenApi('/api/ordenes-entrega/{id}/lista', 'post', '200', res.body)
  })

  it('GET /api/empresa', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(prisma)
    const res = await request(app).get('/api/empresa').expect(200)
    await assertMatchesOpenApi('/api/empresa', 'get', '200', res.body)
  })

  it('PUT /api/empresa', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(prisma)
    const res = await request(app)
      .put('/api/empresa')
      .send({
        nombre: 'Demo Co',
        cuit: '20-12345678-6',
        domicilio: 'Calle 1',
        puntoVenta: 2,
        tipoFactura: 'A',
        logoUrl: null,
      })
      .expect(200)
    await assertMatchesOpenApi('/api/empresa', 'put', '200', res.body)
  })
})

describe('API — errores 500 (cobertura de ramas catch)', () => {
  beforeEach(() => {
    delete process.env.BIZCODE_TEST_ROLE
    delete process.env.BIZCODE_TEST_AUTH_BYPASS
  })

  const err = new Error('db')

  it('GET /api/clientes/:id', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.findFirst).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/clientes/1').expect(500)
    await assertMatchesOpenApi('/api/clientes/{id}', 'get', '500', res.body)
  })

  it('POST /api/clientes', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.create).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).post('/api/clientes').send(clienteInput).expect(500)
    await assertMatchesOpenApi('/api/clientes', 'post', '500', res.body)
  })

  it('PUT /api/clientes/:id', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.findFirst).mockResolvedValueOnce(clienteRow as never)
    vi.mocked(p.cliente.update).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).put('/api/clientes/1').send(clienteInput).expect(500)
    await assertMatchesOpenApi('/api/clientes/{id}', 'put', '500', res.body)
  })

  it('GET /api/articulos', async () => {
    const p = buildPrisma()
    vi.mocked(p.articulo.findMany).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/articulos').expect(500)
    await assertMatchesOpenApi('/api/articulos', 'get', '500', res.body)
  })

  it('GET /api/articulos/:id', async () => {
    const p = buildPrisma()
    vi.mocked(p.articulo.findFirst).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/articulos/1').expect(500)
    await assertMatchesOpenApi('/api/articulos/{id}', 'get', '500', res.body)
  })

  it('POST /api/articulos', async () => {
    const p = buildPrisma()
    vi.mocked(p.rubro.findFirst).mockResolvedValueOnce(rubroRow as never)
    vi.mocked(p.articulo.create).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).post('/api/articulos').send(articuloInput).expect(500)
    await assertMatchesOpenApi('/api/articulos', 'post', '500', res.body)
  })

  it('PUT /api/articulos/:id', async () => {
    const p = buildPrisma()
    vi.mocked(p.articulo.findFirst).mockResolvedValueOnce(articuloRow as never)
    vi.mocked(p.rubro.findFirst).mockResolvedValueOnce(rubroRow as never)
    vi.mocked(p.articulo.update).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).put('/api/articulos/1').send(articuloInput).expect(500)
    await assertMatchesOpenApi('/api/articulos/{id}', 'put', '500', res.body)
  })

  it('GET /api/rubros', async () => {
    const p = buildPrisma()
    vi.mocked(p.rubro.findMany).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/rubros').expect(500)
    await assertMatchesOpenApi('/api/rubros', 'get', '500', res.body)
  })

  it('POST /api/rubros', async () => {
    const p = buildPrisma()
    vi.mocked(p.rubro.create).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).post('/api/rubros').send({ codigo: 1, nombre: 'X' }).expect(500)
    await assertMatchesOpenApi('/api/rubros', 'post', '500', res.body)
  })

  it('GET /api/formas-pago', async () => {
    const p = buildPrisma()
    vi.mocked(p.formaPago.findMany).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/formas-pago').expect(500)
    await assertMatchesOpenApi('/api/formas-pago', 'get', '500', res.body)
  })

  it('GET /api/cobros/transfer-info', async () => {
    const p = buildPrisma()
    vi.mocked(p.cuentaBancaria.findFirst).mockRejectedValueOnce(err)
    const res = await request(createApp(p))
      .get('/api/cobros/transfer-info')
      .set('x-bizcode-channel', 'field')
      .expect(500)
    await assertMatchesOpenApi('/api/cobros/transfer-info', 'get', '500', res.body)
  })

  it('GET /api/facturas', async () => {
    const p = buildPrisma()
    vi.mocked(p.factura.findMany).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/facturas').expect(500)
    await assertMatchesOpenApi('/api/facturas', 'get', '500', res.body)
  })

  it('POST /api/facturas', async () => {
    const p = buildPrisma()
    vi.mocked(p.factura.create).mockRejectedValueOnce(err)
    const res = await request(createApp(p))
      .post('/api/facturas')
      .send({
        fecha: '2025-01-15',
        tipo: 'A',
        numero: 1,
        clienteId: 1,
        neto1: 0,
        neto2: 0,
        neto3: 0,
        iva1: 0,
        iva2: 0,
        total: 0,
        items: [],
      })
      .expect(500)
    await assertMatchesOpenApi('/api/facturas', 'post', '500', res.body)
  })

  it('GET /api/logistica/kpis', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.$queryRaw)
      .mockResolvedValueOnce([{ count: BigInt(2) }])
      .mockResolvedValueOnce([{ count: BigInt(1) }])
      .mockResolvedValueOnce([{ avg_seconds: 600 }])
      .mockResolvedValueOnce([{ motivo: 'ausente', count: BigInt(1) }])
      .mockResolvedValueOnce([{ count: BigInt(0) }])
    const app = createApp(p)
    const res = await request(app)
      .get('/api/logistica/kpis')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(200)
    await assertMatchesOpenApi('/api/logistica/kpis', 'get', '200', res.body)
  })

  it('GET /api/logistica/reporte-choferes', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.$queryRaw).mockResolvedValueOnce([
      {
        chofer_id: 2,
        chofer_username: 'driver1',
        day: new Date('2026-05-20'),
        dispatched: BigInt(3),
        delivered: BigInt(2),
        not_delivered: BigInt(1),
      },
    ])
    const app = createApp(p)
    const res = await request(app)
      .get('/api/logistica/reporte-choferes')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(200)
    await assertMatchesOpenApi('/api/logistica/reporte-choferes', 'get', '200', res.body)
  })

  it('GET /api/logistica/reporte-zonas', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.$queryRaw).mockResolvedValueOnce([
      {
        zona_id: 1,
        zona_nombre: 'Centro',
        dispatched: BigInt(4),
        delivered: BigInt(3),
        not_delivered: BigInt(1),
      },
    ])
    const app = createApp(p)
    const res = await request(app)
      .get('/api/logistica/reporte-zonas')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(200)
    await assertMatchesOpenApi('/api/logistica/reporte-zonas', 'get', '200', res.body)
  })
})
