const router = require('express').Router()
const pool   = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

// All routes require auth
router.use(authenticate)

// ── Helper: generate next reference ──────────────────────────
async function nextRef() {
  const { rows } = await pool.query("SELECT nextval('app_ref_seq') AS n")
  return `APP-${new Date().getFullYear()}-${String(rows[0].n).padStart(4, '0')}`
}

// ── Shared select fragment ────────────────────────────────────
const SELECT_APP = `
  SELECT
    a.id, a.reference, a.type, a.status,
    a.date_of_birth, a.place_of_birth, a.gender, a.notes,
    a.rejection_note, a.internal_note,
    a.payment_method, a.payment_status, a.payment_amount,
    a.permit_url,
    a.created_at, a.updated_at,
    u.id  AS user_id,   u.full_name AS applicant_name,   u.national_id,   u.email AS applicant_email,
    o.id  AS officer_id, o.full_name AS officer_name,
    ap.appointment_date, ap.time_slot, ap.location AS appointment_location
  FROM applications a
  JOIN  users u  ON u.id = a.user_id
  LEFT  JOIN users o  ON o.id = a.officer_id
  LEFT  JOIN appointments ap ON ap.id = a.appointment_id
`

// ── GET /api/applications  ─────────────────────────────────────
//    Citizen: own apps only  |  Staff: all apps + filters
router.get('/', async (req, res) => {
  try {
    const { status, type, search, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    const params = []
    const conds  = []

    if (req.user.role === 'applicant') {
      params.push(req.user.id)
      conds.push(`a.user_id = $${params.length}`)
    }

    if (status) { params.push(status); conds.push(`a.status = $${params.length}`) }
    if (type)   { params.push(type);   conds.push(`a.type   = $${params.length}`) }
    if (search) {
      params.push(`%${search}%`)
      conds.push(`(u.full_name ILIKE $${params.length} OR a.reference ILIKE $${params.length} OR u.national_id ILIKE $${params.length})`)
    }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
    params.push(limit, offset)

    const { rows } = await pool.query(
      `${SELECT_APP} ${where} ORDER BY a.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )

    const countParams = params.slice(0, -2)
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) AS total FROM applications a JOIN users u ON u.id = a.user_id ${where}`,
      countParams
    )

    res.json({ applications: rows, total: parseInt(countRows[0].total), page: +page, limit: +limit })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch applications' })
  }
})

// ── GET /api/applications/:id ─────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT_APP} WHERE a.id = $1`, [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Application not found' })

    const app = rows[0]
    // Citizen can only see their own
    if (req.user.role === 'applicant' && app.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Fetch documents
    const { rows: docs } = await pool.query(
      'SELECT id, doc_type, file_name, file_size, mime_type, uploaded_at FROM documents WHERE application_id = $1',
      [req.params.id]
    )
    res.json({ ...app, documents: docs })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch application' })
  }
})

// ── POST /api/applications  (citizen only) ────────────────────
router.post('/', requireRole('applicant'), async (req, res) => {
  const { type, date_of_birth, place_of_birth, gender, notes,
          appointment_id, payment_method } = req.body

  if (!type) return res.status(400).json({ error: 'type is required' })

  try {
    const reference = await nextRef()
    const { rows } = await pool.query(
      `INSERT INTO applications
         (reference, user_id, type, date_of_birth, place_of_birth, gender, notes, appointment_id, payment_method)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, reference, type, status, created_at`,
      [reference, req.user.id, type, date_of_birth || null, place_of_birth || null,
       gender || null, notes || null, appointment_id || null, payment_method || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create application' })
  }
})

// ── PATCH /api/applications/:id/status  (staff only) ─────────
router.patch('/:id/status', requireRole('officer','supervisor','admin'), async (req, res) => {
  const { status, rejection_note, internal_note } = req.body
  const VALID_TRANSITIONS = ['under_review','approved','rejected','cancelled']
  if (!VALID_TRANSITIONS.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  if (status === 'rejected' && !rejection_note) {
    return res.status(400).json({ error: 'rejection_note is required when rejecting' })
  }

  try {
    const { rows } = await pool.query(
      `UPDATE applications
       SET status = $1, rejection_note = COALESCE($2, rejection_note),
           internal_note = COALESCE($3, internal_note), officer_id = $4
       WHERE id = $5
       RETURNING id, reference, status, updated_at`,
      [status, rejection_note || null, internal_note || null, req.user.id, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Application not found' })

    // Audit log
    await pool.query(
      `INSERT INTO audit_log (actor_id, action, entity_type, entity_id, payload, ip_address)
       VALUES ($1,$2,'application',$3,$4,$5)`,
      [req.user.id, `${status}_application`, req.params.id,
       JSON.stringify({ status, rejection_note }),
       req.ip]
    )

    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application status' })
  }
})

// ── PATCH /api/applications/:id/assign  (staff) ───────────────
router.patch('/:id/assign', requireRole('officer','supervisor','admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE applications SET officer_id = $1 WHERE id = $2 RETURNING id, reference',
      [req.user.id, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign application' })
  }
})

// ── GET /api/applications/:id/documents ──────────────────────
router.get('/:id/documents', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM documents WHERE application_id = $1',
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' })
  }
})

module.exports = router
