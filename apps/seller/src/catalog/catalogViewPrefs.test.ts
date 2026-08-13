import { beforeEach, describe, expect, it, vi } from 'vitest'

const store = new Map<string, string>()

vi.mock('../offline/meta', () => ({
  offlineMeta: {
    getString: (k: string) => store.get(k),
    setString: (k: string, v: string) => {
      store.set(k, v)
    },
  },
}))

describe('catalogViewPrefs (#257)', () => {
  beforeEach(() => {
    store.clear()
  })

  it('defaults to list and persists grid', async () => {
    const { getCatalogViewPreference, setCatalogViewPreference } = await import('./catalogViewPrefs')
    expect(getCatalogViewPreference()).toBe('list')
    setCatalogViewPreference('grid')
    expect(getCatalogViewPreference()).toBe('grid')
    setCatalogViewPreference('list')
    expect(getCatalogViewPreference()).toBe('list')
  })
})
