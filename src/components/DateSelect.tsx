// 年／月／日三個下拉選單。
// 取代原生 <input type="date">：手機上選完年月選單就會自動關閉，日期又得重新點開再選。
// 三個下拉各自獨立，選完年、月之後可以直接接著選日。

const YEAR_SPAN = 10

interface DateSelectProps {
  value: string // 'yyyy-MM-dd'
  max: string // 'yyyy-MM-dd'，不可超過（通常是今天）
  onChange: (value: string) => void
}

const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return { y, m, d }
}

const pad = (n: number) => String(n).padStart(2, '0')

const selectClass =
  'w-full h-12 px-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white text-base text-stone-800'

export default function DateSelect({ value, max, onChange }: DateSelectProps) {
  const { y, m, d } = parse(value)
  const { y: maxY, m: maxM, d: maxD } = parse(max)

  const monthLimit = (year: number) => (year === maxY ? maxM : 12)
  const dayLimit = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate()
    return year === maxY && month === maxM ? Math.min(maxD, daysInMonth) : daysInMonth
  }

  // 變更年或月後，把月、日夾回合法範圍（例如 3/31 改成 2 月 → 2/28）
  const emit = (year: number, month: number, day: number) => {
    const safeMonth = Math.min(month, monthLimit(year))
    const safeDay = Math.min(day, dayLimit(year, safeMonth))
    onChange(`${year}-${pad(safeMonth)}-${pad(safeDay)}`)
  }

  const minYear = Math.min(maxY - YEAR_SPAN, y)
  const topYear = Math.max(maxY, y)
  const years = Array.from({ length: topYear - minYear + 1 }, (_, i) => topYear - i)
  const months = Array.from({ length: monthLimit(y) }, (_, i) => i + 1)
  const days = Array.from({ length: dayLimit(y, m) }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
      <select
        aria-label="年"
        value={y}
        onChange={e => emit(Number(e.target.value), m, d)}
        className={selectClass}
      >
        {years.map(yy => <option key={yy} value={yy}>{yy} 年</option>)}
      </select>
      <select
        aria-label="月"
        value={m}
        onChange={e => emit(y, Number(e.target.value), d)}
        className={selectClass}
      >
        {months.map(mm => <option key={mm} value={mm}>{mm} 月</option>)}
      </select>
      <select
        aria-label="日"
        value={d}
        onChange={e => emit(y, m, Number(e.target.value))}
        className={selectClass}
      >
        {days.map(dd => <option key={dd} value={dd}>{dd} 日</option>)}
      </select>
    </div>
  )
}
