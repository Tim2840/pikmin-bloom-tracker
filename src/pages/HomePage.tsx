import { useEffect, useState } from 'react'
import { Sparkles, Users, History, BarChart3, ArrowRight, Zap, Check, AlertCircle, Plus, X, Sun, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuickActionsStore } from '../stores/useQuickActionsStore'
import { usePeopleStore } from '../stores/usePeopleStore'
import { useRecordsStore } from '../stores/useRecordsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { ITEM_META, ACTION_STYLE, actionFullLabel } from '../lib/recordLabels'
import { todayStr } from '../lib/dateUtils'
import { isSupabaseConfigured } from '../lib/supabase'
import { getHomeStats, resolvePersonColor } from '../services/recordService'
import { RecordFormValues } from '../types'
import RecordForm from '../components/RecordForm'
import BackupReminderModal, { hasSeenBackupReminder } from '../components/BackupReminderModal'
import TutorialOverlay from '../components/TutorialOverlay'
import { useTutorial } from '../hooks/useTutorial'
import { TUTORIAL_STEPS, TUTORIAL_COMPLETE } from '../lib/tutorialData'


const FEATURE_CARDS = [
  {
    to: '/people',
    icon: Users,
    emoji: '👥',
    title: '人物管理',
    desc: '新增、編輯好友，設定專屬顏色與圖標',
    bgClass: 'bg-lime-50',
    textClass: 'text-lime-700',
    borderClass: 'border-lime-200',
  },
  {
    to: '/records',
    icon: History,
    emoji: '📮',
    title: '互動紀錄',
    desc: '記錄明信片收發與打蘑菇的每日互動',
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-200',
  },
  {
    to: '/stats',
    icon: BarChart3,
    emoji: '📊',
    title: '統計分析',
    desc: '查看互動頻率圖表，掌握與好友的連結',
    bgClass: 'bg-violet-50',
    textClass: 'text-violet-700',
    borderClass: 'border-violet-200',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { quickActions, fetchQuickActions } = useQuickActionsStore()
  const { people, fetchPeople } = usePeopleStore()
  const { records, fetchRecords, addRecord } = useRecordsStore()
  const { isAnonymous, loading: authLoading } = useAuthStore()

  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [tapping, setTapping] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBackupReminder, setShowBackupReminder] = useState(false)

  const tutSteps = TUTORIAL_STEPS.home
  const { isOpen: tutOpen, currentStep: tutStep, isComplete: tutDone, startTutorial, next: tutNext, skip: tutSkip, closeComplete: tutClose } = useTutorial('home', tutSteps.length)

  useEffect(() => {
    fetchQuickActions()
    fetchPeople()
    fetchRecords()
  }, [fetchQuickActions, fetchPeople, fetchRecords])

  // 首次啟動且為匿名帳號時顯示登入提醒
  useEffect(() => {
    if (!authLoading && isAnonymous && isSupabaseConfigured() && !hasSeenBackupReminder()) {
      setShowBackupReminder(true)
    }
  }, [authLoading, isAnonymous])

  const today = todayStr()
  const todayRecords = records.filter(r => r.date === today)
  const { monthCount, monthFriendCount } = getHomeStats(records, today)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleQuickAction = async (actionId: string) => {
    if (tapping) return
    const action = quickActions.find(a => a.id === actionId)
    if (!action) return

    const person = people.find(p => p.id === action.personId)
    if (!person) {
      showToast('找不到此好友，請重新設定快捷動作。', 'error')
      return
    }

    setTapping(actionId)
    const date = todayStr()

    const success = await addRecord({
      personId: person.id,
      personNameSnapshot: person.name,
      date,
      itemType: action.itemType,
      actionType: action.actionType,
    })

    setTapping(null)
    if (success) {
      const meta = ITEM_META[action.itemType]
      showToast(`已記錄：${person.name} / ${date} / ${meta.label}`)
    } else {
      showToast('紀錄失敗，請重試。', 'error')
    }
  }

  const handleAddRecord = async (values: RecordFormValues) => {
    const success = await addRecord(values)
    if (success) {
      const meta = ITEM_META[values.itemType]
      showToast(`已記錄：${values.personNameSnapshot} / ${values.date} / ${meta.label}`)
      setShowAddModal(false)
    } else {
      showToast('紀錄失敗，請重試。', 'error')
    }
  }

  return (
    <div className="w-full">
      {/* 首次登入提醒 Modal */}
      {showBackupReminder && (
        <BackupReminderModal
          onSetupNow={() => { setShowBackupReminder(false); navigate('/settings') }}
          onLater={() => { setShowBackupReminder(false); showToast('可到「⚙️ 設定」頁隨時登入保存') }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white text-base font-bold shadow-lg z-50 flex items-center transition-all ${
          toast.type === 'success' ? 'bg-lime-600' : 'bg-rose-600'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          {toast.text}
        </div>
      )}

      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-16 mb-10">
        <div className="flex flex-col items-center md:items-start text-center md:text-left md:flex-1">
          <div className="w-20 h-20 bg-lime-100 rounded-3xl flex items-center justify-center shadow-inner mb-6 animate-bounce">
            <span className="text-4xl">🍄</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-stone-800 tracking-tight mb-3 leading-tight">
            PikLog<br />
            <span className="text-lime-600">紀錄器</span>
          </h1>
          <p className="text-stone-500 text-base md:text-lg max-w-xs md:max-w-sm leading-relaxed mb-6">
            明信片與打蘑菇互動紀錄，輕鬆一按就記好！
          </p>
          <button
            onClick={() => navigate('/people')}
            className="flex items-center gap-2 bg-lime-600 hover:bg-lime-700 active:scale-95 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md shadow-lime-600/20 text-base"
          >
            開始使用
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="glass-card rounded-3xl p-6 md:w-72 lg:w-80 shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-stone-700">本月足跡</h2>
          </div>
          {monthCount === 0 ? (
            <p className="text-stone-500 text-base leading-relaxed">
              這個月還沒有紀錄，快來記第一筆吧！🌱
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-stone-500 text-base">本月互動</span>
                <span className="text-3xl font-black text-lime-600 tabular-nums">
                  {monthCount}
                  <span className="text-base font-bold text-stone-400 ml-1">次</span>
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-stone-500 text-base">聯絡好友</span>
                <span className="text-3xl font-black text-sky-600 tabular-nums">
                  {monthFriendCount}
                  <span className="text-base font-bold text-stone-400 ml-1">位</span>
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-stone-500 text-base">今天已記</span>
                <span className="text-3xl font-black text-violet-600 tabular-nums">
                  {todayRecords.length}
                  <span className="text-base font-bold text-stone-400 ml-1">筆</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 快速紀錄 */}
      <div className="mb-10" data-tutorial="home-quick">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold text-stone-700 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            快速紀錄
          </h2>
          <div className="flex items-center gap-2">
            {quickActions.length > 0 && (
              <button
                onClick={() => navigate('/people/quick-actions')}
                className="text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors"
              >
                管理 →
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            data-tutorial="home-add-btn"
            onClick={() => setShowAddModal(true)}
            className="accessible-target flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-base border-2 border-dashed border-sky-300 text-sky-600 bg-sky-50 hover:bg-sky-100 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            新增紀錄
          </button>
          {quickActions.map(action => {
            const person = people.find(p => p.id === action.personId)
            const itemEmoji = ITEM_META[action.itemType].emoji
            const isTapping = tapping === action.id
            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                disabled={isTapping}
                className="accessible-target flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-base text-white shadow-md transition-all active:scale-95 disabled:opacity-60"
                style={{
                  backgroundColor: person?.color || '#6B7280',
                  boxShadow: `0 4px 12px ${person?.color || '#6B7280'}40`,
                }}
              >
                {isTapping ? (
                  <span className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="text-xl">{itemEmoji}</span>
                )}
                {action.label}
              </button>
            )
          })}
          {quickActions.length === 0 && (
            <button
              onClick={() => navigate('/people/quick-actions')}
              className="accessible-target flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-base border-2 border-dashed border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all"
            >
              <Zap className="w-5 h-5" />
              設定快捷動作
            </button>
          )}
        </div>
      </div>

      {/* 新增紀錄 Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false) }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
              <h2 className="text-lg font-black text-stone-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-500" />
                新增互動紀錄
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="accessible-target flex items-center justify-center w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <RecordForm
                people={people}
                submitLabel="儲存紀錄"
                onSubmit={handleAddRecord}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 今日互動紀錄 */}
      <div className="mb-10" data-tutorial="home-today">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold text-stone-700 flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            今日互動
          </h2>
          {todayRecords.length > 0 && (
            <button
              onClick={() => navigate('/records')}
              className="text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors"
            >
              全部紀錄 →
            </button>
          )}
        </div>
        {todayRecords.length === 0 ? (
          <div className="glass-card rounded-2xl px-5 py-4 text-stone-400 text-sm font-medium flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            今天還沒有互動紀錄，快去記下第一筆吧！
          </div>
        ) : (
          <div className="space-y-2">
            {todayRecords.map(r => {
              const meta = ITEM_META[r.itemType]
              const color = resolvePersonColor(r, people)
              return (
                <div key={r.id} className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-stone-800 text-sm">{r.personNameSnapshot}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ACTION_STYLE[r.actionType]}`}>
                        {actionFullLabel(r.itemType, r.actionType)}
                      </span>
                    </div>
                    {r.note && <p className="text-xs text-stone-400 mt-0.5 truncate">{r.note}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 功能捧徑卡片區 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-tutorial="home-features">
        {FEATURE_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.to}
              onClick={() => navigate(card.to)}
              className={`glass-card rounded-2xl p-5 text-left border ${card.borderClass} group hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full`}
            >
              <div className={`w-12 h-12 rounded-2xl ${card.bgClass} flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${card.textClass}`} />
              </div>
              <h3 className={`font-extrabold text-base ${card.textClass} mb-1`}>{card.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{card.desc}</p>
            </button>
          )
        })}
      </div>
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
        completionMsg={TUTORIAL_COMPLETE.home}
        onNext={tutNext}
        onSkip={tutSkip}
        onCompleteClose={tutClose}
      />
    </div>
  )
}
