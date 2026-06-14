import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useRecordsStore } from '../stores/useRecordsStore'
import { usePeopleStore } from '../stores/usePeopleStore'
import { RecordItem } from '../types'
import { ITEM_META, ACTION_STYLE, actionFullLabel } from '../lib/recordLabels'
import {
  buildMonthGrid, WEEKDAY_LABELS, MONTH_LABEL, shiftMonth, todayStr, formatDateLong,
} from '../lib/dateUtils'

export default function CalendarPage() {
  const { records, fetchRecords } = useRecordsStore()
  const { people, fetchPeople } = usePeopleStore()

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-based
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    fetchRecords()
    fetchPeople()
  }, [fetchRecords, fetchPeople])

  // 依日期分組紀錄
  const byDate = useMemo(() => {
    const map = new Map<string, RecordItem[]>()
    for (const r of records) {
      const arr = map.get(r.date)
      if (arr) arr.push(r)
      else map.set(r.date, [r])
    }
    return map
  }, [records])

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])
  const today = todayStr()

  const goPrev = () => { const n = shiftMonth(year, month, -1); setYear(n.year); setMonth(n.month); setSelectedDate(null) }
  const goNext = () => { const n = shiftMonth(year, month, 1); setYear(n.year); setMonth(n.month); setSelectedDate(null) }
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelectedDate(today) }

  const personName = (r: RecordItem): string => {
    if (r.personId) {
      const p = people.find(pp => pp.id === r.personId)
      if (p) return p.name
    }
    return r.personNameSnapshot || '已刪除的好友'
  }

  // 該天主要色（取第一筆紀錄人物顏色，用於圓點）
  const dayColor = (recs: RecordItem[]): string => {
    const first = recs[0]
    if (first?.personId) {
      const p = people.find(pp => pp.id === first.personId)
      if (p?.color) return p.color
    }
    return '#84cc16' // lime-500 fallback
  }

  const selectedRecords = selectedDate ? byDate.get(selectedDate) ?? [] : []
  const monthRecordCount = useMemo(
    () => cells.filter(c => c.inMonth).reduce((sum, c) => sum + (byDate.get(c.date)?.length ?? 0), 0),
    [cells, byDate],
  )

  return (
    <div className="w-full pb-4">
      {/* 頂部標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight flex items-center gap-2">
            📅 月曆檢視
          </h1>
          <p className="text-stone-500 text-sm md:text-base mt-0.5">點選日期看看那天的互動</p>
        </div>
        <button
          onClick={goToday}
          className="accessible-target self-start sm:self-auto bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-4 py-2 rounded-xl transition-colors text-base shrink-0"
        >
          回到今天
        </button>
      </div>

      {/* 月曆卡 */}
      <div className="glass-card rounded-3xl p-4 md:p-6">
        {/* 月份切換列 */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={goPrev}
            className="accessible-target flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
            aria-label="上個月"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-black text-stone-800 tabular-nums leading-tight">
              {MONTH_LABEL(year, month)}
            </h2>
            <p className="text-xs font-bold text-stone-400 mt-0.5 tabular-nums">本月 {monthRecordCount} 筆紀錄</p>
          </div>
          <button
            onClick={goNext}
            className="accessible-target flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
            aria-label="下個月"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 星期表頭 */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAY_LABELS.map((w, i) => (
            <div
              key={w}
              className={`text-center text-xs md:text-sm font-black py-1 ${
                i === 0 || i === 6 ? 'text-rose-400' : 'text-stone-400'
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* 日期格 */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {cells.map(cell => {
            const dayRecords = byDate.get(cell.date) ?? []
            const count = dayRecords.length
            const isSelected = cell.date === selectedDate
            return (
              <button
                key={cell.date}
                onClick={() => setSelectedDate(isSelected ? null : cell.date)}
                className={`accessible-target relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-lime-600 text-white shadow-lg shadow-lime-600/30 scale-105'
                    : cell.isToday
                      ? 'bg-lime-100 ring-2 ring-lime-400 text-lime-800 font-black'
                      : cell.inMonth
                        ? 'text-stone-700 hover:bg-stone-100'
                        : 'text-stone-300 hover:bg-stone-100/50'
                }`}
              >
                <span className="text-sm md:text-base font-bold tabular-nums leading-none">{cell.day}</span>

                {/* 紀錄標記：1-2 筆顯示圓點，≥3 筆顯示「N」 */}
                <span className="h-3 flex items-center justify-center">
                  {count > 0 && count < 3 && (
                    <span className="flex gap-0.5">
                      {Array.from({ length: count }).map((_, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: isSelected ? '#ecfccb' : dayColor(dayRecords) }}
                        />
                      ))}
                    </span>
                  )}
                  {count >= 3 && (
                    <span className={`text-[10px] md:text-xs font-black tabular-nums leading-none px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/25 text-lime-50' : 'bg-lime-100 text-lime-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 選定日期的紀錄明細（inline 展開） */}
      {selectedDate && (
        <div className="mt-5 glass-card rounded-3xl p-5 animate-scale-up">
          <h3 className="font-black text-stone-800 mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-lime-600" />
            {formatDateLong(selectedDate)}
            <span className="text-stone-400 text-sm font-bold">（{selectedRecords.length} 筆）</span>
          </h3>
          {selectedRecords.length =