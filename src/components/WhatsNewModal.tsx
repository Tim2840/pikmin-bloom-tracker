import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalShell from './ModalShell'
import PikIcon from './PikIcon'
import CountPill from './CountPill'
import {
  APP_VERSION, entriesSince, getLastSeenVersion, hasUsedBefore, markChangelogSeen, shouldShowWhatsNew,
} from '../lib/changelog'

// 更新完成後第一次打開，彈出「更新了什麼」。全新使用者不彈，但會先記下目前版本，之後的更新才會通知。
function decide() {
  const lastSeen = getLastSeenVersion()
  if (shouldShowWhatsNew(lastSeen, hasUsedBefore())) return entriesSince(lastSeen)
  if (lastSeen !== APP_VERSION) markChangelogSeen()
  return null
}

export default function WhatsNewModal() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState(decide)

  if (!entries) return null

  const close = () => { markChangelogSeen(); setEntries(null) }
  const openChangelog = () => { close(); navigate('/changelog') }

  return (
    <ModalShell onClose={close}>
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl animate-scale-up max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="text-center">
          <PikIcon name="mushroom" mood="happy" className="w-20 h-20" />
          <h3 className="text-2xl font-black text-stone-800 mt-1 flex items-center justify-center gap-2">
            更新了什麼 <CountPill>{APP_VERSION}</CountPill>
          </h3>
        </div>

        <div className="mt-4 space-y-3 text-left">
          {entries.map(entry => (
            <div key={entry.version}>
              {entries.length > 1 && <p className="text-base font-black text-stone-500 tabular-nums mb-1">{entry.version}</p>}
              <ul className="space-y-1">
                {entry.items.map(item => (
                  <li key={item} className="flex gap-2 text-lg text-stone-800">
                    <span className="text-lime-600 font-black" aria-hidden="true">•</span>
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={close}
            className="accessible-target w-full h-14 rounded-2xl bg-lime-600 hover:bg-lime-700 active:scale-95 text-white text-lg font-extrabold transition-all"
          >
            知道了
          </button>
          <button
            onClick={openChangelog}
            className="accessible-target w-full h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-lg font-bold transition-colors"
          >
            查看更新紀錄
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
