import { z } from 'zod'
import { validateCUIT } from '../../src/lib/validators'
import { isValidIanaTimeZone } from '../lib/tenantLocalTime'
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
  PedidoInput,
  PedidoInvoiceInput,
  PedidoItemInput,
  ProveedorInput,
  RubroInput,
  OrdenCompraCreateInput,
  OrdenCompraItemInput,
  OrdenCompraReceiveLineInput,
  OrdenCompraUpdateInput,
  RecuentoItemLineInput,
  StockAjusteInput,
} from '../createApp.types'

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
    const ci = typeof data.cuit === 'string' ? data.cuit.trim() : data.cuit
    if (ci != null && typeof ci === 'string' && ci !== '' && !validateCUIT(ci)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cuit must be a valid Argentine CUIT', path: ['cuit'] })
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
    return out
  })

export const articuloBodySchema = z
  .object({
    codigo: z.number(),
    descripcion: z.string(),
    rubroId: z.number(),
    condIva: z.enum(['1', '2', '3'], { errorMap: () => ({ message: 'condIva must be one of: 1, 2, 3' }) }),
    umedida: z.string(),
    precioLista1: z.number(),
    precioLista2: z.number(),
    costo: z.number(),
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
    if (d.length < 3 || d.length > 30) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'descripcion must be a string between 3 and 30 characters', path: ['descripcion'] })
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
    if (!Number.isInteger(data.stock) || data.stock < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'stock must be an integer', path: ['stock'] })
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'stock must be >= 0', path: ['stock'] })
    }
    if (!Number.isInteger(data.minimo) || data.minimo < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'minimo must be an integer', path: ['minimo'] })
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'minimo must be >= 0', path: ['minimo'] })
    }
  })
  .transform(
    (data): ArticuloInput => ({
      codigo: data.codigo,
      descripcion: data.descripcion.trim(),
      rubroId: data.rubroId,
      condIva: data.condIva,
      umedida: data.umedida.trim(),
      precioLista1: data.precioLista1,
      precioLista2: data.precioLista2,
      costo: data.costo,
      stock: data.stock,
      minimo: data.minimo,
      activo: data.activo,
    }),
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
    }
    const fa = trimOrNull(data.fantasia)
    if (fa !== undefined) {
      out.fantasia = fa
    }
    const cu = trimOrNull(data.cuit)
    if (cu !== undefined) {
      out.cuit = cu
    }
    const te = trimOrNull(data.telef)
    if (te !== undefined) {
      out.telef = te
    }
    const em = trimOrNull(data.email)
    if (em !== undefined) {
      out.email = em
    }
    return out
  })

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
      const pathLabel = (fname: keyof FacturaItemInput): string => `items[${index}].${String(fname)}`

      type ItemCheck = { ok: false; message: string } | { ok: true; value: number }
      const check = (
        fname: keyof FacturaItemInput,
        run: (raw: unknown, pathLabel: string) => ItemCheck,
      ): void => {
        const pl = pathLabel(fname)
        const co = run(e[String(fname)], pl)
        if (!co.ok) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: co.message,
            path: ['items', index, String(fname)],
          })
        }
      }

      check('articuloId', (raw, pl) => {
        if (typeof raw !== 'number' || !Number.isInteger(raw)) {
          return { ok: false, message: `${pl} must be an integer` }
        }
        if (raw < 1) {
          return { ok: false, message: `${pl} must be >= 1` }
        }
        return { ok: true, value: raw }
      })

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
      ? data.items.map(
          (entry) =>
            entry as FacturaItemInput /* validated in superRefine */,
        )
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
    }
  })

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

export const stockAjusteBodySchema = z
  .object({
    cantidad: z.number({ invalid_type_error: 'cantidad must be a number' }),
    motivo: z.string({ invalid_type_error: 'motivo must be a string' }),
  })
  .superRefine((data, ctx) => {
    if (!Number.isInteger(data.cantidad) || data.cantidad === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'cantidad must be a non-zero integer',
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
    articuloId: z.number(),
    cantidad: z.number(),
    precio: z.number(),
    dscto: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (!Number.isInteger(data.articuloId) || data.articuloId < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'articuloId must be >= 1', path: ['articuloId'] })
    }
    if (!Number.isInteger(data.cantidad) || data.cantidad < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cantidad must be >= 1', path: ['cantidad'] })
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
  return {
    articuloId: data.articuloId,
    cantidad: data.cantidad,
    precio: data.precio,
    dscto,
    subtotal,
  }
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
          })
          .superRefine((line, ctx) => {
            if (!Number.isInteger(line.itemId) || line.itemId < 1) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'itemId must be a positive integer',
                path: ['itemId'],
              })
            }
            if (!Number.isInteger(line.cantidad) || line.cantidad < 1) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'cantidad must be a positive integer',
                path: ['cantidad'],
              })
            }
          }),
      )
      .min(1, 'lines must contain at least one entry'),
  })
  .transform((data): { lines: OrdenCompraReceiveLineInput[] } => ({ lines: data.lines }))

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

export function safeParseBodySchema<S extends z.ZodTypeAny>(schema: S, raw: unknown): SafeParseBodyResult<z.output<S>> {
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: firstZodIssueMessage(parsed.error) }
  }
  return { ok: true, value: parsed.data }
}
