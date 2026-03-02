require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')
const path       = require('path')

const app = express()

// ── Security & Middleware ─────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true
}))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Rate Limiting ─────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,                    // 20 login attempts per 15 min
  message: { error: 'Too many requests, please try again later' }
})

app.use('/api', globalLimiter)
app.use('/api/auth/login', authLimiter)

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'))
app.use('/api/applications', require('./routes/applications'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/border-logs',  require('./routes/borderLogs'))
app.use('/api/watchlist',    require('./routes/watchlist'))
app.use('/api/analytics',    require('./routes/analytics'))
app.use('/api/users',        require('./routes/users'))
app.use('/api/documents',    require('./routes/documents'))

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let dbOk = false
  try {
    const pool = require('./db')
    await pool.query('SELECT 1')
    dbOk = true
  } catch {}
  res.json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'connected' : 'disconnected',
    env:  process.env.NODE_ENV,
    time: new Date().toISOString()
  })
})

// ── 404 ───────────────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` })
})

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large (max 5 MB)' })
  }
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`\n🟢  BPMS API running on http://localhost:${PORT}`)
  console.log(`    Health: http://localhost:${PORT}/api/health\n`)
})

module.exports = app
