import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap, Plus, Trash2, ChevronUp, ChevronDown,
  ArrowLeft, Check, AlertCircle, AlertTriangle,
} from 'lucide-react'
import { useQuickActionsStore } from '../stores/useQuickActionsStore'
import { usePeopleStore } from '../stores/usePeopleStore'
import { isSupabaseConfigured } from '../lib/supabase'
import { ItemType, ActionType } from '../types'
import { ITEM_META, DIRECTIONS, actionButtonLabel, buildQuickActionLabel } from '../lib/recordLabels'

const ITEM_OPTIONS: { value: ItemType; emoji: string; label: string }[] = [
  { value: 'postcard', ...ITEM_META.postcard },
  { value: 'mushroom', ...ITEM_META.mushroom },
]

export default function QuickActionsPage() {
  const navigate = useNavigate()
  const { quickActions, loading, error, fetchQuickActions, addQuickAction, deleteQuickAction, reorderQuickAction } = useQuickActionsStore()
  const { people, fetchPeople } = usePeopleStore()

  const [personId, setPersonId] = useState('')
  const [itemType, setItemType] = useState<ItemType>('postcard')
  const [actionType, setActionType] = useState<ActionType>('sent')
  const [label, setLabel] = useState('')
  const [useToday, setUseToday] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchQuickActions()
    fetchPeople()
  }, [fetchQuickActions, fetchPeople])

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3000)
  }

  const getAutoLabel = () => {
    const person = people.find(p => p.id === personId)
    if (!person) return ''
    return buildQuickActionLabel(person.nickname || person.name, itemType, actionType)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!personId) {
      showToast('請先選擇好友！', 'error')
      return
    }
    const finalLabel = label.trim() || getAutoLabel()
    if (!finalLabel) {
      showToast('請輸入動作標籤！', 'error')
      return
    }
    const success = await addQuickAction({ label: finalLabel, personId, itemType, actionType, useToday })
    if (success) {
      setPersonId('')
      setItemType('postcard')
      setActionType('sent')
      setLabel('')
      setUseToday(true)
      showToast('快捷動作已新增！')
    }
  }

  const handleDelete = async (id: string) => {
    const success = await deleteQuickAction(id)
    if (success) {
      setDeletingId(null)
      showToast('已刪除快捷動作')
    }
  }

  const isDBOnline = isSupabaseConfigured()

  return (
    <div className="pb-12">
      {/* 頂部標題 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/people')}
          className="accessible-target flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight flex items-center gap-2">
            <Zap className="w-7 h-7 text-amber-500" />
            快捷動作設定
          </h1>
          <p className="text-stone-500 text-sm md:text-base mt-0.5">設定首頁一鍵紀錄的快捷按鈕</p>
        </div>
      </div>

      {/* 離線模式提示 */}
      {!isDBOnline && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start text-amber-800">
          <AlertTriangle className="w-5 h-5 mr-3 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">目前使用本地儲存模式，快捷動作將儲存在此裝置。</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start text-rose-800">
          <AlertCircle className="w-5 h-5 mr-3 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white text-base font-bold shadow-lg z-50 flex items-center ${
          toast.type === 'success' ? 'bg-amber-500' : 'bg-rose-600'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          {toast.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

        {/* 新增表單 */}
        <section className="md:col-span-5 glass-card rounded-3xl p-5 shadow-sm">
          <h2 className="text-lg font-extrabold text-stone-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-500" />
            新增快捷動作
          </h2>

          {people.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <p className="text-sm">請先到「人物管理」新增好友，才能設定快捷動作。</p>
            </div>
          ) : (
            <form onSubmit={handleAdd} className="space-y-4">
              {/* 好友選擇 */}
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-1.5">
                  選擇好友 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={personId}
                  onChange={e => setPersonId(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-base text-stone-800"
                >
                  <option value="">請選擇好友</option>
                  {people.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.nickname ? ` (${p.nickname})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 品項選擇 */}
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-2">品項</label>
                <div className="grid grid-cols-2 gap-2">
                  {ITEM_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setItemType(opt.value)}
                      className={`accessible-target flex flex-col items-center justify-center py-3 rounded-2xl border-2 transition-all font-bold text-base gap-1 ${
                        itemType === opt.value
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
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
                <div className="grid grid-cols-2 gap-2">
                  {DIRECTIONS.map(dir => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setActionType(dir)}
                      className={`accessible-target py-3 rounded-2xl border-2 transition-all font-bold text-sm ${
                        actionType === dir
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                      }`}
                    >
                      {actionButtonLabel(itemType, dir)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 自訂標籤 */}
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-1.5">
                  按鈕標籤
                  <span className="text-stone-400 text-xs font-normal ml-1">(留空自動產生)</span>
                </label>
                <input
                  type="text"
                  placeholder={getAutoLabel() || '例如：AJ 寄明信片'}
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-base text-stone-800"
                />
              </div>

              {/* 日期設定 */}
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-2">日期設定</label>
                <button
                  type="button"
                  onClick={() => setUseToday(!useToday)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    useToday
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    useToday ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
                  }`}>
                    {useToday && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`font-bold text-sm ${useToday ? 'text-amber-700' : 'text-stone-500'}`}>
                    按下按鈕時自動使用「今天」日期
                  </span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full h-12 mt-2 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-extrabold text-base rounded-2xl transition-all shadow-md shadow-amber-500/20"
              >
                新增快捷動作
              </button>
            </form>
          )}
        </section>

        {/* 快捷動作列表 */}
        <section className="md:col-span-7 mt-8 md:mt-0">
          <h2 className="text-lg font-extrabold text-stone-800 mb-4">
            ⚡ 我的快捷動作 ({quickActions.length} 個)
          </h2>

          {loading && quickActions.length === 0 ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-16 bg-stone-200/50 rounded-2xl animate-pulse" />)}
            </div>
          ) : quickActions.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 text-center text-stone-500">
              <span className="text-4xl block mb-2">⚡</span>
              <p className="font-bold text-stone-700">還沒有快捷動作</p>
              <p className="text-xs text-stone-400 mt-1">使用左側表單新增第一個快捷按鈕！</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quickActions.map((action, idx) => {
                const person = people.find(p => p.id === action.personId)
                const itemEmoji = ITEM_META[action.itemType].emoji
                const actionLabel = actionButtonLabel(action.itemType, action.actionType)
                return (
                  <div
                    key={action.id}
                    className="glass-card rounded-2xl p-4 flex items-center gap-3"
                  >
                    {/* 排序按鈕 */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => reorderQuickAction(action.id, 'up')}
                        disabled={idx === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => reorderQuickAction(action.id, 'down')}
                        disabled={idx === quickActions.length - 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 動作資訊 */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${person?.color || '#6B7280'}20` }}
                    >
                      {itemEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-stone-800 text-base truncate">{action.label}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {person?.name ?? '已刪除的好友'} · {actionLabel} · {action.useToday ? '今天日期' : '手動日期'}
                      </p>
                    </div>

                    {/* 刪除按鈕 */}
                    <button
                      onClick={() => setDeletingId(action.id)}
                      className="accessible-target flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* 刪除確認 Dialog */}
      {deletingId && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-stone-800 mb-2">確定要刪除嗎？</h3>
            <p className="text-stone-600 text-sm mb-6">
              刪除後首頁將不再顯示此快捷按鈕。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 h-12 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 h-12 rounded-xl bg-rose-600 text-white font-extrabold hover:bg-rose-700 transition-colors"
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
