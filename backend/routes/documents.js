const router   = require('express').Router()
const path     = require('path')
const fs       = require('fs')
const multer   = require('multer')
const pool     = require('../db')
const { authenticate } = require('../middleware/auth')

router.use(authenticate)

// ── Multer disk storage ───────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads', req.params.appId)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname)
    const name = `${req.body.doc_type || 'document'}-${Date.now()}${ext}`
    cb(null, name)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    cb(allowed.includes(file.mimetype) ? null : new Error('Only JPEG, PNG, PDF allowed'), allowed.includes(file.mimetype))
  }
})

// ── POST /api/documents/:appId ────────────────────────────────
router.post('/:appId', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const { doc_type = 'supporting' } = req.body

  try {
    // Verify applicant owns this application
    const { rows: apps } = await pool.query(
      'SELECT id FROM applications WHERE id = $1 AND (user_id = $2 OR $3 IN (\'officer\',\'supervisor\',\'admin\'))',
      [req.params.appId, req.user.id, req.user.role]
    )
    if (!apps.length) return res.status(403).json({ error: 'Application not found or forbidden' })

    const { rows } = await pool.query(
      `INSERT INTO documents (application_id, doc_type, file_name, file_path, file_size, mime_type)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.appId, doc_type, req.file.originalname,
       req.file.path, req.file.size, req.file.mimetype]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to save document record' })
  }
})

// ── GET /api/documents/:appId/:docId/download ─────────────────
router.get('/:appId/:docId/download', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND application_id = $2',
      [req.params.docId, req.params.appId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Document not found' })

    const doc = rows[0]
    if (!fs.existsSync(doc.file_path)) {
      return res.status(410).json({ error: 'File no longer exists on server' })
    }
    res.download(doc.file_path, doc.file_name)
  } catch (err) {
    res.status(500).json({ error: 'Download failed' })
  }
})

module.exports = router
