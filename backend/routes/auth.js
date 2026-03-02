const router   = require('express').Router()
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const pool     = require('../db')
const { authenticate } = require('../middleware/auth')

// ── Helper: sign JWT ─────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

function userPublic(u) {
  return {
    id: u.id, full_name: u.full_name, email: u.email,
    role: u.role, national_id: u.national_id, phone: u.phone
  }
}

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  const { full_name, email, password, national_id, phone, date_of_birth, gender, place_of_birth } = req.body

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'full_name, email and password are required' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (exists.rows.length) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const hash = await bcrypt.hash(password, 12)
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, national_id, phone, date_of_birth, gender, place_of_birth, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'applicant')
       RETURNING id, full_name, email, role, national_id, phone`,
      [full_name, email.toLowerCase(), hash, national_id || null, phone || null, date_of_birth || null, gender || null, place_of_birth || null]
    )

    const user  = rows[0]
    const token = signToken(user.id)
    res.status(201).json({ token, user: userPublic(user) })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    )
    const user = rows[0]
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user.id)
    res.json({ token, user: userPublic(user) })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// ── GET /api/auth/me  (requires token) ───────────────────────
router.get('/me', authenticate, (req, res) => {
  res.json({ user: userPublic(req.user) })
})

// ── POST /api/auth/change-password ───────────────────────────
router.post('/change-password', authenticate, async (req, res) => {
  const { current_password, new_password } = req.body
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Both current_password and new_password are required' })
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' })
  }

  try {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id])
    const match = await bcrypt.compare(current_password, rows[0].password_hash)
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' })

    const hash = await bcrypt.hash(new_password, 12)
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id])
    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' })
  }
})

module.exports = router
