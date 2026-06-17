import { ShieldAlert, LogIn, Clock } from 'lucide-react'

const FLAG = 'piklog_backup_reminded'

export function hasSeenBackupReminder(): boolean {
  return !!localStorage.getItem(FLAG)
}

function markSeen() {
  localStorage.setItem(FLAG, '1')
}

interface Props {
  onSetupNow: () => void
  onLater: () => void
}

export default function BackupReminderModal({ onSetupNow, onLater }: Props) {
  const handleSetupNow = () => {
    markSeen()
    onSetupNow()
  }

  const handleLater = () => {
    markSeen()
    onLater()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-up">
        <div className="px-6 pt-8 pb-6 text-center">
          {/* 圖示 */}
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-10 h-10 text-amber-500" />
          </div>

          <h2 className="text-2xl font-black text-stone-800 mb-3">
            保存你的紀錄
          </h2>

          <p className="text-stone-600 text-base leading-relaxed mb-2">
            你的紀錄目前只存在這台裝置上。
          </p>
          <p className="text-stone-600 text-base leading-relaxed mb-6">
            如果換手機、或清除瀏覽器資料，<br />
            <span className="font-bold text-rose-600">所有紀錄將會消失</span>。
          </p>

          <div className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 mb-6 text-left">
            <p className="text-sky-800 text-base font-bold mb-1 flex items-center gap-2">
              <LogIn className="w-4 h-4 shrink-0" /> 登入就能保存
            </p>
            <p className="text-sky-700 text-sm leading-relaxed">
              登入（Google 或 Email）後，換手機或清除瀏覽器都能登回來，資料不會不見。
            </p>
          </div>

          {/* 主要按鈕 */}
          <button
            onClick={handleSetupNow}
            className="accessible-target w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-lg shadow-md transition-all active:scale-95 mb-3 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            現在去登入保存
          </button>

          {/* 次要按鈕 */}
          <button
            onClick={handleLater}
            className="accessible-target w-full h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-500 font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            之後再說
          </button>
        </div>
      </div>
    </div>
  )
}
