import { useState } from 'react'
import { Check } from 'lucide-react'
import { ItemType, ActionType, Person, RecordItem } from '../types'

const ITEM_OPTIONS: { value: ItemType; label: string; emoji: string }[] = [
  { value: 'postcard', label: '明信片', emoji: '📮' },
  { value: 'mushroom', label: '蘑菇', emoji: '🍄' },
]

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'sent', label: '寄出' },
  { value: 'received', label: '收到' },
  { value: 'helped', label: '協助打' },
]

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const getOffsetDate = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  return toDateStr(d)
}

const DATE_SHORTCUTS = [
  { label: '今天', offset: 0 },
  { label: '昨天', offset: 1 },
  { label: '前天', offset: 2 },
]

export interface RecordFormValues {
  personId: string
  personNameSnapshot: string
  date: string
  itemType: ItemType
  actionType: ActionType
  note?: string
}

interface RecordFormProps {
  people: Person[]
  initial?: RecordItem
  submitLabel: string
  onSubmit: (values: RecordFormValues) => void
  onCancel: () => void
}

export default function RecordForm({ people, initial, submitLabel, onSubmit, onCancel }: RecordFormProps) {
  const [personId, setPersonId] = useState(initial?.personId ?? '')
  const [itemType, setItemType] = useState<ItemType>(initial?.itemType ?? 'postcard')
  const [actionType, setActionType] = useState<ActionType>(initial?.actionType ?? 'sent')
  const [date, setDate] = useState(initial?.date ?? getOffsetDate(0))
  const [note, setNote] = useState(initial?.note ?? '')
  const [errorText, setErrorText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!personId) {
      setErrorText('請選擇一位好友！')
      return
    }
    const person = people.find(p => p.id === personId)
    onSubmit({
      personId,
      personNameSnapshot: person?.name ?? initial?.personNameSnapshot ?? '',
      date,
      itemType,
      actionType,
      note: note.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorText && (
        <p className="text-sm font-bold text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{errorText}</p>
      )}

      {/* 人名快捷按鈕 */}
      <div>
        <label className="block text-sm font-bold text-stone-600 mb-2">
          選擇好友 <span className="text-rose-500">*</span>
        </label>
        {people.length === 0 ? (
          <p className="text-sm text-stone-400 bg-stone-50 rounded-xl px-4 py-3">
            尚無好友，請先到「人物管理」新增。
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {people.map(p => {
              const selected = personId === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setPersonId(p.id); setErrorText('') }}
                  className="accessible-target flex items-center gap-2 px-4 rounded-2xl border-2 font-bold text-base transition-all"
                  style={{
                    borderColor: selected ? (p.color || '#6B7280') : '#E5E7EB',
                    backgroundColor: selected ? `${p.color || '#6B7280'}15` : '#FFFFFF',
                    color: selected ? (p.color || '#6B7280') : '#57534e',
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color || '#6B7280' }}
                  />
                  {p.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 品項選擇 */}
      <div>
        <label className="block text-sm font-bold text-stone-600 mb-2">品項</label>
        <div className="grid grid-cols-2 gap-2.5">
          {ITEM_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setItemType(opt.value)}
              className={`accessible-target flex flex-col items-center justify-center py-3 rounded-2xl border-2 transition-all font-bold text-base gap-1 ${
                itemType === opt.value
                  ? 'border-sky-400 bg-sky-50 text-sky-700'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 方向選擇 */}
      <div>
        <label className="block text-sm font-bold text-stone-600 mb-2">動作方向</label>
        <div className="grid grid-cols-3 gap-2.5">
          {ACTION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setActionType(opt.value)}
              className={`accessible-target rounded-2xl border-2 transition-all font-bold text-sm ${
                actionType === opt.value
                  ? 'border-sky-400 bg-sky-50 text-sky-700'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 日期選擇 */}
      <div>
        <label className="block text-sm font-bold text-stone-600 mb-2">日期</label>
        <div className="flex gap-2 mb-2.5">
          {DATE_SHORTCUTS.map(s => {
            const sDate = getOffsetDate(s.offset)
            const selected = date === sDate
            return (
              <button
                key={s.offset}
                type="button"
                onClick={() => setDate(sDate)}
                className={`flex-1 accessible-target rounded-xl border-2 font-bold text-sm transition-all ${
                  selected
                    ? 'border-sky-400 bg-sky-50 text-sky-700'
                    : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
        <input
          type="date"
          value={date}
          max={getOffsetDate(0)}
          onChange={e => setDate(e.target.value)}
          className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white text-base text-stone-800"
        />
      </div>

      {/* 備註 */}
      <div>
        <label className="block text-sm font-bold text-stone-600 mb-1.5">
          備註 <span className="text-stone-400 text-xs font-normal">(選填)</span>
        </label>
        <input
          type="text"
          placeholder="例如：生日卡片"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white text-base text-stone-800"
        />
      </div>

      {/* 動作按鈕 */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 h-12 rounded-xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
