import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { Btn, Input } from '../../components/ui/index.jsx'

export default function Login() {
  const [view, setView]         = useState('login') // login | register | forgot
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { login }   = useAuth()
  const { showToast } = useToast()
  const navigate    = useNavigate()

  function handleLogin(e) {
    e?.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setTimeout(() => {
      const u = login(email)
      setLoading(false)
      showToast(`Welcome back, ${u.name.split(' ')[0]}!`)
      navigate(u.role === 'applicant' ? '/portal' : '/admin')
    }, 900)
  }

  const LeftPanel = (
    <div style={{ flex: 1, background: 'linear-gradient(155deg, #0A2342 0%, #1A56DB 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, minWidth: 300 }}>
      <div style={{ maxWidth: 360, textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🛂</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-serif)', lineHeight: 1.2, marginBottom: 8 }}>
          Rwanda Border &amp; Passport Management
        </div>
        <div style={{ fontSize: 13, color: '#93C5FD', marginBottom: 36, lineHeight: 1.7 }}>
          Directorate General of Immigration and Emigration — Digital Services Platform
        </div>
        {['Apply for passports & visas entirely online', 'Real-time application status tracking', 'Secure biometric border management'].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, textAlign: 'left' }}>
            <span style={{ background: '#0E9F6E', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: '#fff', fontWeight: 700 }}>✓</span>
            <span style={{ color: '#BFDBFE', fontSize: 13, lineHeight: 1.5 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'var(--font-sans)' }}>
      {LeftPanel}

      {/* Right panel */}
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: '#FAFAFA', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🇷🇼</div>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Republic of Rwanda</div>
          </div>

          {/* LOGIN FORM */}
          {view === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#0A2342', fontFamily: 'var(--font-serif)', marginBottom: 4 }}>Welcome back</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>Sign in to your BPMS account</div>
              </div>
              {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 12 }}>{error}</div>}
              <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password <span style={{ color: '#E02424' }}>*</span></label>
                  <button type="button" onClick={() => setView('forgot')} style={{ fontSize: 12, color: '#1A56DB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Forgot password?</button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '9px 40px 9px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                  <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>{show ? '🙈' : '👁'}</button>
                </div>
              </div>
              <Btn type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? '⏳  Signing in…' : 'Sign In →'}
              </Btn>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#6B7280' }}>
                Don't have an account?{' '}
                <button type="button" onClick={() => setView('register')} style={{ color: '#1A56DB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Register here</button>
              </div>
              <div style={{ padding: '10px 12px', background: '#F0F9FF', borderRadius: 8, fontSize: 11, color: '#0369A1' }}>
                <strong>Demo logins:</strong><br />
                Citizen: any email + any password<br />
                Officer: uwase@dgie.gov.rw<br />
                Admin: admin@dgie.gov.rw
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {view === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0A2342', fontFamily: 'var(--font-serif)', marginBottom: 4 }}>Create your account</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Citizens only — officers are added by admin</div>
              </div>
              <Input label="Full Name" placeholder="As on National ID" required />
              <Input label="National ID" placeholder="16-digit Rwanda NID" required />
              <Input label="Phone Number" placeholder="+250 7XX XXX XXX" required />
              <Input label="Email address" type="email" placeholder="you@example.com" required />
              <Input label="Password" type="password" placeholder="Minimum 8 characters" required />
              <Input label="Confirm Password" type="password" placeholder="Repeat password" required />
              <Btn style={{ width: '100%', justifyContent: 'center' }}>Create Account</Btn>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#6B7280' }}>
                Already have an account?{' '}
                <button onClick={() => setView('login')} style={{ color: '#1A56DB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Sign in</button>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {view === 'forgot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A56DB', fontSize: 12, fontWeight: 600, textAlign: 'left', fontFamily: 'inherit' }}>← Back to login</button>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0A2342', fontFamily: 'var(--font-serif)', marginBottom: 4 }}>Reset your password</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Enter your email and we will send you a reset link.</div>
              </div>
              <Input label="Email address" type="email" placeholder="you@example.com" required />
              <Btn style={{ width: '100%', justifyContent: 'center' }}>Send Reset Link →</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
