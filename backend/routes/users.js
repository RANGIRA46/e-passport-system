const router = require('express').Router()
const bcrypt = require('bcryptjs')
const pool   = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

router.use(authenticate)

// ── GET /api/users/me  (profile) ─────────────────────────────
router.get('/me', (req, res) => {
  const { id, full_name, email, role, national_id, phone } = req.user
  res.json({ id, full_name, email, role, national_id, phone })
})

// ── PATCH /api/users/me  (update profile) ────────────────────
router.patch('/me', async (req, res) => {
  const { full_name, phone, date_of_birth, gender, place_of_birth } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           phone     = COALESCE($2, phone),
           date_of_birth   = COALESCE($3, date_of_birth),
           gender          = COALESCE($4, gender),
           place_of_birth  = COALESCE($5, place_of_birth)
       WHERE id = $6
       RETURNING id, full_name, email, role, national_id, phone`,
      [full_name || null, phone || null, date_of_birth || null, gender || null, place_of_birth || null, req.user.id]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// ────── ADMIN-ONLY ROUTES ──────────────────────────────────────
// ── GET /api/users  ───────────────────────────────────────────
router.get('/', requireRole('admin'), async (req, res) => {
  try {
    const { role, search } = req.query
    const params = []
    const conds  = []

    if (role)   { params.push(role);     conds.push(`u.role = $${params.length}`) }
    if (search) { params.push(`%${search}%`); conds.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`) }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
    const { rows } = await pool.query(
      `SELECT id, full_name, email, role, national_id, phone, is_active, created_at
       FROM users u ${where} ORDER BY created_at DESC`, params
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// ── POST /api/users  (admin creates staff account) ───────────
router.post('/', requireRole('admin'), async (req, res) => {
  const { full_name, email, password, role = 'officer', phone } = req.body
  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'full_name, email, password required' })
  }
  if (!['officer','supervisor','admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role for admin-created user' })
  }
  try {
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()])
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 12)
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, full_name, email, role, phone`,
      [full_name, email.toLowerCase(), hash, role, phone || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// ── PATCH /api/users/:id/toggle-active  ──────────────────────
router.patch('/:id/toggle-active', requireRole('admin'), async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot deactivate your own account' })
  }
  try {
    const { rows } = await pool.query(
      `UPDATE users SET is_active = NOT is_active WHERE id = $1
       RETURNING id, full_name, is_active`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle user status' })
  }
})

// ── PATCH /api/users/:id/role  ────────────────────────────────
router.patch('/:id/role', requireRole('admin'), async (req, res) => {
  const { role } = req.body
  const VALID = ['applicant','officer','supervisor','admin']
  if (!VALID.includes(role)) return res.status(400).json({ error: 'Invalid role' })
  try {
    const { rows } = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, full_name, role`,
      [role, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' })
  }
})

module.exports = router
