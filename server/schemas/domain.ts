import { z } from 'zod'
import { validateCUIT } from '../../src/lib/validators'
import type {
  ArticuloInput,
  ClienteInput,
  DeliveryZoneCreateParsed,
  DeliveryZoneUpdateParsed,
  FacturaInput,
  FacturaItemInput,
  ProveedorInput,
  RubroInput,
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
    .min(1, 'motivo is required')
    .max(FACTURA_VOID_MOTIVO_MAX_LEN, `motivo must be at most ${FACTURA_VOID_MOTIVO_MAX_LEN} characters`),
})

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
