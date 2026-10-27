import { describe, it, expect } from 'vitest'
import { particleCount } from './effects'

describe('particleCount', () => {
  it('平常放 9 個，快速連點（1.2 秒內）減成 3 個', () => {
    expect(particleCount(0, 5000)).toBe(9)
    expect(particleCount(5000, 5500)).toBe(3)
    expect(particleCount(5000, 6199)).toBe(3)
    expect(particleCount(5000, 6200)).toBe(9)
  })
})
