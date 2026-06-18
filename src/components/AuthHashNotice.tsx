import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { signInWithGoogle } from '../lib/auth'

interface Notice {
  type: 'ok' | 'err'
  text: string
  actionLabel?: string
  onAction?: () => void
}

// 只自動嘗試「取回」一次，避免綁定/取回都失敗時無限跳轉
const RETRY_FLAG = 'piklog_auth_auto_restore'

// Email/Google 連結導回 App 時，網址會帶結果（成功或失敗）。
// Google OAuth 錯誤在 query；Email 連結結果在 hash。成功的 ?code= 由 supabase-js 自行處理。
export default function AuthHashNotice() {
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    const hp = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const sp = new URLSearchParams(window.location.search.replace(/^\?/, ''))
    const hashErr = hp.get('error_code') || hp.get('error')
    const queryErr = sp.get('error_code') || sp.get('error')
    const type = hp.get('type')

    // 一切正常（含 OAuth 成功的 ?code=）→ 清掉自動取回旗標，結束
    if (!hashErr && !queryErr && !type) {
      sessionStorage.removeItem(RETRY_FLAG)
      return
    }

    const clearHash = () => history.replaceState(null, '', window.location.pathname)

    // ── Google OAuth 失敗（query）：多半是這個 Google 已綁到既有帳號 → 自動帶去登入取回 ──
    if (queryErr) {
      clearHash()
      const alreadyTried = sessionStorage.getItem(RETRY_FLAG)
      if (!alreadyTried) {
        sessionStorage.setItem(RETRY_FLAG, '1')
        setNotice({ type: 'ok', text: '這個 Google 已經有帳號了，正在帶你登入取回資料…' })
        signInWithGoogle().then(({ error }) => {
          if (error) {
            sessionStorage.removeItem(RETRY_FLAG)
            setNotice({ type: 'err', text: '取回資料沒有成功，請再試一次。', actionLabel: '重試', onAction: () => signInWithGoogle() })
          }
          // 成功會跳轉，不會走到這
        })
      } else {
        sessionStorage.removeItem(RETRY_FLAG)
        setNotice({ type: 'err', text: '取回資料沒有成功，請再試一次。', actionLabel: '用 Google 重試', onAction: () => signInWithGoogle() })
      }
      return
    }

    // ── Email 連結失敗（hash）──
    if (hashErr) {
      clearHash()
      const expired = /expired|otp/i.test(`${hashErr}`)
      setNotice({
        type: 'err',
        text: expired
          ? '這個連結已過期或用過了，請回「設定 → 帳號與同步」重新試一次。'
          : '連結驗證沒有成功，請回「設定 → 帳號與同步」再試一次。',
      })
      return
    }

    // ── Email 連結成功 ──
    if (type && /magiclink|recovery/.test(type)) {
      sessionStorage.removeItem(RETRY_FLAG)
      setNotice({ type: 'ok', text: '已切換到你的帳號，資料已取回 🎉' })
      clearHash()
    } else if (type && /email_change|signup/.test(type)) {
      sessionStorage.removeItem(RETRY_FLAG)
      setNotice({ type: 'ok', text: '已綁定 Email！之後換裝置就能用這個 Email 取回資料 🎉' })
      clearHash()
    }
  }, [])

  if (!notice) return null

  const ok = notice.type === 'ok'
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md">
      <div
        className={`rounded-2xl p-4 shadow-lg border ${
          ok ? 'bg-lime-50 border-lime-200 text-lime-800' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}
      >
        <div className="flex items-start gap-3">
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
        {notice.actionLabel && notice.onAction && (
          <button
            onClick={notice.onAction}
            className="accessible-target w-full mt-3 h-11 rounded-xl bg-lime-600 hover:bg-lime-700 text-white font-extrabold text-base transition-colors"
          >
            {notice.actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
