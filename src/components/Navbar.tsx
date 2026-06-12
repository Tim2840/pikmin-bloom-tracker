import { NavLink } from 'react-router-dom'
import { Home, Users, History, BarChart3, CalendarDays } from 'lucide-react'

export default function Navbar() {
  const navItems = [
    { to: '/', label: '首頁', icon: Home },
    { to: '/people', label: '人物管理', icon: Users },
    { to: '/records', label: '互動紀錄', icon: History },
    { to: '/calendar', label: '月曆', icon: CalendarDays },
    { to: '/stats', label: '簡單統計', icon: BarChart3 },
  ]

  return (
    <>
      {/* 行動端：底部浮動導覽列 */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md glass-panel rounded-2xl shadow-lg border border-white/50 px-2 py-2 z-50">
        <ul className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to} className="flex-1">
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `
                    flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 accessible-target
                    ${isActive 
                      ? 'text-lime-700 font-bold bg-lime-100/60 scale-105' 
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/50'
                    }
                  `}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-sm tracking-wide">{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 桌面端：頂部固定導覽列 */}
      <header className="hidden md:block w-full sticky top-0 glass-panel border-b border-white/40 shadow-sm px-8 py-4 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Logo 標題 */}
          <div className="flex items-center space-x-3 select-none">
            <span className="text-3xl">🍄</span>
            <span className="text-2xl font-black text-stone-800 tracking-tight">
              PikLog <span className="text-sm font-bold text-lime-600">紀錄器</span>
            </span>
          </div>

          {/* 導覽連結 */}
          <nav>
            <ul className="flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => `
                        flex items-center space-x-2 px-4 py-2 rounded-xl text-base font-bold transition-all duration-200
                        ${isActive 
                          ? 'text-lime-700 bg-lime-100/60 scale-105' 
                          : 'text-stone-600 hover:text-stone-850 hover:bg-stone-100/40'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </header>
    </>
  )
}
