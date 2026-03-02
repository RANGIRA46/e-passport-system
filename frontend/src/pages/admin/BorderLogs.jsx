import { useState } from 'react'
import { Card, Btn, Select } from '../../components/ui/index.jsx'
import { BORDER_LOGS } from '../../data/mockData.js'

export default function BorderLogs() {
  const [passport, setPassport] = useState('')
  const [crossing, setCrossing] = useState('entry')
  const [point, setPoint]       = useState('kigali_airport')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [logs, setLogs]         = useState(BORDER_LOGS)

  function record() {
    if (!passport.trim()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const flagged = passport.toUpperCase() === 'UK9283746'
      const screenResult = {
        passport: passport.toUpperCase(),
        flagged,
        risk: flagged ? 'ALERT' : null,
        name: flagged ? 'Smith James T.' : 'Traveler Verified'
      }
      setResult(screenResult)
      // Add to log
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      const pointLabels = {
        kigali_airport: 'Kigali International Airport',
        gatuna: 'Gatuna Border Post',
        cyanika: 'Cyanika Border Post',
        rusumo: 'Rusumo Border Post',
        kagitumba: 'Kagitumba Border Post'
      }
      setLogs(prev => [{
        time,
        name: screenResult.name,
        passport: screenResult.passport,
        type: crossing === 'entry' ? 'Entry' : 'Exit',
        point: pointLabels[point],
        status: flagged ? 'flagged' : 'clear',
        officer: 'Officer Uwase'
      }, ...prev])
    }, 1200)
  }

  return (
    <div className="fade-in">
      <div style={{ fontSize: 24, fontWeight: 800, color: '#0A2342', fontFamily: 'var(--font-serif)', marginBottom: 20 }}>Border Crossing Logs</div>

      {/* Record form */}
      <Card title="Record New Crossing" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 14, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Passport Number <span style={{ color: '#E02424' }}>*</span></label>
            <input
              value={passport}
              onChange={e => setPassport(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && record()}
              placeholder="Scan or type passport number"
              style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
            />
            <span style={{ fontSize: 11, color: '#6B7280' }}>Tip: try UK9283746 to test a flagged traveler</span>
          </div>
          <Select label="Crossing Type" value={crossing} onChange={e => setCrossing(e.target.value)} options={[
            { value: 'entry', label: '🟢  Entry' },
            { value: 'exit',  label: '🔴  Exit' }
          ]} />
          <Select label="Border Point" value={point} onChange={e => setPoint(e.target.value)} options={[
            { value: 'kigali_airport', label: 'Kigali International Airport' },
            { value: 'gatuna',         label: 'Gatuna Border Post' },
            { value: 'cyanika',        label: 'Cyanika Border Post' },
            { value: 'rusumo',         label: 'Rusumo Border Post' },
            { value: 'kagitumba',      label: 'Kagitumba Border Post' }
          ]} />
          <Btn onClick={record} disabled={loading || !passport.trim()} style={{ marginBottom: 20 }}>
            {loading ? '⏳ Screening…' : '🛡️  Record & Screen'}
          </Btn>
        </div>

        {/* Screening result */}
        {result && (
          <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 10, background: result.flagged ? '#FEF2F2' : '#ECFDF5', border: `1.5px solid ${result.flagged ? '#FCA5A5' : '#10B981'}` }}>
            {result.flagged ? (
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#991B1B', marginBottom: 6 }}>⚠️  WATCHLIST MATCH — DO NOT ALLOW CROSSING</div>
                <div style={{ fontSize: 13, color: '#991B1B' }}>Traveler: <strong>{result.name}</strong>  ·  Passport: <strong>{result.passport}</strong>  ·  Risk Level: <strong>{result.risk}</strong></div>
                <div style={{ fontSize: 12, color: '#991B1B', marginTop: 6 }}>Contact your supervisor immediately. Do not allow this individual to cross.</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#065F46', marginBottom: 4 }}>✅  Clear — Crossing Recorded</div>
                <div style={{ fontSize: 12, color: '#065F46' }}>Passport: <strong>{result.passport}</strong>  ·  No watchlist matches found.</div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Log table */}
      <Card title="Today's Crossing Log" subtitle={`${logs.length} crossings recorded today`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Time', 'Traveler Name', 'Passport No.', 'Type', 'Border Point', 'Status', 'Officer'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #E5E7EB', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: log.status === 'flagged' ? '#FEF2F2' : i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 10px', fontSize: 12, fontWeight: 700, color: '#0A2342', fontFamily: 'monospace' }}>{log.time}</td>
                  <td style={{ padding: '10px 10px', fontSize: 12, fontWeight: 600, color: '#111827' }}>{log.name}</td>
                  <td style={{ padding: '10px 10px', fontSize: 11, color: '#6B7280', fontFamily: 'monospace' }}>{log.passport}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: log.type === 'Entry' ? '#D1FAE5' : '#FEE2E2', color: log.type === 'Entry' ? '#065F46' : '#991B1B', fontWeight: 700 }}>{log.type}</span>
                  </td>
                  <td style={{ padding: '10px 10px', fontSize: 11, color: '#6B7280' }}>{log.point}</td>
                  <td style={{ padding: '10px 10px' }}>
                    {log.status === 'flagged'
                      ? <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#FEE2E2', color: '#991B1B', fontWeight: 700 }}>⚠️ FLAGGED</span>
                      : <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#D1FAE5', color: '#065F46', fontWeight: 700 }}>✓ Clear</span>
                    }
                  </td>
                  <td style={{ padding: '10px 10px', fontSize: 11, color: '#6B7280' }}>{log.officer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
