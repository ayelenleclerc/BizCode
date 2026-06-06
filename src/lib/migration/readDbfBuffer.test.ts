import { describe, expect, it } from 'vitest'
import { assertValidDbfUploadBuffer, DBF_UPLOAD_MAX_BYTES } from './readDbfBuffer'

function minimalDbfBuffer(recordLength = 10): Buffer {
  const headerLength = 32
  const buffer = Buffer.alloc(headerLength)
  buffer[0] = 0x03
  buffer.writeUInt16LE(headerLength, 8)
  buffer.writeUInt16LE(recordLength, 10)
  buffer[headerLength - 1] = 0x0d
  return buffer
}

describe('assertValidDbfUploadBuffer', () => {
  it('accepts a minimal valid DBF header', () => {
    expect(() => assertValidDbfUploadBuffer(minimalDbfBuffer())).not.toThrow()
  })

  it('rejects buffers that are too small', () => {
    expect(() => assertValidDbfUploadBuffer(Buffer.from([0x03]))).toThrow(/too small/)
  })

  it('rejects buffers above the upload limit', () => {
    const oversized = Buffer.alloc(DBF_UPLOAD_MAX_BYTES + 1, 0)
    oversized[0] = 0x03
    oversized.writeUInt16LE(32, 8)
    oversized.writeUInt16LE(10, 10)
    oversized[31] = 0x0d
    expect(() => assertValidDbfUploadBuffer(oversized)).toThrow(/too large/)
  })

  it('rejects unknown version bytes', () => {
    const invalid = minimalDbfBuffer()
    invalid[0] = 0xff
    expect(() => assertValidDbfUploadBuffer(invalid)).toThrow(/version byte/)
  })
})
