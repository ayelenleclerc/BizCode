import { describe, expect, it } from 'vitest'
import { localThumbFileUri, resetThumbCacheForTests, resolveThumbUriSync } from './thumbCache'

describe('thumbCache (#257)', () => {
  it('falls back to remote URL before prefetch', () => {
    resetThumbCacheForTests()
    expect(resolveThumbUriSync(20, '/uploads/articulos/1/20/a-thumb.webp')).toBe(
      'http://localhost:3001/uploads/articulos/1/20/a-thumb.webp',
    )
    expect(resolveThumbUriSync(21, null)).toBeNull()
  })

  it('builds local file uri', () => {
    expect(localThumbFileUri('file:///data/', 20)).toBe('file:///data/articulo-thumbs/20.webp')
  })
})
