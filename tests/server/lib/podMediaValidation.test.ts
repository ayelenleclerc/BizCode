import { describe, expect, it } from 'vitest'
import {
  MOTIVO_NO_ENTREGA_VALUES,
  POD_MAX_FIRMA_BYTES,
  base64PayloadByteLength,
  isNonEmptyBase64,
  itemHasPod,
  parsePodMediaJson,
  validatePodMediaSizes,
} from '../../../apps/server/lib/podMediaValidation'

const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('podMediaValidation', () => {
  it('base64PayloadByteLength decodes data URLs', () => {
    expect(base64PayloadByteLength(TINY_PNG)).toBeGreaterThan(0)
    expect(base64PayloadByteLength('')).toBe(0)
  })

  it('isNonEmptyBase64 rejects empty payloads', () => {
    expect(isNonEmptyBase64(TINY_PNG)).toBe(true)
    expect(isNonEmptyBase64('data:image/png;base64,')).toBe(false)
  })

  it('validatePodMediaSizes enforces limits', () => {
    expect(validatePodMediaSizes({ firmaBase64: TINY_PNG })).toBeNull()
    const huge = `data:image/png;base64,${'A'.repeat(POD_MAX_FIRMA_BYTES * 2)}`
    expect(validatePodMediaSizes({ firmaBase64: huge })).toBe('POD_FIRMA_TOO_LARGE')
  })

  it('parsePodMediaJson and itemHasPod', () => {
    expect(parsePodMediaJson(null)).toBeNull()
    expect(parsePodMediaJson({ firmaBase64: TINY_PNG })).toEqual({ firmaBase64: TINY_PNG })
    expect(itemHasPod({ podMedia: { firmaBase64: TINY_PNG }, receptorNombre: null })).toBe(true)
    expect(itemHasPod({ podMedia: null, receptorNombre: 'Ana' })).toBe(true)
    expect(itemHasPod({ podMedia: null, receptorNombre: null })).toBe(false)
  })

  it('exports motivo enum values', () => {
    expect(MOTIVO_NO_ENTREGA_VALUES).toContain('ausente')
    expect(MOTIVO_NO_ENTREGA_VALUES.length).toBe(5)
  })
})
