import { BarChart3, TrendingUp, Users, Heart } from 'lucide-react'

const STAT_CARDS = [
  {
    icon: Users,
    label: '好友總數',
    value: '-',
    suffix: '位',
    bgClass: 'bg-lime-50',
    textClass: 'text-lime-700',
    iconClass: 'text-lime-500',
  },
  {
    icon: Heart,
    label: '互動次數',
    value: '-',
    suffix: '次',
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-700',
    iconClass: 'text-sky-500',
  },
  {
    icon: TrendingUp,
    label: '本月互動',
    value: '-',
    suffix: '次',
    bgClass: 'bg-violet-50',
    textClass: 'text-violet-700',
    iconClass: 'text-violet-500',
  },
]

export default function StatsPage() {
  return (
    <div className="w-full pb-4">
      {/* 頂部標題 */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight flex items-center gap-2">
          📊 統計分析
        </h1>
        <p className="text-stone-500 text-sm md:text-base mt-0.5">互動頻率與好友關係總覽</p>
      </div>

      {/* 摘要統計卡：手機單欄，桌面三欄 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`glass-card rounded-2xl p-5 border border-white/50`}>
              <div className={`w-10 h-10 ${card.bgClass} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.iconClass}`} />
              </div>
              <p className="text-stone-500 text-xs font-bold mb-1">{card.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${card.textClass}`}>{card.value}</span>
                <span className="text-stone-400 text-sm font-bold">{card.suffix}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 圖表佔位區塊：桌面端兩欄，手機端單欄 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-3xl p-6">
          <h2 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-500" />
            互動頻率圖表
          </h2>
          <div className="h-40 bg-stone-100/50 rounded-2xl flex items-center justify-center">
            <p className="text-stone-400 text-sm font-medium">圖表開發中 🚧</p>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6">
          <h2 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            好友互動排行
          </h2>
          <div className="h-40 bg-stone-100/50 rounded-2xl flex items-center justify-center">
            <p className="text-stone-400 text-sm font-medium">功能開發中 🚧</p>
          </div>
        </div>
      </div>
    </div>
  )
}
