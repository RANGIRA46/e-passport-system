import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Btn, Badge, Modal, EmptyState } from '../../components/ui/index.jsx'
import { MY_APPS, TYPE_ICON } from '../../data/mockData.js'

// ── STATUS PAGE ────────────────────────────────────────────────────
export function Status() {
  const [filter, setFilter] = useState('all')
  const [detail, setDetail] = useState(null)

  const filtered = filter === 'all' ? MY_APPS : MY_APPS.filter(a => a.status === filter)

  return (
    <div className="fade-in">
      <div style={{ fontSize: 24, fontWeight: 800, color: '#0A2342', fontFamily: 'var(--font-serif)', marginBottom: 4 }}>My Applications</div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 20 }}>Your application status updates in real time — no refresh needed.</div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all','pending','under_review','approved','rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid', borderColor: filter === f ? '#1A56DB' : '#E5E7EB', background: filter === f ? '#EFF6FF' : '#fff', color: filter === f ? '#1A56DB' : '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Application cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(app => {
          const typeKey = app.type.split(' ')[0].toLowerCase()
          return (
            <Card key={app.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 44, height: 44, background: '#EFF6FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {TYPE_ICON[typeKey] || '📄'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0A2342' }}>{app.type}</div>
                    <Badge status={app.status} />
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: app.notes ? 8 : 0 }}>Ref: {app.id} · Submitted {app.submitted}</div>
                  {app.notes && <div style={{ fontSize: 12, color: '#374151', background: '#F9FAFB', padding: '8px 10px', borderRadius: 8, borderLeft: '3px solid #D1D5DB' }}>📝 {app.notes}</div>}
                </div>
                <Btn size="sm" variant={app.status === 'approved' ? 'success' : 'ghost'} onClick={() => setDetail(app)}>
                  {app.status === 'approved' ? 'Download Permit' : 'View Details'}
                </Btn>
              </div>
            </Card>
          )
        })}
        {filtered.length === 0 && <EmptyState icon="📭" title="No applications found" message="No applications match this filter." />}
      </div>

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Application Details — ${detail?.id}`}>
        {detail && (
          <>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <Badge status={detail.status} />
              <span style={{ fontSize: 13, color: '#6B7280' }}>Submitted {detail.submitted}</span>
            </div>
            {[['Type', detail.type], ['Reference', detail.id], ['Submitted', detail.submitted]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13 }}>
                <span style={{ color: '#6B7280' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            {detail.notes && <div style={{ marginTop: 12, background: '#F9FAFB', padding: '10px 12px', borderRadius: 8, fontSize: 12, color: '#374151' }}>Officer Note: {detail.notes}</div>}
            {detail.status === 'approved' && (
              <div style={{ marginTop: 16 }}>
                <div style={{ background: '#ECFDF5', border: '1px solid #10B981', borderRadius: 10, padding: '12px 14px', textAlign: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🎉</div>
                  <div style={{ fontWeight: 700, color: '#065F46', fontSize: 14 }}>Application Approved</div>
                  <div style={{ fontSize: 11, color: '#065F46', marginTop: 4 }}>Your digital permit is ready to download.</div>
                </div>
                <Btn variant="success" style={{ width: '100%', justifyContent: 'center' }}>⬇️  Download Permit &amp; QR Code</Btn>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}

// ── APPOINTMENTS PAGE ──────────────────────────────────────────────
export function Appointments() {
  const navigate = useNavigate()
  const appointments = [
    { id: 1, date: 'Thursday, 5 March 2026', time: '10:00 AM', location: 'Kigali DGIE Main Office', purpose: 'Biometric Capture', ref: 'APP-2026-0042', status: 'confirmed', month: 'MAR', day: '05' }
  ]

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0A2342', fontFamily: 'var(--font-serif)', marginBottom: 4 }}>My Appointments</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Manage your scheduled visits to DGIE offices.</div>
        </div>
        <Btn onClick={() => navigate('/portal/apply')}>+ Book Appointment</Btn>
      </div>
      {appointments.map(a => (
        <Card key={a.id} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ background: 'linear-gradient(135deg, #0A2342, #1A56DB)', borderRadius: 10, padding: '12px 16px', textAlign: 'center', minWidth: 60, flexShrink: 0 }}>
              <div style={{ color: '#93C5FD', fontSize: 10, fontWeight: 700 }}>{a.month}</div>
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 900 }}>{a.day}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0A2342', marginBottom: 4 }}>{a.purpose}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>🕐 {a.time} · 📍 {a.location}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>For Application: {a.ref}</div>
            </div>
            <div>
              <div style={{ background: '#ECFDF5', color: '#065F46', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>✓ Confirmed</div>
              <Btn variant="ghost" size="sm" style={{ marginTop: 8 }}>Reschedule</Btn>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
