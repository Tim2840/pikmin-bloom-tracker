import { differenceInCalendarDays, parseISO } from 'date-fns'
import { RecordItem, Person, ItemType } from '../types'
import { PikMood } from '../lib/pikIcons'

export function resolvePersonName(r: RecordItem, people: Person[]): string {
  if (r.personId) {
    const p = people.find(pp => pp.id === r.personId)
    if (p) return p.name
  }
  return r.personNameSnapshot || '已刪除的好友'
}

export function resolvePersonColor(r: RecordItem, people: Person[]): string {
  if (r.personId) {
    const p = people.find(pp => pp.id === r.personId)
    if (p) return p.color || '#6B7280'
  }
  return '#9CA3AF'
}

export interface HomeStats {
  todayCount: number
  monthCount: number
  monthFriendCount: number
}

export function getHomeStats(records: RecordItem[], today: string): HomeStats {
  const monthPrefix = today.slice(0, 7)
  const monthRecords = records.filter(r => r.date.startsWith(monthPrefix))
  return {
    todayCount: records.filter(r => r.date === today).length,
    monthCount: monthRecords.length,
    monthFriendCount: new Set(monthRecords.map(r => r.personId ?? r.personNameSnapshot)).size,
  }
}

export interface RecordFilters {
  personId: string
  itemType: 'all' | ItemType
}

export function filterRecords(records: RecordItem[], filters: RecordFilters, limit = 30): RecordItem[] {
  const result = records
    .filter(r => filters.personId === 'all' || r.personId === filters.personId)
    .filter(r => filters.itemType === 'all' || r.itemType === filters.itemType)
  const hasFilter = filters.personId !== 'all' || filters.itemType !== 'all'
  return hasFilter ? result : result.slice(0, limit)
}

export interface DirectionCounts {
  postcard: { sent: number; received: number }
  mushroom: { sent: number; received: number }
}

export const emptyDirectionCounts = (): DirectionCounts => ({
  postcard: { sent: 0, received: 0 },
  mushroom: { sent: 0, received: 0 },
})

// 依品項與方向計數；舊資料的 helped 視同 sent（往外）
export function addToDirectionCounts(counts: DirectionCounts, r: RecordItem): void {
  counts[r.itemType][r.actionType === 'received' ? 'received' : 'sent']++
}

export function countByDirection(records: RecordItem[]): DirectionCounts {
  const counts = emptyDirectionCounts()
  for (const r of records) addToDirectionCounts(counts, r)
  return counts
}

// 首頁吉祥物的表情：今天有互動 = 開心；7 天以上沒互動 = 打瞌睡；其餘（含還沒有紀錄）= 普通
export function mascotMood(records: RecordItem[], today: string): PikMood {
  if (records.length === 0) return 'normal'
  const last = records.reduce((m, r) => (r.date > m ? r.date : m), '')
  const days = differenceInCalendarDays(parseISO(today), parseISO(last))
  if (days <= 0) return 'happy'
  return days >= 7 ? 'sleepy' : 'normal'
}
