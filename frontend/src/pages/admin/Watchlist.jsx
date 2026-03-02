import { useState } from 'react'
import { Card, Btn, Modal, Input, Select, EmptyState } from '../../components/ui/index.jsx'
import { INITIAL_WATCHLIST } from '../../data/mockData.js'
import { useToast } from '../../context/ToastContext.jsx'

const RISK_COLORS = {
  watch:  { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  alert:  { bg: '#FFEDD5', text: '#9A3412', border: '#F97316' },
  arrest: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' }
}

export default function Watchlist() {
  const [entries, setEntries] = useState(INITIAL_WATCHLIST)
  const [search,  setSearch]  = useState('')
  const [riskF,   setRiskF]   = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [toRemove, setToRemove] = useState(null)
  const [newEntry, setNewEntry] = useState({ type: 'passport', value: '', risk: 'watch', source: '', reason: '' })
  const { showToast } = useToast()

  const filtered = entries.filter(e => {
    const s = search.toLowerCase()
    const matchSearch = !s || e.value.toLowerCase().includes(s) || e.source.toLowerCase().includes(s)
    const matchRisk   = riskF === 'all' || e.risk === riskF
    return matchSearch && matchRisk
  })

  function addEntry() {
    if (!newEntry.value || !newEntry.source) return
    const id = Date.now()
    setEntries(prev => [{ id, ...newEntry, added: new Date().toISOString().split('T')[0] }, ...prev])
    showToast('Entry added to watchlist.', 'warning')
    setShowAdd(false)
    setNewEntry({ type: 'passport', value: '', risk: 'watch', source: '', reason: '' })
  }

  function removeEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
    showToast('Entry removed from watchlist.')
    setToRemove(null)
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0A2342', fontFamily: 'var(--font-serif)', marginBottom: 2 }}>Security Watchlist</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Individuals flagged for heightened border control scrutiny</div>
        </div>
        <Btn variant="danger" onClick={() => setShowAdd(true)}>+ Add to Watchlist</Btn>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search by identifier or source…"
          style={{ flex: 1, minWidth: 220, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
        <select value={riskF} onChange={e => setRiskF(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 12, fontFamily: 'inherit', background: '#fff' }}>
          {['all','watch','alert','arrest'].map(v => (
            <option key={v} value={v}>{v === 'all' ? 'All Risk Levels' : v.charAt(0).toUpperCase() + v.slice(1)}</option>
          ))}
        </select>
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Identifier Type', 'Identifier Value', 'Risk Level', 'Source', 'Date Added', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #E5E7EB', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => {
                const rc = RISK_COLORS[e.risk] || RISK_COLORS.watch
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '10px 10px', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{e.type.replace('_', ' ')}</td>
                    <td style={{ padding: '10px 10px', fontSize: 12, fontFamily: 'monospace', color: '#111827', fontWeight: 600 }}>{e.value}</td>
                    <td style={{ padding: '10px 10px' }}>
                      <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 12, background: rc.bg, color: rc.text, border: `1px solid ${rc.border}`, fontWeight: 700, textTransform: 'uppercase' }}>{e.risk}</span>
                    </td>
                    <td style={{ padding: '10px 10px', fontSize: 12, color: '#6B7280' }}>{e.source}</td>
                    <td style={{ padding: '10px 10px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{e.added}</td>
                    <td style={{ padding: '10px 10px' }}>
                      <Btn size="sm" variant="danger" onClick={() => setToRemove(e)}>Remove</Btn>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6}><EmptyState title="No watchlist entries found" message="Try adjusting the search or filter." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add to Watchlist">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Identifier Type" required value={newEntry.type} onChange={e => setNewEntry(p => ({ ...p, type: e.target.value }))} options={[
            { value: 'passport',    label: 'Passport Number' },
            { value: 'national_id', label: 'National ID' },
            { value: 'name',        label: 'Full Name' }
          ]} />
          <Input label="Identifier Value" required placeholder="Enter passport number, NID, or full name"
            value={newEntry.value} onChange={e => setNewEntry(p => ({ ...p, value: e.target.value }))} />
          <Select label="Risk Level" required value={newEntry.risk} onChange={e => setNewEntry(p => ({ ...p, risk: e.target.value }))} options={[
            { value: 'watch',  label: '⚡ Watch' },
            { value: 'alert',  label: '🔶 Alert' },
            { value: 'arrest', label: '🔴 Arrest' }
          ]} />
          <Input label="Source / Authority" required placeholder="e.g. INTERPOL, Rwanda Police, RIB"
            value={newEntry.source} onChange={e => setNewEntry(p => ({ ...p, source: e.target.value }))} />
          <Input label="Reason / Notes" required placeholder="Reason for watchlist inclusion…" rows={3}
            value={newEntry.reason} onChange={e => setNewEntry(p => ({ ...p, reason: e.target.value }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn variant="danger" disabled={!newEntry.value || !newEntry.source} onClick={addEntry}>Add Entry</Btn>
          </div>
        </div>
      </Modal>

      {/* Remove confirmation modal */}
      <Modal open={!!toRemove} onClose={() => setToRemove(null)} title="Remove Watchlist Entry" width={420}>
        {toRemove && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 13, color: '#374151' }}>
              Are you sure you want to remove <strong>{toRemove.value}</strong> from the watchlist?
              This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="secondary" onClick={() => setToRemove(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={() => removeEntry(toRemove.id)}>Remove Entry</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
