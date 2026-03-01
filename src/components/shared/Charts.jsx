// ── BAR CHART ─────────────────────────────────────────────────────
export function BarChart({ data, color = '#1A56DB', height = 100 }) {
  const max = Math.max(...data.map(d => d.count))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 2 }}>{d.count}</div>
          <div style={{
            width: '100%', background: color, borderRadius: '4px 4px 0 0',
            height: (d.count / max) * (height - 20), opacity: 0.85, transition: 'height 0.5s ease'
          }} />
          <div style={{ fontSize: 9, color: '#6B7280', marginTop: 4 }}>{d.day}</div>
        </div>
      ))}
    </div>
  )
}

// ── PIE CHART ─────────────────────────────────────────────────────
export function PieChart({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  let angle = -90
  const r = 50, cx = 60, cy = 60
  const slices = data.map(d => {
    const pct   = d.count / total
    const sweep = pct * 360
    const start = angle
    angle += sweep
    const toRad = a => (a * Math.PI) / 180
    const x1 = cx + r * Math.cos(toRad(start))
    const y1 = cy + r * Math.sin(toRad(start))
    const x2 = cx + r * Math.cos(toRad(angle - 0.001))
    const y2 = cy + r * Math.sin(toRad(angle - 0.001))
    const large = sweep > 180 ? 1 : 0
    return { ...d, path: `M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2}Z`, pct: Math.round(pct * 100) }
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={120} height={120} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={1.5} />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: '#374151', fontWeight: 500 }}>{s.label}</span>
            <span style={{ color: '#6B7280', marginLeft: 4, fontWeight: 700 }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── STEP PROGRESS BAR ─────────────────────────────────────────────
export function StepBar({ current, steps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: i + 1 <= current ? '#1A56DB' : '#E5E7EB',
              color: i + 1 <= current ? '#fff' : '#9CA3AF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, transition: 'all 0.3s'
            }}>
              {i + 1 < current ? '✓' : i + 1}
            </div>
            <div style={{
              fontSize: 10, fontWeight: 600, marginTop: 4, whiteSpace: 'nowrap',
              color: i + 1 === current ? '#1A56DB' : '#9CA3AF'
            }}>
              {step}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, margin: '0 8px', marginBottom: 18, transition: 'all 0.3s',
              background: i + 1 < current ? '#1A56DB' : '#E5E7EB'
            }} />
          )}
        </div>
      ))}
    </div>
  )
}
