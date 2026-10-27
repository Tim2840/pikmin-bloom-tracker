// 記錄成功的小慶祝：圖示彈一下、飄出愛心和星星。
// 特效只是裝飾：不接收點擊（pointer-events: none）、不到 1 秒就消失，連點時粒子減量。
// 設定頁關閉「特效」或系統開啟「減少動態」時，只留柔和的光圈。
import { pikIcon } from './pikIcons'
import { useSettingsStore } from '../stores/useSettingsStore'

const RAPID_MS = 1200
const POP_MS = 1100

/** 距離上次慶祝太近（快速連點）就只放少量粒子 */
export const particleCount = (lastTs: number, now: number): number => (now - lastTs < RAPID_MS ? 3 : 9)

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export const effectsEnabled = (): boolean => useSettingsStore.getState().settings.effects

let lastCelebrate = 0

export function celebrate(el: HTMLElement | null): void {
  if (!el || !effectsEnabled()) return
  const now = Date.now()
  const count = particleCount(lastCelebrate, now)
  lastCelebrate = now

  if (prefersReducedMotion()) {
    el.classList.add('fx-calm')
    setTimeout(() => el.classList.remove('fx-calm'), 900)
    return
  }

  if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
  el.classList.remove('fx-tap')
  void el.offsetWidth // 重新觸發動畫
  el.classList.add('fx-tap')
  setTimeout(() => el.classList.remove('fx-tap'), 400)

  for (let i = 0; i < count; i++) {
    const pop = document.createElement('span')
    pop.className = 'fx-pop'
    pop.innerHTML = pikIcon(i % 2 ? 'heart' : 'star')
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2
    const dist = 60 + Math.random() * 50
    pop.style.setProperty('--dx', `${Math.cos(angle) * dist}px`)
    pop.style.setProperty('--dy', `${Math.sin(angle) * dist}px`)
    pop.style.setProperty('--rot', `${(Math.random() - 0.5) * 90}deg`)
    el.appendChild(pop)
    setTimeout(() => pop.remove(), POP_MS)
  }
}
