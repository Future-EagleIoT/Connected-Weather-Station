// ============================================================
//  Layout — Sidebar + Header shell for authenticated pages
// ============================================================

import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/',        label: 'Dashboard', icon: '📊' },
  { to: '/devices', label: 'Devices',   icon: '📡' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-mesh">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r"
             style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                 style={{ background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-cyan))' }}>
              🌦️
            </div>
            <div>
              <h1 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Eagle IoT</h1>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Weather Station</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'hover:bg-white/5'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-cyan))' : undefined,
                color: isActive ? '#fff' : 'var(--color-text-secondary)',
              })}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                 style={{ background: 'var(--color-accent-purple)', color: '#fff' }}>
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                {user?.email || 'Admin'}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {user?.is_admin ? 'Administrator' : 'User'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              color: 'var(--color-accent-rose)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.1)'}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-mesh">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b"
                style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌦️</span>
            <span className="font-bold text-sm">Eagle IoT</span>
          </div>
          <div className="flex gap-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive ? 'text-white' : ''}`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'var(--color-accent-blue)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--color-text-secondary)',
                })}
              >
                {item.icon}
              </NavLink>
            ))}
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
