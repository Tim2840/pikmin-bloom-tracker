import { describe, it, expect } from 'vitest'
import { actionButtonLabel, actionFullLabel, buildQuickActionLabel, DIRECTIONS } from './recordLabels'

describe('recordLabels', () => {
  it('新增方向只提供 sent / received（helped 為舊資料相容值）', () => {
    expect(DIRECTIONS).toEqual(['sent', 'received'])
  })

  it('actionButtonLabel 依品項與方向回傳短標籤', () => {
    expect(actionButtonLabel('postcard', 'sent')).toBe('→ 寄給對方')
    expect(actionButtonLabel('postcard', 'received')).toBe('← 對方寄來')
    expect(actionButtonLabel('mushroom', 'sent')).toBe('→ 我邀請他')
    expect(actionButtonLabel('mushroom', 'received')).toBe('← 他邀請我')
  })

  it('actionFullLabel 仍能顯示舊資料的 helped', () => {
    expect(actionFullLabel('mushroom', 'helped')).toBe('協助打蘑菇')
  })

  it('buildQuickActionLabel 產生口語化標籤', () => {
    expect(buildQuickActionLabel('小美', 'postcard', 'sent')).toBe('寄明信片給 小美')
    expect(buildQuickActionLabel('阿明', 'mushroom', 'received')).toBe('阿明 邀我打蘑菇')
  })
})
