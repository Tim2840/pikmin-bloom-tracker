import { useState } from 'react'
import { Mail, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import { linkEmail, signInWithEmail } from '../lib/auth'

interface Props {
  onClose: () => void
  /** backup＝用 Email 登入並保存（預設）；restore＝換裝置用 Email 登入帶回資料 */
  mode?: 'backup' | 'restore'
}

const COPY = {
  backup: {
    title: '用 Email 登入',
    intro: '輸入 Email，我們會寄一條登入連結給你；之後換裝置或清除瀏覽器都能登回來，資料不會不見。',
    warn: '⚠️ 請先確認你能收到這個 Email，需要點信中的連結才會生效。',
    submit: '傳送登入連結',
    sentTitle: '登入連結已寄出！',
    sentBody: '點信中的連結後，就會用這個 Email 登入並把資料存到你的帳號，之後換裝置也能登回來。',
    action: linkEmail,
  },
  restore: {
    title: '用 Email 登入帶回資料',
    intro: '輸入你之前登入用的 Email，我們會寄一條登入連結給你。',
    warn: '⚠️ 點信中的連結後，會以這個 Email 的帳號登入，並把該帳號的資料帶回來。',
    submit: '傳送登入連結',
    sentTitle: '登入連結已寄出！',
    sentBody: '點信中的連結後，就會登入你的帳號並把資料帶回來。',
    action: signInWithEmail,
  },
} as const

export default function EmailBackupModal({ onClose, mode = 'backup' }: Props) {
  const c = COPY[mode]
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    const { error } = await c.action(email.trim())
    if (error) {
      setErrorMsg(error)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-up">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <h2 className="text-lg font-black text-stone-800 flex items-center gap-2">
            <Mail className="w-5 h-5 text-sky-500" />
            {c.title}
          </h2>
          <button
            onClick={onClose}
            className="accessible-target flex items-center justify-center w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {status === 'sent' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-lime-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-lime-600" />
              </div>
              <h3 className="text-xl font-black text-stone-800 mb-2">{c.sentTitle}</h3>
              <p className="text-stone-600 text-base leading-relaxed mb-1">
                請到 <span className="font-bold text-sky-700">{email}</span> 收信。
              </p>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">{c.sentBody}</p>
              <button
                onClick={onClose}
                className="accessible-target w-full h-12 rounded-2xl bg-lime-600 text-white font-extrabold text-lg hover:bg-lime-700 transition-colors"
              >
                好，我去收信
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-stone-600 text-base leading-relaxed">{c.intro}</p>
              <p className="text-stone-500 text-sm leading-relaxed bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                {c.warn}
              </p>

              {status === 'error' && (
                <div className="flex items-start gap-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{errorMsg}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-stone-600 mb-2">
                  Email 地址 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setStatus('idle') }}
                  placeholder="例如：yourname@gmail.com"
                  className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white text-base text-stone-800"
                  required
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex-1 h-12 rounded-xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {status === 'loading'
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Mail className="w-5 h-5" />
                  }
                  {status === 'loading' ? '傳送中…' : c.submit}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
