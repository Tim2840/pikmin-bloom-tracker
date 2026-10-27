import { describe, it, expect } from 'vitest'
import { milestoneFor, MILESTONES } from './milestones'

describe('milestoneFor', () => {
  it('剛好達到里程碑且沒慶祝過，才回傳', () => {
    expect(milestoneFor(10, [])).toBe(10)
    expect(milestoneFor(50, [10])).toBe(50)
  })
  it('不是里程碑的筆數不慶祝', () => {
    expect(milestoneFor(9, [])).toBeNull()
    expect(milestoneFor(11, [])).toBeNull()
  })
  it('已經慶祝過的不再重複（刪掉再補回同樣筆數也一樣）', () => {
    expect(milestoneFor(10, [10])).toBeNull()
  })
  it('里程碑由小到大排列', () => {
    expect([...MILESTONES].sort((a, b) => a - b)).toEqual(MILESTONES)
  })
})
