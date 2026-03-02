// ── BPMS Rwanda — API Service Layer ──────────────────────────
// Replace the mock data layer with real backend calls.
//
// Usage: import api from '../services/api'
//        const { data } = await api.get('/applications')

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// ── Token helpers ─────────────────────────────────────────────
export const token = {
  get:    ()      => localStorage.getItem('bpms_token'),
  set:    (t)     => localStorage.setItem('bpms_token', t),
  clear:  ()      => localStorage.removeItem('bpms_token')
}

// ── Base fetch wrapper ────────────────────────────────────────
async function request(method, path, body = null, opts = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const t = token.get()
  if (t) headers['Authorization'] = `Bearer ${t}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { ...headers, ...opts.headers },
    body: body ? JSON.stringify(body) : undefined
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`)
    err.status = res.status
    err.data   = data
    throw err
  }

  return data
}

const api = {
  get:    (path, opts)       => request('GET',    path, null, opts),
  post:   (path, body, opts) => request('POST',   path, body, opts),
  patch:  (path, body, opts) => request('PATCH',  path, body, opts),
  put:    (path, body, opts) => request('PUT',    path, body, opts),
  delete: (path, opts)       => request('DELETE', path, null, opts)
}

export default api

// ─────────────────────────────────────────────────────────────
//  Typed resource helpers
// ─────────────────────────────────────────────────────────────

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login:          (email, password)  => api.post('/auth/login',           { email, password }),
  register:       (data)             => api.post('/auth/register',         data),
  me:             ()                 => api.get('/auth/me'),
  changePassword: (curr, next)       => api.post('/auth/change-password',  { current_password: curr, new_password: next })
}

// ── Applications ──────────────────────────────────────────────
export const applicationsApi = {
  list:       (params = {})    => api.get('/applications?' + new URLSearchParams(params)),
  get:        (id)             => api.get(`/applications/${id}`),
  create:     (data)           => api.post('/applications', data),
  setStatus:  (id, status, extra = {}) => api.patch(`/applications/${id}/status`, { status, ...extra }),
  assign:     (id)             => api.patch(`/applications/${id}/assign`, {})
}

// ── Appointments ──────────────────────────────────────────────
export const appointmentsApi = {
  list:    ()                                  => api.get('/appointments'),
  slots:   (date, location)                   => api.get(`/appointments/slots?date=${date}&location=${encodeURIComponent(location)}`),
  book:    (location, appointment_date, time_slot) => api.post('/appointments', { location, appointment_date, time_slot }),
  cancel:  (id)                                => api.delete(`/appointments/${id}`)
}

// ── Border Logs ───────────────────────────────────────────────
export const borderApi = {
  list:    (params = {})               => api.get('/border-logs?' + new URLSearchParams(params)),
  record:  (passport_number, traveler_name, crossing_type, border_point) =>
             api.post('/border-logs', { passport_number, traveler_name, crossing_type, border_point }),
  stats:   ()                          => api.get('/border-logs/stats')
}

// ── Watchlist ─────────────────────────────────────────────────
export const watchlistApi = {
  list:    (params = {})  => api.get('/watchlist?' + new URLSearchParams(params)),
  add:     (entry)        => api.post('/watchlist', entry),
  remove:  (id)           => api.delete(`/watchlist/${id}`),
  screen:  (passport_number, name) => api.post('/watchlist/screen', { passport_number, name })
}

// ── Analytics ─────────────────────────────────────────────────
export const analyticsApi = {
  summary:        () => api.get('/analytics/summary'),
  perDay:         (days = 7) => api.get(`/analytics/applications-per-day?days=${days}`),
  byType:         () => api.get('/analytics/by-type'),
  byStatus:       () => api.get('/analytics/by-status'),
  officers:       () => api.get('/analytics/officers'),
  borderPerDay:   (days = 7) => api.get(`/analytics/border-per-day?days=${days}`)
}

// ── Users (admin) ─────────────────────────────────────────────
export const usersApi = {
  me:           ()           => api.get('/users/me'),
  updateMe:     (data)       => api.patch('/users/me', data),
  list:         (params={})  => api.get('/users?' + new URLSearchParams(params)),
  create:       (data)       => api.post('/users', data),
  toggleActive: (id)         => api.patch(`/users/${id}/toggle-active`, {}),
  setRole:      (id, role)   => api.patch(`/users/${id}/role`, { role })
}

// ── Documents ─────────────────────────────────────────────────
export const documentsApi = {
  upload: (appId, file, doc_type) => {
    const form = new FormData()
    form.append('file',     file)
    form.append('doc_type', doc_type)
    const t = token.get()
    return fetch(`${BASE_URL}/documents/${appId}`, {
      method: 'POST',
      headers: t ? { Authorization: `Bearer ${t}` } : {},
      body: form
    }).then(r => r.json())
  },
  downloadUrl: (appId, docId) => `${BASE_URL}/documents/${appId}/${docId}/download`
}
