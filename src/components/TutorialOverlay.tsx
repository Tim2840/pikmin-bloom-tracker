import { useEffect, useState, useCallback, CSSProperties } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { TutorialStep } from '../lib/tutorialData'

interface Props {
  steps: TutorialStep[]
  currentStep: number
  isOpen: boolean
  isComplete: boolean
  completionMsg?: { title: string; content: string }
  onNext: () => void
  onSkip: () => void
  onCompleteClose: () => void
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

const PAD = 12
const TOOLTIP_W = 300
const GAP = 14

export default function TutorialOverlay({
  steps,
  currentStep,
  isOpen,
  isComplete,
  completionMsg,
  onNext,
  onSkip,
  onCompleteClose,
}: Props) {
  const [spotRect, setSpotRect] = useState<Rect | null>(null)

  const step = steps[currentStep]
  const hasSelector = !!step?.selector

  const updateRect = useCallback(() => {
    if (!step?.selector) {
      setSpotRect(null)
      return
    }
    const el = document.querySelector(step.selector)
    if (!el) {
      setSpotRect(null)
      return
    }
    const r = el.getBoundingClientRect()
    setSpotRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [step])

  useEffect(() => {
    if (!isOpen || isComplete) {
      setSpotRect(null)
      return
    }
    // 先 scroll 目標進視窗，再計算位置
    const el = step?.selector ? document.querySelector(step.selector) : null
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      // 等 scroll 結束再抓位置
      const t = setTimeout(updateRect, 350)
      return () => clearTimeout(t)
    }
    updateRect()
  }, [isOpen, isComplete, step, updateRect])

  useEffect(() => {
    if (!isOpen) return
    const onScroll = () => updateRect()
    const onResize = () => updateRect()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [isOpen, updateRect])

  const getTooltipStyle = (): CSSProperties => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = Math.min(TOOLTIP_W, vw - 32)

    if (!spotRect || !hasSelector) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: w,
      }
    }

    const spTop = spotRect.top - PAD
    const spLeft = spotRect.left - PAD
    const spW = spotRect.width + PAD * 2
    const spH = spotRect.height + PAD * 2

    const centerX = Math.max(16, Math.min(spLeft + spW / 2 - w / 2, vw - w - 16))

    // 優先下方
    if (spTop + spH + GAP + 160 < vh) {
      return { position: 'fixed', top: spTop + spH + GAP, left: centerX, width: w }
    }
    // 嘗試上方
    if (spTop - GAP - 160 > 0) {
      return { position: 'fixed', bottom: vh - spTop + GAP, left: centerX, width: w }
    }
    // fallback：置中
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: w,
    }
  }

  if (!isOpen) return null

  // ── 完成畫面 ──
  if (isComplete && completionMsg) {
    return (
      <div className="fixed inset-0 z-[9000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
        <div
          className="bg-white rounded-3xl p-8 text-center shadow-2xl"
          style={{ maxWidth: 320, width: '100%' }}
        >
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-black text-stone-800 mb-3">{completionMsg.title}</h3>
          <p className="text-stone-600 text-base leading-relaxed mb-6">{completionMsg.content}</p>
          <button
            onClick={onCompleteClose}
            className="w-full h-12 bg-lime-600 hover:bg-lime-700 text-white font-extrabold text-base rounded-2xl transition-all active:scale-95"
          >
            了解！繼續探險 🍄
          </button>
        </div>
      </div>
    )
  }

  // ── 教學步驟畫面 ──
  return (
    <>
      {/* 深色遮罩 — spotlight 模式時透明，讓 box-shadow 負責暗色；置中模式時直接暗色 */}
      <div
        className="fixed inset-0 z-[9000]"
        style={{ background: spotRect && hasSelector ? 'transparent' : 'rgba(0,0,0,0.65)' }}
        onClick={onSkip}
      />

      {/* Spotlight 光圈 — 只在有目標元素時顯示 */}
      {spotRect && hasSelector && (
        <div
          className="fixed pointer-events-none z-[9001] transition-all duration-300"
          style={{
            top: spotRect.top - PAD,
            left: spotRect.left - PAD,
            width: spotRect.width + PAD * 2,
            height: spotRect.height + PAD * 2,
            borderRadius: 16,
            boxShadow: '0 0 0 200vmax rgba(0,0,0,0.65), 0 0 0 3px rgba(132,204,22,0.7)',
          }}
        />
      )}

      {/* Tooltip 卡片 */}
      <div
        className="z-[9002] bg-white rounded-2xl shadow-2xl p-5"
        style={getTooltipStyle()}
        onClick={e => e.stopPropagation()}
      >
        {/* 標題列 */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-black text-stone-800 leading-snug">{step?.title}</h3>
          <button
            onClick={onSkip}
            className="shrink-0 w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-stone-600 flex items-center justify-center transition-colors"
            title="跳過說明"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-stone-600 text-sm leading-relaxed mb-4">{step?.content}</p>

        {/* 步驟進度 + 操作按鈕 */}
        <div className="flex items-center justify-between gap-3">
          {/* 點點進度 */}
          <div className="flex gap-1.5 items-center">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-200"
                style={{
                  width: i === currentStep ? 20 : 6,
                  backgroundColor: i === currentStep ? '#65a30d' : '#e7e5e4',
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSkip}
              className="text-xs text-stone-400 hover:text-stone-600 font-bold transition-colors px-1 py-1"
            >
              跳過
            </button>
            <button
              onClick={onNext}
              className="flex items-center gap-1 bg-lime-600 hover:bg-lime-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all active:scale-95"
            >
              {currentStep < steps.length - 1 ? '下一步' : '完成！'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
