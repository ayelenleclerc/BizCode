/**
 * @en Re-exports FCEM detection helpers for server consumers (#239).
 * @es Reexporta helpers de detección FCEM para consumidores del server (#239).
 * @pt-BR Reexporta helpers de detecção FCEM para consumidores do server (#239).
 */
export {
  evaluateFcemRequirement,
  FCEM_DEFAULT_UMBRAL_ARS,
  FCEM_ESTADOS,
  FCEM_MIN_PLAZO_PAGO_DIAS,
  FCEM_TIPO_CBTE_BY_LETTER,
  isFcemEstado,
  type FcemDetectionInput,
  type FcemDetectionResult,
  type FcemEstado,
} from '@bizcode/types'
