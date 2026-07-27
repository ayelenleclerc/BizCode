/**
 * @en Server-side re-export of UoM pure helpers/types from @bizcode/types (#203); keeps a single source of truth.
 * @es Re-export en servidor de helpers/tipos puros de UoM desde @bizcode/types (#203); mantiene una única fuente de verdad.
 * @pt-BR Re-export no servidor de helpers/tipos puros de UoM a partir de @bizcode/types (#203); mantém uma única fonte de verdade.
 */
export {
  AFIP_UNIDAD_CODES,
  UNIDAD_BASE_VALUES,
  afipCodigoForUnidad,
  allowsDecimalQuantity,
  fromBaseQuantity,
  isUnidadBase,
  roundQty,
  toBaseQuantity,
  umedidaFromUnidadBase,
  validateQuantityForUom,
} from '@bizcode/types'
export type { UnidadBase } from '@bizcode/types'
