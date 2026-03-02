-- ============================================================
--  BPMS RWANDA — Seed Data
--  Run AFTER schema.sql
--  psql -U postgres -d bpms_rwanda -f seed.sql
-- ============================================================

-- Passwords are all:  Password123!
-- Hash generated with bcrypt rounds=12

-- ── USERS ───────────────────────────────────────────────────
INSERT INTO users (id, full_name, email, password_hash, national_id, phone, date_of_birth, gender, role) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'BARAKA Johnson',
  'baraka@gmail.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgRmLatdF5h0IIBH.Jy01a',
  '1199880012345678',
  '+250788123456',
  '1988-05-14',
  'male',
  'applicant'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Officer Uwase Marie',
  'uwase@dgie.gov.rw',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgRmLatdF5h0IIBH.Jy01a',
  NULL,
  '+250788000001',
  NULL,
  'female',
  'officer'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Officer Rwema Pierre',
  'rwema@dgie.gov.rw',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgRmLatdF5h0IIBH.Jy01a',
  NULL,
  '+250788000003',
  NULL,
  'male',
  'officer'
),
(
  '44444444-4444-4444-4444-444444444444',
  'Supervisor Niyonzima Jean',
  'niyonzima@dgie.gov.rw',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgRmLatdF5h0IIBH.Jy01a',
  NULL,
  '+250788000004',
  NULL,
  'male',
  'supervisor'
),
(
  '55555555-5555-5555-5555-555555555555',
  'Admin Kalisa Eric',
  'admin@dgie.gov.rw',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgRmLatdF5h0IIBH.Jy01a',
  NULL,
  '+250788000002',
  NULL,
  'male',
  'admin'
),
(
  '66666666-6666-6666-6666-666666666666',
  'KARENZI MUCYO David',
  'karenzi@gmail.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgRmLatdF5h0IIBH.Jy01a',
  '1200010098765432',
  '+250788111222',
  '2000-03-22',
  'male',
  'applicant'
)
ON CONFLICT DO NOTHING;

-- ── APPOINTMENTS ─────────────────────────────────────────────
INSERT INTO appointments (id, user_id, location, appointment_date, time_slot) VALUES
(
  'aaaa0001-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'DGIE Headquarters, Kigali',
  '2026-03-10',
  '10:00'
)
ON CONFLICT DO NOTHING;

-- ── APPLICATIONS ─────────────────────────────────────────────
INSERT INTO applications (id, reference, user_id, type, status, date_of_birth, place_of_birth, gender, officer_id, appointment_id, payment_status, created_at) VALUES
(
  'bbbb0001-0000-0000-0000-000000000001',
  'APP-2026-0042',
  '11111111-1111-1111-1111-111111111111',
  'passport', 'pending',
  '1988-05-14', 'Kigali', 'male',
  NULL,
  'aaaa0001-0000-0000-0000-000000000001',
  'paid',
  '2026-02-28 09:14:00+00'
),
(
  'bbbb0002-0000-0000-0000-000000000002',
  'APP-2026-0038',
  '66666666-6666-6666-6666-666666666666',
  'visa', 'approved',
  '2000-03-22', 'Musanze', 'male',
  '22222222-2222-2222-2222-222222222222',
  NULL,
  'paid',
  '2026-02-25 11:00:00+00'
),
(
  'bbbb0003-0000-0000-0000-000000000003',
  'APP-2026-0011',
  '11111111-1111-1111-1111-111111111111',
  'visa', 'approved',
  '1988-05-14', 'Kigali', 'male',
  '22222222-2222-2222-2222-222222222222',
  NULL,
  'paid',
  '2026-01-10 08:30:00+00'
),
(
  'bbbb0004-0000-0000-0000-000000000004',
  'APP-2026-0003',
  '11111111-1111-1111-1111-111111111111',
  'renewal', 'rejected',
  '1988-05-14', 'Kigali', 'male',
  '22222222-2222-2222-2222-222222222222',
  NULL,
  'refunded',
  '2025-12-05 14:00:00+00'
),
(
  'bbbb0005-0000-0000-0000-000000000005',
  'APP-2026-0014',
  '11111111-1111-1111-1111-111111111111',
  'emergency', 'pending',
  '1988-05-14', 'Kigali', 'male',
  NULL,
  NULL,
  'paid',
  '2026-02-10 07:00:00+00'
)
ON CONFLICT DO NOTHING;

-- ── BORDER LOGS ───────────────────────────────────────────────
INSERT INTO border_logs (passport_number, traveler_name, crossing_type, border_point, status, officer_id, crossed_at) VALUES
('PA3847291', 'Mugisha Robert',   'entry', 'Kigali International Airport', 'clear',   '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '4 hours'),
('UK9283746', 'Smith James T.',   'entry', 'Kigali International Airport', 'flagged', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '3h45m'),
('PA2938471', 'Uwimana Claire',   'exit',  'Gatuna Border Post',           'clear',   '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '3h'),
('PA1827364', 'Habimana Patrick', 'entry', 'Cyanika Border Post',          'clear',   '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2h30m'),
('CN4728193', 'Zhang Wei',        'entry', 'Kigali International Airport', 'clear',   '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '2h');

-- ── WATCHLIST ─────────────────────────────────────────────────
INSERT INTO watchlist (identifier_type, identifier_value, risk_level, source, reason, added_by, created_at) VALUES
('passport',    'UK9283746',        'alert',  'INTERPOL',     'Suspected international fraud. INTERPOL Red Notice #I-2024-00183.', '44444444-4444-4444-4444-444444444444', '2026-01-15'),
('name',        'Hassan Al-Rashid', 'watch',  'RIB',          'Under surveillance for financial crimes. Contact RIB before processing.',       '44444444-4444-4444-4444-444444444444', '2026-02-01'),
('national_id', '1199010098765432', 'arrest', 'Rwanda Police','Outstanding warrant for identity document forgery. Arrest on sight.',            '44444444-4444-4444-4444-444444444444', '2025-12-20');

-- ── SET SEQUENCE ──────────────────────────────────────────────
SELECT setval('app_ref_seq', 43, true);
