import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(t => {
          const colors = {
            success: { bg: '#ECFDF5', border: '#10B981', text: '#065F46', icon: '✅' },
            error:   { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B', icon: '❌' },
            warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', icon: '⚠️' }
          }
          const c = colors[t.type] || colors.success
          return (
            <div key={t.id} className="toast-in"
              style={{ background: c.bg, border: `1.5px solid ${c.border}`, color: c.text, padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxWidth: 340, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>{c.icon}</span> {t.message}
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
