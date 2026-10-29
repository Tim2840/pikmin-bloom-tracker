import { describe, it, expect } from 'vitest'
import { CHANGELOG, APP_VERSION, compareVersions as cmp, entriesSince, shouldShowWhatsNew } from './changelog'

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

describe('compareVersions', () => {
  it('依數字比較，而不是字串（1.10.0 比 1.9.0 新）', () => {
    expect(cmp('1.10.0', '1.9.0')).toBeGreaterThan(0)
    expect(cmp('1.9.0', '1.10.0')).toBeLessThan(0)
    expect(cmp('2.0.0', '1.99.99')).toBeGreaterThan(0)
    expect(cmp('1.2.3', '1.2.3')).toBe(0)
  })
})

describe('shouldShowWhatsNew', () => {
  it('已經看過目前版本就不彈', () => {
    expect(shouldShowWhatsNew(APP_VERSION, true)).toBe(false)
  })
  it('全新使用者不彈', () => {
    expect(shouldShowWhatsNew(null, false)).toBe(false)
  })
  it('用過 App 但沒有版本記錄（舊版使用者）要彈', () => {
    expect(shouldShowWhatsNew(null, true)).toBe(true)
  })
  it('看過舊版本，現在是新版本就彈', () => {
    expect(shouldShowWhatsNew('1.0.0', true)).toBe(true)
  })
})

describe('entriesSince', () => {
  it('只給上次看到的版本之後的更新，由新到舊', () => {
    const got = entriesSince('1.8.0')
    expect(got.length).toBeGreaterThan(0)
    for (const e of got) expect(cmp(e.version, '1.8.0')).toBeGreaterThan(0)
    expect(got[0].version).toBe(APP_VERSION)
  })
  it('最多 3 筆', () => {
    expect(entriesSince('1.0.0').length).toBe(3)
    expect(entriesSince('1.0.0', 2).length).toBe(2)
  })
  it('不知道上次看到哪一版時只給最新一筆', () => {
    expect(entriesSince(null)).toEqual([CHANGELOG[0]])
  })
  it('已經是最新版就沒有更新可說', () => {
    expect(entriesSince(APP_VERSION)).toEqual([])
  })
})
