const router = require('express').Router()
const pool   = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

router.use(authenticate)
router.use(requireRole('supervisor','admin'))

// ── GET /api/analytics/summary ────────────────────────────────
router.get('/summary', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'approved')     AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected')     AS rejected,
        COUNT(*) FILTER (WHERE status = 'pending')      AS pending,
        COUNT(*) FILTER (WHERE status = 'under_review') AS under_review,
        ROUND(
          COUNT(*) FILTER (WHERE status = 'approved')::numeric /
          NULLIF(COUNT(*) FILTER (WHERE status IN ('approved','rejected')), 0) * 100, 1
        ) AS approval_rate,
        ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) FILTER (
          WHERE status IN ('approved','rejected')
        ), 1) AS avg_processing_hours
      FROM applications
    `)
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary' })
  }
})

// ── GET /api/analytics/applications-per-day ───────────────────
router.get('/applications-per-day', async (req, res) => {
  try {
    const { days = 7 } = req.query
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(d, 'YYYY-MM-DD') AS date,
        TO_CHAR(d, 'Dy') AS day,
        COALESCE(cnt, 0) AS count
      FROM generate_series(
        CURRENT_DATE - INTERVAL '${parseInt(days) - 1} days',
        CURRENT_DATE, INTERVAL '1 day'
      ) d
      LEFT JOIN (
        SELECT DATE(created_at) AS app_date, COUNT(*) AS cnt
        FROM applications
        GROUP BY app_date
      ) x ON x.app_date = d
      ORDER BY d
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch daily data' })
  }
})

// ── GET /api/analytics/by-type ────────────────────────────────
router.get('/by-type', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT type, COUNT(*) AS count
      FROM applications
      GROUP BY type ORDER BY count DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch type breakdown' })
  }
})

// ── GET /api/analytics/by-status ──────────────────────────────
router.get('/by-status', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM applications
      GROUP BY status ORDER BY count DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status breakdown' })
  }
})

// ── GET /api/analytics/officers ───────────────────────────────
router.get('/officers', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        u.full_name AS officer,
        COUNT(*)                                       AS reviewed,
        COUNT(*) FILTER (WHERE a.status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE a.status = 'rejected') AS rejected,
        ROUND(AVG(EXTRACT(EPOCH FROM (a.updated_at - a.created_at)) / 3600), 1) AS avg_hours
      FROM applications a
      JOIN users u ON u.id = a.officer_id
      WHERE a.status IN ('approved','rejected')
        AND a.officer_id IS NOT NULL
      GROUP BY u.id, u.full_name
      ORDER BY reviewed DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch officer stats' })
  }
})

// ── GET /api/analytics/border-crossings-per-day ───────────────
router.get('/border-per-day', async (req, res) => {
  try {
    const { days = 7 } = req.query
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(d, 'YYYY-MM-DD') AS date,
        TO_CHAR(d, 'Dy') AS day,
        COALESCE(SUM(cnt),0) AS count
      FROM generate_series(
        CURRENT_DATE - INTERVAL '${parseInt(days) - 1} days',
        CURRENT_DATE, INTERVAL '1 day'
      ) d
      LEFT JOIN (
        SELECT DATE(crossed_at) AS cdate, COUNT(*) AS cnt
        FROM border_logs GROUP BY cdate
      ) x ON x.cdate = d
      GROUP BY d ORDER BY d
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch border data' })
  }
})

module.exports = router
