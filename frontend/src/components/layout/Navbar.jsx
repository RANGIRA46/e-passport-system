import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const links = [
    { path: '/portal',              label: 'Dashboard' },
    { path: '/portal/apply',        label: 'Apply Now' },
    { path: '/portal/status',       label: 'My Applications' },
    { path: '/portal/appointments', label: 'Appointments' }
  ]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{
      background: '#0A2342', padding: '0 28px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      height: 56, position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      {/* Logo */}
      <div onClick={() => navigate('/portal')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div style={{ width: 32, height: 32, background: '#1A56DB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛂</div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-serif)' }}>BPMS Rwanda</span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 4 }}>
        {links.map(l => {
          const active = location.pathname === l.path
          return (
            <button key={l.path} onClick={() => navigate(l.path)} style={{
              background: active ? '#1A56DB' : 'transparent', border: 'none',
              color: active ? '#fff' : '#93C5FD', padding: '6px 12px',
              borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s'
            }}>
              {l.label}
            </button>
          )
        })}
      </div>

      {/* User section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 16, cursor: 'pointer' }}>🔔</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, background: '#1A56DB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
            {user?.name?.charAt(0)}
          </div>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>{user?.name?.split(' ')[0]}</span>
        </div>
        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
          Sign Out
        </button>
      </div>
    </nav>
  )
}
