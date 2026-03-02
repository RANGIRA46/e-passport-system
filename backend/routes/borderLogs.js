const router = require('express').Router()
const pool   = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

router.use(authenticate)
router.use(requireRole('officer','supervisor','admin'))

// ── GET /api/border-logs  ─────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { date, status, point, page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit
    const params = []
    const conds  = []

    if (date) {
      params.push(date)
      conds.push(`DATE(bl.crossed_at AT TIME ZONE 'Africa/Kigali') = $${params.length}`)
    }
    if (status) { params.push(status); conds.push(`bl.status = $${params.length}`) }
    if (point)  { params.push(`%${point}%`); conds.push(`bl.border_point ILIKE $${params.length}`) }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
    params.push(limit, offset)

    const { rows } = await pool.query(
      `SELECT bl.*, u.full_name AS officer_name
       FROM border_logs bl
       JOIN users u ON u.id = bl.officer_id
       ${where}
       ORDER BY bl.crossed_at DESC
       LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    )

    const countParams = params.slice(0,-2)
    const { rows: cr } = await pool.query(
      `SELECT COUNT(*) AS total FROM border_logs bl ${where}`, countParams
    )

    res.json({ logs: rows, total: parseInt(cr[0].total), page: +page })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch border logs' })
  }
})

// ── POST /api/border-logs  ────────────────────────────────────
//    Records crossing AND auto-screens against watchlist
router.post('/', async (req, res) => {
  const { passport_number, traveler_name, crossing_type, border_point } = req.body

  if (!passport_number || !crossing_type || !border_point) {
    return res.status(400).json({ error: 'passport_number, crossing_type, and border_point are required' })
  }

  try {
    // ── Watchlist screening ──────────────────────────────────
    const { rows: hits } = await pool.query(
      `SELECT id, identifier_type, identifier_value, risk_level, source
       FROM watchlist
       WHERE is_active = true AND (
         (identifier_type = 'passport'    AND UPPER(identifier_value) = UPPER($1)) OR
         (identifier_type = 'name'        AND traveler_name IS NOT NULL AND UPPER($2) ILIKE '%' || UPPER(identifier_value) || '%')
       )`,
      [passport_number, traveler_name || '']
    )

    const flagged   = hits.length > 0
    const riskLevel = hits.length ? hits.reduce((highest, h) => {
      const order = { watch: 1, alert: 2, arrest: 3 }
      return order[h.risk_level] > order[highest] ? h.risk_level : highest
    }, 'watch') : null

    const { rows } = await pool.query(
      `INSERT INTO border_logs
         (passport_number, traveler_name, crossing_type, border_point, status, risk_level, officer_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [passport_number.toUpperCase(), traveler_name || null, crossing_type, border_point,
       flagged ? 'flagged' : 'clear', riskLevel, req.user.id]
    )

    const log = rows[0]

    // Audit if flagged
    if (flagged) {
      await pool.query(
        `INSERT INTO audit_log (actor_id, action, entity_type, entity_id, payload, ip_address)
         VALUES ($1,'flag_crossing','border_log',$2,$3,$4)`,
        [req.user.id, log.id, JSON.stringify({ passport_number, risk_level: riskLevel, watchlist_hits: hits }), req.ip]
      )
    }

    res.status(201).json({
      log,
      screening: {
        flagged,
        risk_level: riskLevel,
        watchlist_hits: hits
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to record crossing' })
  }
})

// ── GET /api/border-logs/stats  ──────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE DATE(crossed_at AT TIME ZONE 'Africa/Kigali') = CURRENT_DATE) AS today_total,
        COUNT(*) FILTER (WHERE DATE(crossed_at AT TIME ZONE 'Africa/Kigali') = CURRENT_DATE AND crossing_type = 'entry') AS today_entries,
        COUNT(*) FILTER (WHERE DATE(crossed_at AT TIME ZONE 'Africa/Kigali') = CURRENT_DATE AND crossing_type = 'exit')  AS today_exits,
        COUNT(*) FILTER (WHERE DATE(crossed_at AT TIME ZONE 'Africa/Kigali') = CURRENT_DATE AND status = 'flagged')      AS today_flagged
      FROM border_logs
    `)
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

module.exports = router
