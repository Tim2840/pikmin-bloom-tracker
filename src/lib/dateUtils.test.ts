import { describe, it, expect } from 'vitest'
import { MONTH_LABEL, shiftMonth, toDateStr, formatDate, buildMonthGrid } from './dateUtils'

describe('dateUtils', () => {
  it('MONTH_LABEL 把 0-based 月份顯示為 1-based', () => {
    expect(MONTH_LABEL(2026, 5)).toBe('2026年6月')
    expect(MONTH_LABEL(2026, 0)).toBe('2026年1月')
  })

  it('shiftMonth 正確跨年', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 }) // 12月 → 隔年 1月
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 }) // 1月 → 去年 12月
    expect(shiftMonth(2026, 5, 2)).toEqual({ year: 2026, month: 7 })
  })

  it('toDateStr / formatDate 格式正確', () => {
    expect(toDateStr(new Date(2026, 5, 9))).toBe('2026-06-09')
    expect(formatDate('2026-06-09')).toBe('2026/06/09')
  })

  it('buildMonthGrid 補滿整週並涵蓋當月每一天', () => {
    const grid = buildMonthGrid(2026, 5) // 2026 年 6 月
    expect(grid.length % 7).toBe(0)
    expect(grid.some((c) => c.inMonth && c.day === 1)).toBe(true)
    expect(grid.some((c) => c.inMonth && c.day === 30)).toBe(true)
  })
})
