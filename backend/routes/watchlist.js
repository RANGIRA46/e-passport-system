const router = require('express').Router()
const pool   = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

router.use(authenticate)
router.use(requireRole('supervisor','admin'))

// ── GET /api/watchlist ────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { risk, search } = req.query
    const params = []
    const conds  = ['w.is_active = true']

    if (risk)   { params.push(risk); conds.push(`w.risk_level = $${params.length}`) }
    if (search) {
      params.push(`%${search}%`)
      conds.push(`(w.identifier_value ILIKE $${params.length} OR w.source ILIKE $${params.length})`)
    }

    const { rows } = await pool.query(
      `SELECT w.*, u.full_name AS added_by_name
       FROM watchlist w
       LEFT JOIN users u ON u.id = w.added_by
       WHERE ${conds.join(' AND ')}
       ORDER BY w.created_at DESC`,
      params
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch watchlist' })
  }
})

// ── POST /api/watchlist ───────────────────────────────────────
router.post('/', async (req, res) => {
  const { identifier_type, identifier_value, risk_level, source, reason } = req.body
  if (!identifier_type || !identifier_value || !risk_level || !source) {
    return res.status(400).json({ error: 'identifier_type, identifier_value, risk_level, and source are required' })
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO watchlist (identifier_type, identifier_value, risk_level, source, reason, added_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [identifier_type, identifier_value, risk_level, source, reason || null, req.user.id]
    )
    await pool.query(
      `INSERT INTO audit_log (actor_id, action, entity_type, entity_id, payload, ip_address)
       VALUES ($1,'add_watchlist','watchlist',$2,$3,$4)`,
      [req.user.id, rows[0].id, JSON.stringify({ identifier_value, risk_level }), req.ip]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to add watchlist entry' })
  }
})

// ── DELETE /api/watchlist/:id ─────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE watchlist SET is_active = false WHERE id = $1 RETURNING id, identifier_value`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Entry not found' })

    await pool.query(
      `INSERT INTO audit_log (actor_id, action, entity_type, entity_id, ip_address)
       VALUES ($1,'remove_watchlist','watchlist',$2,$3)`,
      [req.user.id, req.params.id, req.ip]
    )
    res.json({ message: 'Entry removed from watchlist' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove entry' })
  }
})

// ── POST /api/watchlist/screen ────────────────────────────────
//    Quick passport/name screen (used by border log recording)
router.post('/screen', requireRole('officer','supervisor','admin'), async (req, res) => {
  const { passport_number, name } = req.body
  if (!passport_number && !name) {
    return res.status(400).json({ error: 'passport_number or name is required' })
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, identifier_type, identifier_value, risk_level, source, reason
       FROM watchlist
       WHERE is_active = true AND (
         (identifier_type = 'passport' AND UPPER(identifier_value) = UPPER($1)) OR
         (identifier_type = 'name'     AND $2 IS NOT NULL AND UPPER($2) ILIKE '%' || UPPER(identifier_value) || '%')
       )`,
      [passport_number || '', name || null]
    )
    res.json({ flagged: rows.length > 0, hits: rows })
  } catch (err) {
    res.status(500).json({ error: 'Screening failed' })
  }
})

module.exports = router
