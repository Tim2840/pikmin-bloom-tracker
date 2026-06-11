import { History } from 'lucide-react'

export default function RecordsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
        <History className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-stone-850 mb-2">互動紀錄</h1>
      <p className="text-stone-600 max-w-xs text-base">
        明信片收發與打蘑菇的歷史紀錄頁面。此功能將於後續的 Sprint 開發。
      </p>
    </div>
  )
}
