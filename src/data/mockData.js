// ── MOCK USERS ───────────────────────────────────────────────────
export const MOCK_USERS = {
  citizen: {
    id: 'u1', name: 'BARAKA Johnson', email: 'baraka@gmail.com',
    role: 'applicant', national_id: '1199880012345678', phone: '+250 788 123 456'
  },
  officer: {
    id: 'u2', name: 'Officer Uwase Marie', email: 'uwase@dgie.gov.rw',
    role: 'officer', national_id: null, phone: '+250 788 000 001'
  },
  admin: {
    id: 'u3', name: 'Admin Niyonzima Jean', email: 'admin@dgie.gov.rw',
    role: 'admin', national_id: null, phone: '+250 788 000 002'
  }
}

// ── MY APPLICATIONS (citizen view) ───────────────────────────────
export const MY_APPS = [
  { id: 'APP-2026-0042', type: 'Passport Application', status: 'pending',      submitted: '28 Feb 2026', notes: '' },
  { id: 'APP-2026-0011', type: 'Visa Application',     status: 'approved',     submitted: '10 Jan 2026', notes: 'All documents verified. Approved.' },
  { id: 'APP-2026-0003', type: 'Passport Renewal',     status: 'rejected',     submitted: '05 Dec 2025', notes: 'Birth certificate missing. Please reapply.' }
]

// ── ALL APPLICATIONS (admin view) ─────────────────────────────────
export const ALL_APPS = [
  { id: 'APP-2026-0042', type: 'passport',  status: 'pending',      name: 'BARAKA Johnson',      nid: '1199880012345678', submitted: '2026-02-28', officer: '—' },
  { id: 'APP-2026-0038', type: 'visa',      status: 'approved',     name: 'KARENZI MUCYO David', nid: '1200010098765432', submitted: '2026-02-25', officer: 'Officer Uwase' },
  { id: 'APP-2026-0031', type: 'renewal',   status: 'under_review', name: 'Uwimana Claire',      nid: '1199570056789012', submitted: '2026-02-20', officer: 'Officer Rwema' },
  { id: 'APP-2026-0027', type: 'passport',  status: 'rejected',     name: 'Nkusi Emmanuel',      nid: '1200150034567890', submitted: '2026-02-18', officer: 'Officer Uwase' },
  { id: 'APP-2026-0019', type: 'visa',      status: 'approved',     name: 'Mutesi Josephine',    nid: '1198920067890123', submitted: '2026-02-12', officer: 'Officer Bimenyimana' },
  { id: 'APP-2026-0014', type: 'emergency', status: 'pending',      name: 'Habimana Patrick',    nid: '1201030089012345', submitted: '2026-02-10', officer: '—' }
]

// ── BORDER LOGS ───────────────────────────────────────────────────
export const BORDER_LOGS = [
  { time: '08:14', name: 'Mugisha Robert',   passport: 'PA3847291', type: 'Entry', point: 'Kigali International Airport', status: 'clear',   officer: 'Officer Uwase' },
  { time: '08:32', name: 'Smith James T.',   passport: 'UK9283746', type: 'Entry', point: 'Kigali International Airport', status: 'flagged', officer: 'Officer Uwase' },
  { time: '09:05', name: 'Uwimana Claire',   passport: 'PA2938471', type: 'Exit',  point: 'Gatuna Border Post',           status: 'clear',   officer: 'Officer Rwema' },
  { time: '09:41', name: 'Habimana Patrick', passport: 'PA1827364', type: 'Entry', point: 'Cyanika Border Post',          status: 'clear',   officer: 'Officer Bimenyimana' },
  { time: '10:12', name: 'Zhang Wei',        passport: 'CN4728193', type: 'Entry', point: 'Kigali International Airport', status: 'clear',   officer: 'Officer Uwase' }
]

// ── CHART DATA ────────────────────────────────────────────────────
export const WEEK_DATA = [
  { day: 'Mon', count: 24 }, { day: 'Tue', count: 38 }, { day: 'Wed', count: 31 },
  { day: 'Thu', count: 47 }, { day: 'Fri', count: 52 }, { day: 'Sat', count: 18 }, { day: 'Sun', count: 12 }
]

export const STATUS_DIST = [
  { label: 'Pending',      count: 34, color: '#F59E0B' },
  { label: 'Under Review', count: 28, color: '#3B82F6' },
  { label: 'Approved',     count: 89, color: '#10B981' },
  { label: 'Rejected',     count: 16, color: '#EF4444' }
]

export const TYPE_DIST = [
  { label: 'Passport',  count: 112, color: '#1A56DB' },
  { label: 'Visa',      count: 68,  color: '#0E9F6E' },
  { label: 'Renewal',   count: 32,  color: '#C27803' },
  { label: 'Emergency', count: 10,  color: '#E02424' }
]

export const OFFICERS = [
  { name: 'Officer Uwase Marie',       reviewed: 89, approved: 61, rejected: 18, avg: '3.8h' },
  { name: 'Officer Rwema Pierre',      reviewed: 74, approved: 52, rejected: 12, avg: '4.1h' },
  { name: 'Officer Bimenyimana Grace', reviewed: 59, approved: 35, rejected: 9,  avg: '5.2h' }
]

// ── WATCHLIST ─────────────────────────────────────────────────────
export const INITIAL_WATCHLIST = [
  { id: 1, type: 'passport',    value: 'UK9283746',        risk: 'alert',  source: 'INTERPOL',     added: '2026-01-15' },
  { id: 2, type: 'name',        value: 'Hassan Al-Rashid', risk: 'watch',  source: 'RIB',           added: '2026-02-01' },
  { id: 3, type: 'national_id', value: '1199010098765432', risk: 'arrest', source: 'Rwanda Police', added: '2025-12-20' }
]

// ── STATUS CONFIG ─────────────────────────────────────────────────
export const STATUS_CFG = {
  pending:      { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
  under_review: { bg: '#DBEAFE', text: '#1E40AF', label: 'Under Review' },
  approved:     { bg: '#D1FAE5', text: '#065F46', label: 'Approved' },
  rejected:     { bg: '#FEE2E2', text: '#991B1B', label: 'Rejected' },
  cancelled:    { bg: '#F3F4F6', text: '#374151', label: 'Cancelled' }
}

export const TYPE_ICON = {
  passport:  '🛂',
  visa:      '🌍',
  renewal:   '🔄',
  emergency: '🚨'
}
