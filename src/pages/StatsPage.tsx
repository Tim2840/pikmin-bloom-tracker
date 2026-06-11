import { BarChart3 } from 'lucide-react'

export default function StatsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-purple-500">
        <BarChart3 className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-stone-850 mb-2">統計分析</h1>
      <p className="text-stone-600 max-w-xs text-base">
        分析與各好友明信片及蘑菇合作頻率圖表。此功能將於後續的 Sprint 開發。
      </p>
    </div>
  )
}
