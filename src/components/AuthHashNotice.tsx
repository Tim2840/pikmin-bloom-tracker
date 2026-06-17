import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

// Email 確認連結導回 App 時，網址 hash 會帶結果（成功或失敗）。
// 這個元件把它解析成友善提示，避免使用者看到空白頁或 localhost 錯誤。
// 成功的 token hash 由 supabase-js 自動處理並清掉；失效/拒絕的 error hash 由這裡接手。
export default function AuthHashNotice() {
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    const raw = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
    if (!raw) return
    const params = new URLSearchParams(raw)
    const errorCode = params.get('error_code') || params.get('error')
    const type = params.get('type')

    const clearHash = () =>
      history.replaceState(null, '', window.location.pathname + window.location.search)

    if (errorCode) {
      const expired = /expired|otp/i.test(errorCode)
      setNotice({
        type: 'err',
        text: expired
          ? '這個確認連結已過期或用過了，請回「設定 → 雲端備份」重新寄一次確認信。'
          : '連結驗證沒有成功，請回「設定 → 雲端備份」再試一次。',
      })
      clearHash()
    } else if (type && /magiclink|recovery/.test(type)) {
      setNotice({ type: 'ok', text: '登入成功，已把你的資料還原回來了 🎉' })
      clearHash()
    } else if (type && /email_change|signup/.test(type)) {
      setNotice({ type: 'ok', text: 'Email 綁定成功！之後換裝置就能用這個 Email 還原資料 🎉' })
      clearHash()
    }
  }, [])

  if (!notice) return null

  const ok = notice.type === 'ok'
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md">
      <div
        className={`flex items-start gap-3 rounded-2xl p-4 shadow-lg border ${
          ok ? 'bg-lime-50 border-lime-200 text-lime-800' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}
      >
        {ok ? (
          <CheckCircle2 className="w-6 h-6 shrink-0 text-lime-600" />
        ) : (
          <AlertCircle className="w-6 h-6 shrink-0 text-amber-600" />
        )}
        <p className="text-base font-medium leading-relaxed flex-1">{notice.text}</p>
        <button
          onClick={() => setNotice(null)}
          className="accessible-target shrink-0 w-8 h-8 -mt-1 -mr-1 flex items-center justify-center rounded-lg hover:bg-black/5"
          aria-label="關閉"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
