import { useEffect, useState } from 'react'
import { Sparkles, Users, History, BarChart3, ArrowRight, Zap, Check, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuickActionsStore } from '../stores/useQuickActionsStore'
import { usePeopleStore } from '../stores/usePeopleStore'
import { useRecordsStore } from '../stores/useRecordsStore'

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

const getTodayDate = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function HomePage() {
  const navigate = useNavigate()
  const { quickActions, fetchQuickActions } = useQuickActionsStore()
  const { people, fetchPeople } = usePeopleStore()
  const { addRecord } = useRecordsStore()

  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [tapping, setTapping] = useState<string | null>(null)

  useEffect(() => {
    fetchQuickActions()
    fetchPeople()
  }, [fetchQuickActions, fetchPeople])

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
    const date = getTodayDate()

    const success = await addRecord({
      personId: person.id,
      personNameSnapshot: person.name,
      date,
      itemType: action.itemType,
      actionType: action.actionType,
    })

    setTapping(null)
    if (success) {
      const itemLabel = action.itemType === 'postcard' ? '明信片' : '蘑菇'
      showToast(`已記錄：${person.name} / ${date} / ${itemLabel}`)
    } else {
      showToast('紀錄失敗，請重試。', 'error')
    }
  }

  return (
    <div className="w-full">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white text-base font-bold shadow-lg z-50 flex items-center transition-all ${
          toast.type === 'success' ? 'bg-lime-600' : 'bg-rose-600'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          {toast.text}
        </div>
      )}

      {/* Hero 區塊 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-16 mb-10">
        {/* 左欄：主視覺文字 */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left md:flex-1">
          <div className="w-20 h-20 bg-lime-100 rounded-3xl flex items-center justify-center shadow-inner mb-6 animate-bounce">
            <span className="text-4xl">🍄</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-stone-800 tracking-tight mb-3 leading-tight">
            PikLog<br />
            <span className="text-lime-600">紀錄器</span>
          </h1>
          <p className="text-stone-500 text-base md:text-lg max-w-xs md:max-w-sm leading-relaxed mb-6">
            長輩友善的明信片與打蘑菇互動紀錄工具，輕鬆一按就記好！
          </p>
          <button
            onClick={() => navigate('/people')}
            className="flex items-center gap-2 bg-lime-600 hover:bg-lime-700 active:scale-95 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md shadow-lime-600/20 text-base"
          >
            開始使用
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* 右欄：Sprint 進度卡 */}
        <div className="glass-card rounded-3xl p-6 md:w-72 lg:w-80 shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-stone-700">目前進度</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: '基礎架構', done: true },
              { label: '人物管理 CRUD', done: true },
              { label: '快捷動作', done: true },
              { label: '互動紀錄功能', done: true },
              { label: '統計圖表', done: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  item.done ? 'bg-lime-500 text-white' : 'bg-stone-200 text-stone-400'
                }`}>
                  {item.done ? '✓' : '○'}
                </span>
                <span className={`text-sm font-medium ${item.done ? 'text-stone-700' : 'text-stone-400'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快捷動作區塊 */}
      {quickActions.length > 0 ? (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-stone-700 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              快速紀錄
            </h2>
            <button
              onClick={() => navigate('/people/quick-actions')}
              className="text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors"
            >
              管理 →
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {quickActions.map(action => {
              const person = people.find(p => p.id === action.personId)
              const itemEmoji = action.itemType === 'postcard' ? '📮' : '🍄'
              const isTapping = tapping === action.id
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  disabled={isTapping}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-base text-white shadow-md transition-all active:scale-95 disabled:opacity-60"
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
          </div>
        </div>
      ) : (
        <div className="mb-10">
          <button
            onClick={() => navigate('/people/quick-actions')}
            className="w-full glass-card rounded-2xl p-4 border border-dashed border-amber-300 flex items-center gap-3 hover:border-amber-400 transition-colors group"
          >
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-left">
              <p className="font-bold text-stone-700 text-sm group-hover:text-amber-700 transition-colors">設定快捷動作</p>
              <p className="text-stone-400 text-xs">一鍵記錄常用互動，省去每次手動選擇</p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 ml-auto group-hover:text-amber-500 transition-colors" />
          </button>
        </div>
      )}

      {/* 功能捷徑卡片區 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    </div>
  )
}
