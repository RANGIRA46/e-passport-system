import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV_LINKS = [
  { path: '/admin',            icon: '📊', label: 'Dashboard',       roles: ['officer','supervisor','admin'] },
  { path: '/admin/apps',       icon: '📋', label: 'Applications',    roles: ['officer','supervisor','admin'] },
  { path: '/admin/border',     icon: '🛡️', label: 'Border Logs',     roles: ['officer','supervisor','admin'] },
  { path: '/admin/analytics',  icon: '📈', label: 'Analytics',       roles: ['supervisor','admin'] },
  { path: '/admin/watchlist',  icon: '⚠️', label: 'Watchlist',       roles: ['supervisor','admin'] },
  { path: '/admin/users',      icon: '👥', label: 'User Management', roles: ['admin'] }
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const links = NAV_LINKS.filter(l => l.roles.includes(user?.role))

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      width: 220, background: '#0A2342', height: '100vh',
      position: 'fixed', left: 0, top: 0,
      display: 'flex', flexDirection: 'column', zIndex: 50
    }}>
      {/* Header */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, background: '#1A56DB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛂</div>
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-serif)' }}>BPMS</div>
            <div style={{ color: '#93C5FD', fontSize: 10 }}>Admin Portal</div>
          </div>
        </div>
        {/* User badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 34, height: 34, background: '#1A56DB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {user?.name?.charAt(0)}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name?.split(' ').slice(-2).join(' ')}
            </div>
            <span style={{ background: '#1E40AF', color: '#93C5FD', fontSize: 9, padding: '1px 6px', borderRadius: 10, fontWeight: 700, textTransform: 'uppercase' }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {links.map(l => {
          const active = location.pathname === l.path
          return (
            <button key={l.path} onClick={() => navigate(l.path)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12, fontWeight: 600, textAlign: 'left', width: '100%',
              background: active ? '#1A56DB' : 'transparent',
              color: active ? '#fff' : '#93C5FD',
              transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: 14 }}>{l.icon}</span> {l.label}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
          width: '100%', borderRadius: 8, border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
          background: 'transparent', color: '#F87171'
        }}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  )
}
