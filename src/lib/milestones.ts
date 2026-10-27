// 里程碑：互動紀錄累計到指定筆數時慶祝一次。
import { effectsEnabled } from './effects'

export const MILESTONES = [10, 50, 100, 200, 500, 1000]
export const MILESTONE_EVENT = 'piklog:milestone'
const KEY = 'piklog_milestones_shown'

/** 剛好達到某個里程碑、而且還沒慶祝過，才回傳該筆數 */
export const milestoneFor = (total: number, shown: number[]): number | null =>
  MILESTONES.includes(total) && !shown.includes(total) ? total : null

const loadShown = (): number[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((n): n is number => typeof n === 'number') : []
  } catch {
    return []
  }
}

const saveShown = (shown: number[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(shown))
  } catch {
    /* 私密模式或容量滿時忽略 */
  }
}

/** 新增紀錄成功後呼叫：傳入新增後的總筆數 */
export function checkMilestone(total: number): void {
  if (!effectsEnabled()) return
  const shown = loadShown()
  const hit = milestoneFor(total, shown)
  if (hit === null) return
  saveShown([...shown, hit])
  window.dispatchEvent(new CustomEvent<number>(MILESTONE_EVENT, { detail: hit }))
}
