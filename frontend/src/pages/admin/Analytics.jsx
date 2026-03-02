import { useState } from 'react'
import { Card, Stat, Btn } from '../../components/ui/index.jsx'
import { BarChart, PieChart } from '../../components/shared/Charts.jsx'
import { WEEK_DATA, TYPE_DIST, OFFICERS } from '../../data/mockData.js'

const BORDER_DATA = [
  { day: 'Mon', count: 180 }, { day: 'Tue', count: 215 }, { day: 'Wed', count: 198 },
  { day: 'Thu', count: 243 }, { day: 'Fri', count: 267 }, { day: 'Sat', count: 142 }, { day: 'Sun', count: 89 }
]

export default function Analytics() {
  const [period, setPeriod] = useState('7d')

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0A2342', fontFamily: 'var(--font-serif)', marginBottom: 2 }}>Analytics Dashboard</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Data insights for immigration management decisions</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[{ v: '7d', l: '7 Days' }, { v: '30d', l: '30 Days' }, { v: '90d', l: '90 Days' }].map(p => (
            <button key={p.v} onClick={() => setPeriod(p.v)} style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid', borderColor: period === p.v ? '#1A56DB' : '#E5E7EB', background: period === p.v ? '#EFF6FF' : '#fff', color: period === p.v ? '#1A56DB' : '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{p.l}</button>
          ))}
          <Btn variant="secondary" size="sm">⬇️ Export PDF</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <Stat icon="📋" label="Total Applications"    value="222" sub="This period" />
        <Stat icon="✅" label="Total Approved"        value="148" sub="66.7% rate"  color="#0E9F6E" />
        <Stat icon="❌" label="Total Rejected"        value="39"  sub="17.6% rate"  color="#E02424" />
        <Stat icon="⏱️" label="Avg. Processing Time" value="4.2h" sub="Target: <8h" color="#C27803" />
      </div>

      {/* Row 2 charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card title="Applications per Day">
          <BarChart data={WEEK_DATA} />
        </Card>
        <Card title="Application Type Breakdown">
          <PieChart data={TYPE_DIST} />
        </Card>
      </div>

      {/* Border crossings chart */}
      <Card title="Border Crossings per Day" style={{ marginBottom: 20 }}>
        <BarChart data={BORDER_DATA} color="#0E9F6E" height={120} />
      </Card>

      {/* Officer performance table */}
      <Card title="Officer Performance" subtitle="Applications reviewed this period">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Officer', 'Reviewed', 'Approved', 'Rejected', 'Avg. Decision Time'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #E5E7EB' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OFFICERS.map((o, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 10px', fontSize: 12, fontWeight: 600, color: '#111827' }}>{o.name}</td>
                  <td style={{ padding: '10px 10px', fontSize: 13, fontWeight: 800, color: '#0A2342' }}>{o.reviewed}</td>
                  <td style={{ padding: '10px 10px', fontSize: 12, color: '#0E9F6E', fontWeight: 600 }}>{o.approved}</td>
                  <td style={{ padding: '10px 10px', fontSize: 12, color: '#E02424', fontWeight: 600 }}>{o.rejected}</td>
                  <td style={{ padding: '10px 10px', fontSize: 12, color: '#6B7280' }}>{o.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
