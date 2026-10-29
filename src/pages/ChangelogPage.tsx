import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ScrollText } from 'lucide-react'
import { CHANGELOG, markChangelogSeen } from '../lib/changelog'
import { formatDate } from '../lib/dateUtils'
import CountPill from '../components/CountPill'

export default function ChangelogPage() {
  const navigate = useNavigate()

  useEffect(() => { markChangelogSeen() }, [])

  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/settings')}
          className="accessible-target flex items-center justify-center w-12 h-12 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors shrink-0"
          aria-label="回設定"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight flex items-center gap-2">
          <ScrollText className="w-7 h-7 text-lime-600" /> 更新紀錄
        </h1>
      </div>

      <div className="space-y-3 max-w-xl">
        {CHANGELOG.map((entry, i) => (
          <section key={entry.version} className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-lg font-black text-stone-800 tabular-nums">{entry.version}</span>
              {i === 0 && <CountPill>最新</CountPill>}
              <span className="text-base text-stone-500 tabular-nums ml-auto">{formatDate(entry.date)}</span>
            </div>
            <ul className="space-y-1">
              {entry.items.map(item => (
                <li key={item} className="flex gap-2 text-base text-stone-700">
                  <span className="text-lime-600 font-black" aria-hidden="true">•</span>
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
