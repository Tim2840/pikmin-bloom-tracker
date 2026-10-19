import { describe, it, expect } from 'vitest'
import { countByDirection } from './recordService'
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
