import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Inbox } from 'lucide-react'
import { useRecordsStore } from '../stores/useRecordsStore'
import { usePeopleStore } from '../stores/usePeopleStore'
import { ACTION_STYLE, STAT_LABELS, actionFullLabel } from '../lib/recordLabels'
import { countryLabel } from '../lib/countries'
import { formatDate, todayStr } from '../lib/dateUtils'
import { countByDirection } from '../services/recordService'
import { recordsOfPerson } from '../services/peopleService'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import CountPill from '../components/CountPill'
import { ItemIcon } from '../components/PikIcon'

const PAGE_SIZE = 30

export default function FriendDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { records, fetchRecords } = useRecordsStore()
  const { people, fetchPeople } = usePeopleStore()
  const [shown, setShown] = useState(PAGE_SIZE)

  useEffect(() => {
    fetchRecords()
    fetchPeople()
  }, [fetchRecords, fetchPeople])

  const person = people.find(p => p.id === id)
  const list = useMemo(() => recordsOfPerson(records, id), [records, id])
  const counts = useMemo(() => countByDirection(list), [list])

  const backButton = (
    <button
      onClick={() => navigate('/people')}
      className="accessible-target flex items-center justify-center w-12 h-12 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors shrink-0"
      aria-label="回人物管理"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  )

  if (!person) {
    return (
      <div className="pb-12">
        <div className="mb-6">{backButton}</div>
        <div className="glass-card rounded-3xl p-8 text-center text-stone-500">
          <p className="font-bold text-stone-700 text-lg">找不到這位好友</p>
          <p className="text-base mt-1">可能已被刪除，請回人物管理看看。</p>
        </div>
      </div>
    )
  }

  const color = person.color || '#6B7280'
  const lastDate = list[0]?.date ?? null
  const daysSince = lastDate ? differenceInCalendarDays(parseISO(todayStr()), parseISO(lastDate)) : null

  const statCards = [
    { type: 'postcard' as const, label: `明信片 ${STAT_LABELS.postcard.sent}`, value: counts.postcard.sent, cls: 'bg-amber-50 text-amber-700' },
    { type: 'postcard' as const, label: `明信片 ${STAT_LABELS.postcard.received}`, value: counts.postcard.received, cls: 'bg-orange-50 text-orange-700' },
    { type: 'mushroom' as const, label: `蘑菇 ${STAT_LABELS.mushroom.sent}`, value: counts.mushroom.sent, cls: 'bg-violet-50 text-violet-700' },
    { type: 'mushroom' as const, label: `蘑菇 ${STAT_LABELS.mushroom.received}`, value: counts.mushroom.received, cls: 'bg-fuchsia-50 text-fuchsia-700' },
  ]

  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 mb-6">
        {backButton}
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight flex items-center gap-2">
            <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="truncate">{person.name}</span>
          </h1>
          <p className="text-stone-500 text-base mt-0.5 truncate">
            {[countryLabel(person.country), person.nickname].filter(Boolean).join(' · ') || '往來紀錄'}
          </p>
        </div>
      </div>

      {/* 累計數字（全部期間） */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {statCards.map(c => (
          <div key={c.label} className={`rounded-2xl p-4 ${c.cls}`}>
            <p className="text-base font-bold flex items-center gap-1.5"><ItemIcon type={c.type} className="w-6 h-6" /> {c.label}</p>
            <p className="text-3xl font-black tabular-nums mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-3">
        <Clock className="w-6 h-6 text-lime-600 shrink-0" />
        <p className="text-base font-bold text-stone-700">
          {lastDate
            ? `最近互動 ${daysSince === 0 ? '今天' : `${daysSince} 天前`}`
            : '還沒有任何互動紀錄'}
        </p>
      </div>

      {/* 時間軸 */}
      <h2 className="text-lg font-extrabold text-stone-800 mb-3 flex items-center gap-2">往來紀錄 <CountPill>{list.length} 筆</CountPill></h2>
      {list.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center">
          <Inbox className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-base text-stone-500">到「互動紀錄」新增第一筆吧！</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.slice(0, shown).map(r => (
            <div key={r.id} className="glass-card rounded-2xl p-3 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center text-2xl shrink-0">
                <ItemIcon type={r.itemType} className="w-9 h-9" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-base font-bold px-2 py-0.5 rounded-full inline-block ${ACTION_STYLE[r.actionType]}`}>
                  {actionFullLabel(r.itemType, r.actionType)}
                </span>
                <p className="text-base text-stone-500 mt-0.5 truncate">
                  {formatDate(r.date)}{r.note ? ` · ${r.note}` : ''}
                </p>
              </div>
            </div>
          ))}
          {list.length > shown && (
            <button
              onClick={() => setShown(s => s + PAGE_SIZE)}
              className="accessible-target w-full h-12 rounded-xl bg-stone-100 text-stone-600 font-bold text-base hover:bg-stone-200 transition-colors"
            >
              顯示更多
            </button>
          )}
        </div>
      )}
    </div>
  )
}
