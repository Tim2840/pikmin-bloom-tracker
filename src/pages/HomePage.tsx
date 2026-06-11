import { Sparkles, Users, History, BarChart3, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const FEATURE_CARDS = [
  {
    to: '/people',
    icon: Users,
    emoji: '👥',
    color: 'lime',
    title: '人物管理',
    desc: '新增、編輯好友，設定專屬顏色與圖標',
    bgClass: 'bg-lime-50',
    textClass: 'text-lime-700',
    borderClass: 'border-lime-200',
    btnClass: 'bg-lime-600 hover:bg-lime-700',
  },
  {
    to: '/records',
    icon: History,
    emoji: '📮',
    color: 'sky',
    title: '互動紀錄',
    desc: '記錄明信片收發與打蘑菇的每日互動',
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-200',
    btnClass: 'bg-sky-600 hover:bg-sky-700',
  },
  {
    to: '/stats',
    icon: BarChart3,
    emoji: '📊',
    color: 'violet',
    title: '統計分析',
    desc: '查看互動頻率圖表，掌握與好友的連結',
    bgClass: 'bg-violet-50',
    textClass: 'text-violet-700',
    borderClass: 'border-violet-200',
    btnClass: 'bg-violet-600 hover:bg-violet-700',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="w-full">
      {/* Hero 區塊：手機端置中，桌面端左右兩欄 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-16 mb-12">

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
              { label: '互動紀錄功能', done: false },
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

      {/* 功能捷徑卡片區：手機單欄，桌面三欄 */}
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

