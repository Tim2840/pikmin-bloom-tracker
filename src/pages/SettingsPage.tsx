import { useEffect, useState } from 'react'
import { Type, RotateCcw, Smartphone, Share, MoreVertical, Download, CheckCircle2, ExternalLink, Mail, ShieldCheck } from 'lucide-react'
import { useSettingsStore, MIN_SCALE, MAX_SCALE } from '../stores/useSettingsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { isSupabaseConfigured } from '../lib/supabase'
import { canInstall, isStandalone, promptInstall, subscribeInstallable } from '../lib/pwaInstall'
import EmailBackupModal from '../components/EmailBackupModal'

const PRESETS = [
  { label: '小', sub: '90%', value: 0.9 },
  { label: '標準', sub: '100%', value: 1.0 },
  { label: '大', sub: '115%', value: 1.15 },
  { label: '特大', sub: '130%', value: 1.3 },
]

export default function SettingsPage() {
  const { settings, setFontScale, reset } = useSettingsStore()
  const scale = settings.fontScale
  const { user, isAnonymous } = useAuthStore()
  const [showEmailModal, setShowEmailModal] = useState(false)
  const dbEnabled = isSupabaseConfigured()

  // 追蹤 PWA 可安裝狀態
  const [installable, setInstallable] = useState(canInstall())
  const standalone = isStandalone()
  useEffect(() => subscribeInstallable(() => setInstallable(canInstall())), [])

  const guideUrl = `${import.meta.env.BASE_URL}guide.html`

  const handleInstall = async () => {
    await promptInstall()
  }

  return (
    <div className="w-full pb-4">
      {showEmailModal && <EmailBackupModal onClose={() => setShowEmailModal(false)} />}
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
                設定 Email 後，換手機或清除瀏覽器時可透過 Email 連結還原所有紀錄。
              </p>
              <p className="text-amber-700 text-sm font-medium bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
                ⚠️ 目前為「本機帳號」模式。清除瀏覽器資料或換裝置前，請先設定 Email 備份。
              </p>
              <button
                onClick={() => setShowEmailModal(true)}
                className="accessible-target inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base shadow-md transition-all active:scale-95"
              >
                <Mail className="w-5 h-5" /> 設定 Email 備份
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 bg-lime-50 border border-lime-200 rounded-2xl p-4">
              <CheckCircle2 className="w-6 h-6 text-lime-600 shrink-0" />
              <div>
                <p className="font-bold text-lime-800 text-base">已設定 Email 備份</p>
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
