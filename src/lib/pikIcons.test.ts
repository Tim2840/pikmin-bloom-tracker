import { describe, it, expect } from 'vitest'
import { pikIcon, ITEM_ICON, PikIconName } from './pikIcons'

const NAMES: PikIconName[] = ['mushroom', 'mail', 'sprout', 'heart', 'star']

describe('pikIcons', () => {
  it('每個圖示都是完整、可縮放的 SVG', () => {
    for (const n of NAMES) {
      const out = pikIcon(n)
      expect(out.startsWith('<svg viewBox="0 0 64 64"')).toBe(true)
      expect(out.endsWith('</svg>')).toBe(true)
      expect(out).toContain('width="100%"')
    }
  })

  it('蘑菇的三種表情畫法不同，打瞌睡才有 z', () => {
    const [happy, normal, sleepy] = (['happy', 'normal', 'sleepy'] as const).map(m => pikIcon('mushroom', m))
    expect(new Set([happy, normal, sleepy]).size).toBe(3)
    expect(sleepy).toContain('>z<')
    expect(happy).not.toContain('>z<')
  })

  it('傘蓋下緣是圓角（路徑含曲線，不是尖角直接收尾）', () => {
    expect(pikIcon('mushroom')).toContain('C58 38.5 55 41 51 41 L13 41 C9 41 6 38.5 6 34 Z')
  })

  it('品項對應圖示：明信片用信封、蘑菇用蘑菇', () => {
    expect(ITEM_ICON).toEqual({ postcard: 'mail', mushroom: 'mushroom' })
  })
})
