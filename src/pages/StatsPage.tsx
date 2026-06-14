import { useEffect, useMemo, useState } from 'react'
import { BarChart3, TrendingUp, Users, Heart, Trophy, Inbox, HelpCircle } from 'lucide-react'
import { useRecordsStore } from '../stores/useRecordsStore'
import { usePeopleStore } from '../stores/usePeopleStore'
import { RecordItem } from '../types'
import { RANGE_OPTIONS, RangeKey, isInRange, formatDate } from '../lib/dateUtils'
import TutorialOverlay from '../components/TutorialOverlay'
import { useTutorial } from '../hooks/useTutorial'
import { TUTORIAL_STEPS, TUTORIAL_COMPLETE } from '../lib/tutorialData'

interface PersonStat {
  id: string | null
  name: string
  color: string
  postcardSent: number   // 寄出明信片
  mushroomInvited: number // 邀 / 協助打蘑菇
  total: number
  lastDate: string | null
}

export default function StatsPage() {
  const { records, fetchRecords } = useRecordsStore()
  const { people, fetchPeople } = usePeopleStore()
  const [range, setRange] = useState<RangeKey>('month')

  useEffect(() => {
    fetchRecords()
    fetchPeople()
  }, [fetchRecords, fetchPeople])

  // 依目前時間範圍篩選
  const ranged = useMemo(
    () => records.filter(r => isInRange(r.date, range)),
    [records, range],
  )

  // 解析人名（優先用現存人物，否則用 snapshot）
  const resolveName = (r: RecordItem): string => {
    if (r.personId) {
      const p = people.find(pp => pp.id === r.personId)
      if (p) return p.name
    }
    return r.personNameSnapshot || '已刪除的好友'
  }
  const resolveColor = (r: RecordItem): string => {
    if (r.personId) {
      const p = people.find(pp => pp.id === r.personId)
      if (p?.color) return p.color
    }
    return '#9CA3AF'
  }

  // 逐人彙總（key 用 personId，沒有則用 snapshot 名稱）
  const personStats = useMemo<PersonStat[]>(() => {
    const map = new Map<string, PersonStat>()
    for (const r of ranged) {
      const key = r.personId ?? `snap:${r.personNameSnapshot}`
      let s = map.get(key)
      if (!s) {
        s = {
          id: r.personId,
          name: resolveName(r),
          color: resolveColor(r),
          postcardSent: 0,
          mushroomInvited: 0,
          total: 0,
          lastDate: null,
        }
        map.set(key, s)
      }
      if (r.itemType === 'postcard' && r.actionType === 'sent') s.postcardSent++
      if (r.itemType === 'mushroom' && (r.actionType === 'sent' || r.actionType === 'helped')) s.mushroomInvited++
      s.total++
      if (!s.lastDate || r.date > s.lastDate) s.lastDate = r.date
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  }, [ranged, people])

  // 摘要卡數字
  const totalInteractions = ranged.length
  const postcardTotal = ranged.filter(r => r.itemType === 'postcard').length
  const mushroomTotal = ranged.filter(r => r.itemType === 'mushroom').length

  const summaryCards = [
    { icon: Users, label: '好友總數', value: people.length, suffix: '位', bg: 'bg-lime-50', text: 'text-lime-700', ic: 'text-lime-500' },
    { icon: Heart, label: '互動次數', value: totalInteractions, suffix: '次', bg: 'bg-sky-50', text: 'text-sky-700', ic: 'text-sky-500' },
    { icon: TrendingUp, label: '寄出明信片', value: postcardTotal, suffix: '張', bg: 'bg-amber-50', text: 'text-amber-700', ic: 'text-amber-500' },
    { icon: BarChart3, label: '打蘑菇', value: mushroomTotal, suffix: '次', bg: 'bg-violet-50', text: 'text-violet-700', ic: 'text-violet-500' },
  ]

  const top5 = personStats.slice(0, 5)
  const isEmpty = totalInteractions === 0

  const tutSteps = TUTORIAL_STEPS.stats
  const { isOpen: tutOpen, currentStep: tutStep, isComplete: tutDone, startTutorial, next: tutNext, skip: tutSkip, closeComplete: tutClose } = useTutorial('stats', tutSteps.length)

  return (
    <div className="w-full pb-4">
      {/* 頂部標題 */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight flex items-center gap-2">
          📊 統計分析
        </h1>
        <p className="text-stone-500 text-sm md:text-base mt-0.5">互動頻率與好友關係總覽</p>
      </div>

      {/* 時間範圍切換 */}
      <div className="flex gap-2 mb-6" data-tutorial="stats-range">
        {RANGE_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setRange(opt.key)}
            className={`accessible-target px-4 py-2 rounded-xl text-base font-bold transition-all ${
              range === opt.key
                ? 'bg-lime-600 text-white shadow-md shadow-lime-600/20'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 摘要統計卡：手機兩欄，桌面四欄 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="glass-card rounded-2xl p-5 border border-white/50">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.ic}`} />
              </div>
              <p className="text-stone-500 text-xs font-bold mb-1">{card.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black tabular-nums ${card.text}`}>{card.value}</span>
                <span className="text-stone-400 text-sm font-bold">{card.suffix}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div data-tutorial="stats-list">
      {isEmpty ? (
        /* 空狀態 */
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-violet-400" />
          </div>
          <h2 className="text-lg font-bold text-stone-700 mb-2">這段期間還沒有紀錄</h2>
          <p className="text-stone-400 text-sm max-w-xs mx-auto leading-relaxed">
            換個時間範圍看看，或到「互動紀錄」新增第一筆吧！
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 好友互動排行 */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              好友互動排行
            </h2>
            <ol className="space-y-3">
              {top5.map((s, i) => (
                <li key={s.id ?? s.name} className="flex items-center gap-3">
                  <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm font-black tabular-nums ${
                    i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {i + 1}
                  </span>
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-bold text-stone-800 truncate flex-1">{s.name}</span>
                  <span className="text-stone-500 text-sm font-bold tabular-nums shrink-0">{s.total} 次</span>
                </li>
              ))}
            </ol>
          </div>

          {/* 逐人明細 */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              每位好友明細
            </h2>
            <div className="space-y-3">
              {personStats.map(s => (
                <div key={s.id ?? s.name} className="flex items-center gap-3 py-1">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-800 truncate">{s.name}</p>
                    <p className="text-xs text-stone-400">
                      最近互動：{s.lastDate ? formatDate(s.lastDate) : '—'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 text-xs font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 tabular-nums">📮 {s.postcardSent}</span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 tabular-nums">🍄 {s.mushroomInvited}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>{/* end stats-list */}

      {/* 說明按鈕 */}
      <button
        onClick={startTutorial}
        className="fixed right-4 bottom-24 md:bottom-6 z-40 w-10 h-10 rounded-full bg-white border-2 border-lime-400 text-lime-600 shadow-md hover:bg-lime-50 hover:border-lime-500 transition-all active:scale-90 flex items-center justify-center"
        title="查看使用說明"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* 教學遣罩 */}
      <TutorialOverlay
        steps={tutSteps}
        currentStep={tutStep}
        isOpen={tutOpen}
        isComplete={tutDone}
        completionMsg={TUTORIAL_COMPLETE.stats}
        onNext={tutNext}
        onSkip={tutSkip}
        onCompleteClose={tutClose}
      />
    </div>
  )
}
