import { z } from 'zod'
import { validateCBU, validateCUIT } from '../../web/src/lib/validators'
import { isValidIanaTimeZone } from '../lib/tenantLocalTime'
import { UNIDAD_BASE_VALUES, umedidaFromUnidadBase } from '../lib/uom'
import type {
  ArticuloInput,
  ClienteInput,
  DeliveryZoneCreateParsed,
  DeliveryZoneUpdateParsed,
  EmpresaInput,
  FacturaInput,
  FacturaPrintInput,
  PrintingTestInput,
  FacturaItemInput,
  ContratoAjusteManualInput,
  ContratoInput,
  ContratoItemInput,
  ContratoUpdateInput,
  OrdenTrabajoFacturarInput,
  OrdenTrabajoInput,
  OrdenTrabajoItemInput,
  OrdenTrabajoTransitionInput,
  OrdenTrabajoUpdateInput,
  PedidoInput,
  PedidoInvoiceInput,
  PedidoItemInput,
  RemitoEntregarInput,
  RemitoInput,
  RemitoItemInput,
  RemitoUpdateInput,
  ChequeInput,
  ChequeTransicionInput,
  ChequeUpdateInput,
  CobroInput,
  ProveedorInput,
  ProveedorCuentaCorrienteAjusteInput,
  ClienteCuentaCorrienteAjusteInput,
  RubroInput,
  OrdenCompraCreateInput,
  OrdenCompraItemInput,
  OrdenCompraReceiveLineInput,
  OrdenCompraUpdateInput,
  RecuentoItemLineInput,
  StockAjusteInput,
} from '@bizcode/types'

/** @see server/createApp.ts FACTURA_VOID_MOTIVO_MAX_LEN */
export const FACTURA_VOID_MOTIVO_MAX_LEN = 500 as const

const deliveryZoneTipoSchema = z.enum(['barrio', 'manual', 'predefinida'], {
  errorMap: () => ({ message: 'tipo must be one of: barrio, manual, predefinida' }),
})

function normalizeOptStr(v: string | null | undefined, max: number, fieldKey: string, ctx: z.RefinementCtx): void {
  if (v === undefined) {
    return
  }
  if (typeof v !== 'string' && v !== null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${fieldKey} must be a string`, path: [fieldKey] })
    return
  }
  if (v === null) {
    return
  }
  const t = v.trim()
  if (t.length > max) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${fieldKey} must be at most ${max} characters`, path: [fieldKey] })
  }
}

export const clienteBodySchema = z
  .object({
    codigo: z.number({ invalid_type_error: 'codigo must be an integer' }),
    rsocial: z.string(),
    condIva: z.enum(['RI', 'Mono', 'CF', 'Exento'], {
      errorMap: () => ({ message: 'condIva must be one of: RI, Mono, CF, Exento' }),
    }),
    activo: z.boolean({ invalid_type_error: 'activo must be a boolean' }),
    fantasia: z.union([z.string(), z.null(), z.undefined()]).optional(),
    domicilio: z.union([z.string(), z.null(), z.undefined()]).optional(),
    localidad: z.union([z.string(), z.null(), z.undefined()]).optional(),
    cpost: z.union([z.string(), z.null(), z.undefined()]).optional(),
    telef: z.union([z.string(), z.null(), z.undefined()]).optional(),
    email: z.union([z.string(), z.null(), z.undefined()]).optional(),
    cuit: z.union([z.string(), z.null(), z.undefined()]).optional(),
    creditLimit: z.union([z.number(), z.null(), z.undefined()]).optional(),
    creditDays: z.union([z.number(), z.null(), z.undefined()]).optional(),
    suspended: z.boolean().optional(),
    deliveryZoneId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    listaPrecioId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    cbu: z.union([z.string(), z.null(), z.undefined()]).optional(),
    alias: z.union([z.string(), z.null(), z.undefined()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (typeof data.codigo !== 'number' || !Number.isInteger(data.codigo)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'codigo must be an integer', path: ['codigo'] })
    } else if (data.codigo < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'codigo must be >= 1', path: ['codigo'] })
    }
    const rs = data.rsocial.trim()
    if (rs.length < 3 || rs.length > 30) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'rsocial must be a string between 3 and 30 characters', path: ['rsocial'] })
    }
    normalizeOptStr(data.fantasia === undefined ? undefined : data.fantasia, 30, 'fantasia', ctx)
    normalizeOptStr(data.domicilio === undefined ? undefined : data.domicilio, 40, 'domicilio', ctx)
    normalizeOptStr(data.localidad === undefined ? undefined : data.localidad, 25, 'localidad', ctx)
    normalizeOptStr(data.cpost === undefined ? undefined : data.cpost, 8, 'cpost', ctx)
    normalizeOptStr(data.telef === undefined ? undefined : data.telef, 25, 'telef', ctx)
    normalizeOptStr(data.email === undefined ? undefined : data.email, 50, 'email', ctx)
    normalizeOptStr(data.cuit === undefined ? undefined : data.cuit, 14, 'cuit', ctx)
    normalizeOptStr(data.alias === undefined ? undefined : data.alias, 60, 'alias', ctx)
    normalizeOptStr(data.cbu === undefined ? undefined : data.cbu, 22, 'cbu', ctx)
    const ci = typeof data.cuit === 'string' ? data.cuit.trim() : data.cuit
    if (ci != null && typeof ci === 'string' && ci !== '' && !validateCUIT(ci)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cuit must be a valid Argentine CUIT', path: ['cuit'] })
    }
    const cbuRaw = typeof data.cbu === 'string' ? data.cbu.trim() : data.cbu
    if (cbuRaw != null && typeof cbuRaw === 'string' && cbuRaw !== '' && !validateCBU(cbuRaw)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cbu must be a valid Argentine CBU', path: ['cbu'] })
    }
    if (data.creditLimit !== undefined && data.creditLimit !== null && (typeof data.creditLimit !== 'number' || data.creditLimit < 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'creditLimit must be a number', path: ['creditLimit'] })
    }
    if (data.creditLimit !== undefined && data.creditLimit !== null && Number.isNaN(data.creditLimit)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'creditLimit must be >= 0', path: ['creditLimit'] })
    }
    const cd = data.creditDays
    if (cd !== undefined && cd !== null && (typeof cd !== 'number' || Number.isNaN(cd) || cd < 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'creditDays must be a number', path: ['creditDays'] })
    }
    if (cd !== undefined && cd !== null && !Number.isInteger(cd)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'creditDays must be an integer', path: ['creditDays'] })
    }
    const dz = data.deliveryZoneId
    if (dz !== undefined && dz !== null && (typeof dz !== 'number' || !Number.isInteger(dz) || dz < 1)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'deliveryZoneId must be an integer', path: ['deliveryZoneId'] })
    }
    const lp = data.listaPrecioId
    if (lp !== undefined && lp !== null && (typeof lp !== 'number' || !Number.isInteger(lp) || lp < 1)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'listaPrecioId must be an integer', path: ['listaPrecioId'] })
    }
  })
  .transform((data): ClienteInput => {
    const trimOrUndef = (
      key: keyof typeof data,
    ): string | null | undefined => {
      const v = data[key]
      if (v === undefined || v === null) {
        return v as null | undefined
      }
      if (typeof v !== 'string') {
        return undefined
      }
      const t = v.trim()
      return t === '' ? null : t
    }

    const out: ClienteInput = {
      codigo: data.codigo as number,
      rsocial: data.rsocial.trim(),
      condIva: data.condIva,
      activo: data.activo,
    }
    const fa = trimOrUndef('fantasia')
    if (fa !== undefined) {
      out.fantasia = fa
    }
    const cui = trimOrUndef('cuit')
    if (cui !== undefined) {
      out.cuit = cui
    }
    const dom = trimOrUndef('domicilio')
    if (dom !== undefined) {
      out.domicilio = dom
    }
    const loc = trimOrUndef('localidad')
    if (loc !== undefined) {
      out.localidad = loc
    }
    const cp = trimOrUndef('cpost')
    if (cp !== undefined) {
      out.cpost = cp
    }
    const te = trimOrUndef('telef')
    if (te !== undefined) {
      out.telef = te
    }
    const em = trimOrUndef('email')
    if (em !== undefined) {
      out.email = em
    }
    if (data.creditLimit !== undefined) {
      out.creditLimit = data.creditLimit
    }
    if (data.creditDays !== undefined) {
      out.creditDays = data.creditDays ?? 0
    }
    if (data.suspended !== undefined) {
      out.suspended = data.suspended
    }
    if (data.deliveryZoneId !== undefined) {
      out.deliveryZoneId = data.deliveryZoneId
    }
    if (data.listaPrecioId !== undefined) {
      out.listaPrecioId = data.listaPrecioId
    }
    const cbuTrim = trimOrUndef('cbu')
    if (cbuTrim !== undefined) {
      out.cbu = cbuTrim === null ? null : cbuTrim.replace(/\D/g, '')
    }
    const aliasTrim = trimOrUndef('alias')
    if (aliasTrim !== undefined) {
      out.alias = aliasTrim
    }
    return out
  })

export const articuloBodySchema = z
  .object({
    codigo: z.number(),
    descripcion: z.string(),
    rubroId: z.number(),
    categoriaId: z.union([z.number().int().min(1), z.null()]).optional(),
    esPadre: z.boolean().optional(),
    padreId: z.union([z.number().int().min(1), z.null()]).optional(),
    heredaPrecio: z.boolean().optional(),
    precioOverride: z.union([z.number().min(0), z.null()]).optional(),
    costoOverride: z.union([z.number().min(0), z.null()]).optional(),
    condIva: z.enum(['1', '2', '3'], { errorMap: () => ({ message: 'condIva must be one of: 1, 2, 3' }) }),
    umedida: z.string(),
    tipo: z.enum(['articulo', 'servicio']).optional(),
    unidadServicio: z
      .enum(['hora', 'dia', 'mes', 'proyecto', 'km', 'unidad', 'otro'])
      .nullable()
      .optional(),
    mesesGarantia: z.union([z.number(), z.null()]).optional(),
    controlLote: z.boolean().optional(),
    /** @en Base unit of measure for stock/quantity rules (#203). @es Unidad base de stock/cantidad (#203). @pt-BR Unidade base de estoque/quantidade (#203). */
    unidadBase: z.enum(UNIDAD_BASE_VALUES).optional(),
    unidadCompra: z.union([z.string(), z.null()]).optional(),
    factorConversion: z.number().optional(),
    multiploVenta: z.union([z.number(), z.null()]).optional(),
    pesoKg: z.union([z.number(), z.null()]).optional(),
    volumenM3: z.union([z.number(), z.null()]).optional(),
    precioLista1: z.number(),
    precioLista2: z.number(),
    costo: z.number(),
    monedaPrecio: z.enum(['ARS', 'USD', 'EUR']).optional(),
    precioEnMonedaOrigen: z.union([z.number().min(0), z.null()]).optional(),
    stock: z.number(),
    minimo: z.number(),
    activo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!Number.isInteger(data.codigo) || data.codigo < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'codigo must be an integer', path: ['codigo'] })
      if (data.codigo < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'codigo must be >= 1', path: ['codigo'] })
      }
    }
    const d = data.descripcion.trim()
    if (d.length < 3 || d.length > 120) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'descripcion must be a string between 3 and 120 characters', path: ['descripcion'] })
    }
    if (!Number.isInteger(data.rubroId) || data.rubroId < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'rubroId must be an integer', path: ['rubroId'] })
      if (data.rubroId < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'rubroId must be >= 1', path: ['rubroId'] })
      }
    }
    const u = data.umedida.trim()
    if (u.length < 2 || u.length > 6) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'umedida must be a string between 2 and 6 characters', path: ['umedida'] })
    }
    if (typeof data.precioLista1 !== 'number' || data.precioLista1 < 0.01) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'precioLista1 must be >= 0.01', path: ['precioLista1'] })
    }
    if (typeof data.precioLista2 !== 'number' || data.precioLista2 < 0.01) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'precioLista2 must be >= 0.01', path: ['precioLista2'] })
    }
    if (typeof data.costo !== 'number' || data.costo < 0.01) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'costo must be >= 0.01', path: ['costo'] })
    }
    const factorConversion = data.factorConversion ?? 1
    if (!Number.isFinite(factorConversion) || factorConversion <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'factorConversion must be a finite number > 0', path: ['factorConversion'] })
    }
    if (data.unidadCompra != null && data.unidadCompra.trim().length > 0 && !(factorConversion > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'factorConversion is required (> 0) when unidadCompra is set',
        path: ['factorConversion'],
      })
    }
    if (data.multiploVenta !== undefined && data.multiploVenta !== null) {
      if (!Number.isFinite(data.multiploVenta) || data.multiploVenta <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'multiploVenta must be a finite number > 0', path: ['multiploVenta'] })
      }
    }
    if (data.pesoKg !== undefined && data.pesoKg !== null && (!Number.isFinite(data.pesoKg) || data.pesoKg < 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'pesoKg must be a finite number >= 0', path: ['pesoKg'] })
    }
    if (data.volumenM3 !== undefined && data.volumenM3 !== null && (!Number.isFinite(data.volumenM3) || data.volumenM3 < 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'volumenM3 must be a finite number >= 0', path: ['volumenM3'] })
    }
    const monedaPrecio = data.monedaPrecio ?? 'ARS'
    if (monedaPrecio !== 'ARS') {
      if (data.precioEnMonedaOrigen == null || data.precioEnMonedaOrigen < 0.0001) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'precioEnMonedaOrigen is required when monedaPrecio is USD or EUR',
          path: ['precioEnMonedaOrigen'],
        })
      }
    }
    const tipo = data.tipo ?? 'articulo'
    if (tipo === 'servicio') {
      if (data.unidadServicio == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'unidadServicio is required when tipo is servicio',
          path: ['unidadServicio'],
        })
      }
      if (typeof data.stock !== 'number' || !Number.isFinite(data.stock) || data.stock !== 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'stock must be 0 for servicio', path: ['stock'] })
      }
      if (typeof data.minimo !== 'number' || !Number.isFinite(data.minimo) || data.minimo !== 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'minimo must be 0 for servicio', path: ['minimo'] })
      }
    } else {
      if (data.unidadServicio != null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'unidadServicio must be null when tipo is articulo',
          path: ['unidadServicio'],
        })
      }
      if (typeof data.stock !== 'number' || !Number.isFinite(data.stock) || data.stock < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'stock must be a finite number >= 0', path: ['stock'] })
      }
      if (typeof data.minimo !== 'number' || !Number.isFinite(data.minimo) || data.minimo < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'minimo must be a finite number >= 0', path: ['minimo'] })
      }
      if (
        data.mesesGarantia !== undefined &&
        data.mesesGarantia !== null &&
        (!Number.isInteger(data.mesesGarantia) || data.mesesGarantia < 1)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'mesesGarantia must be an integer >= 1 or null',
          path: ['mesesGarantia'],
        })
      }
    }
  })
  .transform(
    (data): ArticuloInput => {
      const tipo = data.tipo ?? 'articulo'
      // @en When unidadBase is provided, the legacy umedida is derived from it (single source of truth) (#203).
      // @es Cuando se envía unidadBase, el umedida legacy se deriva de ella (fuente única de verdad) (#203).
      // @pt-BR Quando unidadBase é enviado, o umedida legado é derivado dela (fonte única de verdade) (#203).
      const umedida =
        data.unidadBase !== undefined ? umedidaFromUnidadBase(data.unidadBase) : data.umedida.trim()
      return {
        codigo: data.codigo,
        descripcion: data.descripcion.trim(),
        rubroId: data.rubroId,
        condIva: data.condIva,
        umedida,
        tipo,
        unidadServicio: tipo === 'servicio' ? (data.unidadServicio ?? null) : null,
        mesesGarantia: tipo === 'servicio' ? null : (data.mesesGarantia ?? null),
        controlLote: tipo === 'servicio' ? false : (data.controlLote ?? false),
        unidadBase: data.unidadBase,
        unidadCompra: data.unidadCompra ?? null,
        factorConversion: data.factorConversion ?? 1,
        multiploVenta: data.multiploVenta ?? null,
        pesoKg: data.pesoKg ?? null,
        volumenM3: data.volumenM3 ?? null,
        precioLista1: data.precioLista1,
        precioLista2: data.precioLista2,
        costo: data.costo,
        monedaPrecio: data.monedaPrecio ?? 'ARS',
        precioEnMonedaOrigen:
          (data.monedaPrecio ?? 'ARS') === 'ARS' ? null : (data.precioEnMonedaOrigen ?? null),
        stock: tipo === 'servicio' ? 0 : data.stock,
        minimo: tipo === 'servicio' ? 0 : data.minimo,
        activo: data.activo,
      }
    },
  )

export const rubroBodySchema = z
  .object({
    codigo: z.number(),
    nombre: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!Number.isInteger(data.codigo) || data.codigo < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'codigo must be an integer', path: ['codigo'] })
      if (data.codigo < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'codigo must be >= 1', path: ['codigo'] })
      }
    }
    const n = data.nombre.trim()
    if (n.length === 0 || n.length > 20) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'nombre must be a string between 1 and 20 characters', path: ['nombre'] })
    }
  })
  .transform((data): RubroInput => ({ codigo: data.codigo, nombre: data.nombre.trim() }))

const proveedorTipoCuentaSchema = z.enum(['cc', 'ca'], {
  errorMap: () => ({ message: 'tipoCuenta must be cc or ca' }),
})
const proveedorCondicionPagoSchema = z.enum(['contado', '15dias', '30dias', '60dias', 'otro'], {
  errorMap: () => ({ message: 'condicionPago must be contado, 15dias, 30dias, 60dias, or otro' }),
})
const proveedorCategoriaSchema = z.enum(['materia_prima', 'insumos', 'servicios', 'logistica'], {
  errorMap: () => ({ message: 'categoria must be materia_prima, insumos, servicios, or logistica' }),
})

export const proveedorBodySchema = z
  .object({
    codigo: z.number(),
    rsocial: z.string(),
    condIva: z.enum(['RI', 'Mono', 'CF', 'Exento'], {
      errorMap: () => ({ message: 'condIva must be one of: RI, Mono, CF, Exento' }),
    }),
    activo: z.boolean(),
    fantasia: z.union([z.string(), z.null(), z.undefined()]).optional(),
    telef: z.union([z.string(), z.null(), z.undefined()]).optional(),
    email: z.union([z.string(), z.null(), z.undefined()]).optional(),
    cuit: z.union([z.string(), z.null(), z.undefined()]).optional(),
    cbu: z.union([z.string(), z.null(), z.undefined()]).optional(),
    alias: z.union([z.string(), z.null(), z.undefined()]).optional(),
    banco: z.union([z.string(), z.null(), z.undefined()]).optional(),
    tipoCuenta: z.union([proveedorTipoCuentaSchema, z.null(), z.undefined()]).optional(),
    moneda: z.union([z.string(), z.undefined()]).optional(),
    condicionPago: z.union([proveedorCondicionPagoSchema, z.null(), z.undefined()]).optional(),
    plazoHabitual: z.union([z.number(), z.null(), z.undefined()]).optional(),
    descuentoPct: z.union([z.number(), z.null(), z.undefined()]).optional(),
    limiteCredito: z.union([z.number(), z.null(), z.undefined()]).optional(),
    categoria: z.union([proveedorCategoriaSchema, z.null(), z.undefined()]).optional(),
    contactoNombre: z.union([z.string(), z.null(), z.undefined()]).optional(),
    contactoEmail: z.union([z.string(), z.null(), z.undefined()]).optional(),
    contactoTel: z.union([z.string(), z.null(), z.undefined()]).optional(),
    notas: z.union([z.string(), z.null(), z.undefined()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (!Number.isInteger(data.codigo) || data.codigo < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'codigo must be an integer', path: ['codigo'] })
      if (data.codigo < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'codigo must be >= 1', path: ['codigo'] })
      }
    }
    const r = data.rsocial.trim()
    if (r.length < 3 || r.length > 30) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'rsocial must be a string between 3 and 30 characters', path: ['rsocial'] })
    }
    normalizeOptStr(data.fantasia === undefined ? undefined : data.fantasia, 30, 'fantasia', ctx)
    normalizeOptStr(data.telef === undefined ? undefined : data.telef, 25, 'telef', ctx)
    normalizeOptStr(data.email === undefined ? undefined : data.email, 50, 'email', ctx)
    normalizeOptStr(data.cuit === undefined ? undefined : data.cuit, 14, 'cuit', ctx)
    const cui = typeof data.cuit === 'string' ? data.cuit.trim() : data.cuit
    if (cui != null && typeof cui === 'string' && cui !== '' && !validateCUIT(cui)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cuit must be a valid Argentine CUIT', path: ['cuit'] })
    }
    normalizeOptStr(data.cbu === undefined ? undefined : data.cbu, 22, 'cbu', ctx)
    const cbuRaw = typeof data.cbu === 'string' ? data.cbu.trim() : data.cbu
    if (cbuRaw != null && typeof cbuRaw === 'string' && cbuRaw !== '' && !validateCBU(cbuRaw)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cbu must be a valid Argentine CBU', path: ['cbu'] })
    }
    normalizeOptStr(data.alias === undefined ? undefined : data.alias, 20, 'alias', ctx)
    normalizeOptStr(data.banco === undefined ? undefined : data.banco, 50, 'banco', ctx)
    if (data.moneda !== undefined && data.moneda.trim().length > 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'moneda must be at most 3 characters', path: ['moneda'] })
    }
    const ph = data.plazoHabitual
    if (ph !== undefined && ph !== null && (!Number.isInteger(ph) || ph < 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'plazoHabitual must be a non-negative integer', path: ['plazoHabitual'] })
    }
    if (data.descuentoPct !== undefined && data.descuentoPct !== null) {
      if (typeof data.descuentoPct !== 'number' || Number.isNaN(data.descuentoPct) || data.descuentoPct < 0 || data.descuentoPct > 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'descuentoPct must be between 0 and 100', path: ['descuentoPct'] })
      }
    }
    if (data.limiteCredito !== undefined && data.limiteCredito !== null) {
      if (typeof data.limiteCredito !== 'number' || Number.isNaN(data.limiteCredito) || data.limiteCredito < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'limiteCredito must be >= 0', path: ['limiteCredito'] })
      }
    }
    normalizeOptStr(data.contactoNombre === undefined ? undefined : data.contactoNombre, 50, 'contactoNombre', ctx)
    normalizeOptStr(data.contactoEmail === undefined ? undefined : data.contactoEmail, 50, 'contactoEmail', ctx)
    normalizeOptStr(data.contactoTel === undefined ? undefined : data.contactoTel, 25, 'contactoTel', ctx)
    if (data.notas !== undefined && data.notas !== null && typeof data.notas === 'string' && data.notas.length > 2000) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'notas must be at most 2000 characters', path: ['notas'] })
    }
  })
  .transform((data): ProveedorInput => {
    const trimOrNull = (v: unknown): string | null | undefined => {
      if (v === undefined) {
        return undefined
      }
      if (v === null) {
        return null
      }
      if (typeof v !== 'string') {
        return undefined
      }
      const t = v.trim()
      return t === '' ? null : t
    }
    const out: ProveedorInput = {
      codigo: data.codigo,
      rsocial: data.rsocial.trim(),
      condIva: data.condIva,
      activo: data.activo,
      moneda: (data.moneda ?? 'ARS').trim() || 'ARS',
    }
    const assignOpt = <K extends keyof ProveedorInput>(key: K, val: ProveedorInput[K] | undefined) => {
      if (val !== undefined) {
        out[key] = val
      }
    }
    assignOpt('fantasia', trimOrNull(data.fantasia) as ProveedorInput['fantasia'])
    assignOpt('cuit', trimOrNull(data.cuit) as ProveedorInput['cuit'])
    assignOpt('telef', trimOrNull(data.telef) as ProveedorInput['telef'])
    assignOpt('email', trimOrNull(data.email) as ProveedorInput['email'])
    const cbuTrim = trimOrNull(data.cbu)
    if (cbuTrim !== undefined) {
      out.cbu = cbuTrim === null ? null : cbuTrim.replace(/\D/g, '')
    }
    assignOpt('alias', trimOrNull(data.alias) as ProveedorInput['alias'])
    assignOpt('banco', trimOrNull(data.banco) as ProveedorInput['banco'])
    if (data.tipoCuenta !== undefined) {
      out.tipoCuenta = data.tipoCuenta
    }
    if (data.condicionPago !== undefined) {
      out.condicionPago = data.condicionPago
    }
    if (data.plazoHabitual !== undefined) {
      out.plazoHabitual = data.plazoHabitual
    }
    if (data.descuentoPct !== undefined) {
      out.descuentoPct = data.descuentoPct
    }
    if (data.limiteCredito !== undefined) {
      out.limiteCredito = data.limiteCredito
    }
    if (data.categoria !== undefined) {
      out.categoria = data.categoria
    }
    assignOpt('contactoNombre', trimOrNull(data.contactoNombre) as ProveedorInput['contactoNombre'])
    assignOpt('contactoEmail', trimOrNull(data.contactoEmail) as ProveedorInput['contactoEmail'])
    assignOpt('contactoTel', trimOrNull(data.contactoTel) as ProveedorInput['contactoTel'])
    assignOpt('notas', trimOrNull(data.notas) as ProveedorInput['notas'])
    return out
  })

const retencionPercepcionLineSchema = z.object({
  regimenId: z.number().int().min(1),
  baseImponible: z.number().positive('baseImponible must be positive'),
  alicuota: z.number().min(0).max(100),
  importe: z.number().positive('importe must be positive'),
})

export const facturaPercepcionLineSchema = retencionPercepcionLineSchema
export const cobroRetencionLineSchema = retencionPercepcionLineSchema

export const facturaBodySchema = z
  .object({
    fecha: z.string(),
    tipo: z.enum(['A', 'B'], { required_error: 'tipo must be A or B', invalid_type_error: 'tipo must be A or B' }),
    numero: z.number(),
    clienteId: z.number(),
    prefijo: z.string().optional(),
    formaPagoId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    neto1: z.number(),
    neto2: z.number(),
    neto3: z.number(),
    iva1: z.number(),
    iva2: z.number(),
    total: z.number(),
    items: z.array(z.unknown()),
    percepciones: z.array(facturaPercepcionLineSchema).optional(),
    puntosCanje: z.number().int().min(1).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const f = data.fecha.trim()
    if (f.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'fecha is required', path: ['fecha'] })
    }
    if (!Number.isInteger(data.numero) || data.numero < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'numero must be an integer', path: ['numero'] })
      if (data.numero < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'numero must be >= 1', path: ['numero'] })
      }
    }
    if (!Number.isInteger(data.clienteId) || data.clienteId < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'clienteId must be an integer', path: ['clienteId'] })
      if (data.clienteId < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'clienteId must be >= 1', path: ['clienteId'] })
      }
    }
    if (data.prefijo !== undefined && typeof data.prefijo !== 'string') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'prefijo must be a string', path: ['prefijo'] })
    }
    const fp = data.formaPagoId
    if (
      fp !== undefined &&
      fp !== null &&
      (typeof fp !== 'number' || !Number.isInteger(fp) || fp < 1)
    ) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'formaPagoId must be a positive integer or null', path: ['formaPagoId'] })
    }
    const ns = ['neto1', 'neto2', 'neto3', 'iva1', 'iva2', 'total'] as const
    for (const k of ns) {
      const v = data[k]
      if (typeof v !== 'number' || Number.isNaN(v) || v < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${k} must be a number`, path: [k] })
        if (v < 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${k} must be >= 0`, path: [k] })
        }
      }
    }
    if (!Array.isArray(data.items)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'items must be an array', path: ['items'] })
      return
    }

    data.items.forEach((entry: unknown, index: number): void => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `items[${index}] must be an object`,
          path: ['items', index],
        })
        return
      }
      const e = entry as Record<string, unknown>
      const pathLabel = (fname: string): string => `items[${index}].${fname}`

      type ItemCheck = { ok: false; message: string } | { ok: true; value: number }
      const check = (
        fname: string,
        run: (raw: unknown, pathLabel: string) => ItemCheck,
      ): void => {
        const pl = pathLabel(fname)
        const co = run(e[fname], pl)
        if (!co.ok) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: co.message,
            path: ['items', index, fname],
          })
        }
      }

      const rawArticuloId = e.articuloId
      const hasArticuloId =
        rawArticuloId !== undefined && rawArticuloId !== null && rawArticuloId !== ''
      if (hasArticuloId) {
        check('articuloId', (raw, pl) => {
          if (typeof raw !== 'number' || !Number.isInteger(raw)) {
            return { ok: false, message: `${pl} must be an integer` }
          }
          if (raw < 1) {
            return { ok: false, message: `${pl} must be >= 1` }
          }
          return { ok: true, value: raw }
        })
      } else {
        const desc = typeof e.descripcion === 'string' ? e.descripcion.trim() : ''
        if (desc.length < 1 || desc.length > 120) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${pathLabel('descripcion')} is required (1–120 chars) for ad-hoc lines`,
            path: ['items', index, 'descripcion'],
          })
        }
        const iva = e.condIva
        if (iva !== '1' && iva !== '2' && iva !== '3') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${pathLabel('condIva')} must be one of: 1, 2, 3 for ad-hoc lines`,
            path: ['items', index, 'condIva'],
          })
        }
        const us = e.unidadServicio
        if (
          us !== undefined &&
          us !== null &&
          us !== 'hora' &&
          us !== 'dia' &&
          us !== 'mes' &&
          us !== 'proyecto' &&
          us !== 'km' &&
          us !== 'unidad' &&
          us !== 'otro'
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${pathLabel('unidadServicio')} is invalid`,
            path: ['items', index, 'unidadServicio'],
          })
        }
      }

      for (const fname of ['cantidad', 'precio', 'dscto', 'subtotal'] as const) {
        check(fname, (raw, pl) => {
          if (typeof raw !== 'number' || Number.isNaN(raw)) {
            return { ok: false, message: `${pl} must be a number` }
          }
          if (raw < 0) {
            return { ok: false, message: `${pl} must be >= 0` }
          }
          return { ok: true, value: raw }
        })
      }
    })
  })
  .transform((data): FacturaInput => {
    const items: FacturaItemInput[] = Array.isArray(data.items)
      ? data.items.map((entry) => {
          const e = entry as Record<string, unknown>
          const articuloId =
            e.articuloId === undefined || e.articuloId === null
              ? null
              : (e.articuloId as number)
          const item: FacturaItemInput = {
            articuloId,
            cantidad: e.cantidad as number,
            precio: e.precio as number,
            dscto: e.dscto as number,
            subtotal: e.subtotal as number,
          }
          if (typeof e.descripcion === 'string') {
            item.descripcion = e.descripcion.trim()
          }
          if (e.condIva === '1' || e.condIva === '2' || e.condIva === '3') {
            item.condIva = e.condIva
          }
          if (
            e.unidadServicio === 'hora' ||
            e.unidadServicio === 'dia' ||
            e.unidadServicio === 'mes' ||
            e.unidadServicio === 'proyecto' ||
            e.unidadServicio === 'km' ||
            e.unidadServicio === 'unidad' ||
            e.unidadServicio === 'otro'
          ) {
            item.unidadServicio = e.unidadServicio
          } else if (e.unidadServicio === null) {
            item.unidadServicio = null
          }
          if (typeof e.nroSerie === 'string') {
            item.nroSerie = e.nroSerie.trim() || null
          } else if (e.nroSerie === null) {
            item.nroSerie = null
          }
          if (typeof e.nroImei === 'string') {
            item.nroImei = e.nroImei.trim() || null
          } else if (e.nroImei === null) {
            item.nroImei = null
          }
          return item
        })
      : []

    const out: FacturaInput = {
      fecha: data.fecha.trim(),
      tipo: data.tipo,
      numero: data.numero,
      clienteId: data.clienteId,
      ...(typeof data.prefijo === 'string' ? { prefijo: data.prefijo } : {}),
      ...(data.formaPagoId !== undefined ? { formaPagoId: data.formaPagoId } : {}),
      neto1: data.neto1,
      neto2: data.neto2,
      neto3: data.neto3,
      iva1: data.iva1,
      iva2: data.iva2,
      total: data.total,
      items,
      ...(data.percepciones != null && data.percepciones.length > 0
        ? { percepciones: data.percepciones }
        : {}),
    }
    return out
  })

export const facturaVoidBodySchema = z.object({
  motivo: z
    .string({ required_error: 'motivo is required', invalid_type_error: 'motivo must be a string' })
    .trim()
    .min(10, 'motivo must be at least 10 characters')
    .max(FACTURA_VOID_MOTIVO_MAX_LEN, `motivo must be at most ${FACTURA_VOID_MOTIVO_MAX_LEN} characters`),
})

export const facturaPrintBodySchema = z.object({
  device: z.enum(['pdf', 'fiscal', 'thermal']),
}).transform((data): FacturaPrintInput => ({
  device: data.device,
}))

export const printingTestBodySchema = z.object({
  device: z.enum(['fiscal', 'thermal']),
}).transform((data): PrintingTestInput => ({
  device: data.device,
}))

export const deliveryZoneCreateBodySchema = z
  .object({
    nombre: z.string({ required_error: 'nombre must be a string', invalid_type_error: 'nombre must be a string' }),
    tipo: deliveryZoneTipoSchema.optional(),
    diasEntrega: z.union([z.string(), z.null(), z.undefined()]).optional(),
    horario: z.union([z.string(), z.null(), z.undefined()]).optional(),
  })
  .superRefine((data, ctx) => {
    const n = data.nombre.trim()
    if (n.length === 0 || n.length > 60) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'nombre must be between 1 and 60 characters', path: ['nombre'] })
    }
    if (data.diasEntrega !== undefined && data.diasEntrega !== null && typeof data.diasEntrega !== 'string') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'diasEntrega must be a string or null', path: ['diasEntrega'] })
    }
    if (data.horario !== undefined && data.horario !== null && typeof data.horario !== 'string') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'horario must be a string or null', path: ['horario'] })
    }
    if (typeof data.diasEntrega === 'string' && data.diasEntrega.trim().length > 20) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'diasEntrega must be at most 20 characters', path: ['diasEntrega'] })
    }
    if (typeof data.horario === 'string' && data.horario.trim().length > 30) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'horario must be at most 30 characters', path: ['horario'] })
    }
  })
  .transform((data): DeliveryZoneCreateParsed => ({
    nombre: data.nombre.trim(),
    tipo: data.tipo ?? 'barrio',
    diasEntrega:
      data.diasEntrega === undefined
        ? null
        : data.diasEntrega === null
          ? null
          : data.diasEntrega.trim() === ''
            ? null
            : data.diasEntrega.trim(),
    horario:
      data.horario === undefined
        ? null
        : data.horario === null
          ? null
          : data.horario.trim() === ''
            ? null
            : data.horario.trim(),
  }))

export const deliveryZoneUpdateBodySchema = z
  .object({
    nombre: z.string().optional(),
    tipo: deliveryZoneTipoSchema.optional(),
    diasEntrega: z.union([z.string(), z.null(), z.undefined()]).optional(),
    horario: z.union([z.string(), z.null(), z.undefined()]).optional(),
    activo: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.nombre !== undefined) {
      const n = data.nombre.trim()
      if (n.length === 0 || n.length > 60) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'nombre must be between 1 and 60 characters', path: ['nombre'] })
      }
    }
    if (data.diasEntrega !== undefined && data.diasEntrega !== null && typeof data.diasEntrega !== 'string') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'diasEntrega must be a string or null', path: ['diasEntrega'] })
    }
    if (data.horario !== undefined && data.horario !== null && typeof data.horario !== 'string') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'horario must be a string or null', path: ['horario'] })
    }
    if (typeof data.diasEntrega === 'string' && data.diasEntrega.trim().length > 20) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'diasEntrega must be at most 20 characters', path: ['diasEntrega'] })
    }
    if (typeof data.horario === 'string' && data.horario.trim().length > 30) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'horario must be at most 30 characters', path: ['horario'] })
    }
  })
  .transform((data): DeliveryZoneUpdateParsed => {
    const out: DeliveryZoneUpdateParsed = {}
    if (data.nombre !== undefined) {
      out.nombre = data.nombre.trim()
    }
    if (data.tipo !== undefined) {
      out.tipo = data.tipo
    }
    if (data.diasEntrega !== undefined) {
      if (data.diasEntrega === null) {
        out.diasEntrega = null
      } else {
        const t = data.diasEntrega.trim()
        out.diasEntrega = t === '' ? null : t
      }
    }
    if (data.horario !== undefined) {
      if (data.horario === null) {
        out.horario = null
      } else {
        const t = data.horario.trim()
        out.horario = t === '' ? null : t
      }
    }
    if (data.activo !== undefined) {
      out.activo = data.activo
    }
    return out
  })

export const cobroBodySchema = z
  .object({
    clienteId: z.number(),
    fecha: z.string(),
    monto: z.number(),
    formaPagoId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    referencia: z.string().optional(),
    nota: z.string().optional(),
    chequeId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    chequeNuevo: z.union([z.object({}).passthrough(), z.null(), z.undefined()]).optional(),
    retenciones: z.array(cobroRetencionLineSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (!Number.isInteger(data.clienteId) || data.clienteId < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'clienteId must be >= 1', path: ['clienteId'] })
    }
    const f = data.fecha.trim()
    if (f.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'fecha is required', path: ['fecha'] })
    }
    if (typeof data.monto !== 'number' || Number.isNaN(data.monto) || data.monto <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'monto must be > 0', path: ['monto'] })
    }
    const fp = data.formaPagoId
    if (
      fp !== undefined &&
      fp !== null &&
      (typeof fp !== 'number' || !Number.isInteger(fp) || fp < 1)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'formaPagoId must be a positive integer or null',
        path: ['formaPagoId'],
      })
    }
    if (data.referencia !== undefined && data.referencia.length > 60) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'referencia max 60 chars', path: ['referencia'] })
    }
    if (data.nota !== undefined && data.nota.length > 200) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'nota max 200 chars', path: ['nota'] })
    }
  })
  .transform((data) => {
    const ref = data.referencia?.trim()
    const note = data.nota?.trim()
    return {
      clienteId: data.clienteId,
      fecha: data.fecha.trim(),
      monto: data.monto,
      formaPagoId: data.formaPagoId ?? null,
      referencia: ref && ref.length > 0 ? ref : null,
      nota: note && note.length > 0 ? note : null,
      ...(data.retenciones != null && data.retenciones.length > 0
        ? { retenciones: data.retenciones }
        : {}),
      chequeId: data.chequeId ?? null,
      ...(data.chequeNuevo != null && typeof data.chequeNuevo === 'object'
        ? { chequeNuevo: data.chequeNuevo as ChequeInput }
        : {}),
    } satisfies CobroInput
  })

const chequeTipoSchema = z.enum(['recibido', 'emitido'])
const chequeModalidadSchema = z.enum(['fisico', 'echeq'])

export const chequeBodySchema = z
  .object({
    tipo: chequeTipoSchema,
    modalidad: chequeModalidadSchema,
    numero: z.string(),
    banco: z.string(),
    sucursal: z.string().optional(),
    cbuOrigen: z.string().optional(),
    libradorNombre: z.string(),
    libradorCuit: z.string().optional(),
    monto: z.number(),
    moneda: z.string().optional(),
    fechaEmision: z.string(),
    fechaVencimiento: z.string(),
    clienteId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    proveedorId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    observaciones: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.numero.trim().length < 1 || data.numero.length > 30) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'numero is required (max 30)', path: ['numero'] })
    }
    if (data.banco.trim().length < 1 || data.banco.length > 50) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'banco is required (max 50)', path: ['banco'] })
    }
    if (typeof data.monto !== 'number' || data.monto <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'monto must be > 0', path: ['monto'] })
    }
  })
  .transform(
    (data): ChequeInput => ({
      tipo: data.tipo,
      modalidad: data.modalidad,
      numero: data.numero.trim(),
      banco: data.banco.trim(),
      sucursal: data.sucursal?.trim() ?? null,
      cbuOrigen: data.cbuOrigen?.trim() ?? null,
      libradorNombre: data.libradorNombre.trim(),
      libradorCuit: data.libradorCuit?.trim() ?? null,
      monto: data.monto,
      moneda: data.moneda?.trim() || 'ARS',
      fechaEmision: data.fechaEmision.trim(),
      fechaVencimiento: data.fechaVencimiento.trim(),
      clienteId: data.clienteId ?? null,
      proveedorId: data.proveedorId ?? null,
      observaciones: data.observaciones?.trim() ?? null,
    }),
  )

export const chequeUpdateBodySchema = z
  .object({
    banco: z.string().optional(),
    sucursal: z.union([z.string(), z.null(), z.undefined()]).optional(),
    cbuOrigen: z.union([z.string(), z.null(), z.undefined()]).optional(),
    libradorNombre: z.string().optional(),
    libradorCuit: z.union([z.string(), z.null(), z.undefined()]).optional(),
    fechaVencimiento: z.string().optional(),
    observaciones: z.union([z.string(), z.null(), z.undefined()]).optional(),
  })
  .transform((data): ChequeUpdateInput => data)

export const chequeTransicionBodySchema = z
  .object({
    destino: z.union([z.string(), z.null(), z.undefined()]).optional(),
    nota: z.union([z.string(), z.null(), z.undefined()]).optional(),
    proveedorId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    monto: z.union([z.number(), z.null(), z.undefined()]).optional(),
  })
  .transform(
    (data): ChequeTransicionInput => ({
      destino: data.destino?.trim() ?? null,
      nota: data.nota?.trim() ?? null,
      proveedorId: data.proveedorId ?? undefined,
      monto: data.monto ?? null,
    }),
  )

const ORDEN_ENTREGA_ESTADOS = [
  'pending',
  'picking',
  'ready',
  'assigned',
  'in_transit',
  'delivered',
  'failed',
  'cancelled',
] as const

export const ordenEntregaCreateBodySchema = z
  .object({
    clienteId: z.number(),
    fecha: z.string(),
    facturaId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    zonaId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    driverId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    nota: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!Number.isInteger(data.clienteId) || data.clienteId < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'clienteId must be >= 1', path: ['clienteId'] })
    }
    if (data.fecha.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'fecha is required', path: ['fecha'] })
    }
    for (const [field, val] of [
      ['facturaId', data.facturaId],
      ['zonaId', data.zonaId],
      ['driverId', data.driverId],
    ] as const) {
      if (
        val !== undefined &&
        val !== null &&
        (typeof val !== 'number' || !Number.isInteger(val) || val < 1)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} must be a positive integer or null`,
          path: [field],
        })
      }
    }
    if (data.nota !== undefined && data.nota.length > 200) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'nota max 200 chars', path: ['nota'] })
    }
  })
  .transform((data) => {
    const note = data.nota?.trim()
    return {
      clienteId: data.clienteId,
      fecha: data.fecha.trim(),
      facturaId: data.facturaId ?? null,
      zonaId: data.zonaId ?? null,
      driverId: data.driverId ?? null,
      nota: note && note.length > 0 ? note : null,
    }
  })

export const ordenEntregaUpdateBodySchema = z
  .object({
    estado: z.enum(ORDEN_ENTREGA_ESTADOS),
    driverId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    zonaId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    nota: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    for (const [field, val] of [
      ['driverId', data.driverId],
      ['zonaId', data.zonaId],
    ] as const) {
      if (
        val !== undefined &&
        val !== null &&
        (typeof val !== 'number' || !Number.isInteger(val) || val < 1)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} must be a positive integer or null`,
          path: [field],
        })
      }
    }
    if (data.nota !== undefined && data.nota.length > 200) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'nota max 200 chars', path: ['nota'] })
    }
  })
  .transform((data) => {
    const note = data.nota?.trim()
    return {
      estado: data.estado,
      driverId: data.driverId === undefined ? undefined : data.driverId,
      zonaId: data.zonaId === undefined ? undefined : data.zonaId,
      nota: note === undefined ? undefined : note.length > 0 ? note : null,
    }
  })

const SHIPPING_TRANSPORTISTAS = ['correo_argentino', 'andreani', 'propio', 'meli_full'] as const
const ESTADO_ENVIO_VALUES = ['pending', 'in_transit', 'delivered', 'returned'] as const
const SHIPPING_API_CARRIERS = ['andreani', 'correo_argentino'] as const

export const ordenEntregaTrackingAssignBodySchema = z
  .object({
    transportista: z.enum(SHIPPING_TRANSPORTISTAS),
    nroSeguimiento: z.string().min(1).max(80),
    estadoEnvio: z.enum(ESTADO_ENVIO_VALUES).optional(),
  })
  .transform((data) => ({
    transportista: data.transportista,
    nroSeguimiento: data.nroSeguimiento.trim(),
    estadoEnvio: data.estadoEnvio,
  }))

export const shippingCarrierConfigUpsertBodySchema = z
  .object({
    username: z.string().min(1).max(120),
    password: z.string().min(1).max(200),
    sandboxMode: z.boolean().optional(),
    activo: z.boolean().optional(),
  })
  .transform((data) => ({
    username: data.username.trim(),
    password: data.password,
    sandboxMode: data.sandboxMode,
    activo: data.activo,
  }))

export const shippingApiCarrierParamSchema = z.enum(SHIPPING_API_CARRIERS)

/**
 * @en WooCommerce Basic Auth credential save payload: `storeUrl` + consumer key/secret, optional
 *   webhook secret (#188).
 * @es Payload para guardar credenciales Basic Auth WooCommerce: `storeUrl` + consumer key/secret,
 *   webhook secret opcional (#188).
 * @pt-BR Payload para salvar credenciais Basic Auth WooCommerce: `storeUrl` + consumer key/secret,
 *   webhook secret opcional (#188).
 */
export const woocommerceCredentialsBodySchema = z.object({
  storeUrl: z
    .string({ required_error: 'storeUrl is required' })
    .trim()
    .min(1, 'storeUrl is required')
    .max(255)
    .url('storeUrl must be a valid URL')
    .refine((value) => {
      try {
        const parsed = new URL(value)
        return parsed.protocol === 'https:'
      } catch {
        return false
      }
    }, 'storeUrl must use https'),
  consumerKey: z
    .string({ required_error: 'consumerKey is required' })
    .trim()
    .min(1, 'consumerKey is required')
    .max(200),
  consumerSecret: z
    .string({ required_error: 'consumerSecret is required' })
    .trim()
    .min(1, 'consumerSecret is required')
    .max(200),
  webhookSecret: z.string().trim().max(200).optional().nullable(),
  storeName: z.string().trim().max(120).optional().nullable(),
})

export const stockAjusteBodySchema = z
  .object({
    cantidad: z.number({ invalid_type_error: 'cantidad must be a number' }),
    motivo: z.string({ invalid_type_error: 'motivo must be a string' }),
    depositoId: z.union([z.number().int().min(1), z.null()]).optional(),
    loteId: z.union([z.number().int().min(1), z.null()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (!Number.isFinite(data.cantidad) || data.cantidad === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'cantidad must be a non-zero finite number',
        path: ['cantidad'],
      })
    }
    const motivo = data.motivo.trim()
    if (motivo.length < 1 || motivo.length > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'motivo must be between 1 and 100 characters',
        path: ['motivo'],
      })
    }
  })
  .transform((data): StockAjusteInput => ({
    cantidad: data.cantidad,
    motivo: data.motivo.trim(),
    depositoId: data.depositoId ?? null,
    loteId: data.loteId ?? null,
  }))

const empresaTipoFacturaSchema = z.enum(['A', 'B', 'C'], {
  errorMap: () => ({ message: 'tipoFactura must be one of: A, B, C' }),
})

const empresaCondicionIvaSchema = z.enum(['RI', 'Mono', 'CF', 'Exento'], {
  errorMap: () => ({ message: 'condicionIva must be one of: RI, Mono, CF, Exento' }),
})

export const empresaUpdateBodySchema = z
  .object({
    nombre: z.string({ required_error: 'nombre is required', invalid_type_error: 'nombre must be a string' }),
    cuit: z.string({ required_error: 'cuit is required', invalid_type_error: 'cuit must be a string' }),
    domicilio: z.union([z.string(), z.null(), z.undefined()]).optional(),
    puntoVenta: z.number({ invalid_type_error: 'puntoVenta must be an integer' }),
    tipoFactura: empresaTipoFacturaSchema,
    logoUrl: z.union([z.string(), z.null(), z.undefined()]).optional(),
    recordatorioDiasGracia: z.number({ invalid_type_error: 'recordatorioDiasGracia must be an integer' }).optional(),
    timezone: z.string({ invalid_type_error: 'timezone must be a string' }).optional(),
    recordatorioHoraInicio: z
      .number({ invalid_type_error: 'recordatorioHoraInicio must be an integer' })
      .optional(),
    recordatorioHoraFin: z.number({ invalid_type_error: 'recordatorioHoraFin must be an integer' }).optional(),
    condicionIva: empresaCondicionIvaSchema.optional(),
    ingresosBrutos: z.union([z.string(), z.null(), z.undefined()]).optional(),
    fechaInicioActividades: z.union([z.string(), z.null(), z.undefined()]).optional(),
  })
  .superRefine((data, ctx) => {
    const nombre = data.nombre.trim()
    if (nombre.length < 1 || nombre.length > 40) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'nombre must be between 1 and 40 characters', path: ['nombre'] })
    }
    normalizeOptStr(data.domicilio === undefined ? undefined : data.domicilio, 40, 'domicilio', ctx)
    const cuitTrim = data.cuit.trim()
    if (cuitTrim.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cuit is required', path: ['cuit'] })
    } else if (!validateCUIT(cuitTrim)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cuit must be a valid Argentine CUIT', path: ['cuit'] })
    }
    if (!Number.isInteger(data.puntoVenta) || data.puntoVenta < 1 || data.puntoVenta > 9999) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'puntoVenta must be an integer between 1 and 9999',
        path: ['puntoVenta'],
      })
    }
    if (data.logoUrl !== undefined && data.logoUrl !== null && typeof data.logoUrl === 'string') {
      const logo = data.logoUrl.trim()
      if (logo.length > 255) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'logoUrl must be at most 255 characters', path: ['logoUrl'] })
      }
      if (logo.length > 0) {
        try {
          const parsed = new URL(logo)
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'logoUrl must be an http or https URL', path: ['logoUrl'] })
          }
        } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'logoUrl must be a valid URL', path: ['logoUrl'] })
        }
      }
    }
    if (data.recordatorioDiasGracia !== undefined) {
      const grace = data.recordatorioDiasGracia
      if (!Number.isInteger(grace) || grace < 0 || grace > 365) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'recordatorioDiasGracia must be an integer between 0 and 365',
          path: ['recordatorioDiasGracia'],
        })
      }
    }
    if (data.timezone !== undefined) {
      const tz = data.timezone.trim()
      if (tz.length < 1 || tz.length > 64 || !isValidIanaTimeZone(tz)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'timezone must be a valid IANA time zone',
          path: ['timezone'],
        })
      }
    }
    if (data.recordatorioHoraInicio !== undefined) {
      const h = data.recordatorioHoraInicio
      if (!Number.isInteger(h) || h < 0 || h > 23) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'recordatorioHoraInicio must be an integer between 0 and 23',
          path: ['recordatorioHoraInicio'],
        })
      }
    }
    if (data.recordatorioHoraFin !== undefined) {
      const h = data.recordatorioHoraFin
      if (!Number.isInteger(h) || h < 1 || h > 24) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'recordatorioHoraFin must be an integer between 1 and 24',
          path: ['recordatorioHoraFin'],
        })
      }
    }
    const start = data.recordatorioHoraInicio
    const end = data.recordatorioHoraFin
    if (start !== undefined && end !== undefined && start >= end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'recordatorioHoraFin must be greater than recordatorioHoraInicio',
        path: ['recordatorioHoraFin'],
      })
    }
    if (data.ingresosBrutos !== undefined && data.ingresosBrutos !== null && typeof data.ingresosBrutos === 'string') {
      const ib = data.ingresosBrutos.trim()
      if (ib.length > 30) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ingresosBrutos must be at most 30 characters',
          path: ['ingresosBrutos'],
        })
      }
    }
    if (
      data.fechaInicioActividades !== undefined &&
      data.fechaInicioActividades !== null &&
      typeof data.fechaInicioActividades === 'string'
    ) {
      const raw = data.fechaInicioActividades.trim()
      if (raw.length > 0 && !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'fechaInicioActividades must be YYYY-MM-DD',
          path: ['fechaInicioActividades'],
        })
      }
    }
  })
  .transform((data): EmpresaInput => {
    const dom =
      data.domicilio === undefined
        ? null
        : data.domicilio === null
          ? null
          : data.domicilio.trim() === ''
            ? null
            : data.domicilio.trim()
    const logo =
      data.logoUrl === undefined
        ? null
        : data.logoUrl === null
          ? null
          : data.logoUrl.trim() === ''
            ? null
            : data.logoUrl.trim()
    const ingresosBrutos =
      data.ingresosBrutos === undefined
        ? undefined
        : data.ingresosBrutos === null
          ? null
          : data.ingresosBrutos.trim() === ''
            ? null
            : data.ingresosBrutos.trim()
    const fechaInicioActividades =
      data.fechaInicioActividades === undefined
        ? undefined
        : data.fechaInicioActividades === null
          ? null
          : data.fechaInicioActividades.trim() === ''
            ? null
            : data.fechaInicioActividades.trim()

    return {
      nombre: data.nombre.trim(),
      cuit: data.cuit.trim(),
      domicilio: dom,
      puntoVenta: data.puntoVenta,
      tipoFactura: data.tipoFactura,
      logoUrl: logo,
      recordatorioDiasGracia: data.recordatorioDiasGracia,
      timezone: data.timezone?.trim(),
      recordatorioHoraInicio: data.recordatorioHoraInicio,
      recordatorioHoraFin: data.recordatorioHoraFin,
      condicionIva: data.condicionIva,
      ingresosBrutos,
      fechaInicioActividades,
    }
  })

const pedidoItemLineSchema = z
  .object({
    articuloId: z.number().nullable().optional(),
    descripcion: z.string().optional(),
    condIva: z.enum(['1', '2', '3']).optional(),
    unidadServicio: z
      .enum(['hora', 'dia', 'mes', 'proyecto', 'km', 'unidad', 'otro'])
      .nullable()
      .optional(),
    cantidad: z.number(),
    precio: z.number(),
    dscto: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    const hasArticuloId = data.articuloId != null
    if (hasArticuloId) {
      if (!Number.isInteger(data.articuloId) || (data.articuloId as number) < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'articuloId must be >= 1', path: ['articuloId'] })
      }
    } else {
      const desc = (data.descripcion ?? '').trim()
      if (desc.length < 1 || desc.length > 120) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'descripcion is required (1–120 chars) for ad-hoc lines',
          path: ['descripcion'],
        })
      }
      if (data.condIva !== '1' && data.condIva !== '2' && data.condIva !== '3') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'condIva must be one of: 1, 2, 3 for ad-hoc lines',
          path: ['condIva'],
        })
      }
    }
    if (!Number.isFinite(data.cantidad) || data.cantidad <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cantidad must be a finite number > 0', path: ['cantidad'] })
    }
    if (typeof data.precio !== 'number' || Number.isNaN(data.precio) || data.precio < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'precio must be >= 0', path: ['precio'] })
    }
    const ds = data.dscto ?? 0
    if (typeof ds !== 'number' || Number.isNaN(ds) || ds < 0 || ds > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'dscto must be between 0 and 100', path: ['dscto'] })
    }
  })

function mapPedidoItemLine(
  data: z.infer<typeof pedidoItemLineSchema>,
): PedidoItemInput {
  const dscto = data.dscto ?? 0
  const subtotal =
    Math.round((data.cantidad * data.precio - (data.cantidad * data.precio * dscto) / 100) * 100) / 100
  const item: PedidoItemInput = {
    articuloId: data.articuloId ?? null,
    cantidad: data.cantidad,
    precio: data.precio,
    dscto,
    subtotal,
  }
  if (data.descripcion !== undefined) {
    item.descripcion = data.descripcion.trim()
  }
  if (data.condIva !== undefined) {
    item.condIva = data.condIva
  }
  if (data.unidadServicio !== undefined) {
    item.unidadServicio = data.unidadServicio
  }
  return item
}

const pedidoItemsField = z
  .array(pedidoItemLineSchema)
  .min(1, 'items must contain at least one line')
  .transform((lines) => lines.map(mapPedidoItemLine))

export const pedidoBodySchema = z
  .object({
    clienteId: z.number(),
    vendedorId: z.union([z.number(), z.null()]).optional(),
    validUntil: z.union([z.string(), z.null()]).optional(),
    items: pedidoItemsField,
  })
  .superRefine((data, ctx) => {
    if (!Number.isInteger(data.clienteId) || data.clienteId < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'clienteId must be >= 1', path: ['clienteId'] })
    }
    const v = data.vendedorId
    if (v !== undefined && v !== null && (!Number.isInteger(v) || v < 1)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'vendedorId must be >= 1 or null', path: ['vendedorId'] })
    }
  })
  .transform(
    (data): PedidoInput => ({
      clienteId: data.clienteId,
      vendedorId: data.vendedorId,
      validUntil: data.validUntil,
      items: data.items,
    }),
  )

export const pedidoInvoiceBodySchema = z
  .object({
    fecha: z.string(),
    tipo: z.enum(['A', 'B'], { errorMap: () => ({ message: 'tipo must be A or B' }) }),
    numero: z.number(),
    prefijo: z.string().optional(),
    formaPagoId: z.union([z.number(), z.null()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fecha.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'fecha is required', path: ['fecha'] })
    }
    if (!Number.isInteger(data.numero) || data.numero < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'numero must be >= 1', path: ['numero'] })
    }
  })
  .transform(
    (data): PedidoInvoiceInput => ({
      fecha: data.fecha.trim(),
      tipo: data.tipo,
      numero: data.numero,
      prefijo: data.prefijo,
      formaPagoId: data.formaPagoId,
    }),
  )

const contratoFrecuenciaSchema = z.enum(['mensual', 'bimestral', 'trimestral', 'semestral', 'anual'], {
  errorMap: () => ({
    message: 'frecuencia must be one of: mensual, bimestral, trimestral, semestral, anual',
  }),
})

const contratoItemLineSchema = z
  .object({
    articuloId: z.number().nullable().optional(),
    descripcion: z.string(),
    condIva: z.enum(['1', '2', '3']).optional(),
    unidadServicio: z
      .enum(['hora', 'dia', 'mes', 'proyecto', 'km', 'unidad', 'otro'])
      .nullable()
      .optional(),
    cantidad: z.number(),
    precioUnit: z.number(),
    dscto: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    const desc = data.descripcion.trim()
    if (desc.length < 1 || desc.length > 120) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'descripcion must be 1–120 chars',
        path: ['descripcion'],
      })
    }
    const hasArticuloId = data.articuloId != null
    if (hasArticuloId) {
      if (!Number.isInteger(data.articuloId) || (data.articuloId as number) < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'articuloId must be >= 1', path: ['articuloId'] })
      }
    } else if (data.condIva !== '1' && data.condIva !== '2' && data.condIva !== '3') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'condIva must be one of: 1, 2, 3 for ad-hoc lines',
        path: ['condIva'],
      })
    }
    if (!Number.isInteger(data.cantidad) || data.cantidad < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cantidad must be >= 1', path: ['cantidad'] })
    }
    if (typeof data.precioUnit !== 'number' || Number.isNaN(data.precioUnit) || data.precioUnit < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'precioUnit must be >= 0', path: ['precioUnit'] })
    }
    const ds = data.dscto ?? 0
    if (typeof ds !== 'number' || Number.isNaN(ds) || ds < 0 || ds > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'dscto must be between 0 and 100', path: ['dscto'] })
    }
  })
  .transform(
    (data): ContratoItemInput => ({
      articuloId: data.articuloId ?? null,
      descripcion: data.descripcion.trim(),
      condIva: data.condIva,
      unidadServicio: data.unidadServicio,
      cantidad: data.cantidad,
      precioUnit: data.precioUnit,
      dscto: data.dscto ?? 0,
    }),
  )

const contratoAjusteSchema = z
  .object({
    tipo: z.enum(['porcentaje_fijo', 'manual'], {
      errorMap: () => ({ message: 'tipo must be porcentaje_fijo or manual' }),
    }),
    porcentaje: z.union([z.number(), z.null()]).optional(),
    frecuenciaAjuste: contratoFrecuenciaSchema,
    proximoAjuste: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.proximoAjuste.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'proximoAjuste is required', path: ['proximoAjuste'] })
    }
    if (data.tipo === 'porcentaje_fijo') {
      if (typeof data.porcentaje !== 'number' || Number.isNaN(data.porcentaje) || data.porcentaje <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'porcentaje must be > 0 for porcentaje_fijo',
          path: ['porcentaje'],
        })
      }
    }
  })

function refineContratoBody(
  data: {
    clienteId: number
    nombre: string
    diaDelMes: number
    fechaInicio: string
    items: unknown[]
  },
  ctx: z.RefinementCtx,
): void {
  if (!Number.isInteger(data.clienteId) || data.clienteId < 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'clienteId must be >= 1', path: ['clienteId'] })
  }
  if (data.nombre.trim().length < 1 || data.nombre.trim().length > 120) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'nombre must be 1–120 chars', path: ['nombre'] })
  }
  if (!Number.isInteger(data.diaDelMes) || data.diaDelMes < 1 || data.diaDelMes > 31) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'diaDelMes must be 1–31', path: ['diaDelMes'] })
  }
  if (data.fechaInicio.trim().length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'fechaInicio is required', path: ['fechaInicio'] })
  }
  if (!Array.isArray(data.items) || data.items.length < 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'items must contain at least one line', path: ['items'] })
  }
}

const contratoBodyObject = z.object({
  clienteId: z.number(),
  nombre: z.string(),
  descripcion: z.union([z.string(), z.null()]).optional(),
  frecuencia: contratoFrecuenciaSchema,
  diaDelMes: z.number(),
  fechaInicio: z.string(),
  fechaFin: z.union([z.string(), z.null()]).optional(),
  proximaFact: z.string().optional(),
  moneda: z.string().optional(),
  incluyeIVA: z.boolean().optional(),
  ivaAlicuota: z.number().optional(),
  modoEmision: z.enum(['auto', 'revision']).optional(),
  tipoFactura: z.enum(['A', 'B']).optional(),
  prefijo: z.string().optional(),
  items: z.array(contratoItemLineSchema).min(1),
  ajuste: contratoAjusteSchema.nullable().optional(),
})

export const contratoBodySchema = contratoBodyObject.superRefine(refineContratoBody).transform(
  (data): ContratoInput => ({
    clienteId: data.clienteId,
    nombre: data.nombre.trim(),
    descripcion:
      data.descripcion === undefined || data.descripcion === null
        ? data.descripcion ?? null
        : data.descripcion.trim().slice(0, 500),
    frecuencia: data.frecuencia,
    diaDelMes: data.diaDelMes,
    fechaInicio: data.fechaInicio.trim(),
    fechaFin:
      data.fechaFin === undefined || data.fechaFin === null ? data.fechaFin ?? null : data.fechaFin.trim(),
    proximaFact: data.proximaFact?.trim(),
    moneda: data.moneda?.trim() || 'ARS',
    incluyeIVA: data.incluyeIVA,
    ivaAlicuota: data.ivaAlicuota,
    modoEmision: data.modoEmision,
    tipoFactura: data.tipoFactura,
    prefijo: data.prefijo?.trim(),
    items: data.items,
    ajuste:
      data.ajuste === undefined || data.ajuste === null
        ? data.ajuste ?? null
        : {
            tipo: data.ajuste.tipo,
            porcentaje: data.ajuste.porcentaje,
            frecuenciaAjuste: data.ajuste.frecuenciaAjuste,
            proximoAjuste: data.ajuste.proximoAjuste.trim(),
          },
  }),
)

export const contratoUpdateBodySchema = contratoBodyObject
  .extend({
    estado: z.enum(['activo', 'pausado', 'finalizado', 'cancelado']).optional(),
  })
  .superRefine(refineContratoBody)
  .transform(
    (data): ContratoUpdateInput => ({
      clienteId: data.clienteId,
      nombre: data.nombre.trim(),
      descripcion:
        data.descripcion === undefined || data.descripcion === null
          ? data.descripcion ?? null
          : data.descripcion.trim().slice(0, 500),
      frecuencia: data.frecuencia,
      diaDelMes: data.diaDelMes,
      fechaInicio: data.fechaInicio.trim(),
      fechaFin:
        data.fechaFin === undefined || data.fechaFin === null ? data.fechaFin ?? null : data.fechaFin.trim(),
      proximaFact: data.proximaFact?.trim(),
      moneda: data.moneda?.trim() || 'ARS',
      incluyeIVA: data.incluyeIVA,
      ivaAlicuota: data.ivaAlicuota,
      modoEmision: data.modoEmision,
      tipoFactura: data.tipoFactura,
      prefijo: data.prefijo?.trim(),
      items: data.items,
      estado: data.estado,
      ajuste:
        data.ajuste === undefined || data.ajuste === null
          ? data.ajuste ?? null
          : {
              tipo: data.ajuste.tipo,
              porcentaje: data.ajuste.porcentaje,
              frecuenciaAjuste: data.ajuste.frecuenciaAjuste,
              proximoAjuste: data.ajuste.proximoAjuste.trim(),
            },
    }),
  )

export const contratoAjusteManualBodySchema = z
  .object({
    porcentaje: z.number(),
  })
  .superRefine((data, ctx) => {
    if (typeof data.porcentaje !== 'number' || Number.isNaN(data.porcentaje) || data.porcentaje === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'porcentaje must be a non-zero number',
        path: ['porcentaje'],
      })
    }
  })
  .transform((data): ContratoAjusteManualInput => ({ porcentaje: data.porcentaje }))

const otEstadoSchema = z.enum([
  'recibido',
  'diagnosticado',
  'presupuestado',
  'aprobado',
  'en_reparacion',
  'listo',
  'entregado',
  'facturado',
  'cancelado',
  'sin_reparacion',
])

const otPrioridadSchema = z.enum(['baja', 'normal', 'alta', 'urgente'])

const otItemTipoSchema = z.enum(['mano_de_obra', 'repuesto', 'servicio'])

const otItemSchema = z
  .object({
    tipo: otItemTipoSchema,
    descripcion: z.string(),
    articuloId: z.union([z.number(), z.null()]).optional(),
    cantidad: z.number(),
    precioUnit: z.number(),
    condIva: z.enum(['1', '2', '3']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.descripcion.trim().length < 1 || data.descripcion.trim().length > 120) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'descripcion must be 1–120 chars',
        path: ['descripcion'],
      })
    }
    if (typeof data.cantidad !== 'number' || Number.isNaN(data.cantidad) || data.cantidad <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cantidad must be > 0', path: ['cantidad'] })
    }
    if (typeof data.precioUnit !== 'number' || Number.isNaN(data.precioUnit) || data.precioUnit < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'precioUnit must be >= 0', path: ['precioUnit'] })
    }
    if (data.tipo === 'repuesto') {
      if (data.articuloId == null || !Number.isInteger(data.articuloId) || data.articuloId < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'articuloId is required for repuesto',
          path: ['articuloId'],
        })
      }
    }
  })
  .transform(
    (data): OrdenTrabajoItemInput => ({
      tipo: data.tipo,
      descripcion: data.descripcion.trim().slice(0, 120),
      articuloId: data.articuloId ?? null,
      cantidad: data.cantidad,
      precioUnit: data.precioUnit,
      condIva: data.condIva ?? '1',
    }),
  )

function refineOtBody(
  data: {
    clienteId: number
    equipoDescripcion: string
    sintomaReportado: string
  },
  ctx: z.RefinementCtx,
): void {
  if (!Number.isInteger(data.clienteId) || data.clienteId < 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'clienteId must be >= 1', path: ['clienteId'] })
  }
  if (data.equipoDescripcion.trim().length < 1 || data.equipoDescripcion.trim().length > 200) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'equipoDescripcion must be 1–200 chars',
      path: ['equipoDescripcion'],
    })
  }
  if (data.sintomaReportado.trim().length < 1 || data.sintomaReportado.trim().length > 500) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'sintomaReportado must be 1–500 chars',
      path: ['sintomaReportado'],
    })
  }
}

const otBodyObject = z.object({
  clienteId: z.number(),
  tecnicoId: z.union([z.number(), z.null()]).optional(),
  prioridad: otPrioridadSchema.optional(),
  equipoMarca: z.union([z.string(), z.null()]).optional(),
  equipoModelo: z.union([z.string(), z.null()]).optional(),
  equipoNroSerie: z.union([z.string(), z.null()]).optional(),
  equipoDescripcion: z.string(),
  sintomaReportado: z.string(),
  diagnostico: z.union([z.string(), z.null()]).optional(),
  trabajoRealizado: z.union([z.string(), z.null()]).optional(),
  fechaPromesa: z.union([z.string(), z.null()]).optional(),
  observaciones: z.union([z.string(), z.null()]).optional(),
  enGarantia: z.boolean().optional(),
  garantiaVence: z.union([z.string(), z.null()]).optional(),
  otGarantiaId: z.union([z.number(), z.null()]).optional(),
  items: z.array(otItemSchema).optional(),
})

function mapOtBody(data: z.infer<typeof otBodyObject>): OrdenTrabajoInput {
  return {
    clienteId: data.clienteId,
    tecnicoId: data.tecnicoId ?? null,
    prioridad: data.prioridad,
    equipoMarca: data.equipoMarca?.trim() || null,
    equipoModelo: data.equipoModelo?.trim() || null,
    equipoNroSerie: data.equipoNroSerie?.trim() || null,
    equipoDescripcion: data.equipoDescripcion.trim().slice(0, 200),
    sintomaReportado: data.sintomaReportado.trim().slice(0, 500),
    diagnostico: data.diagnostico?.trim() || null,
    trabajoRealizado: data.trabajoRealizado?.trim() || null,
    fechaPromesa: data.fechaPromesa?.trim() || null,
    observaciones: data.observaciones?.trim() || null,
    enGarantia: data.enGarantia,
    garantiaVence: data.garantiaVence?.trim() || null,
    otGarantiaId: data.otGarantiaId ?? null,
    items: data.items,
  }
}

export const ordenTrabajoBodySchema = otBodyObject.superRefine(refineOtBody).transform(mapOtBody)

export const ordenTrabajoUpdateBodySchema = otBodyObject
  .extend({
    estado: otEstadoSchema.optional(),
    fechaEntrega: z.union([z.string(), z.null()]).optional(),
    presupuesto: z.union([z.number(), z.null()]).optional(),
  })
  .superRefine(refineOtBody)
  .transform(
    (data): OrdenTrabajoUpdateInput => ({
      ...mapOtBody(data),
      estado: data.estado,
      fechaEntrega: data.fechaEntrega?.trim() || null,
      presupuesto: data.presupuesto,
    }),
  )

export const ordenTrabajoTransitionBodySchema = z
  .object({
    estado: otEstadoSchema,
    diagnostico: z.union([z.string(), z.null()]).optional(),
    trabajoRealizado: z.union([z.string(), z.null()]).optional(),
    fechaPromesa: z.union([z.string(), z.null()]).optional(),
    fechaEntrega: z.union([z.string(), z.null()]).optional(),
    tecnicoId: z.union([z.number(), z.null()]).optional(),
    observaciones: z.union([z.string(), z.null()]).optional(),
    items: z.array(otItemSchema).optional(),
  })
  .transform(
    (data): OrdenTrabajoTransitionInput => ({
      estado: data.estado,
      diagnostico: data.diagnostico?.trim() || null,
      trabajoRealizado: data.trabajoRealizado?.trim() || null,
      fechaPromesa: data.fechaPromesa?.trim() || null,
      fechaEntrega: data.fechaEntrega?.trim() || null,
      tecnicoId: data.tecnicoId ?? null,
      observaciones: data.observaciones?.trim() || null,
      items: data.items,
    }),
  )

export const ordenTrabajoFacturarBodySchema = z
  .object({
    tipo: z.enum(['A', 'B']).optional(),
    prefijo: z.string().optional(),
  })
  .transform(
    (data): OrdenTrabajoFacturarInput => ({
      tipo: data.tipo,
      prefijo: data.prefijo?.trim(),
    }),
  )

export const garantiaRegisterBodySchema = z
  .object({
    articuloId: z.number().int().min(1),
    clienteId: z.number().int().min(1),
    facturaId: z.union([z.number().int().min(1), z.null()]).optional(),
    facturaItemId: z.union([z.number().int().min(1), z.null()]).optional(),
    nroSerie: z.union([z.string(), z.null()]).optional(),
    nroImei: z.union([z.string(), z.null()]).optional(),
    descripcionEquipo: z.union([z.string(), z.null()]).optional(),
    fechaVenta: z.union([z.string(), z.null()]).optional(),
    mesesGarantia: z.union([z.number().int().min(1), z.null()]).optional(),
  })
  .transform((data) => ({
    articuloId: data.articuloId,
    clienteId: data.clienteId,
    facturaId: data.facturaId ?? null,
    facturaItemId: data.facturaItemId ?? null,
    nroSerie: data.nroSerie?.trim() || null,
    nroImei: data.nroImei?.trim() || null,
    descripcionEquipo: data.descripcionEquipo?.trim() || null,
    fechaVenta: data.fechaVenta?.trim() || undefined,
    mesesGarantia: data.mesesGarantia ?? undefined,
  }))

export const garantiaUsoBodySchema = z
  .object({
    otId: z.union([z.number().int().min(1), z.null()]).optional(),
    descripcion: z.string().min(1).max(500),
  })
  .transform((data) => ({
    otId: data.otId ?? null,
    descripcion: data.descripcion.trim(),
  }))

/** Resultado de validar un objeto arbitrario (p. ej. fila CSV → raw) con un schema Zod de dominio. */
export type SafeParseBodyResult<T> = { ok: true; value: T } | { ok: false; error: string }

/**
 * Valida `raw` con el mismo schema que `validateBody` en rutas JSON (p. ej. import CSV tras `csvRowToRaw*`).
 */
function firstZodIssueMessage(err: z.ZodError): string {
  const issue = err.errors[0]
  if (!issue) {
    return 'Validation failed'
  }
  const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
  const m = issue.message
  const combined = `${path}${m}`.trim()
  return combined.length > 0 ? combined : 'Validation failed'
}

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'from/to must be YYYY-MM-DD')

function refineReportesPeriodOrder(
  data: { from: string; to: string },
  ctx: z.RefinementCtx,
): void {
  if (data.from > data.to) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'from must be on or before to',
      path: ['from'],
    })
  }
}

export const reportesPeriodQuerySchema = z
  .object({
    from: isoDateString,
    to: isoDateString,
  })
  .superRefine(refineReportesPeriodOrder)

export const reportesVentasQuerySchema = z
  .object({
    from: isoDateString,
    to: isoDateString,
    agrupar: z.enum(['dia', 'semana', 'mes']).default('dia'),
  })
  .superRefine(refineReportesPeriodOrder)

const optionalPositiveIntQuery = z
  .string()
  .optional()
  .transform((v) => {
    if (v === undefined || v === '') return undefined
    const n = Number.parseInt(v, 10)
    if (!Number.isFinite(n) || n < 1) return NaN
    return n
  })
  .refine((v) => v === undefined || !Number.isNaN(v), {
    message: 'must be a positive integer',
  })

export const notasCreditoListQuerySchema = z
  .object({
    from: isoDateString,
    to: isoDateString,
    clienteId: optionalPositiveIntQuery,
  })
  .superRefine(refineReportesPeriodOrder)

export const logisticaReportesQuerySchema = z
  .object({
    from: isoDateString,
    to: isoDateString,
    choferId: optionalPositiveIntQuery,
  })
  .superRefine(refineReportesPeriodOrder)

export const dashboardVentasHistoricoQuerySchema = z
  .object({
    from: isoDateString,
    to: isoDateString,
    groupBy: z.enum(['day', 'week', 'month']).default('day'),
    vendedorId: optionalPositiveIntQuery,
    deliveryZoneId: optionalPositiveIntQuery,
  })
  .superRefine(refineReportesPeriodOrder)

const ordenCompraItemBodySchema = z
  .object({
    articuloId: z.number({ invalid_type_error: 'articuloId must be a number' }),
    cantidad: z.number({ invalid_type_error: 'cantidad must be a number' }),
    costoUnitario: z.number({ invalid_type_error: 'costoUnitario must be a number' }),
  })
  .superRefine((data, ctx) => {
    if (!Number.isInteger(data.articuloId) || data.articuloId < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'articuloId must be a positive integer', path: ['articuloId'] })
    }
    if (!Number.isInteger(data.cantidad) || data.cantidad < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cantidad must be a positive integer', path: ['cantidad'] })
    }
    if (!Number.isFinite(data.costoUnitario) || data.costoUnitario < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'costoUnitario must be a non-negative number',
        path: ['costoUnitario'],
      })
    }
  })
  .transform((data): OrdenCompraItemInput => ({
    articuloId: data.articuloId,
    cantidad: data.cantidad,
    costoUnitario: data.costoUnitario,
  }))

export const ordenCompraCreateBodySchema = z
  .object({
    proveedorId: z.number({ invalid_type_error: 'proveedorId must be a number' }),
    fechaEstimada: z.union([z.string(), z.null(), z.undefined()]).optional(),
    nota: z.union([z.string(), z.null(), z.undefined()]).optional(),
    items: z.array(ordenCompraItemBodySchema).min(1, 'items must contain at least one line'),
  })
  .superRefine((data, ctx) => {
    if (!Number.isInteger(data.proveedorId) || data.proveedorId < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'proveedorId must be a positive integer',
        path: ['proveedorId'],
      })
    }
    if (data.nota !== undefined && data.nota !== null && data.nota.length > 200) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'nota max 200 chars', path: ['nota'] })
    }
  })
  .transform((data): OrdenCompraCreateInput => {
    const note = data.nota?.trim()
    return {
      proveedorId: data.proveedorId,
      fechaEstimada: data.fechaEstimada ?? null,
      nota: note === undefined ? null : note.length > 0 ? note : null,
      items: data.items,
    }
  })

export const ordenCompraUpdateBodySchema = z
  .object({
    proveedorId: z.number({ invalid_type_error: 'proveedorId must be a number' }).optional(),
    fechaEstimada: z.union([z.string(), z.null(), z.undefined()]).optional(),
    nota: z.union([z.string(), z.null(), z.undefined()]).optional(),
    items: z.array(ordenCompraItemBodySchema).min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.proveedorId !== undefined &&
      (!Number.isInteger(data.proveedorId) || data.proveedorId < 1)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'proveedorId must be a positive integer',
        path: ['proveedorId'],
      })
    }
    if (data.nota !== undefined && data.nota !== null && data.nota.length > 200) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'nota max 200 chars', path: ['nota'] })
    }
  })
  .transform((data): OrdenCompraUpdateInput => {
    const note = data.nota?.trim()
    return {
      proveedorId: data.proveedorId,
      fechaEstimada: data.fechaEstimada,
      nota:
        data.nota === undefined ? undefined : note === undefined || note.length === 0 ? null : note,
      items: data.items,
    }
  })

export const ordenCompraReceiveBodySchema = z
  .object({
    lines: z
      .array(
        z
          .object({
            itemId: z.number({ invalid_type_error: 'itemId must be a number' }),
            cantidad: z.number({ invalid_type_error: 'cantidad must be a number' }),
            nroLote: z.string().trim().min(1).max(60).nullable().optional(),
            fechaVencimiento: z.string().trim().min(1).nullable().optional(),
          })
          .superRefine((line, ctx) => {
            if (!Number.isInteger(line.itemId) || line.itemId < 1) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'itemId must be a positive integer',
                path: ['itemId'],
              })
            }
            if (!Number.isFinite(line.cantidad) || line.cantidad <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'cantidad must be a positive finite number',
                path: ['cantidad'],
              })
            }
            const hasLot = Boolean(line.nroLote) || Boolean(line.fechaVencimiento)
            if (hasLot && (!line.nroLote || !line.fechaVencimiento)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'nroLote and fechaVencimiento are required together',
                path: ['nroLote'],
              })
            }
            if (line.fechaVencimiento) {
              const d = new Date(line.fechaVencimiento)
              if (Number.isNaN(d.getTime())) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'fechaVencimiento must be a valid date',
                  path: ['fechaVencimiento'],
                })
              }
            }
          }),
      )
      .min(1, 'lines must contain at least one entry'),
  })
  .transform((data): { lines: OrdenCompraReceiveLineInput[] } => ({
    lines: data.lines.map((line) => ({
      itemId: line.itemId,
      cantidad: line.cantidad,
      nroLote: line.nroLote ?? null,
      fechaVencimiento: line.fechaVencimiento ?? null,
    })),
  }))

export const recuentoItemsBodySchema = z
  .object({
    lines: z
      .array(
        z
          .object({
            articuloId: z.number({ invalid_type_error: 'articuloId must be a number' }),
            cantFisica: z.number({ invalid_type_error: 'cantFisica must be a number' }),
          })
          .superRefine((line, ctx) => {
            if (!Number.isInteger(line.articuloId) || line.articuloId < 1) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'articuloId must be a positive integer',
                path: ['articuloId'],
              })
            }
            if (!Number.isInteger(line.cantFisica) || line.cantFisica < 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'cantFisica must be a non-negative integer',
                path: ['cantFisica'],
              })
            }
          }),
      )
      .min(1, 'lines must contain at least one entry'),
  })
  .transform((data): { lines: RecuentoItemLineInput[] } => ({ lines: data.lines }))

export const repartoCreateBodySchema = z
  .object({
    fecha: z.string().min(1, 'fecha is required'),
    choferId: z.number({ invalid_type_error: 'choferId must be a number' }),
    vehiculo: z.string().max(60).nullable().optional(),
    observaciones: z.string().max(500).nullable().optional(),
    ordenEntregaIds: z
      .array(z.number({ invalid_type_error: 'ordenEntregaIds entries must be numbers' }))
      .min(1, 'ordenEntregaIds must contain at least one id'),
  })
  .superRefine((body, ctx) => {
    if (!Number.isInteger(body.choferId) || body.choferId < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'choferId must be a positive integer',
        path: ['choferId'],
      })
    }
    for (let i = 0; i < body.ordenEntregaIds.length; i++) {
      const id = body.ordenEntregaIds[i]
      if (!Number.isInteger(id) || id < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ordenEntregaIds entries must be positive integers',
          path: ['ordenEntregaIds', i],
        })
      }
    }
  })

const motivoNoEntregaEnum = z.enum([
  'ausente',
  'rechazo',
  'domicilio_incorrecto',
  'producto_dañado',
  'otro',
])

export const repartoItemPodBodySchema = z
  .object({
    outcome: z.enum(['delivered', 'not_delivered']),
    receptorNombre: z.string().max(120).nullable().optional(),
    receptorDni: z.string().max(20).nullable().optional(),
    firmaBase64: z.string().nullable().optional(),
    fotoBase64: z.string().nullable().optional(),
    notasEntrega: z.string().max(500).nullable().optional(),
    motivoNoEntrega: motivoNoEntregaEnum.nullable().optional(),
  })
  .superRefine((body, ctx) => {
    if (body.outcome === 'delivered') {
      const name = body.receptorNombre?.trim() ?? ''
      if (name.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'receptorNombre is required for delivered outcome',
          path: ['receptorNombre'],
        })
      }
      const firma = body.firmaBase64?.trim() ?? ''
      if (firma.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'firmaBase64 is required for delivered outcome',
          path: ['firmaBase64'],
        })
      }
    }
    if (body.outcome === 'not_delivered' && body.motivoNoEntrega == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'motivoNoEntrega is required for not_delivered outcome',
        path: ['motivoNoEntrega'],
      })
    }
  })

export const repartoUbicacionBodySchema = z
  .object({
    lat: z.number(),
    lng: z.number(),
  })
  .superRefine((body, ctx) => {
    if (body.lat < -90 || body.lat > 90) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'lat must be between -90 and 90', path: ['lat'] })
    }
    if (body.lng < -180 || body.lng > 180) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'lng must be between -180 and 180', path: ['lng'] })
    }
  })

const libroIvaPeriodoString = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'periodo must be YYYY-MM')

export const libroIvaVentasQuerySchema = z.object({
  periodo: libroIvaPeriodoString,
  format: z.enum(['txt', 'xlsx', 'preview']).default('preview'),
})

export const libroIvaComprasQuerySchema = libroIvaVentasQuerySchema

/** @en Supplier purchase voucher body (#306). */
const movimientoProveedorCCTipoSchema = z.enum(
  ['factura_compra', 'pago', 'nc_proveedor', 'ajuste'],
  { invalid_type_error: 'tipo must be factura_compra, pago, nc_proveedor or ajuste' },
)

/** @en Supplier ledger manual adjustment body (#270). */
export const proveedorCuentaCorrienteAjusteBodySchema = z
  .object({
    monto: z.number().refine((v) => v !== 0, { message: 'monto must be non-zero' }),
    motivo: z.string().trim().min(1, 'motivo is required').max(500),
  })
  .transform((data): ProveedorCuentaCorrienteAjusteInput => ({
    monto: data.monto,
    motivo: data.motivo,
  }))

export { movimientoProveedorCCTipoSchema }

/** @en Customer ledger movement type filter (#232). */
const movimientoClienteCCTipoSchema = z.enum(
  [
    'saldo_inicial',
    'factura',
    'nota_credito',
    'cobro',
    'retencion',
    'percepcion',
    'cheque_rechazado',
    'ajuste',
  ],
  { invalid_type_error: 'Invalid cliente cuenta corriente tipo filter' },
)

/** @en Customer ledger manual adjustment body (#232). */
export const clienteCuentaCorrienteAjusteBodySchema = z
  .object({
    monto: z.number().refine((v) => v !== 0, { message: 'monto must be non-zero' }),
    motivo: z.string().trim().min(1, 'motivo is required').max(500),
  })
  .transform((data): ClienteCuentaCorrienteAjusteInput => ({
    monto: data.monto,
    motivo: data.motivo,
  }))

/** @en Customer account statement email body (#232). */
export const clienteCuentaCorrienteEnviarBodySchema = z.object({
  email: z.string().email().max(50).optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
})

export { movimientoClienteCCTipoSchema }

const reciboPagoMetodoSchema = z.enum(['transferencia', 'cheque', 'efectivo', 'echeq'])

const reciboPagoRetencionLineSchema = retencionPercepcionLineSchema

/** @en Supplier payment receipt body (#271, #276 retenciones). */
export const reciboPagoBodySchema = z
  .object({
    fecha: z.string(),
    total: z.number().positive('total must be positive'),
    metodoPago: reciboPagoMetodoSchema,
    cbu: z.union([z.string(), z.null(), z.undefined()]).optional(),
    referencia: z.union([z.string(), z.null(), z.undefined()]).optional(),
    notas: z.union([z.string(), z.null(), z.undefined()]).optional(),
    chequeId: z.union([z.number(), z.null(), z.undefined()]).optional(),
    facturas: z
      .array(
        z.object({
          comprobanteCompraId: z.union([z.number(), z.null(), z.undefined()]).optional(),
          facturaRef: z.string().trim().min(1).max(40),
          monto: z.number().positive('monto must be positive'),
        }),
      )
      .min(1, 'At least one factura allocation is required'),
    retenciones: z.array(reciboPagoRetencionLineSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const f = data.fecha.trim()
    if (f.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'fecha is required', path: ['fecha'] })
    }
    if (data.cbu != null && data.cbu.length > 22) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cbu max 22 chars', path: ['cbu'] })
    }
    if (data.referencia != null && data.referencia.length > 60) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'referencia max 60 chars', path: ['referencia'] })
    }
    if (data.notas != null && data.notas.length > 500) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'notas max 500 chars', path: ['notas'] })
    }
    for (const line of data.facturas) {
      if (line.comprobanteCompraId != null && (!Number.isInteger(line.comprobanteCompraId) || line.comprobanteCompraId < 1)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'comprobanteCompraId must be >= 1',
          path: ['facturas'],
        })
      }
    }
    const bruto = data.facturas.reduce((sum, line) => sum + line.monto, 0)
    const retTotal = (data.retenciones ?? []).reduce((sum, line) => sum + line.importe, 0)
    const expectedNet = bruto - retTotal
    if (Math.abs(expectedNet - data.total) > 0.009) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'total must equal sum of facturas minus sum of retenciones',
        path: ['total'],
      })
    }
  })

const reciboCobroFormaTipoSchema = z.enum([
  'efectivo',
  'transferencia',
  'cheque',
  'mercadopago',
  'tarjeta',
  'otro',
])

/** @en Customer payment receipt body (#233). */
export const reciboCobroBodySchema = z
  .object({
    fecha: z.string(),
    totalCobrado: z.number().positive('totalCobrado must be positive'),
    concepto: z.union([z.string(), z.null(), z.undefined()]).optional(),
    fifo: z.boolean().optional(),
    formas: z
      .array(
        z.object({
          tipo: reciboCobroFormaTipoSchema,
          importe: z.number().positive('importe must be positive'),
          chequeId: z.union([z.number(), z.null(), z.undefined()]).optional(),
          chequeNuevo: z.union([z.object({}).passthrough(), z.null(), z.undefined()]).optional(),
          referencia: z.union([z.string(), z.null(), z.undefined()]).optional(),
          banco: z.union([z.string(), z.null(), z.undefined()]).optional(),
        }),
      )
      .min(1, 'At least one payment method is required'),
    imputaciones: z
      .array(
        z.object({
          facturaId: z.number().int().min(1),
          importe: z.number().positive('importe must be positive'),
        }),
      )
      .optional(),
    retenciones: z.array(retencionPercepcionLineSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const f = data.fecha.trim()
    if (f.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'fecha is required', path: ['fecha'] })
    }
    if (data.concepto != null && data.concepto.length > 500) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'concepto max 500 chars', path: ['concepto'] })
    }
    const formasTotal = data.formas.reduce((sum, line) => sum + line.importe, 0)
    if (Math.abs(formasTotal - data.totalCobrado) > 0.009) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'totalCobrado must equal sum of formas importe',
        path: ['totalCobrado'],
      })
    }
  })

export const reciboCobroVoidBodySchema = z.object({
  anulacionMotivo: z.string().trim().min(3, 'anulacionMotivo is required'),
})

const comprobanteCompraFieldsSchema = z.object({
  fecha: z.string(),
  tipo: z.enum(['A', 'B', 'C'], {
    required_error: 'tipo must be A, B or C',
    invalid_type_error: 'tipo must be A, B or C',
  }),
  prefijo: z.string().min(1).max(4),
  numero: z.number().int().min(1),
  proveedorId: z.number().int().min(1),
  ordenCompraId: z.number().int().min(1).optional(),
  neto1: z.number().min(0),
  neto2: z.number().min(0),
  neto3: z.number().min(0),
  iva1: z.number().min(0),
  iva2: z.number().min(0),
  total: z.number().min(0),
  cae: z.string().max(20).optional(),
  caeVto: z.string().optional(),
  vencimiento: z.string().optional(),
})

export const comprobanteCompraBodySchema = comprobanteCompraFieldsSchema.superRefine((data, ctx) => {
  const f = data.fecha.trim()
  if (f.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'fecha is required', path: ['fecha'] })
  }
})

export const documentoCompraItemPreviewSchema = z.object({
  descripcion: z.string().min(1),
  cantidad: z.number().positive(),
  precioUnitario: z.number().min(0),
  subtotal: z.number().min(0),
  articuloId: z.number().int().min(1).nullable().optional(),
  confianza: z.number().min(0).max(1).optional(),
})

export const documentoCompraConfirmBodySchema = comprobanteCompraFieldsSchema
  .extend({
    documentoId: z.number().int().min(1),
    items: z.array(documentoCompraItemPreviewSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const f = data.fecha.trim()
    if (f.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'fecha is required', path: ['fecha'] })
    }
  })

export const documentoCompraTemplateBodySchema = z.object({
  content: z.string().min(20, 'YAML template content is required'),
})

export const facturaPendienteEstadoSchema = z.enum([
  'pendiente',
  'proxima_vencer',
  'vencida_hoy',
  'vencida_critica',
])

export const facturasPendientesQuerySchema = z.object({
  estado: facturaPendienteEstadoSchema.optional(),
  proveedorId: z.coerce.number().int().min(1).optional(),
})

export const proveedorHistorialQuerySchema = z.object({
  dias: z.coerce.number().int().refine((v) => [30, 90, 180, 365].includes(v), {
    message: 'dias must be one of: 30, 90, 180, 365',
  }).optional(),
})

export const articuloProveedoresSortFieldSchema = z.enum(['precio', 'precioListaFecha', 'ultimaCompra'])

export const articuloProveedoresComparadorQuerySchema = z.object({
  sortBy: articuloProveedoresSortFieldSchema.optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
})

export const proveedoresCompararQuerySchema = articuloProveedoresComparadorQuerySchema.extend({
  articuloId: z.coerce.number().int().min(1),
})

export type ProveedorArticuloInput = {
  articuloId: number
  codigoProveedor: string
  descripcion?: string | null
  precioLista?: number | null
  unidadCompra?: string | null
  multiplo?: number
  activo?: boolean
}

export type ProveedorArticuloUpdateInput = {
  codigoProveedor?: string
  descripcion?: string | null
  precioLista?: number | null
  unidadCompra?: string | null
  multiplo?: number
  activo?: boolean
}

export const proveedorArticuloBodySchema = z
  .object({
    articuloId: z.number(),
    codigoProveedor: z.string(),
    descripcion: z.union([z.string(), z.null(), z.undefined()]).optional(),
    precioLista: z.union([z.number(), z.null(), z.undefined()]).optional(),
    unidadCompra: z.union([z.string(), z.null(), z.undefined()]).optional(),
    multiplo: z.union([z.number(), z.undefined()]).optional(),
    activo: z.union([z.boolean(), z.undefined()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (!Number.isInteger(data.articuloId) || data.articuloId < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'articuloId must be a positive integer',
        path: ['articuloId'],
      })
    }
    const code = data.codigoProveedor.trim()
    if (code.length < 1 || code.length > 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'codigoProveedor must be between 1 and 50 characters',
        path: ['codigoProveedor'],
      })
    }
    if (data.descripcion != null && typeof data.descripcion === 'string' && data.descripcion.length > 120) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'descripcion must be at most 120 characters',
        path: ['descripcion'],
      })
    }
    if (data.unidadCompra != null && typeof data.unidadCompra === 'string' && data.unidadCompra.length > 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'unidadCompra must be at most 30 characters',
        path: ['unidadCompra'],
      })
    }
    if (data.precioLista != null && (typeof data.precioLista !== 'number' || Number.isNaN(data.precioLista) || data.precioLista < 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'precioLista must be >= 0',
        path: ['precioLista'],
      })
    }
    if (data.multiplo !== undefined && (typeof data.multiplo !== 'number' || Number.isNaN(data.multiplo) || data.multiplo <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'multiplo must be > 0',
        path: ['multiplo'],
      })
    }
  })
  .transform((data): ProveedorArticuloInput => {
    const trimOrNull = (v: unknown): string | null | undefined => {
      if (v === undefined) return undefined
      if (v === null) return null
      if (typeof v !== 'string') return undefined
      const t = v.trim()
      return t === '' ? null : t
    }
    const out: ProveedorArticuloInput = {
      articuloId: data.articuloId,
      codigoProveedor: data.codigoProveedor.trim(),
    }
    const desc = trimOrNull(data.descripcion)
    if (desc !== undefined) out.descripcion = desc
    if (data.precioLista !== undefined) out.precioLista = data.precioLista
    const unidad = trimOrNull(data.unidadCompra)
    if (unidad !== undefined) out.unidadCompra = unidad
    if (data.multiplo !== undefined) out.multiplo = data.multiplo
    if (data.activo !== undefined) out.activo = data.activo
    return out
  })

export const proveedorArticuloUpdateBodySchema = z
  .object({
    codigoProveedor: z.union([z.string(), z.undefined()]).optional(),
    descripcion: z.union([z.string(), z.null(), z.undefined()]).optional(),
    precioLista: z.union([z.number(), z.null(), z.undefined()]).optional(),
    unidadCompra: z.union([z.string(), z.null(), z.undefined()]).optional(),
    multiplo: z.union([z.number(), z.undefined()]).optional(),
    activo: z.union([z.boolean(), z.undefined()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.codigoProveedor !== undefined) {
      const code = data.codigoProveedor.trim()
      if (code.length < 1 || code.length > 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'codigoProveedor must be between 1 and 50 characters',
          path: ['codigoProveedor'],
        })
      }
    }
    if (data.descripcion != null && typeof data.descripcion === 'string' && data.descripcion.length > 120) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'descripcion must be at most 120 characters',
        path: ['descripcion'],
      })
    }
    if (data.unidadCompra != null && typeof data.unidadCompra === 'string' && data.unidadCompra.length > 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'unidadCompra must be at most 30 characters',
        path: ['unidadCompra'],
      })
    }
    if (data.precioLista != null && (typeof data.precioLista !== 'number' || Number.isNaN(data.precioLista) || data.precioLista < 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'precioLista must be >= 0',
        path: ['precioLista'],
      })
    }
    if (data.multiplo !== undefined && (typeof data.multiplo !== 'number' || Number.isNaN(data.multiplo) || data.multiplo <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'multiplo must be > 0',
        path: ['multiplo'],
      })
    }
  })
  .transform((data): ProveedorArticuloUpdateInput => {
    const trimOrNull = (v: unknown): string | null | undefined => {
      if (v === undefined) return undefined
      if (v === null) return null
      if (typeof v !== 'string') return undefined
      const t = v.trim()
      return t === '' ? null : t
    }
    const out: ProveedorArticuloUpdateInput = {}
    if (data.codigoProveedor !== undefined) out.codigoProveedor = data.codigoProveedor.trim()
    const desc = trimOrNull(data.descripcion)
    if (desc !== undefined) out.descripcion = desc
    if (data.precioLista !== undefined) out.precioLista = data.precioLista
    const unidad = trimOrNull(data.unidadCompra)
    if (unidad !== undefined) out.unidadCompra = unidad
    if (data.multiplo !== undefined) out.multiplo = data.multiplo
    if (data.activo !== undefined) out.activo = data.activo
    return out
  })

export const proveedorArticuloImportRowSchema = z.object({
  codigo_proveedor: z.string().min(1).max(50),
  codigo_interno: z.coerce.number().int().positive(),
  precio: z.union([z.coerce.number().nonnegative(), z.literal(''), z.null()]).optional(),
  unidad: z.union([z.string().max(30), z.literal(''), z.null()]).optional(),
})

export const alertaProveedorConfigBodySchema = z
  .object({
    diasPrevioAviso: z.number().int().min(0).max(90).optional(),
    diasCritico: z.number().int().min(1).max(365).optional(),
    notifEmail: z.boolean().optional(),
    notifInApp: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.diasPrevioAviso != null &&
      data.diasCritico != null &&
      data.diasCritico <= data.diasPrevioAviso
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'diasCritico must be greater than diasPrevioAviso',
        path: ['diasCritico'],
      })
    }
  })

const regimenTipoSchema = z.enum(['ganancias', 'iva', 'iibb'])
const regimenSubtipoSchema = z.enum(['retencion', 'percepcion'])

export const regimenRetencionBodySchema = z.object({
  tipo: regimenTipoSchema,
  subtipo: regimenSubtipoSchema,
  nombre: z.string().trim().min(1).max(80),
  alicuota: z.number().min(0).max(100),
  alicuotaMin: z.number().min(0).nullable().optional(),
  provincia: z.string().trim().max(10).nullable().optional(),
  activo: z.boolean().optional(),
})

export const regimenRetencionUpdateBodySchema = z
  .object({
    nombre: z.string().trim().min(1).max(80).optional(),
    alicuota: z.number().min(0).max(100).optional(),
    alicuotaMin: z.number().min(0).nullable().optional(),
    provincia: z.string().trim().max(10).nullable().optional(),
    activo: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const fiscalRetencionesConfigBodySchema = z.object({
  esAgenteRetencionGanancias: z.boolean().optional(),
  esAgenteRetencionIVA: z.boolean().optional(),
  esAgenteRetencionIIBB: z.boolean().optional(),
})

export const retencionesPreviewQuerySchema = z.object({
  entidadTipo: z.enum(['cliente', 'proveedor']),
  entidadId: z.coerce.number().int().min(1),
  monto: z.coerce.number().positive(),
  contexto: z.enum(['factura', 'cobro']).optional(),
  neto1: z.coerce.number().min(0).optional(),
  neto2: z.coerce.number().min(0).optional(),
  neto3: z.coerce.number().min(0).optional(),
})

export const presentacionRetencionBodySchema = z.object({
  formato: z.enum(['sicore', 'sifere']),
  periodo: z.string().regex(/^\d{4}-\d{2}$/, 'periodo must be YYYY-MM'),
})

const remitoItemField = z
  .array(
    z.object({
      articuloId: z.number(),
      descripcion: z.string(),
      cantidad: z.number(),
      unidad: z.string(),
    }),
  )
  .min(1, 'items must contain at least one line')
  .superRefine((items, ctx) => {
    items.forEach((it, idx) => {
      if (!Number.isInteger(it.articuloId) || it.articuloId < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'articuloId must be >= 1', path: [idx, 'articuloId'] })
      }
      const desc = it.descripcion.trim()
      if (desc.length < 1 || desc.length > 120) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'descripcion must be 1-120 characters', path: [idx, 'descripcion'] })
      }
      if (!Number.isInteger(it.cantidad) || it.cantidad < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cantidad must be >= 1', path: [idx, 'cantidad'] })
      }
      const unidad = it.unidad.trim()
      if (unidad.length < 1 || unidad.length > 6) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'unidad must be 1-6 characters', path: [idx, 'unidad'] })
      }
    })
  })
  .transform((items): RemitoItemInput[] =>
    items.map((it) => ({
      articuloId: it.articuloId,
      descripcion: it.descripcion.trim(),
      cantidad: it.cantidad,
      unidad: it.unidad.trim(),
    })),
  )

export const remitoBodySchema = z
  .object({
    tipo: z.enum(['remito_x', 'remito_ingreso'], {
      errorMap: () => ({ message: 'tipo must be remito_x or remito_ingreso' }),
    }),
    clienteId: z.union([z.number(), z.null()]).optional(),
    proveedorId: z.union([z.number(), z.null()]).optional(),
    facturaId: z.union([z.number(), z.null()]).optional(),
    pedidoId: z.union([z.number(), z.null()]).optional(),
    ordenEntregaId: z.union([z.number(), z.null()]).optional(),
    fecha: z.string().optional(),
    observaciones: z.union([z.string(), z.null()]).optional(),
    items: remitoItemField,
  })
  .transform(
    (data): RemitoInput => ({
      tipo: data.tipo,
      clienteId: data.clienteId,
      proveedorId: data.proveedorId,
      facturaId: data.facturaId,
      pedidoId: data.pedidoId,
      ordenEntregaId: data.ordenEntregaId,
      fecha: data.fecha,
      observaciones: data.observaciones,
      items: data.items,
    }),
  )

export const remitoUpdateBodySchema = z
  .object({
    clienteId: z.union([z.number(), z.null()]).optional(),
    proveedorId: z.union([z.number(), z.null()]).optional(),
    observaciones: z.union([z.string(), z.null()]).optional(),
    items: remitoItemField.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' })
  .transform((data): RemitoUpdateInput => data)

export const remitoEntregarBodySchema = z
  .object({
    firmadoPor: z.string(),
    fechaEntrega: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const name = data.firmadoPor.trim()
    if (name.length < 2 || name.length > 120) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'firmadoPor must be 2-120 characters', path: ['firmadoPor'] })
    }
  })
  .transform(
    (data): RemitoEntregarInput => ({
      firmadoPor: data.firmadoPor.trim(),
      fechaEntrega: data.fechaEntrega,
    }),
  )

export function safeParseBodySchema<S extends z.ZodTypeAny>(schema: S, raw: unknown): SafeParseBodyResult<z.output<S>> {
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: firstZodIssueMessage(parsed.error) }
  }
  return { ok: true, value: parsed.data }
}

export const cajaCreateBodySchema = z
  .object({
    nombre: z.string().min(1).max(80),
  })
  .transform((data) => ({ nombre: data.nombre.trim() }))

export const turnoCajaOpenBodySchema = z
  .object({
    cajaId: z.number().int().min(1),
    montoApertura: z.number().min(0),
  })
  .transform((data) => ({
    cajaId: data.cajaId,
    montoApertura: data.montoApertura,
  }))

const conteoEfectivoSchema = z.object({
  b1000: z.number().int().min(0).optional(),
  b500: z.number().int().min(0).optional(),
  b200: z.number().int().min(0).optional(),
  b100: z.number().int().min(0).optional(),
  b50: z.number().int().min(0).optional(),
  b20: z.number().int().min(0).optional(),
  b10: z.number().int().min(0).optional(),
  m10: z.number().int().min(0).optional(),
  m5: z.number().int().min(0).optional(),
  m2: z.number().int().min(0).optional(),
  m1: z.number().int().min(0).optional(),
})

export const turnoCajaCloseBodySchema = z
  .object({
    conteo: conteoEfectivoSchema,
    observaciones: z.union([z.string().max(500), z.null()]).optional(),
  })
  .transform((data) => ({
    conteo: data.conteo,
    observaciones: data.observaciones?.trim() || null,
  }))

export const movimientoCajaManualBodySchema = z
  .object({
    tipo: z.enum(['egreso', 'ingreso_extra']),
    importe: z.number().positive(),
    concepto: z.union([z.string().max(200), z.null()]).optional(),
    formaPago: z.enum(['efectivo', 'tarjeta', 'mp', 'transferencia', 'otro']).optional(),
  })
  .transform((data) => ({
    tipo: data.tipo,
    importe: data.importe,
    concepto: data.concepto?.trim() || null,
    formaPago: data.formaPago ?? ('efectivo' as const),
  }))

export const formaPagoPatchBodySchema = z
  .object({
    esEfectivo: z.boolean(),
  })
  .transform((data) => ({ esEfectivo: data.esEfectivo }))

// ── Listas de precios (Issue #234) ──────────────────────────────────────────

const isoOrNullDate = z.union([isoDateString, z.null()]).optional()

export const listaPrecioCreateBodySchema = z
  .object({
    nombre: z.string().min(1).max(80),
    moneda: z.string().length(3).optional(),
    activa: z.boolean().optional(),
    esDefault: z.boolean().optional(),
    vigenciaHasta: isoOrNullDate,
  })
  .transform((data) => ({
    nombre: data.nombre.trim(),
    moneda: (data.moneda ?? 'ARS').toUpperCase(),
    activa: data.activa ?? true,
    esDefault: data.esDefault ?? false,
    vigenciaHasta: data.vigenciaHasta ?? null,
  }))

export const listaPrecioPatchBodySchema = z
  .object({
    nombre: z.string().min(1).max(80).optional(),
    moneda: z.string().length(3).optional(),
    activa: z.boolean().optional(),
    esDefault: z.boolean().optional(),
    vigenciaHasta: isoOrNullDate,
  })
  .transform((data) => {
    const out: {
      nombre?: string
      moneda?: string
      activa?: boolean
      esDefault?: boolean
      vigenciaHasta?: string | null
    } = {}
    if (data.nombre !== undefined) out.nombre = data.nombre.trim()
    if (data.moneda !== undefined) out.moneda = data.moneda.toUpperCase()
    if (data.activa !== undefined) out.activa = data.activa
    if (data.esDefault !== undefined) out.esDefault = data.esDefault
    if (data.vigenciaHasta !== undefined) out.vigenciaHasta = data.vigenciaHasta
    return out
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'at least one field is required',
  })

const precioEscalonadoSchema = z
  .object({
    cantidadDesde: z.number().min(0),
    cantidadHasta: z.union([z.number().positive(), z.null()]).optional(),
    precio: z.number().min(0),
  })
  .superRefine((data, ctx) => {
    if (
      data.cantidadHasta !== undefined &&
      data.cantidadHasta !== null &&
      data.cantidadHasta <= data.cantidadDesde
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'cantidadHasta must be greater than cantidadDesde',
        path: ['cantidadHasta'],
      })
    }
  })

export const listaPrecioItemBodySchema = z
  .object({
    articuloId: z.number().int().min(1),
    tipoPrecio: z.enum(['fijo', 'porcentaje_sobre_base']),
    precio: z.number().min(0).optional(),
    porcentaje: z.number().optional(),
    escalonados: z.array(precioEscalonadoSchema).max(50).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipoPrecio === 'fijo' && (data.precio === undefined || data.precio === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'precio is required when tipoPrecio=fijo',
        path: ['precio'],
      })
    }
    if (
      data.tipoPrecio === 'porcentaje_sobre_base' &&
      (data.porcentaje === undefined || data.porcentaje === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'porcentaje is required when tipoPrecio=porcentaje_sobre_base',
        path: ['porcentaje'],
      })
    }
  })
  .transform((data) => ({
    articuloId: data.articuloId,
    tipoPrecio: data.tipoPrecio,
    precio: data.tipoPrecio === 'fijo' ? (data.precio ?? 0) : null,
    porcentaje: data.tipoPrecio === 'porcentaje_sobre_base' ? (data.porcentaje ?? 0) : null,
    escalonados: (data.escalonados ?? []).map((e) => ({
      cantidadDesde: e.cantidadDesde,
      cantidadHasta: e.cantidadHasta ?? null,
      precio: e.precio,
    })),
  }))

export const listaPrecioBulkUpdateBodySchema = z
  .object({
    porcentaje: z.number(),
    preview: z.boolean().optional(),
  })
  .transform((data) => ({
    porcentaje: data.porcentaje,
    preview: data.preview ?? false,
  }))

const requiredPositiveIntQuery = z
  .string()
  .min(1)
  .transform((v) => Number.parseInt(v, 10))
  .refine((v) => Number.isFinite(v) && v >= 1, {
    message: 'must be a positive integer',
  })

const positiveNumberQuery = z
  .string()
  .optional()
  .transform((v) => {
    if (v === undefined || v === '') return 1
    return Number.parseFloat(v)
  })
  .refine((v) => Number.isFinite(v) && v > 0, {
    message: 'must be a positive number',
  })

export const precioEfectivoQuerySchema = z.object({
  articuloId: requiredPositiveIntQuery,
  listaPrecioId: optionalPositiveIntQuery,
  cantidad: positiveNumberQuery,
})

// ── Variantes / categorías (#235) ───────────────────────────────────────────

export const categoriaArticuloCreateBodySchema = z
  .object({
    nombre: z.string().min(1).max(80),
    codigo: z.union([z.string().max(20), z.null()]).optional(),
    padreId: z.union([z.number().int().min(1), z.null()]).optional(),
    precioDefault: z.union([z.number().min(0), z.null()]).optional(),
    activo: z.boolean().optional(),
  })
  .transform((data) => ({
    nombre: data.nombre.trim(),
    codigo: data.codigo === undefined ? null : data.codigo === null ? null : data.codigo.trim() || null,
    padreId: data.padreId ?? null,
    precioDefault: data.precioDefault ?? null,
    activo: data.activo ?? true,
  }))

export const categoriaArticuloPatchBodySchema = z
  .object({
    nombre: z.string().min(1).max(80).optional(),
    codigo: z.union([z.string().max(20), z.null()]).optional(),
    padreId: z.union([z.number().int().min(1), z.null()]).optional(),
    precioDefault: z.union([z.number().min(0), z.null()]).optional(),
    activo: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'at least one field is required' })
  .transform((data) => {
    const out: {
      nombre?: string
      codigo?: string | null
      padreId?: number | null
      precioDefault?: number | null
      activo?: boolean
    } = {}
    if (data.nombre !== undefined) out.nombre = data.nombre.trim()
    if (data.codigo !== undefined) {
      out.codigo = data.codigo === null ? null : data.codigo.trim() || null
    }
    if (data.padreId !== undefined) out.padreId = data.padreId
    if (data.precioDefault !== undefined) out.precioDefault = data.precioDefault
    if (data.activo !== undefined) out.activo = data.activo
    return out
  })

export const categoriaAtributoCreateBodySchema = z
  .object({
    nombre: z.string().min(1).max(40),
    orden: z.number().int().min(0).optional(),
    valores: z
      .array(
        z.object({
          valor: z.string().min(1).max(40),
          orden: z.number().int().min(0).optional(),
        }),
      )
      .optional(),
  })
  .transform((data) => ({
    nombre: data.nombre.trim(),
    orden: data.orden ?? 0,
    valores: (data.valores ?? []).map((v, i) => ({
      valor: v.valor.trim(),
      orden: v.orden ?? i,
    })),
  }))

export const categoriaAtributoPatchBodySchema = z
  .object({
    nombre: z.string().min(1).max(40).optional(),
    orden: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'at least one field is required' })
  .transform((data) => {
    const out: { nombre?: string; orden?: number } = {}
    if (data.nombre !== undefined) out.nombre = data.nombre.trim()
    if (data.orden !== undefined) out.orden = data.orden
    return out
  })

export const categoriaAtributoValorCreateBodySchema = z
  .object({
    valor: z.string().min(1).max(40),
    orden: z.number().int().min(0).optional(),
  })
  .transform((data) => ({
    valor: data.valor.trim(),
    orden: data.orden ?? 0,
  }))

export const generarVariantesBodySchema = z
  .object({
    atributoValorIdsPorAtributo: z.array(z.array(z.number().int().min(1)).min(1)).min(1),
    codigoInicio: z.number().int().min(1).optional(),
  })
  .transform((data) => ({
    atributoValorIdsPorAtributo: data.atributoValorIdsPorAtributo,
    codigoInicio: data.codigoInicio,
  }))

export const articuloOfertaCreateBodySchema = z
  .object({
    precioOferta: z.number().min(0),
    vigenciaDesde: isoDateString,
    vigenciaHasta: isoDateString,
    activa: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (new Date(data.vigenciaHasta).getTime() < new Date(data.vigenciaDesde).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'vigenciaHasta must be >= vigenciaDesde',
        path: ['vigenciaHasta'],
      })
    }
  })
  .transform((data) => ({
    precioOferta: data.precioOferta,
    vigenciaDesde: data.vigenciaDesde,
    vigenciaHasta: data.vigenciaHasta,
    activa: data.activa ?? true,
  }))

export const articuloOfertaPatchBodySchema = z
  .object({
    precioOferta: z.number().min(0).optional(),
    vigenciaDesde: isoDateString.optional(),
    vigenciaHasta: isoDateString.optional(),
    activa: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'at least one field is required' })

export const articuloImagenReorderBodySchema = z.object({
  ordenIds: z.array(z.number().int().min(1)).min(1),
})

export const precioCatalogoEfectivoQuerySchema = z.object({
  articuloId: requiredPositiveIntQuery,
})

// ── Depósitos / transferencias (#236) ───────────────────────────────────────

const depositoTipoSchema = z.enum(['central', 'sucursal', 'externo', 'picking', 'transito'])

export const depositoCreateBodySchema = z
  .object({
    nombre: z.string().min(1).max(80),
    codigo: z.string().min(1).max(20),
    tipo: depositoTipoSchema,
    direccion: z.union([z.string().max(200), z.null()]).optional(),
    responsableId: z.union([z.number().int().min(1), z.null()]).optional(),
    activo: z.boolean().optional(),
    esDefault: z.boolean().optional(),
  })
  .transform((data) => ({
    nombre: data.nombre.trim(),
    codigo: data.codigo.trim().toUpperCase(),
    tipo: data.tipo,
    direccion:
      data.direccion === undefined || data.direccion === null
        ? null
        : data.direccion.trim() || null,
    responsableId: data.responsableId ?? null,
    activo: data.activo ?? true,
    esDefault: data.esDefault ?? false,
  }))

export const depositoPatchBodySchema = z
  .object({
    nombre: z.string().min(1).max(80).optional(),
    codigo: z.string().min(1).max(20).optional(),
    tipo: depositoTipoSchema.optional(),
    direccion: z.union([z.string().max(200), z.null()]).optional(),
    responsableId: z.union([z.number().int().min(1), z.null()]).optional(),
    activo: z.boolean().optional(),
    esDefault: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'at least one field is required' })
  .transform((data) => {
    const out: {
      nombre?: string
      codigo?: string
      tipo?: z.infer<typeof depositoTipoSchema>
      direccion?: string | null
      responsableId?: number | null
      activo?: boolean
      esDefault?: boolean
    } = {}
    if (data.nombre !== undefined) out.nombre = data.nombre.trim()
    if (data.codigo !== undefined) out.codigo = data.codigo.trim().toUpperCase()
    if (data.tipo !== undefined) out.tipo = data.tipo
    if (data.direccion !== undefined) {
      out.direccion = data.direccion === null ? null : data.direccion.trim() || null
    }
    if (data.responsableId !== undefined) out.responsableId = data.responsableId
    if (data.activo !== undefined) out.activo = data.activo
    if (data.esDefault !== undefined) out.esDefault = data.esDefault
    return out
  })

export const transferenciaDepositoCreateBodySchema = z
  .object({
    origenId: z.number().int().min(1),
    destinoId: z.number().int().min(1),
    nota: z.union([z.string().max(200), z.null()]).optional(),
    items: z
      .array(
        z.object({
          articuloId: z.number().int().min(1),
          cantidadEnviada: z.number().int().min(1),
        }),
      )
      .min(1),
  })
  .refine((data) => data.origenId !== data.destinoId, {
    message: 'origenId and destinoId must differ',
  })
  .transform((data) => ({
    origenId: data.origenId,
    destinoId: data.destinoId,
    nota: data.nota === undefined || data.nota === null ? null : data.nota.trim() || null,
    items: data.items,
  }))

export const transferenciaDepositoRecibirBodySchema = z.object({
  items: z
    .array(
      z.object({
        articuloId: z.number().int().min(1),
        cantidadRecibida: z.number().int().min(0),
      }),
    )
    .min(1),
})

const comisionTipoSchema = z.enum([
  'porcentaje_cobrado',
  'porcentaje_facturado',
  'importe_fijo_por_venta',
])

export const configComisionCreateBodySchema = z.object({
  vendedorId: z.number().int().min(1),
  tipo: comisionTipoSchema,
  alicuota: z.number().min(0),
  vigenciaDesde: z.string().min(1),
  vigenciaHasta: z.union([z.string().min(1), z.null()]).optional(),
  articuloCategoriaId: z.union([z.number().int().min(1), z.null()]).optional(),
  clienteId: z.union([z.number().int().min(1), z.null()]).optional(),
})

export const configComisionPatchBodySchema = z.object({
  vendedorId: z.number().int().min(1).optional(),
  tipo: comisionTipoSchema.optional(),
  alicuota: z.number().min(0).optional(),
  vigenciaDesde: z.string().min(1).optional(),
  vigenciaHasta: z.union([z.string().min(1), z.null()]).optional(),
  articuloCategoriaId: z.union([z.number().int().min(1), z.null()]).optional(),
  clienteId: z.union([z.number().int().min(1), z.null()]).optional(),
})

export const liquidacionGenerarBodySchema = z.object({
  periodo: z.string().regex(/^\d{4}-\d{2}$/),
  vendedorId: z.number().int().min(1).optional(),
})

export const comisionesSettingsBodySchema = z.object({
  modoDevengo: comisionTipoSchema,
})

const tipoCambioTipoSchema = z.enum(['oficial', 'mep', 'ccl', 'blue', 'manual'])
const monedaFxSchema = z.enum(['USD', 'EUR'])

export const tipoCambioManualBodySchema = z.object({
  moneda: monedaFxSchema,
  tipo: tipoCambioTipoSchema,
  valor: z.number().positive(),
  fecha: z.string().min(1).optional(),
})

export const tipoCambioPreferidoBodySchema = z.object({
  tipoCambioPreferido: tipoCambioTipoSchema,
})

export const tipoCambioSyncBodySchema = z.object({
  moneda: monedaFxSchema.optional(),
})

const formulaInsumoUnidadSchema = z.enum(['kg', 'g', 'l', 'ml', 'unidad', 'hora'])

export const formulaInsumoBodySchema = z.object({
  articuloId: z.number().int().min(1),
  cantidad: z.number().positive(),
  unidad: formulaInsumoUnidadSchema,
  esOpcional: z.boolean().optional(),
  orden: z.number().int().min(0).optional(),
})

export const formulaProduccionCreateBodySchema = z.object({
  articuloId: z.number().int().min(1),
  rendimiento: z.number().positive(),
  unidadRendimiento: z.string().min(1).max(12).optional(),
  observaciones: z.string().max(500).nullable().optional(),
  insumos: z.array(formulaInsumoBodySchema).min(1),
})

export const formulaProduccionUpdateBodySchema = z.object({
  rendimiento: z.number().positive(),
  unidadRendimiento: z.string().min(1).max(12).optional(),
  observaciones: z.string().max(500).nullable().optional(),
  insumos: z.array(formulaInsumoBodySchema).min(1),
})

export const formulaProyeccionBodySchema = z.object({
  unidades: z.number().positive(),
})

export const ordenProduccionCreateBodySchema = z.object({
  articuloId: z.number().int().min(1),
  cantidadPlanif: z.number().positive(),
  depositoId: z.number().int().min(1).optional(),
  fechaPlanif: z.string().min(1).max(30).optional(),
  operadorId: z.number().int().min(1).nullable().optional(),
  observaciones: z.string().max(500).nullable().optional(),
})

export const ordenProduccionCompletarBodySchema = z.object({
  cantidadReal: z.number().positive(),
  insumos: z
    .array(
      z.object({
        articuloId: z.number().int().min(1),
        cantidadReal: z.number().min(0),
      }),
    )
    .optional(),
})

export const ordenProduccionSugerirCompraBodySchema = z.object({
  proveedorId: z.number().int().min(1),
})

export const configFidelizacionUpsertBodySchema = z.object({
  activo: z.boolean(),
  nombre: z.string().trim().min(1).max(80).optional(),
  pesosPorPunto: z.number().positive(),
  puntosPorPeso: z.number().positive(),
  mesesVencimiento: z.number().int().min(1).max(120).nullable().optional(),
  montoMinCompra: z.number().min(0).optional(),
  aplicaEnDescuento: z.boolean().optional(),
})

export const fidelizacionAjusteBodySchema = z.object({
  clienteId: z.number().int().min(1),
  puntos: z.number().int().refine((v) => v !== 0, { message: 'puntos must be non-zero' }),
  concepto: z.string().max(200).nullable().optional(),
})

export const configFefoUpsertBodySchema = z.object({
  diasAlertaVencimiento: z.number().int().min(1).max(365),
})

export const loteCreateBodySchema = z.object({
  articuloId: z.number().int().min(1),
  depositoId: z.number().int().min(1),
  nroLote: z.string().trim().min(1).max(60),
  fechaVencimiento: z.string().trim().min(1),
  proveedorId: z.number().int().min(1).nullable().optional(),
  stockInicial: z.number().int().min(0).optional(),
})

export const loteListQuerySchema = z.object({
  articuloId: z.coerce.number().int().min(1).optional(),
  depositoId: z.coerce.number().int().min(1).optional(),
  soloActivos: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => (v === undefined ? true : v === true || v === 'true')),
  porVencer: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => v === true || v === 'true'),
})

export const trazabilidadQuerySchema = z.object({
  loteId: z.coerce.number().int().min(1),
})
