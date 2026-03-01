import { useState } from 'react'
import { Card, Btn, Badge, Modal, Input, EmptyState } from '../../components/ui/index.jsx'
import { ALL_APPS } from '../../data/mockData.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function Applications() {
  const [apps, setApps]         = useState(ALL_APPS)
  const [search, setSearch]     = useState('')
  const [typeF, setTypeF]       = useState('all')
  const [statusF, setStatusF]   = useState('all')
  const [detail, setDetail]     = useState(null)
  const [action, setAction]     = useState(null) // 'approve' | 'reject'
  const [rejectNote, setRejectNote] = useState('')
  const { showToast } = useToast()

  const filtered = apps.filter(a => {
    const s = search.toLowerCase()
    const matchSearch = !s || a.name.toLowerCase().includes(s) || a.id.toLowerCase().includes(s) || a.nid.includes(s)
    const matchType   = typeF   === 'all' || a.type   === typeF
    const matchStatus = statusF === 'all' || a.status === statusF
    return matchSearch && matchType && matchStatus
  })

  function approve(id) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: 'approved', officer: 'Officer Uwase' } : a))
    showToast(`Application ${id} approved. Permit generated and applicant notified.`)
    setDetail(null); setAction(null)
  }

  function reject(id) {
    if (!rejectNote.trim()) return
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected', officer: 'Officer Uwase' } : a))
    showToast(`Application ${id} rejected.`, 'error')
    setDetail(null); setAction(null); setRejectNote('')
  }

  return (
    <div className="fade-in">
      <div style={{ fontSize: 24, fontWeight: 800, color: '#0A2342', fontFamily: 'var(--font-serif)', marginBottom: 20 }}>All Applications</div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search by name, reference, or NID…"
          style={{ flex: 1, minWidth: 220, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
        <select value={typeF} onChange={e => setTypeF(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 12, fontFamily: 'inherit', background: '#fff' }}>
          {['all','passport','visa','renewal','emergency'].map(v => (
            <option key={v} value={v}>{v === 'all' ? 'All Types' : v.charAt(0).toUpperCase() + v.slice(1)}</option>
          ))}
        </select>
        <select value={statusF} onChange={e => setStatusF(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 12, fontFamily: 'inherit', background: '#fff' }}>
          {['all','pending','under_review','approved','rejected'].map(v => (
            <option key={v} value={v}>{v === 'all' ? 'All Statuses' : v.replace('_', ' ')}</option>
          ))}
        </select>
        <Btn variant="secondary" size="sm">⬇️  Export CSV</Btn>
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Reference', 'Applicant Name', 'NID', 'Type', 'Submitted', 'Status', 'Officer', 'Action'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #E5E7EB', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} onClick={() => { setDetail(a); setAction(null) }}
                  style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA', cursor: 'pointer' }}>
                  <td style={{ padding: '10px 10px', fontSize: 11, color: '#1A56DB', fontWeight: 700, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{a.id}</td>
                  <td style={{ padding: '10px 10px', fontSize: 12, fontWeight: 600, color: '#111827' }}>{a.name}</td>
                  <td style={{ padding: '10px 10px', fontSize: 11, color: '#6B7280', fontFamily: 'monospace' }}>{a.nid}</td>
                  <td style={{ padding: '10px 10px', fontSize: 12, color: '#374151', textTransform: 'capitalize' }}>{a.type}</td>
                  <td style={{ padding: '10px 10px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{a.submitted}</td>
                  <td style={{ padding: '10px 10px' }}><Badge status={a.status} /></td>
                  <td style={{ padding: '10px 10px', fontSize: 12, color: '#6B7280' }}>{a.officer}</td>
                  <td style={{ padding: '10px 10px' }} onClick={e => e.stopPropagation()}>
                    <Btn size="sm" variant="ghost" onClick={() => { setDetail(a); setAction(null) }}>Review →</Btn>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8}><EmptyState title="No applications match your search" message="Try adjusting the filters." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#6B7280' }}>
          <span>Showing {filtered.length} of {apps.length} applications</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn variant="secondary" size="sm" disabled>← Previous</Btn>
            <Btn variant="secondary" size="sm" disabled>Next →</Btn>
          </div>
        </div>
      </Card>

      {/* Review Modal */}
      <Modal open={!!detail} onClose={() => { setDetail(null); setAction(null) }} title={`Review Application — ${detail?.id}`} width={700}>
        {detail && !action && (
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {/* Left: applicant info */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicant Profile</div>
              {[['Full Name', detail.name], ['National ID', detail.nid], ['Application Type', detail.type], ['Submitted', detail.submitted], ['Assigned Officer', detail.officer]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F3F4F6', fontSize: 12 }}>
                  <span style={{ color: '#6B7280' }}>{k}</span>
                  <span style={{ fontWeight: 600, textTransform: k === 'Application Type' ? 'capitalize' : 'none' }}>{v}</span>
                </div>
              ))}
              {/* Documents */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted Documents</div>
                {['Passport Photo ✓', 'NID — Front ✓', 'NID — Back ✓', 'Birth Certificate ✓'].map(d => (
                  <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#ECFDF5', borderRadius: 6, marginBottom: 4, fontSize: 12, color: '#065F46' }}>
                    <span>📄</span> {d}
                    <Btn size="sm" variant="ghost" style={{ marginLeft: 'auto', fontSize: 11 }}>View</Btn>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: decision panel */}
            <div style={{ width: 200, flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Decision</div>
              <div style={{ marginBottom: 14 }}><Badge status={detail.status} /></div>
              {detail.status === 'pending' && (
                <>
                  <Btn style={{ width: '100%', justifyContent: 'center', marginBottom: 8, background: '#0E9F6E' }} onClick={() => setAction('approve')}>✅  Approve</Btn>
                  <Btn variant="danger" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }} onClick={() => setAction('reject')}>❌  Reject</Btn>
                  <Btn variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'center' }}>📋  Mark Under Review</Btn>
                </>
              )}
              {detail.status !== 'pending' && (
                <div style={{ fontSize: 12, color: '#6B7280', background: '#F9FAFB', padding: 10, borderRadius: 8 }}>
                  This application has already been <strong>{detail.status}</strong>.
                </div>
              )}
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Internal Note</label>
                <textarea rows={3} placeholder="Optional note visible to staff only…"
                  style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 11, fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
          </div>
        )}

        {/* Approve confirmation */}
        {action === 'approve' && detail && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0A2342', marginBottom: 8 }}>Confirm Approval</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
              Approve <strong>{detail.name}</strong>'s {detail.type} application?<br />
              A QR permit will be generated and the applicant notified by SMS and email.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Btn variant="secondary" onClick={() => setAction(null)}>Cancel</Btn>
              <Btn variant="success" onClick={() => approve(detail.id)}>Confirm Approval</Btn>
            </div>
          </div>
        )}

        {/* Reject form */}
        {action === 'reject' && detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0A2342' }}>Reject Application</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              You are rejecting <strong>{detail.name}</strong>'s {detail.type} application. The applicant will be notified with your reason.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Rejection Reason <span style={{ color: '#E02424' }}>*</span></label>
              <textarea rows={4} value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                placeholder="Enter a clear reason — this will be sent to the applicant…"
                style={{ padding: '10px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="secondary" onClick={() => setAction(null)}>Cancel</Btn>
              <Btn variant="danger" disabled={!rejectNote.trim()} onClick={() => reject(detail.id)}>Confirm Rejection</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
