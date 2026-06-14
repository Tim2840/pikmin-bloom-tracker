import { useEffect, useMemo, useState } from 'react'
import {
  History, Filter, Plus, Calendar, User, X, Edit2, Trash2,
  Check, AlertCircle, AlertTriangle, HelpCircle,
} from 'lucide-react'
import { useRecordsStore } from '../stores/useRecordsStore'
import { usePeopleStore } from '../stores/usePeopleStore'
import { isSupabaseConfigured } from '../lib/supabase'
import { ItemType, RecordItem } from '../types'
import { ITEM_META, ACTION_STYLE, actionFullLabel } from '../lib/recordLabels'
import RecordForm, { RecordFormValues } from '../components/RecordForm'
import TutorialOverlay from '../components/TutorialOverlay'
import { useTutorial } from '../hooks/useTutorial'
import { TUTORIAL_STEPS, TUTORIAL_COMPLETE } from '../lib/tutorialData'

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-')
  return `${y}/${m}/${d}`
}

export default function RecordsPage() {
  const { records, loading, error, fetchRecords, addRecord, updateRecord, deleteRecord } = useRecordsStore()
  const { people, fetchPeople } = usePeopleStore()

  const [showAdd, setShowAdd] = useState(false)
  const [editingRecord, setEditingRecord] = useState<RecordItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // 篩選狀態
  const [filterPersonId, setFilterPersonId] = useState<string>('all')
  const [filterItem, setFilterItem] = useState<'all' | ItemType>('all')

  useEffect(() => {
    fetchRecords()
    fetchPeople()
  }, [fetchRecords, fetchPeople])

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3000)
  }

  const personName = (r: RecordItem) => {
    if (r.personId) {
      const p = people.find(pp => pp.id === r.personId)
      if (p) return p.name
    }
    return r.personNameSnapshot || '已刪除的好友'
  }

  const personColor = (r: RecordItem) => {
    if (r.personId) {
      const p = people.find(pp => pp.id === r.personId)
      if (p) return p.color || '#6B7280'
    }
    return '#9CA3AF'
  }

  // 無篩選時顯示最近 30 筆；有篩選條件時顯示全部符合結果
  const filtered = useMemo(() => {
    const result = records
      .filter(r => filterPersonId === 'all' || r.personId === filterPersonId)
      .filter(r => filterItem === 'all' || r.itemType === filterItem)
    return (filterPersonId === 'all' && filterItem === 'all') ? result.slice(0, 30) : result
  }, [records, filterPersonId, filterItem])

  const handleAdd = async (values: RecordFormValues) => {
    const success = await addRecord(values)
    if (success) {
      setShowAdd(false)
      showToast(`已記錄：${values.personNameSnapshot} / ${formatDate(values.date)} / ${ITEM_META[values.itemType].label}`)
    } else {
      showToast('新增失敗，請重試。', 'error')
    }
  }

  const handleEdit = async (values: RecordFormValues) => {
    if (!editingRecord) return
    const success = await updateRecord(editingRecord.id, values)
    if (success) {
      setEditingRecord(null)
      showToast('紀錄已更新！')
    } else {
      showToast('更新失敗，請重試。', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    const success = await deleteRecord(id)
    if (success) {
      setDeletingId(null)
      showToast('已刪除紀錄')
    } else {
      showToast('刪除失敗，請重試。', 'error')
    }
  }

  const isDBOnline = isSupabaseConfigured()
  const hasFilter = filterPersonId !== 'all' || filterItem !== 'all'

  const tutSteps = TUTORIAL_STEPS.records
  const { isOpen: tutOpen, currentStep: tutStep, isComplete: tutDone, startTutorial, next: tutNext, skip: tutSkip, closeComplete: tutClose } = useTutorial('records', tutSteps.length)

  return (
    <div className="w-full pb-4">
      {/* 頂部標題列 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight flex items-center gap-2">
            📮 互動紀錄
          </h1>
          <p className="text-stone-500 text-sm md:text-base mt-0.5">記錄每次與好友的明信片與打蘑菇</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-md shadow-sky-600/20 text-base shrink-0"
        >
          <Plus className="w-5 h-5" />
          新增紀錄
        </button>
      </div>

      {/* 離線模式提示 */}
      {!isDBOnline && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start text-amber-800">
          <AlertTriangle className="w-5 h-5 mr-3 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">目前使用本地儲存模式，紀錄將儲存在此裝置。</p>
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
          toast.type === 'success' ? 'bg-sky-600' : 'bg-rose-600'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          {toast.text}
        </div>
      )}

      {/* 篩選工具列 */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3" data-tutorial="records-filter">
        <div className="flex items-center gap-2 text-stone-500 text-sm font-bold shrink-0">
          <Filter className="w-4 h-4" />
          篩選
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="flex items-center gap-2 bg-stone-100 rounded-xl px-3 flex-1">
            <User className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={filterPersonId}
              onChange={e => setFilterPersonId(e.target.value)}
              className="bg-transparent text-sm text-stone-700 font-medium py-2.5 flex-1 focus:outline-none"
            >
              <option value="all">全部好友</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-stone-100 rounded-xl px-3 flex-1">
            <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={filterItem}
              onChange={e => setFilterItem(e.target.value as 'all' | ItemType)}
              className="bg-transparent text-sm text-stone-700 font-medium py-2.5 flex-1 focus:outline-none"
            >
              <option value="all">所有品項</option>
              <option value="postcard">📮 明信片</option>
              <option value="mushroom">🍄 蘑菇</option>
            </select>
          </div>
          {hasFilter && (
            <button
              onClick={() => { setFilterPersonId('all'); setFilterItem('all') }}
              className="text-sm font-bold text-stone-400 hover:text-stone-600 px-3 py-2.5 shrink-0"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* 列表 / 空狀態 */}
      <div data-tutorial="records-list">
      {loading && records.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-stone-200/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-sky-400" />
          </div>
          {records.length === 0 ? (
            <>
              <h2 className="text-lg font-bold text-stone-700 mb-2">還沒有任何紀錄</h2>
              <p className="text-stone-400 text-sm max-w-xs mx-auto leading-relaxed">
                按右上角「新增紀錄」開始記錄你和好友的明信片與打蘑菇互動吧！
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-stone-700 mb-2">沒有符合篩選的紀錄</h2>
              <p className="text-stone-400 text-sm">試試調整或清除篩選條件。</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold text-stone-400 px-1">
            {hasFilter ? `篩選結果：共 ${filtered.length} 筆` : `顯示最近 ${filtered.length} 筆`}
          </p>
          {filtered.map(r => {
            const meta = ITEM_META[r.itemType]
            return (
              <div key={r.id} className="glass-card rounded-2xl p-4 flex items-center gap-3 group">
                {/* 品項 emoji */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: `${personColor(r)}20` }}
                >
                  {meta.emoji}
                </div>

                {/* 主要資訊 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base text-stone-800 truncate">{personName(r)}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ACTION_STYLE[r.actionType]}`}>
                      {actionFullLabel(r.itemType, r.actionType)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {formatDate(r.date)}{r.note ? ` · ${r.note}` : ''}
                  </p>
                </div>

                {/* 操作 */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setEditingRecord(r)}
                    className="accessible-target flex items-center justify-center p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                    title="編輯"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(r.id)}
                    className="accessible-target flex items-center justify-center p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    title="刪除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>{/* end records-list */}

      {/* 新增 Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-black text-stone-800">📮 新增互動紀錄</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="accessible-target flex items-center justify-center text-stone-400 hover:text-stone-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <RecordForm
              people={people}
              submitLabel="儲存紀錄"
              onSubmit={handleAdd}
              onCancel={() => setShowAdd(false)}
            />
          </div>
        </div>
      )}

      {/* 編輯 Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-black text-stone-800">✏️ 編輯紀錄</h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="accessible-target flex items-center justify-center text-stone-400 hover:text-stone-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <RecordForm
              people={people}
              initial={editingRecord}
              submitLabel="儲存修改"
              onSubmit={handleEdit}
              onCancel={() => setEditingRecord(null)}
            />
          </div>
        </div>
      )}

      {/* 刪除確認 Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl text-center animate-scale-up">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-stone-800 mb-2">確定要刪除嗎？</h3>
            <p className="text-stone-600 text-sm mb-6">此筆互動紀錄將被永久刪除，無法復原。</p>
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
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 說明按鈕 */}
      <button
        onClick={startTutorial}
        data-tutorial="help-btn"
        className="fixed right-4 top-4 md:top-20 z-40 w-10 h-10 rounded-full bg-white border-2 border-lime-400 text-lime-600 shadow-md hover:bg-lime-50 hover:border-lime-500 transition-all active:scale-90 flex items-center justify-center"
        title="查看使用說明"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* 教學遮罩 */}
      <TutorialOverlay
        steps={tutSteps}
        currentStep={tutStep}
        isOpen={tutOpen}
        isComplete={tutDone}
        completionMsg={TUTORIAL_COMPLETE.records}
        onNext={tutNext}
        onSkip={tutSkip}
        onCompleteClose={tutClose}
      />
    </div>
  )
}
