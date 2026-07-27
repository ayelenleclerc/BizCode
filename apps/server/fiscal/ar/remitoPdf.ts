import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'
import { mapRemitoPublic, type RemitoRow } from '../../services/RemitoService'
import { renderRemitoPdfA4 } from './remitoPdfLayout'

/**
 * @en Builds remito PDF buffer for download (#230).
 * @es Genera buffer PDF de remito para descarga (#230).
 * @pt-BR Gera buffer PDF de remessa para download (#230).
 */
export async function buildRemitoPdfBuffer(
  prisma: PrismaClient,
  tenantId: number,
  remitoId: number,
): Promise<ServiceResult<Buffer>> {
  const remito = await prisma.remito.findFirst({
    where: { id: remitoId, tenantId },
    include: {
      cliente: { select: { rsocial: true, cuit: true, domicilio: true, condIva: true } },
      proveedor: { select: { rsocial: true, cuit: true } },
      items: { select: { descripcion: true, cantidad: true, unidad: true } },
    },
  })
  if (!remito) {
    return { ok: false, status: 404, error: 'Remito not found' }
  }
  if (remito.estado === 'borrador' || remito.estado === 'anulado') {
    return { ok: false, status: 409, error: 'REMITO_PDF_NOT_AVAILABLE' }
  }

  const empresa = await prisma.paramEmpresa.findFirst({
    where: { tenantId },
    select: { nombre: true, cuit: true, domicilio: true, condicionIva: true },
  })

  const mapped = mapRemitoPublic(remito as RemitoRow)
  const buffer = await renderRemitoPdfA4({
    empresa: {
      nombre: empresa?.nombre ?? 'BizCode',
      cuit: empresa?.cuit ?? '',
      domicilio: empresa?.domicilio ?? null,
      condicionIva: empresa?.condicionIva ?? null,
    },
    remito: {
      referencia: mapped.referencia,
      prefijo: remito.prefijo,
      numero: remito.numero,
      tipo: remito.tipo,
      fecha: remito.fecha,
      observaciones: remito.observaciones,
      firmadoPor: remito.firmadoPor,
      cliente: remito.cliente,
      proveedor: remito.proveedor,
      items: remito.items.map((it) => ({
        descripcion: it.descripcion,
        cantidad: Number(it.cantidad),
        unidad: it.unidad,
      })),
    },
  })
  return { ok: true, data: buffer }
}

export function remitoPdfFilename(remitoId: number, prefijo: string | null, numero: number | null): string {
  const ref =
    prefijo != null && numero != null ? `REM-${prefijo}-${String(numero).padStart(8, '0')}` : `remito-${remitoId}`
  return `${ref}.pdf`
}
