import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Card, Stat, Btn, Badge } from '../../components/ui/index.jsx'
import { MY_APPS, TYPE_ICON } from '../../data/mockData.js'

export default function CitizenDashboard() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const approved = MY_APPS.filter(a => a.status === 'approved').length
  const pending  = MY_APPS.filter(a => a.status === 'pending').length
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="fade-in">
      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(120deg, #0A2342, #1A56DB)', padding: '28px 28px', marginBottom: 28, borderRadius: 14 }}>
        <div style={{ fontSize: 12, color: '#93C5FD', fontWeight: 600, marginBottom: 4 }}>
          {new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-serif)', marginBottom: 6 }}>
          {greeting}, {user?.name?.split(' ')[0]}! 👋
        </div>
        <div style={{ fontSize: 13, color: '#BFDBFE' }}>
          Welcome to your BPMS self-service portal. Manage your immigration documents here.
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <Stat icon="📁" label="Total Applications" value={MY_APPS.length} sub="All time" />
        <Stat icon="⏳" label="Pending Review"     value={pending}        sub="Awaiting decision" color="#C27803" />
        <Stat icon="✅" label="Approved"           value={approved}       sub="Ready to collect"  color="#0E9F6E" />
        <Stat icon="📅" label="Next Appointment"   value="5 Mar"          sub="Kigali DGIE Office" color="#0A2342" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent applications — full width */}
        <Card title="My Recent Applications" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MY_APPS.map(app => {
              const typeKey = app.type.split(' ')[0].toLowerCase()
              return (
                <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 22 }}>{TYPE_ICON[typeKey] || '📄'}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{app.type}</div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>Ref: {app.id} · Submitted {app.submitted}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge status={app.status} />
                    <Btn size="sm" variant="ghost" onClick={() => navigate('/portal/status')}>View</Btn>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Quick actions */}
        <Card title="Quick Actions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🛂', label: 'Apply for Passport', to: '/portal/apply' },
              { icon: '🌍', label: 'Apply for Visa',     to: '/portal/apply' },
              { icon: '📅', label: 'Book Appointment',   to: '/portal/appointments' },
              { icon: '📊', label: 'Track Application',  to: '/portal/status' }
            ].map(q => (
              <button key={q.label} onClick={() => navigate(q.to)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#F0F9FF', borderRadius: 9, border: '1px solid #DBEAFE', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <span style={{ fontSize: 18 }}>{q.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0A2342' }}>{q.label}</span>
                <span style={{ marginLeft: 'auto', color: '#1A56DB' }}>→</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Upcoming appointment */}
        <Card title="Upcoming Appointment">
          <div style={{ background: 'linear-gradient(135deg, #0A2342, #1A56DB)', borderRadius: 10, padding: '16px 18px', color: '#fff' }}>
            <div style={{ fontSize: 11, color: '#93C5FD', fontWeight: 600, marginBottom: 6 }}>BIOMETRIC CAPTURE SESSION</div>
            <div style={{ fontSize: 19, fontWeight: 800, fontFamily: 'var(--font-serif)', marginBottom: 4 }}>Thursday, 5 March 2026</div>
            <div style={{ fontSize: 13, color: '#BFDBFE', marginBottom: 12 }}>10:00 AM · Kigali DGIE Main Office, KN 3 Ave</div>
            <div style={{ fontSize: 11, color: '#D1FAE5', background: 'rgba(16,185,129,0.2)', padding: '4px 10px', borderRadius: 12, display: 'inline-block', fontWeight: 600 }}>✓ Confirmed</div>
          </div>
          <div style={{ marginTop: 10 }}>
            <Btn variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/portal/appointments')}>Manage Appointments</Btn>
          </div>
        </Card>
      </div>
    </div>
  )
}
