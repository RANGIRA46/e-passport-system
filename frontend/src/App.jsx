import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

// Layout components
import Navbar       from './components/layout/Navbar.jsx'
import AdminSidebar from './components/layout/AdminSidebar.jsx'

// Auth pages
import Login from './pages/auth/Login.jsx'

// Citizen portal pages
import CitizenDashboard   from './pages/portal/CitizenDashboard.jsx'
import Apply              from './pages/portal/Apply.jsx'
import { Status, Appointments } from './pages/portal/StatusAppointments.jsx'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import Applications   from './pages/admin/Applications.jsx'
import BorderLogs     from './pages/admin/BorderLogs.jsx'
import Analytics      from './pages/admin/Analytics.jsx'
import Watchlist      from './pages/admin/Watchlist.jsx'

// ── LAYOUTS ────────────────────────────────────────────────────────
function PortalLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
        <Outlet />
      </div>
    </div>
  )
}

function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      <AdminSidebar />
      <div style={{ marginLeft: 220, flex: 1, padding: '28px 28px', overflowX: 'auto' }}>
        <Outlet />
      </div>
    </div>
  )
}

// ── PROTECTED ROUTE ───────────────────────────────────────────────
function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return user.role === 'applicant'
      ? <Navigate to="/portal" replace />
      : <Navigate to="/admin" replace />
  }
  return <Outlet />
}

// ── APP ROUTES ────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Redirect root */}
      <Route path="/"
        element={
          !user
            ? <Navigate to="/login" replace />
            : user.role === 'applicant'
            ? <Navigate to="/portal" replace />
            : <Navigate to="/admin"  replace />
        }
      />

      {/* ── Citizen portal ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PortalLayout />}>
          <Route path="/portal"              element={<CitizenDashboard />} />
          <Route path="/portal/apply"        element={<Apply />} />
          <Route path="/portal/status"       element={<Status />} />
          <Route path="/portal/appointments" element={<Appointments />} />
        </Route>
      </Route>

      {/* ── Admin / officer ── */}
      <Route element={<ProtectedRoute allowedRoles={['officer','supervisor','admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin"          element={<AdminDashboard />} />
          <Route path="/admin/apps"     element={<Applications />} />
          <Route path="/admin/border"   element={<BorderLogs />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/watchlist" element={<Watchlist />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
