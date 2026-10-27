import { describe, it, expect } from 'vitest'
import { countByDirection, mascotMood } from './recordService'
import { RecordItem } from '../types'

const rec = (itemType: RecordItem['itemType'], actionType: RecordItem['actionType']): RecordItem => ({
  id: `${itemType}-${actionType}-${Math.random()}`,
  personId: 'p1',
  personNameSnapshot: '阿明',
  date: '2026-10-01',
  itemType,
  actionType,
  createdAt: '2026-10-01',
})

describe('countByDirection', () => {
  it('往外與往內分開計算（含他人邀請我 / 對方寄來）', () => {
    const counts = countByDirection([
      rec('postcard', 'sent'), rec('postcard', 'sent'), rec('postcard', 'received'),
      rec('mushroom', 'sent'), rec('mushroom', 'received'), rec('mushroom', 'received'),
    ])
    expect(counts).toEqual({
      postcard: { sent: 2, received: 1 },
      mushroom: { sent: 1, received: 2 },
    })
  })

  it('舊資料 helped 視同往外（sent）', () => {
    expect(countByDirection([rec('mushroom', 'helped')]).mushroom).toEqual({ sent: 1, received: 0 })
  })

  it('沒有紀錄時全為 0', () => {
    expect(countByDirection([])).toEqual({
      postcard: { sent: 0, received: 0 },
      mushroom: { sent: 0, received: 0 },
    })
  })
})

describe('mascotMood', () => {
  const today = '2026-10-27'
  const r = (date: string) => ({ ...rec('postcard', 'sent'), date })

  it('今天有互動 = 開心', () => {
    expect(mascotMood([r('2026-10-27'), r('2026-09-01')], today)).toBe('happy')
  })
  it('1 到 6 天沒互動 = 普通', () => {
    expect(mascotMood([r('2026-10-26')], today)).toBe('normal')
    expect(mascotMood([r('2026-10-21')], today)).toBe('normal')
  })
  it('7 天以上沒互動 = 打瞌睡', () => {
    expect(mascotMood([r('2026-10-20')], today)).toBe('sleepy')
    expect(mascotMood([r('2026-01-01')], today)).toBe('sleepy')
  })
  it('還沒有任何紀錄 = 普通', () => {
    expect(mascotMood([], today)).toBe('normal')
  })
})
