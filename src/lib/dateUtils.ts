// 日期工具：底層統一使用 date-fns（locale 設 zh-TW），全部以本地時區計算
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subDays,
  isWithinInterval,
  isSameMonth,
  isToday as dfIsToday,
} from 'date-fns'
import { zhTW } from 'date-fns/locale'

// Date → 'yyyy-MM-dd'
export const toDateStr = (d: Date): string => format(d, 'yyyy-MM-dd')

export const todayStr = (): string => toDateStr(new Date())

// 'yyyy-MM-dd' → 'yyyy/MM/dd'
export const formatDate = (s: string): string => format(parseISO(s), 'yyyy/MM/dd')

// 'yyyy-MM-dd' → 'M月d日 (週X)'
export const formatDateLong = (s: string): string =>
  format(parseISO(s), 'M月d日 (EEEEE)', { locale: zhTW })

export type RangeKey = 'month' | '30days' | 'all'

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: 'month', label: '本月' },
  { key: '30days', label: '近 30 天' },
  { key: 'all', label: '全部' },
]

// 判斷日期字串是否落在指定範圍內
export const isInRange = (dateStr: string, range: RangeKey): boolean => {
  if (range === 'all') return true
  const target = parseISO(dateStr)
  if (range === 'month') return isSameMonth(target, new Date())
  // 近 30 天（含今天，往前推 29 天）
  const today = new Date()
  return isWithinInterval(target, { start: subDays(today, 29), end: today })
}

// 月曆格子：補滿前後整週，鄰月日期也回傳（以 inMonth 標記）
export interface DayCell {
  date: string // 'yyyy-MM-dd'
  day: number
  inMonth: boolean
  isToday: boolean
}

export const buildMonthGrid = (year: number, month: number): DayCell[] => {
  const base = new Date(year, month, 1)
  const gridStart = startOfWeek(startOfMonth(base), { weekStartsOn: 0 })
  const gridEnd = endOfWeek(endOfMonth(base), { weekStartsOn: 0 })
  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map(d => ({
    date: toDateStr(d),
    day: d.getDate(),
    inMonth: isSameMonth(d, base),
    isToday: dfIsToday(d),
  }))
}

export const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

// 月份標題：「2026年6月」
export const MONTH_LABEL = (year: number, month: number): string =>
  `${year}年${month + 1}月`

// 切換月份（month 為 0-based），回傳新的 year/month
export const shiftMonth = (
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } => {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}
