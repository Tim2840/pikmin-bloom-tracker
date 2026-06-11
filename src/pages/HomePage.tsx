import { Sparkles, Calendar } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 bg-lime-100 rounded-3xl flex items-center justify-center shadow-inner mb-6 animate-bounce">
        <span className="text-4xl">🍄</span>
      </div>
      <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight mb-2">
        PikLog 紀錄器
      </h1>
      <p className="text-stone-600 text-lg max-w-sm mb-8">
        長輩友善的明信片與打蘑菇互動紀錄工具，輕鬆一按就記好！
      </p>
      
      <div className="glass-card rounded-2xl p-6 max-w-sm w-full text-left">
        <h2 className="text-lg font-bold text-stone-700 flex items-center mb-3">
          <Sparkles className="w-5 h-5 text-amber-500 mr-2" />
          Sprint 1 已就緒
        </h2>
        <p className="text-stone-600 text-sm leading-relaxed mb-4">
          您可以在下方導覽列切換到「**人物管理**」頁面，開始新增與管理您的 Pikmin 好友！
        </p>
        <div className="flex items-center text-xs text-stone-500 bg-stone-100 p-2 rounded-lg">
          <Calendar className="w-4 h-4 mr-2" />
          目前進度：完成 Vite + React + Supabase 基礎架構
        </div>
      </div>
    </div>
  )
}
