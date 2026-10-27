import { useEffect, useMemo, useState } from 'react'
import PikIcon from './PikIcon'
import { MILESTONE_EVENT } from '../lib/milestones'
import { prefersReducedMotion } from '../lib/effects'

const COLORS = ['#ef5b4a', '#ffc83d', '#6fbf3f', '#5aa9e6', '#ff9fb2', '#a78bfa']
const SHOW_MS = 2600

// 里程碑慶祝：一次性的彩帶與一句話。整層不接收點擊，不會擋住下面的畫面。
export default function MilestoneOverlay() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onHit = (e: Event) => {
      setCount((e as CustomEvent<number>).detail)
      clearTimeout(timer)
      timer = setTimeout(() => setCount(null), SHOW_MS)
    }
    window.addEventListener(MILESTONE_EVENT, onHit)
    return () => { window.removeEventListener(MILESTONE_EVENT, onHit); clearTimeout(timer) }
  }, [])

  const pieces = useMemo(
    () => (count === null || prefersReducedMotion()
      ? []
      : Array.from({ length: 48 }, (_, i) => ({
          left: `${Math.random() * 100}%`,
          background: COLORS[i % COLORS.length],
          duration: `${1.4 + Math.random() * 1.2}s`,
          delay: `${Math.random() * 0.4}s`,
          dx: `${(Math.random() - 0.5) * 120}px`,
          rot: `${Math.random() * 720}deg`,
        }))),
    [count],
  )

  if (count === null) return null
  return (
    <>
      <div className="fx-confetti-layer" aria-hidden="true">
        {pieces.map((p, i) => (
          <span
            key={i}
            className="fx-piece"
            style={{ left: p.left, background: p.background, animationDuration: p.duration, animationDelay: p.delay, ['--dx' as string]: p.dx, ['--rot' as string]: p.rot }}
          />
        ))}
      </div>
      <div className="fx-milestone" role="status" aria-live="polite">
        <PikIcon name="mushroom" mood="happy" className="w-[72px] h-[72px]" />
        第 {count} 筆！
      </div>
    </>
  )
}
