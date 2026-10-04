import { describe, it, expect } from 'vitest'
import { mergeWithLocal } from './syncMerge'

describe('mergeWithLocal', () => {
  it('雲端為空時保留本機全部資料並回報待補傳', () => {
    const local = [{ id: 'a' }, { id: 'b' }]
    const r = mergeWithLocal([], local)
    expect(r.merged).toEqual(local)
    expect(r.localOnly).toEqual(local)
  })
  it('雲端較少時不會遺失本機獨有資料', () => {
    const r = mergeWithLocal([{ id: 'a', v: 'cloud' }], [{ id: 'a', v: 'local' }, { id: 'b', v: 'local' }])
    expect(r.merged).toHaveLength(2)
    expect(r.merged.find(x => x.id === 'a')?.v).toBe('cloud')
    expect(r.localOnly.map(x => x.id)).toEqual(['b'])
  })
})
