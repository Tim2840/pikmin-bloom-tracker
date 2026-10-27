import { ReactNode, useEffect, useRef } from 'react'
import { lockScroll } from '../lib/scrollLock'

interface Props {
  onClose: () => void
  /** center：置中；bottom：手機貼底、桌機置中 */
  align?: 'center' | 'bottom'
  children: ReactNode
}

// 所有彈窗共用的外框：背景變暗、鎖住背景捲動、點背景空白處或按 Esc 關閉。
// 要「按下」和「放開」都在背景上才關閉，避免在輸入框拖曳選字時手指滑到外面就誤關。
export default function ModalShell({ onClose, align = 'center', children }: Props) {
  const pressedOnBackdrop = useRef(false)

  useEffect(() => lockScroll(), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex ${align === 'bottom' ? 'items-end sm:items-center' : 'items-center'} justify-center p-4 overscroll-contain`}
      onPointerDown={(e) => { pressedOnBackdrop.current = e.target === e.currentTarget }}
      onClick={(e) => {
        if (pressedOnBackdrop.current && e.target === e.currentTarget) onClose()
        pressedOnBackdrop.current = false
      }}
    >
      {children}
    </div>
  )
}
