import { RecordItem, Person, ItemType } from '../types'

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
