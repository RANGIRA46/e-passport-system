// ── BUTTON ────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', style: sx = {}, disabled = false, type = 'button' }) {
  const base = {
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: 8,
    fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'all 0.15s', fontFamily: 'inherit', opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap'
  }
  const sizes = {
    sm: { padding: '6px 14px', fontSize: 12 },
    md: { padding: '9px 18px', fontSize: 13 },
    lg: { padding: '13px 26px', fontSize: 14 }
  }
  const variants = {
    primary:   { background: '#1A56DB', color: '#fff' },
    secondary: { background: '#fff', color: '#0A2342', border: '1.5px solid #E5E7EB' },
    danger:    { background: '#E02424', color: '#fff' },
    ghost:     { background: 'transparent', color: '#1A56DB' },
    success:   { background: '#0E9F6E', color: '#fff' }
  }
  return (
    <button type={type} onClick={disabled ? undefined : onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...sx }}>
      {children}
    </button>
  )
}

// ── BADGE ─────────────────────────────────────────────────────────
import { STATUS_CFG } from '../../data/mockData.js'

export function Badge({ status }) {
  const s = STATUS_CFG[status] || STATUS_CFG.pending
  return (
    <span style={{
      background: s.bg, color: s.text, padding: '2px 10px',
      borderRadius: 20, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap'
    }}>
      {s.label}
    </span>
  )
}

// ── CARD ──────────────────────────────────────────────────────────
export function Card({ children, style: sx = {}, title, subtitle, className = '' }) {
  return (
    <div className={`fade-in ${className}`} style={{
      background: '#fff', borderRadius: 12, border: '1.5px solid #E5E7EB',
      padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', ...sx
    }}>
      {title && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0A2342', fontFamily: 'var(--font-serif)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

// ── INPUT ─────────────────────────────────────────────────────────
export function Input({ label, type = 'text', placeholder, value, onChange, required, error, helpText, readOnly, style: sx = {}, defaultValue, rows }) {
  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: `1.5px solid ${error ? '#E02424' : '#D1D5DB'}`, fontSize: 13,
    color: '#111827', background: readOnly ? '#F9FAFB' : '#fff',
    fontFamily: 'inherit', boxSizing: 'border-box', ...sx
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          {label} {required && <span style={{ color: '#E02424' }}>*</span>}
        </label>
      )}
      {rows ? (
        <textarea rows={rows} placeholder={placeholder} value={value} onChange={onChange}
          style={{ ...inputStyle, resize: 'vertical' }} />
      ) : (
        <input type={type} placeholder={placeholder} value={value} onChange={onChange}
          readOnly={readOnly} defaultValue={defaultValue} style={inputStyle} />
      )}
      {error    && <span style={{ fontSize: 11, color: '#E02424' }}>{error}</span>}
      {helpText && <span style={{ fontSize: 11, color: '#6B7280' }}>{helpText}</span>}
    </div>
  )
}

// ── SELECT ────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          {label} {required && <span style={{ color: '#E02424' }}>*</span>}
        </label>
      )}
      <select value={value} onChange={onChange} style={{
        width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB',
        fontSize: 13, color: '#111827', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box'
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── MODAL ─────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 540 }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,35,66,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div className="fade-in" onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: width, padding: '28px 28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0A2342', fontFamily: 'var(--font-serif)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280', lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── STAT CARD ─────────────────────────────────────────────────────
export function Stat({ icon, label, value, sub, color = '#1A56DB' }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #E5E7EB', padding: '18px 20px', flex: 1, minWidth: 140, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginTop: 6, fontFamily: 'var(--font-serif)' }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── EMPTY STATE ───────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title = 'No data found', message = '', action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 40px', color: '#6B7280' }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{title}</div>
      {message && <div style={{ fontSize: 12, marginBottom: 20 }}>{message}</div>}
      {action}
    </div>
  )
}

// ── SPINNER ───────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #E5E7EB', borderTop: '3px solid #1A56DB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
