import { History, Filter, Plus, Calendar, User } from 'lucide-react'

export default function RecordsPage() {
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
          disabled
          className="flex items-center gap-2 bg-sky-600 text-white font-bold px-5 py-3 rounded-2xl opacity-50 cursor-not-allowed text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          新增紀錄
        </button>
      </div>

      {/* 篩選工具列：手機端上下排，桌面端橫排 */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 text-stone-500 text-sm font-bold shrink-0">
          <Filter className="w-4 h-4" />
          篩選
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="flex items-center gap-2 bg-stone-100 rounded-xl px-3 py-2 text-sm text-stone-500 flex-1">
            <User className="w-4 h-4" />
            <span>全部好友</span>
          </div>
          <div className="flex items-center gap-2 bg-stone-100 rounded-xl px-3 py-2 text-sm text-stone-500 flex-1">
            <Calendar className="w-4 h-4" />
            <span>所有日期</span>
          </div>
        </div>
      </div>

      {/* 空狀態 */}
      <div className="glass-card rounded-3xl p-12 text-center">
        <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-sky-400" />
        </div>
        <h2 className="text-lg font-bold text-stone-700 mb-2">互動紀錄功能開發中</h2>
        <p className="text-stone-400 text-sm max-w-xs mx-auto leading-relaxed">
          明信片收發與打蘑菇的歷史紀錄頁面，將於後續 Sprint 開發完成。
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-sky-50 text-sky-600 text-xs font-bold px-4 py-2 rounded-full">
          🚧 Coming Soon
        </div>
      </div>
    </div>
  )
}
