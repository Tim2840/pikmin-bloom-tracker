import { differenceInCalendarDays, parseISO } from 'date-fns'
import { Person, RecordItem } from '../types'
import { countryName } from '../lib/countries'

// 依姓名 / 暱稱 / 國家名搜尋好友；空字串回傳全部
export function filterPeople(people: Person[], query: string): Person[] {
  const q = query.trim().toLowerCase()
  if (!q) return people
  return people.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.nickname ?? '').toLowerCase().includes(q) ||
    countryName(p.country).toLowerCase().includes(q)
  )
}

export interface InactiveFriend {
  person: Person
  lastDate: string | null // 從沒互動過為 null
  daysSince: number | null
}

// 找出「很久沒互動」的好友：最近一筆紀錄距今 >= days 天，或從沒有紀錄。
// 排序：最久沒互動的在前；從沒互動過的（多半是剛加入的好友）排最後。
export function findInactiveFriends(
  people: Person[],
  records: RecordItem[],
  today: string,
  days = 30,
): InactiveFriend[] {
  const lastByPerson = new Map<string, string>()
  for (const r of records) {
    if (!r.personId) continue
    const prev = lastByPerson.get(r.personId)
    if (!prev || r.date > prev) lastByPerson.set(r.personId, r.date)
  }

  const todayDate = parseISO(today)
  const result: InactiveFriend[] = []
  for (const person of people) {
    const lastDate = lastByPerson.get(person.id) ?? null
    const daysSince = lastDate ? differenceInCalendarDays(todayDate, parseISO(lastDate)) : null
    if (lastDate === null || (daysSince as number) >= days) {
      result.push({ person, lastDate, daysSince })
    }
  }

  return result.sort((a, b) => {
    if (a.daysSince === null && b.daysSince === null) return a.person.sortOrder - b.person.sortOrder
    if (a.daysSince === null) return 1
    if (b.daysSince === null) return -1
    return b.daysSince - a.daysSince
  })
}

// 單一好友的往來紀錄（新到舊）
export function recordsOfPerson(records: RecordItem[], personId: string): RecordItem[] {
  return records
    .filter(r => r.personId === personId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}
