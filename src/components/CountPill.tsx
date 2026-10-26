// 標題旁的數量小標籤，例如「12 人」「5 筆」。取代括號包起來的數量。
export default function CountPill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-0.5 rounded-full bg-lime-100 text-lime-800 text-base font-bold tabular-nums align-middle ${className}`}>
      {children}
    </span>
  )
}
