import { describe, expect, it } from 'vitest'
import { buildDeliveredPodInput, canConfirmDelivered, mapPodSaveError } from './podValidation'

describe('podValidation (#161)', () => {
  it('canConfirmDelivered requires name and signature', () => {
    expect(canConfirmDelivered('', 'data:image/png;base64,abc')).toBe(false)
    expect(canConfirmDelivered('Ana', null)).toBe(false)
    expect(canConfirmDelivered('Ana', '')).toBe(false)
    expect(canConfirmDelivered('  Ana  ', 'data:image/png;base64,abc')).toBe(true)
  })

  it('mapPodSaveError maps known API codes', () => {
    expect(mapPodSaveError(new Error('POD_FIRMA_REQUIRED'))).toBe('signatureRequired')
    expect(mapPodSaveError(new Error('POD_FIRMA_TOO_LARGE'))).toBe('firmaTooLarge')
    expect(mapPodSaveError(new Error('POD_FOTO_TOO_LARGE'))).toBe('photoTooLarge')
    expect(mapPodSaveError(new Error('firmaBase64 is required'))).toBe('signatureRequired')
    expect(mapPodSaveError(new Error('network'))).toBe('save')
  })

  it('buildDeliveredPodInput trims and nulls optional blanks', () => {
    expect(
      buildDeliveredPodInput({
        receptorNombre: '  Ana  ',
        receptorDni: '',
        firmaBase64: 'data:image/png;base64,abc',
        fotoBase64: null,
        notasEntrega: '  ',
      }),
    ).toEqual({
      receptorNombre: 'Ana',
      receptorDni: null,
      firmaBase64: 'data:image/png;base64,abc',
      fotoBase64: null,
      notasEntrega: null,
    })
  })
})
