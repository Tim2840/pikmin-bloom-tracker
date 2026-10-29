import { describe, it, expect } from 'vitest'
import { CHANGELOG, APP_VERSION } from './changelog'

const parts = (v: string) => v.split('.').map(Number)
const cmp = (a: string, b: string) => {
  const [x, y] = [parts(a), parts(b)]
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]
  return 0
}

describe('changelog', () => {
  it('版本號格式正確且不重複', () => {
    const versions = CHANGELOG.map(e => e.version)
    for (const v of versions) expect(v).toMatch(/^\d+\.\d+\.\d+$/)
    expect(new Set(versions).size).toBe(versions.length)
  })

  it('由新到舊排列：版本遞減、日期不會變新', () => {
    for (let i = 1; i < CHANGELOG.length; i++) {
      expect(cmp(CHANGELOG[i - 1].version, CHANGELOG[i].version)).toBeGreaterThan(0)
      expect(CHANGELOG[i - 1].date >= CHANGELOG[i].date).toBe(true)
    }
  })

  it('日期是有效的 YYYY-MM-DD，每筆至少有一項說明', () => {
    for (const e of CHANGELOG) {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(e.date))).toBe(false)
      expect(e.items.length).toBeGreaterThan(0)
      for (const item of e.items) expect(item.trim().length).toBeGreaterThan(0)
    }
  })

  it('遵守介面文字精簡規則：說明裡不放括號', () => {
    for (const e of CHANGELOG) for (const item of e.items) expect(item).not.toMatch(/[（）()［］\[\]]/)
  })

  it('目前版本就是最新一筆', () => {
    expect(APP_VERSION).toBe(CHANGELOG[0].version)
  })
})
