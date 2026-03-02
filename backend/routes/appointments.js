const router = require('express').Router()
const pool   = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

router.use(authenticate)

// ── GET /api/appointments  (own appointments) ─────────────────
router.get('/', async (req, res) => {
  try {
    const isStaff = ['officer','supervisor','admin'].includes(req.user.role)
    const { rows } = isStaff
      ? await pool.query(
          `SELECT ap.*, u.full_name AS applicant_name, u.email AS applicant_email
           FROM appointments ap
           JOIN users u ON u.id = ap.user_id
           WHERE ap.is_cancelled = false
           ORDER BY ap.appointment_date, ap.time_slot`)
      : await pool.query(
          `SELECT * FROM appointments WHERE user_id = $1 AND is_cancelled = false ORDER BY appointment_date, time_slot`,
          [req.user.id])

    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' })
  }
})

// ── GET /api/appointments/slots?date=YYYY-MM-DD&location=...  ─
// Returns array of booked time slots for a given date + location
router.get('/slots', async (req, res) => {
  const { date, location } = req.query
  if (!date || !location) {
    return res.status(400).json({ error: 'date and location are required' })
  }
  try {
    const { rows } = await pool.query(
      `SELECT time_slot FROM appointments
       WHERE appointment_date = $1 AND location = $2 AND is_cancelled = false`,
      [date, location]
    )
    res.json({ booked: rows.map(r => r.time_slot) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slots' })
  }
})

// ── POST /api/appointments ────────────────────────────────────
router.post('/', requireRole('applicant'), async (req, res) => {
  const { location, appointment_date, time_slot } = req.body
  if (!location || !appointment_date || !time_slot) {
    return res.status(400).json({ error: 'location, appointment_date and time_slot are required' })
  }

  // Validate date is in the future
  if (new Date(appointment_date) <= new Date()) {
    return res.status(400).json({ error: 'Appointment date must be in the future' })
  }

  try {
    // Check slot is not already taken
    const conflict = await pool.query(
      `SELECT id FROM appointments WHERE appointment_date = $1 AND location = $2 AND time_slot = $3 AND is_cancelled = false`,
      [appointment_date, location, time_slot]
    )
    if (conflict.rows.length) {
      return res.status(409).json({ error: 'This time slot is already booked. Please choose another.' })
    }

    const { rows } = await pool.query(
      `INSERT INTO appointments (user_id, location, appointment_date, time_slot)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, location, appointment_date, time_slot]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to book appointment' })
  }
})

// ── DELETE /api/appointments/:id  (cancel) ────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE appointments SET is_cancelled = true
       WHERE id = $1 AND ($2::user_role IN ('officer','supervisor','admin') OR user_id = $3)
       RETURNING id`,
      [req.params.id, req.user.role, req.user.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found or forbidden' })
    res.json({ message: 'Appointment cancelled' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel appointment' })
  }
})

module.exports = router
