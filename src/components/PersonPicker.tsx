import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Person } from '../types'
import { filterPeople } from '../services/peopleService'

// 好友達到這個人數才顯示搜尋框，少的時候直接看清單就好
export const SEARCH_MIN_PEOPLE = 6

interface Props {
  people: Person[]
  value: string
  onChange: (personId: string) => void
}

const dot = (p: Person) => (
  <span className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: p.color || '#6B7280' }} />
)

// 新增紀錄用的選好友：好友多時可搜尋；選好後收成一列名字，按「更換」重新選。
export default function PersonPicker({ people, value, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [changing, setChanging] = useState(false)
  const selected = people.find(p => p.id === value)

  if (selected && !changing) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="flex-1 min-w-0 inline-flex items-center gap-2 px-4 min-h-[48px] rounded-2xl border-2 font-bold text-base"
          style={{
            borderColor: selected.color || '#6B7280',
            backgroundColor: `${selected.color || '#6B7280'}15`,
            color: selected.color || '#6B7280',
          }}
        >
          {dot(selected)}
          <span className="truncate">{selected.name}</span>
        </div>
        <button
          type="button"
          onClick={() => setChanging(true)}
          className="accessible-target shrink-0 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-base font-bold transition-colors"
        >
          更換
        </button>
      </div>
    )
  }

  const results = filterPeople(people, query)
  const choose = (id: string) => {
    onChange(id)
    setChanging(false)
    setQuery('')
  }

  return (
    <div className="space-y-2">
      {people.length >= SEARCH_MIN_PEOPLE && (
        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            // 在搜尋框按 Enter 是「選第一位」，不能讓它送出整張表單
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (results[0]) choose(results[0].id) } }}
            placeholder="搜尋好友"
            aria-label="搜尋好友"
            className="w-full h-12 pl-12 pr-12 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white text-base text-stone-800"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="accessible-target absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-stone-400 hover:text-stone-700"
              aria-label="清除搜尋"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {results.length === 0 ? (
        <p className="text-base text-stone-500 bg-stone-50 rounded-xl px-4 py-3">找不到「{query.trim()}」</p>
      ) : (
        <div role="listbox" aria-label="好友" className="max-h-56 overflow-y-auto overscroll-contain rounded-xl border border-stone-200 bg-white divide-y divide-stone-100">
          {results.map(p => (
            <button
              key={p.id}
              type="button"
              role="option"
              aria-selected={p.id === value}
              onClick={() => choose(p.id)}
              className={`accessible-target w-full flex items-center gap-3 px-4 text-left text-base font-bold transition-colors ${
                p.id === value ? 'bg-sky-50 text-sky-700' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {dot(p)}
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
