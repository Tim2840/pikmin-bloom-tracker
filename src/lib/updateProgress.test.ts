import { describe, it, expect } from 'vitest'
import { nextProgress, isUpdateFinished, MIN_UPDATE_MS, GIVE_UP_MS } from './updateProgress'

const run = (ticks: number, finishedAt: number | null) => {
  let p = 0
  const seq: number[] = []
  for (let i = 0; i < ticks; i++) {
    p = nextProgress(p, finishedAt !== null && i >= finishedAt)
    seq.push(p)
  }
  return seq
}

describe('nextProgress', () => {
  it('還沒完成時只增不減，而且不會超過 90%', () => {
    const seq = run(400, null)
    for (let i = 1; i < seq.length; i++) expect(seq[i]).toBeGreaterThanOrEqual(seq[i - 1])
    expect(Math.max(...seq)).toBeLessThanOrEqual(90)
    expect(seq[seq.length - 1]).toBeGreaterThan(85)
  })

  it('起步看得見：第一個 50 毫秒就有進度', () => {
    expect(nextProgress(0, false)).toBeGreaterThan(0)
  })

  it('完成後會衝到剛好 100%，且在合理的時間內', () => {
    const seq = run(200, 20)
    expect(seq[seq.length - 1]).toBe(100)
    const reached = seq.findIndex(v => v === 100)
    expect(reached - 20).toBeLessThanOrEqual(25) // 完成之後最多 25 個 tick（約 1.25 秒）
  })

  it('從 0% 直接完成也不會超過 100%', () => {
    expect(nextProgress(0, true)).toBeLessThanOrEqual(100)
    expect(nextProgress(99.9, true)).toBe(100)
  })
})

describe('isUpdateFinished', () => {
  it('新版已接管，但還沒顯示夠久：還不能完成', () => {
    expect(isUpdateFinished(true, MIN_UPDATE_MS - 1)).toBe(false)
  })
  it('新版已接管且顯示夠久：完成', () => {
    expect(isUpdateFinished(true, MIN_UPDATE_MS)).toBe(true)
  })
  it('新版還沒接管：等到上限才放棄', () => {
    expect(isUpdateFinished(false, GIVE_UP_MS - 1)).toBe(false)
    expect(isUpdateFinished(false, GIVE_UP_MS)).toBe(true)
  })
})
