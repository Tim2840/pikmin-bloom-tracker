import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import PikIcon from './PikIcon'
import { lockScroll } from '../lib/scrollLock'
import { useSettingsStore } from '../stores/useSettingsStore'
import { isUpdateFinished, nextProgress } from '../lib/updateProgress'

// 瀏覽器只在開啟頁面時才檢查新版；常駐在桌面的 App 可能很久不會檢查，所以每小時、以及切回 App 時主動檢查一次
const CHECK_INTERVAL_MS = 60 * 60 * 1000
const TICK_MS = 50
const RELOAD_DELAY_MS = 400 // 讓使用者看到 100%

// 更新進度畫面：蓋住整個畫面、擋住操作（更新中不能再點），進度到 100% 後重新載入
function UpdatingOverlay({ controlled, activate }: { controlled: MutableRefObject<boolean>; activate: () => void }) {
  const effects = useSettingsStore(s => s.settings.effects)
  const [progress, setProgress] = useState(0)
  const activateRef = useRef(activate)
  activateRef.current = activate

  useEffect(() => {
    const unlock = lockScroll()
    const startedAt = Date.now()
    let current = 0
    let reloadTimer: ReturnType<typeof setTimeout> | undefined
    activateRef.current()
    const tick = setInterval(() => {
      current = nextProgress(current, isUpdateFinished(controlled.current, Date.now() - startedAt))
      setProgress(current)
      if (current >= 100 && reloadTimer === undefined) {
        reloadTimer = setTimeout(() => window.location.reload(), RELOAD_DELAY_MS)
      }
    }, TICK_MS)
    return () => { clearInterval(tick); clearTimeout(reloadTimer); unlock() }
  }, [controlled])

  const pct = Math.floor(progress)
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="更新中"
      className="fixed inset-0 z-[70] bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl w-full max-w-xs p-6 shadow-xl text-center">
        <PikIcon name="mushroom" mood="happy" className={`w-20 h-20 ${effects ? 'fx-bob' : ''}`} />
        <p className="text-xl font-black text-stone-800 mt-2">更新中</p>
        <p className="text-4xl font-black text-lime-700 tabular-nums mt-1">{pct}%</p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="mt-4 h-4 rounded-full bg-stone-200 overflow-hidden"
        >
          <div className="h-full rounded-full bg-lime-600" style={{ width: `${progress}%`, transition: 'width 80ms linear' }} />
        </div>
      </div>
    </div>
  )
}

// 偵測到新版時，在畫面下方出現一條提示；按「更新」才開始更新，不會自己重新整理。
export default function UpdatePrompt() {
  const [updating, setUpdating] = useState(false)
  const controlled = useRef(false) // 新版 Service Worker 已接管頁面
  const updatingRef = useRef(false)
  updatingRef.current = updating

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      const check = () => { registration.update().catch(() => { /* 離線時略過 */ }) }
      setInterval(check, CHECK_INTERVAL_MS)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
    },
    // 外掛預設在新版接管時立刻重新載入；改由進度畫面跑完才載入。
    // 不是自己按的更新（例如在別的視窗更新了）就照舊馬上重新載入，避免新舊版本混用。
    onNeedReload() {
      if (updatingRef.current) controlled.current = true
      else window.location.reload()
    },
  })

  if (updating) return <UpdatingOverlay controlled={controlled} activate={() => { void updateServiceWorker(false) }} />
  if (!needRefresh) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 mx-auto bottom-24 md:bottom-6 z-40 flex items-center gap-3 w-max max-w-[calc(100vw-2rem)] pl-4 pr-2 py-2 rounded-full bg-white border-2 border-lime-600 shadow-xl animate-scale-up"
    >
      <PikIcon name="mushroom" mood="happy" className="w-9 h-9" />
      <span className="text-lg font-black text-stone-800 whitespace-nowrap">有新版本</span>
      <button
        onClick={() => setUpdating(true)}
        className="accessible-target shrink-0 whitespace-nowrap px-5 rounded-full bg-lime-600 hover:bg-lime-700 active:scale-95 text-white text-lg font-extrabold transition-all"
      >
        更新
      </button>
    </div>
  )
}
