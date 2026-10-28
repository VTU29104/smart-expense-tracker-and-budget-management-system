import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Receipt, BarChart3, LogOut, Menu, X,
  Repeat, Upload, Users, GraduationCap, ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import AIBadge from './AIBadge';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses & Income' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics & Trends' },
  { to: '/recurring', icon: Repeat, label: 'Recurring Bills' },
  { to: '/import', icon: Upload, label: 'Bulk Import' },
  { to: '/groups', icon: Users, label: 'Hostel & Splits' }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#fbfbf9] dark:bg-[#0c1017] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 bg-[#0a2318] text-white flex-col fixed h-screen z-20 shadow-md border-r border-[#153828]">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#143928]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-950/40 text-white flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-mono">
                  expensetracker
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/80 font-medium tracking-tight truncate">
                Smart Student Finance
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-emerald-400/70 uppercase tracking-wider">
            Menu
          </div>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600/90 text-white shadow-sm shadow-emerald-950/30 font-semibold'
                    : 'text-emerald-100/80 hover:bg-[#123626] hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Tagline Box */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-[#0f2f20] border border-[#1a4430]">
          <div className="flex items-center gap-1.5 mb-1 text-emerald-300 font-medium text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Campus Edition</span>
          </div>
          <p className="text-[11px] text-emerald-200/75 leading-tight italic">
            Spend wisely. Save confidently.
          </p>
        </div>

        {/* User profile & controls */}
        <div className="p-3 border-t border-[#143928] space-y-2 bg-[#081e15]">
          <div className="px-3 py-1 flex items-center justify-between">
            <ThemeToggle />
            <AIBadge />
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0d281c] border border-[#163e2c]">
            <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate text-white">{user?.name || 'Sowmya'}</div>
              <div className="text-[10px] text-emerald-300/60 truncate">{user?.email || 'demo@expense.app'}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-red-950/60 text-emerald-300 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a2318] text-white border-b border-[#143928] px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white font-mono">expensetracker</span>
            <span className="text-[9px] uppercase font-bold text-emerald-300 ml-1.5">Student</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-[#123626] text-emerald-100"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside
            className="w-64 bg-[#0a2318] text-white h-full flex flex-col p-4 space-y-4 pt-16 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <nav className="flex-1 space-y-1">
              {NAV.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-emerald-100/80 hover:bg-[#123626] hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-[#143928] pt-3">
              <div className="flex items-center justify-between text-xs text-emerald-200 mb-2">
                <span className="font-semibold">{user?.name || 'Sowmya'}</span>
                <button onClick={logout} className="text-red-400 hover:text-red-300 flex items-center gap-1">
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
