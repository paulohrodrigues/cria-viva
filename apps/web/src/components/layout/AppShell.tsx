import { Outlet, NavLink } from 'react-router-dom'
import { Home, List, BarChart2, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'
import { FarmSelector } from './FarmSelector'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Início' },
  { to: '/animals', icon: List, label: 'Animais' },
  { to: '/reports', icon: BarChart2, label: 'Relatórios' },
  { to: '/settings', icon: Settings, label: 'Config.' },
]

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e17]">
      {/* Header */}
      <header className="bg-[#0a0e17]/90 backdrop-blur-lg border-b border-white/[0.07] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-sm">
              🐄
            </div>
            <span className="font-bold text-white text-lg tracking-tight">CriaViva</span>
          </div>
          <FarmSelector />
        </div>
      </header>

      {/* Layout */}
      <div className="flex flex-1 max-w-5xl mx-auto w-full">
        {/* Sidebar — desktop */}
        <nav className="hidden md:flex flex-col w-56 shrink-0 py-6 gap-1 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 p-4 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#0d1117]/95 backdrop-blur-lg border-t border-white/[0.07] z-30 safe-area-inset-bottom">
        <div className="flex">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-all',
                  isActive ? 'text-brand-400' : 'text-slate-600',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} />
                  <span>{label}</span>
                  {isActive && <span className="w-1 h-1 rounded-full bg-brand-400 mt-0.5" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
