// 捕捉 Android/Chrome 的 beforeinstallprompt，讓設定頁能提供「安裝」按鈕。
// 這個事件常在頁面剛載入時就觸發，所以在 main.tsx 早早 import 本模組以註冊監聽。

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const INSTALLABLE_EVENT = 'piklog:installable'

let deferredPrompt: BeforeInstallPromptEvent | null = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    window.dispatchEvent(new Event(INSTALLABLE_EVENT))
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    window.dispatchEvent(new Event(INSTALLABLE_EVENT))
  })
}

/** 是否已在獨立視窗（已安裝為 app）開啟 */
export const isStandalone = (): boolean =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true)

export const canInstall = (): boolean => deferredPrompt !== null

/** 觸發瀏覽器原生安裝流程；回傳是否被接受。無可用提示時回傳 false。 */
export const promptInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) return false
  await deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  window.dispatchEvent(new Event(INSTALLABLE_EVENT))
  return outcome === 'accepted'
}

/** 訂閱可安裝狀態變化，回傳取消訂閱函式 */
export const subscribeInstallable = (cb: () => void): (() => void) => {
  window.addEventListener(INSTALLABLE_EVENT, cb)
  return () => window.removeEventListener(INSTALLABLE_EVENT, cb)
}
