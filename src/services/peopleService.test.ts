import { describe, it, expect } from 'vitest'
import { filterPeople, findInactiveFriends, recordsOfPerson } from './peopleService'
import { Person, RecordItem } from '../types'

const person = (id: string, name: string, over: Partial<Person> = {}): Person => ({
  id, name, sortOrder: Number(id.replace(/\D/g, '')) || 0, createdAt: '2026-01-01', ...over,
})
const rec = (id: string, personId: string | null, date: string, over: Partial<RecordItem> = {}): RecordItem => ({
  id, personId, personNameSnapshot: 'x', date, itemType: 'postcard', actionType: 'sent', createdAt: `${date}T00:00:00Z`, ...over,
})

describe('filterPeople', () => {
  const people = [person('p1', '阿明', { nickname: 'Ming' }), person('p2', '小華'), person('p3', 'Alice')]

  it('空白搜尋回傳全部', () => {
    expect(filterPeople(people, '  ')).toHaveLength(3)
  })
  it('比對姓名與暱稱，不分大小寫', () => {
    expect(filterPeople(people, '小').map(p => p.id)).toEqual(['p2'])
    expect(filterPeople(people, 'ming').map(p => p.id)).toEqual(['p1'])
    expect(filterPeople(people, 'ALI').map(p => p.id)).toEqual(['p3'])
  })
  it('找不到時回傳空陣列', () => {
    expect(filterPeople(people, '不存在')).toEqual([])
  })
})

describe('findInactiveFriends', () => {
  const today = '2026-10-26'
  const people = [person('p1', '久'), person('p2', '剛互動'), person('p3', '從沒'), person('p4', '更久')]
  const records = [
    rec('r1', 'p1', '2026-09-01'), // 55 天
    rec('r2', 'p1', '2026-08-01'), // 較舊的不影響最近日期
    rec('r3', 'p2', '2026-10-20'), // 6 天
    rec('r4', 'p4', '2026-06-01'), // 147 天
    rec('r5', null, '2026-10-25'), // 已刪除好友的紀錄不計入
  ]

  it('列出超過門檻與從沒互動的好友，最久的在前、從沒互動的最後', () => {
    const result = findInactiveFriends(people, records, today, 30)
    expect(result.map(r => r.person.id)).toEqual(['p4', 'p1', 'p3'])
    expect(result[0]).toMatchObject({ lastDate: '2026-06-01', daysSince: 147 })
    expect(result[2]).toMatchObject({ lastDate: null, daysSince: null })
  })
  it('剛好滿門檻天數算在內，差一天不算', () => {
    const edge = [person('p1', 'A'), person('p2', 'B')]
    const recs = [rec('a', 'p1', '2026-09-26'), rec('b', 'p2', '2026-09-27')] // 30 天 / 29 天
    expect(findInactiveFriends(edge, recs, today, 30).map(r => r.person.id)).toEqual(['p1'])
  })
  it('所有人都有近期互動時回傳空陣列', () => {
    expect(findInactiveFriends([people[1]], records, today)).toEqual([])
  })
})

describe('recordsOfPerson', () => {
  it('只取該好友並依日期新到舊排序', () => {
    const recs = [rec('a', 'p1', '2026-01-01'), rec('b', 'p2', '2026-05-01'), rec('c', 'p1', '2026-03-01')]
    expect(recordsOfPerson(recs, 'p1').map(r => r.id)).toEqual(['c', 'a'])
  })
})
