import { useState } from 'react'
import { Check } from 'lucide-react'
import { ItemType, ActionType, Person, RecordItem, RecordFormValues } from '../types'
import { ITEM_META, DIRECTIONS, actionButtonLabel } from '../lib/recordLabels'
import DateSelect from './DateSelect'

const ITEM_OPTIONS: { value: ItemType; emoji: string; label: string }[] = [
  { value: 'postcard', ...ITEM_META.postcard },
  { value: 'mushroom', ...ITEM_META.mushroom },
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

interface RecordFormProps {
  people: Person[]
  initial?: RecordItem
  submitLabel: string
  /** 回傳 false 代表儲存失敗（連續新增模式下不重設表單） */
  onSubmit: (values: RecordFormValues) => void | boolean | Promise<void | boolean>
  onCancel: () => void
  /** 連續新增模式：儲存後留在同一位好友，只清空備註，方便一次記多筆 */
  continuous?: boolean
  cancelLabel?: string
}

export default function RecordForm({
  people, initial, submitLabel, onSubmit, onCancel, continuous = false, cancelLabel = '取消',
}: RecordFormProps) {
  const [personId, setPersonId] = useState(initial?.personId ?? '')
  const [itemType, setItemType] = useState<ItemType>(initial?.itemType ?? 'postcard')
  const [actionType, setActionType] = useState<ActionType>(
    initial?.actionType && initial.actionType !== 'helped' ? initial.actionType : 'sent'
  )
  const [date, setDate] = useState(initial?.date ?? getOffsetDate(0))
  const [note, setNote] = useState(initial?.note ?? '')
  const [errorText, setErrorText] = useState('')
  // 編輯既有紀錄且該好友還在名冊中：只顯示他，不需重選（好友已被刪除時才退回選單）
  const lockedPerson = initial ? people.find(p => p.id === initial.personId) : undefined
  const [submitting, setSubmitting] = useState(false)
  const [savedCount, setSavedCount] = useState(0)

  // 切換品項時保留方向（往外仍往外），僅把舊的 helped 正規化為 sent
  const handleItemChange = (value: ItemType) => {
    setItemType(value)
    if (actionType === 'helped') setActionType('sent')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!personId) {
      setErrorText('請選擇一位好友！')
      return
    }
    const person = people.find(p => p.id === personId)
    setSubmitting(true)
    try {
      const result = await onSubmit({
        personId,
        personNameSnapshot: person?.name ?? initial?.personNameSnapshot ?? '',
        date,
        itemType,
        actionType,
        note: note.trim() || undefined,
      })
      // 連續新增：保留好友／品項／方向／日期，只清掉備註
      if (continuous && result !== false) {
        setNote('')
        setSavedCount(c => c + 1)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorText && (
        <p className="text-sm font-bold text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{errorText}</p>
      )}
      {continuous && savedCount > 0 && (
        <p className="text-base font-bold text-lime-700 bg-lime-50 rounded-xl px-3 py-2">
          ✅ 已連續記錄 {savedCount} 筆，可以繼續記，記完按「完成」
        </p>
      )}

      {/* 人名：編輯時固定顯示該好友（不列出全部好友）；新增時用下拉選單選擇（只顯示名字，不加暱稱括號） */}
      <div>
        {lockedPerson ? (
          <>
            <label className="block text-sm font-bold text-stone-600 mb-2">好友</label>
            <div
              className="inline-flex items-center gap-2 px-4 min-h-[48px] rounded-2xl border-2 font-bold text-base"
              style={{
                borderColor: lockedPerson.color || '#6B7280',
                backgroundColor: `${lockedPerson.color || '#6B7280'}15`,
                color: lockedPerson.color || '#6B7280',
              }}
            >
              <span
                className="w-5 h-5 rounded-full shrink-0"
                style={{ backgroundColor: lockedPerson.color || '#6B7280' }}
              />
              {lockedPerson.name}
            </div>
          </>
        ) : (
        <>
        <label className="block text-sm font-bold text-stone-600 mb-2">
          選擇好友 <span className="text-rose-500">*</span>
        </label>
        {people.length === 0 ? (
          <p className="text-sm text-stone-400 bg-stone-50 rounded-xl px-4 py-3">
            尚無好友，請先到「人物管理」新增。
          </p>
        ) : (
          <select
            value={personId}
            onChange={e => { setPersonId(e.target.value); setErrorText('') }}
            className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white text-base text-stone-800"
          >
            <option value="">請選擇好友</option>
            {people.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
        </>
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
              onClick={() => handleItemChange(opt.value)}
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
        <div className="grid grid-cols-2 gap-2.5">
          {DIRECTIONS.map(dir => (
            <button
              key={dir}
              type="button"
              onClick={() => setActionType(dir)}
              className={`accessible-target rounded-2xl border-2 transition-all font-bold text-sm ${
                actionType === dir
                  ? 'border-sky-400 bg-sky-50 text-sky-700'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              }`}
            >
              {actionButtonLabel(itemType, dir)}
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
        <DateSelect value={date} max={getOffsetDate(0)} onChange={setDate} />
      </div>

      {/* 備註 */}
      <div>
        <label className="block text-sm font-bold text-stone-600 mb-1.5">
          備註
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
          {cancelLabel}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 h-12 rounded-xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 disabled:opacity-60 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
