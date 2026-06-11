import { NavLink } from 'react-router-dom'
import { Home, Users, History, BarChart3 } from 'lucide-react'

export default function Navbar() {
  const navItems = [
    { to: '/', label: '首頁', icon: Home },
    { to: '/people', label: '人物管理', icon: Users },
    { to: '/records', label: '互動紀錄', icon: History },
    { to: '/stats', label: '簡單統計', icon: BarChart3 },
  ]

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md glass-panel rounded-2xl shadow-lg border border-white/50 px-2 py-2 z-50">
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
                <Icon className="w-6 h-6 mb-1 transition-transform" />
                <span className="text-sm tracking-wide">{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
