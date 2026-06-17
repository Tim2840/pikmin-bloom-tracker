import { useEffect, useState } from 'react'
import { Type, RotateCcw, Smartphone, Share, MoreVertical, Download, CheckCircle2, ExternalLink, Mail, ShieldCheck, AlertCircle } from 'lucide-react'
import { useSettingsStore, MIN_SCALE, MAX_SCALE } from '../stores/useSettingsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { isSupabaseConfigured } from '../lib/supabase'
import { linkGoogle, signInWithGoogle } from '../lib/auth'
import { canInstall, isStandalone, promptInstall, subscribeInstallable } from '../lib/pwaInstall'
import EmailBackupModal from '../components/EmailBackupModal'

const PRESETS = [
  { label: '小', sub: '90%', value: 0.9 },
  { label: '標準', sub: '100%', value: 1.0 },
  { label: '大', sub: '115%', value: 1.15 },
  { label: '特大', sub: '130%', value: 1.3 },
]

function GoogleG({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export default function SettingsPage() {
  const { settings, setFontScale, reset } = useSettingsStore()
  const scale = settings.fontScale
  const { user, isAnonymous } = useAuthStore()
  const [emailModal, setEmailModal] = useState<null | 'backup' | 'restore'>(null)
  const [authError, setAuthError] = useState('')
  const dbEnabled = isSupabaseConfigured()

  // 追蹤 PWA 可安裝狀態
  const [installable, setInstallable] = useState(canInstall())
  const standalone = isStandalone()
  useEffect(() => subscribeInstallable(() => setInstallable(canInstall())), [])

  const guideUrl = `${import.meta.env.BASE_URL}guide.html`

  const handleInstall = async () => {
    await promptInstall()
  }

  const handleGoogleBackup = async () => {
    setAuthError('')
    const { error } = await linkGoogle()
    if (error) setAuthError(`Google 備份失敗：${error}`)
  }
  const handleGoogleRestore = async () => {
    setAuthError('')
    const { error } = await signInWithGoogle()
    if (error) setAuthError(`Google 登入失敗：${error}`)
  }

  return (
    <div className="w-full pb-4">
      {emailModal && <EmailBackupModal mode={emailModal} onClose={() => setEmailModal(null)} />}
      {/* 標題 */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight flex items-center gap-2">
          ⚙️ 設定
        </h1>
        <p className="text-stone-500 text-base mt-0.5">調整介面大小、把 App 加到手機桌面</p>
      </div>

      {/* 介面大小 */}
      <section className="glass-card rounded-3xl p-5 md:p-6 mb-6 max-w-xl">
        <h2 className="text-lg font-extrabold text-stone-800 mb-1 flex items-center gap-2">
          <Type className="w-5 h-5 text-lime-600" /> 介面大小
        </h2>
        <p className="text-stone-500 text-base mb-4">選一個大小，整個 App 會立刻跟著變。覺得太大就選「小」。</p>

        {/* 預設大小 */}
        <div className="grid grid-cols-4 gap-2 md:gap-3 mb-5">
          {PRESETS.map((p) => {
            const active = Math.abs(scale - p.value) < 0.025
            return (
              <button
                key={p.value}
                onClick={() => setFontScale(p.value)}
                className={`accessible-target flex flex-col items-center justify-center py-3 rounded-2xl font-extrabold transition-all active:scale-95 border-2 ${
                  active
                    ? 'bg-lime-600 text-white border-lime-600 shadow-md'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-lime-300 hover:bg-lime-50'
                }`}
              >
                <span className="text-lg leading-none">{p.label}</span>
                <span className={`text-sm mt-1 ${active ? 'text-lime-50' : 'text-stone-400'}`}>{p.sub}</span>
              </button>
            )
          })}
        </div>

        {/* 微調滑桿 */}
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="scale" className="text-base font-bold text-stone-700">
            微調：{Math.round(scale * 100)}%
          </label>
          <button
            onClick={reset}
            className="accessible-target inline-flex items-center gap-1.5 text-base font-bold text-stone-500 hover:text-lime-700 px-2 rounded-lg"
          >
            <RotateCcw className="w-4 h-4" /> 回預設
          </button>
        </div>
        <input
          id="scale"
          type="range"
          min={MIN_SCALE}
          max={MAX_SCALE}
          step={0.05}
          value={scale}
          onChange={(e) => setFontScale(parseFloat(e.target.value))}
          className="w-full h-3 rounded-full appearance-none bg-stone-200 accent-lime-600 cursor-pointer"
        />

        {/* 即時預覽 */}
        <div className="mt-5 bg-stone-50 border border-stone-100 rounded-2xl p-4">
          <p className="text-sm text-stone-400 mb-2">預覽</p>
          <p className="text-base text-stone-800 font-medium mb-3">🍄 今天和小美互相寄了明信片！</p>
          <button className="accessible-target inline-flex items-center px-4 py-2 rounded-xl bg-lime-600 text-white font-extrabold text-lg">
            按鈕範例
          </button>
        </div>
      </section>

      {/* 雲端備份 */}
      {dbEnabled && (
        <section className="glass-card rounded-3xl p-5 md:p-6 mb-6 max-w-xl">
          <h2 className="text-lg font-extrabold text-stone-800 mb-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-lime-600" /> 雲端備份與同步
          </h2>
          {isAnonymous || !user ? (
            <>
              <p className="text-stone-500 text-base mb-4 leading-relaxed">
                備份後，換手機或清除瀏覽器時就能登回同一個帳號、把紀錄全部還原。
              </p>
              <p className="text-amber-700 text-sm font-medium bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
                ⚠️ 目前為「本機帳號」模式。清除瀏覽器資料或換裝置前，請先備份。
              </p>

              {authError && (
                <div className="flex items-start gap-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 mb-4">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{authError}</p>
                </div>
              )}

              {/* Google：主要方式 */}
              <button
                onClick={handleGoogleBackup}
                className="accessible-target w-full sm:w-auto inline-flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-white border-2 border-stone-200 hover:border-stone-300 text-stone-700 font-extrabold text-base shadow-sm transition-all active:scale-95"
              >
                <GoogleG className="w-5 h-5" /> 用 Google 帳號備份
              </button>
              <button
                onClick={handleGoogleRestore}
                className="accessible-target block mt-3 text-base font-bold text-sky-700 hover:text-sky-800 underline underline-offset-2"
              >
                已經有帳號？用 Google 登入還原
              </button>

              {/* Email：備援方式 */}
              <div className="mt-5 pt-4 border-t border-stone-100">
                <p className="text-stone-400 text-sm mb-2">沒有 Google 帳號？也可以用 Email：</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <button
                    onClick={() => setEmailModal('backup')}
                    className="accessible-target inline-flex items-center gap-1.5 text-base font-bold text-sky-700 hover:text-sky-800 underline underline-offset-2"
                  >
                    <Mail className="w-4 h-4" /> 用 Email 備份
                  </button>
                  <button
                    onClick={() => setEmailModal('restore')}
                    className="accessible-target text-base font-bold text-sky-700 hover:text-sky-800 underline underline-offset-2"
                  >
                    用 Email 登入還原
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 bg-lime-50 border border-lime-200 rounded-2xl p-4">
              <CheckCircle2 className="w-6 h-6 text-lime-600 shrink-0" />
              <div>
                <p className="font-bold text-lime-800 text-base">雲端備份已啟用</p>
                <p className="text-lime-700 text-sm">{user.email}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 加入主畫面 */}
      <section className="glass-card rounded-3xl p-5 md:p-6 max-w-xl">
        <h2 className="text-lg font-extrabold text-stone-800 mb-1 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-lime-600" /> 加入手機桌面
        </h2>
        <p className="text-stone-500 text-base mb-4">把 PikLog 像 App 一樣放到桌面，之後一點就開、不用記網址。</p>

        {standalone ? (
          <div className="flex items-center gap-2 bg-lime-50 border border-lime-200 rounded-2xl p-4 text-lime-800 font-bold text-base">
            <CheckCircle2 className="w-6 h-6 shrink-0" /> 你已經是用桌面 App 開啟，讚！
          </div>
        ) : (
          <>
            {installable && (
              <button
                onClick={handleInstall}
                className="accessible-target w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 mb-5 rounded-2xl bg-lime-600 hover:bg-lime-700 text-white font-extrabold text-lg shadow-md transition-all active:scale-95"
              >
                <Download className="w-5 h-5" /> 一鍵安裝到桌面
              </button>
            )}

            {/* iOS 步驟 */}
            <div className="rounded-2xl border border-stone-100 bg-white/60 p-4 mb-3">
              <p className="font-extrabold text-stone-800 text-base mb-2">🍎 iPhone / iPad（用 Safari）</p>
              <ol className="space-y-1.5 text-stone-700 text-base">
                <li className="flex gap-2"><span className="font-black text-lime-600">1.</span> 點下方工具列的「分享」<Share className="inline w-4 h-4 -mt-0.5" /></li>
                <li className="flex gap-2"><span className="font-black text-lime-600">2.</span> 往下滑，點「加入主畫面」</li>
                <li className="flex gap-2"><span className="font-black text-lime-600">3.</span> 右上角點「加入」就完成</li>
              </ol>
            </div>

            {/* Android 步驟 */}
            <div className="rounded-2xl border border-stone-100 bg-white/60 p-4">
              <p className="font-extrabold text-stone-800 text-base mb-2">🤖 Android（用 Chrome）</p>
              <ol className="space-y-1.5 text-stone-700 text-base">
                <li className="flex gap-2"><span className="font-black text-lime-600">1.</span> 點右上角的「⋮」<MoreVertical className="inline w-4 h-4 -mt-0.5" /></li>
                <li className="flex gap-2"><span className="font-black text-lime-600">2.</span> 點「安裝應用程式」或「加入主畫面」</li>
                <li className="flex gap-2"><span className="font-black text-lime-600">3.</span> 點「安裝 / 新增」就完成</li>
              </ol>
            </div>

            <a
              href={guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="accessible-target inline-flex items-center gap-1.5 mt-4 text-base font-bold text-lime-700 hover:text-lime-800"
            >
              查看完整圖文說明 <ExternalLink className="w-4 h-4" />
            </a>
          </>
        )}
      </section>
    </div>
  )
}
