import { useRegisterSW } from 'virtual:pwa-register/react'
import PikIcon from './PikIcon'

// 瀏覽器只在開啟頁面時才檢查新版；常駐在桌面的 App 可能很久不會檢查，所以每小時、以及切回 App 時主動檢查一次
const CHECK_INTERVAL_MS = 60 * 60 * 1000

// 偵測到新版時，在畫面下方出現一條提示；按「更新」才重新載入。不擋操作，也不會自己重新整理。
export default function UpdatePrompt() {
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
  })

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
        onClick={() => updateServiceWorker(true)}
        className="accessible-target shrink-0 whitespace-nowrap px-5 rounded-full bg-lime-600 hover:bg-lime-700 active:scale-95 text-white text-lg font-extrabold transition-all"
      >
        更新
      </button>
    </div>
  )
}
