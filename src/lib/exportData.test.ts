import { describe, it, expect } from 'vitest'
import { csvEscape, buildPeopleCsv, buildRecordsCsv } from './exportData'
import { Person, RecordItem } from '../types'

const person = (over: Partial<Person>): Person => ({
  id: 'p1', name: '阿明', sortOrder: 0, createdAt: '2026-01-02T00:00:00Z', ...over,
})
const rec = (over: Partial<RecordItem>): RecordItem => ({
  id: 'r1', personId: 'p1', personNameSnapshot: '阿明', date: '2026-10-01',
  itemType: 'postcard', actionType: 'sent', createdAt: '2026-10-01', ...over,
})

describe('exportData', () => {
  it('csvEscape 處理逗號、雙引號、換行，並中和公式開頭', () => {
    expect(csvEscape('a,b')).toBe('"a,b"')
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""')
    expect(csvEscape('第一行\n第二行')).toBe('"第一行\n第二行"')
    expect(csvEscape('=SUM(A1)')).toBe("'=SUM(A1)")
    expect(csvEscape(undefined)).toBe('')
  })

  it('好友 CSV 含 BOM、表頭，依 sortOrder 排序', () => {
    const csv = buildPeopleCsv([
      person({ id: 'p2', name: '小華', sortOrder: 1 }),
      person({ name: '阿明', nickname: '明明', sortOrder: 0 }),
    ])
    expect(csv.startsWith('﻿姓名,暱稱,國家,建立日期\r\n')).toBe(true)
    const lines = csv.trim().split('\r\n')
    expect(lines[1]).toBe('阿明,明明,,2026-01-02')
    expect(lines[2].startsWith('小華,')).toBe(true)
  })

  it('紀錄 CSV 依日期新到舊，好友已刪除時用 snapshot，方向用完整語句', () => {
    const csv = buildRecordsCsv(
      [
        rec({ id: 'a', date: '2026-09-01' }),
        rec({ id: 'b', date: '2026-10-05', personId: null, personNameSnapshot: '已離開的人', itemType: 'mushroom', actionType: 'received', note: '一起打, 很開心' }),
      ],
      [person({})],
    )
    const lines = csv.trim().split('\r\n')
    expect(lines[0]).toContain('日期,好友,品項,方向,備註')
    expect(lines[1]).toBe('2026-10-05,已離開的人,蘑菇,← 他邀請我打蘑菇,"一起打, 很開心"')
    expect(lines[2]).toBe('2026-09-01,阿明,明信片,→ 寄給對方明信片,')
  })
})
