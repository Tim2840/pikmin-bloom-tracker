import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { signInWithGoogle } from '../lib/auth'

interface Notice {
  type: 'ok' | 'err'
  text: string
  actionLabel?: string
  onAction?: () => void
}

// Email/Google 連結導回 App 時，網址會帶結果（成功或失敗）。
// 把它解析成友善提示；成功的 token 由 supabase-js 自動處理，失效/拒絕的 error 由這裡接手。
export default function AuthHashNotice() {
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    const hp = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const sp = new URLSearchParams(window.location.search.replace(/^\?/, ''))
    const errorCode = hp.get('error_code') || hp.get('error') || sp.get('error_code') || sp.get('error')
    const errorDesc = hp.get('error_description') || sp.get('error_description') || ''
    const type = hp.get('type')
    if (!errorCode && !type) return

    const clearHash = () => history.replaceState(null, '', window.location.pathname)

    if (errorCode) {
      clearHash()
      const blob = `${errorCode} ${errorDesc}`.toLowerCase()
      // 綁定失敗最常見原因：這個 Google 已綁定到某個帳號 → 應改用「取回資料」(登入該帳號)
      const alreadyLinked = /already.*(linked|exist|regist)|identity.*already|email.*exist/.test(blob)
      const expired = /expired|otp/.test(blob)

      if (alreadyLinked) {
        setNotice({
          type: 'ok',
          text: '這個 Google 帳號已經綁定過了 🎉 要把它的資料取回到這台裝置嗎？',
          actionLabel: '取回資料',
          onAction: () => { signInWithGoogle() },
        })
        return
      }

      // 其次：目前帳號其實已經綁了 Google？（已是綁定狀態仍重複觸發）
      ;(async () => {
        let alreadyGoogle = false
        try {
          if (isSupabaseConfigured()) {
            const { data } = await supabase.auth.getUser()
            alreadyGoogle = (data.user?.identities ?? []).some((i) => i.provider === 'google')
          }
        } catch { /* 查不到就當作未綁定 */ }

        if (alreadyGoogle) {
          setNotice({ type: 'ok', text: '你已經綁定 Google 帳號了，資料會自動同步 🎉' })
        } else if (expired) {
          setNotice({ type: 'err', text: '這個連結已過期或用過了，請回「設定 → 帳號與同步」重新試一次。' })
        } else {
          setNotice({ type: 'err', text: '綁定沒有成功，請回「設定 → 帳號與同步」再試一次。' })
        }
      })()
      return
    }

    if (type && /magiclink|recovery/.test(type)) {
      setNotice({ type: 'ok', text: '已切換到你的帳號，資料已取回 🎉' })
      clearHash()
    } else if (type && /email_change|signup/.test(type)) {
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
