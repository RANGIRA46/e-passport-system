import { useNavigate } from 'react-router-dom'
import { Card, Stat, Btn, Badge } from '../../components/ui/index.jsx'
import { BarChart, PieChart } from '../../components/shared/Charts.jsx'
import { ALL_APPS, WEEK_DATA, STATUS_DIST } from '../../data/mockData.js'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const pending  = ALL_APPS.filter(a => a.status === 'pending')

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0A2342', fontFamily: 'var(--font-serif)', marginBottom: 2 }}>Admin Dashboard</div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>
          {new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Alert banner */}
      <div style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>🚨</span>
        <div style={{ flex: 1, fontSize: 12, color: '#991B1B', fontWeight: 600 }}>
          1 flagged border crossing this morning — Smith James T. at Kigali Airport. Risk level: ALERT. Supervisor notified.
        </div>
        <Btn variant="danger" size="sm" onClick={() => navigate('/admin/border')}>View Log</Btn>
      </div>

      {/* KPI stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <Stat icon="📋" label="Applications Today"  value="47"  sub="+12 from yesterday" />
        <Stat icon="⏳" label="Pending Review"      value="34"  sub="Oldest: 3 days ago" color="#C27803" />
        <Stat icon="✅" label="Approved Today"      value="29"  sub="61.7% approval rate" color="#0E9F6E" />
        <Stat icon="🛡️" label="Border Crossings"    value="183" sub="12 exits / 171 entries" color="#0A2342" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card title="Applications per Day (Last 7 Days)">
          <BarChart data={WEEK_DATA} />
        </Card>
        <Card title="Applications by Status">
          <PieChart data={STATUS_DIST} />
        </Card>
      </div>

      {/* Pending applications table */}
      <Card title="Recent Applications Awaiting Review" subtitle="Showing most recently submitted first">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Reference', 'Applicant', 'Type', 'Submitted', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA', cursor: 'pointer' }} onClick={() => navigate('/admin/apps')}>
                  <td style={{ padding: '10px 10px', fontSize: 11, color: '#1A56DB', fontWeight: 700, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{a.id}</td>
                  <td style={{ padding: '10px 10px', fontSize: 12, fontWeight: 600, color: '#111827' }}>{a.name}</td>
                  <td style={{ padding: '10px 10px', fontSize: 12, color: '#374151', textTransform: 'capitalize' }}>{a.type}</td>
                  <td style={{ padding: '10px 10px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{a.submitted}</td>
                  <td style={{ padding: '10px 10px' }}><Badge status={a.status} /></td>
                  <td style={{ padding: '10px 10px' }}>
                    <Btn size="sm" variant="ghost" onClick={e => { e.stopPropagation(); navigate('/admin/apps') }}>Review →</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
