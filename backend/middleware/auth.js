const jwt = require('jsonwebtoken')
const pool = require('../db')

// ── Verify JWT and attach user to req ────────────────────────
async function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // Fetch fresh user in case role changed or account deactivated
    const { rows } = await pool.query(
      'SELECT id, full_name, email, role, national_id, phone, is_active FROM users WHERE id = $1',
      [payload.sub]
    )
    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ error: 'Account not found or deactivated' })
    }
    req.user = rows[0]
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ── Role guard factory ───────────────────────────────────────
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

module.exports = { authenticate, requireRole }
