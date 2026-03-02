-- ============================================================
--  BPMS RWANDA — PostgreSQL Schema
--  Run: psql -U postgres -d bpms_rwanda -f schema.sql
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUMS ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role       AS ENUM ('applicant','officer','supervisor','admin');
  CREATE TYPE app_type        AS ENUM ('passport','visa','renewal','emergency');
  CREATE TYPE app_status      AS ENUM ('pending','under_review','approved','rejected','cancelled');
  CREATE TYPE crossing_type   AS ENUM ('entry','exit');
  CREATE TYPE crossing_status AS ENUM ('clear','flagged');
  CREATE TYPE risk_level      AS ENUM ('watch','alert','arrest');
  CREATE TYPE watchlist_type  AS ENUM ('passport','national_id','name');
  CREATE TYPE payment_method  AS ENUM ('mtn_momo','bank_card','on_arrival');
  CREATE TYPE payment_status  AS ENUM ('pending','paid','failed','refunded');
  CREATE TYPE doc_type        AS ENUM ('passport_photo','nid_front','nid_back','birth_certificate','supporting');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ── USERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  national_id   VARCHAR(20)   UNIQUE,               -- null for staff
  phone         VARCHAR(20),
  date_of_birth DATE,
  gender        VARCHAR(10),
  place_of_birth VARCHAR(100),
  role          user_role     NOT NULL DEFAULT 'applicant',
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- ── APPOINTMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location        VARCHAR(120)  NOT NULL,
  appointment_date DATE         NOT NULL,
  time_slot       VARCHAR(10)   NOT NULL,               -- e.g. "09:00"
  is_cancelled    BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date, location);

-- ── APPLICATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       VARCHAR(20)   NOT NULL UNIQUE,        -- APP-2026-XXXX
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            app_type      NOT NULL,
  status          app_status    NOT NULL DEFAULT 'pending',
  date_of_birth   DATE,
  place_of_birth  VARCHAR(100),
  gender          VARCHAR(10),
  notes           TEXT,
  rejection_note  TEXT,
  officer_id      UUID          REFERENCES users(id),   -- assigned officer
  internal_note   TEXT,
  appointment_id  UUID          REFERENCES appointments(id),
  payment_method  payment_method,
  payment_status  payment_status NOT NULL DEFAULT 'pending',
  payment_amount  NUMERIC(10,2) NOT NULL DEFAULT 55000,  -- RWF
  permit_url      TEXT,                                  -- generated QR/permit
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_user     ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status   ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_type     ON applications(type);
CREATE INDEX IF NOT EXISTS idx_applications_officer  ON applications(officer_id);
CREATE INDEX IF NOT EXISTS idx_applications_ref      ON applications(reference);

-- ── DOCUMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID          NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  doc_type        doc_type      NOT NULL,
  file_name       VARCHAR(255)  NOT NULL,
  file_path       VARCHAR(512)  NOT NULL,
  file_size       INTEGER,
  mime_type       VARCHAR(80),
  uploaded_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_app ON documents(application_id);

-- ── BORDER LOGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS border_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_number VARCHAR(30)   NOT NULL,
  traveler_name   VARCHAR(120),
  crossing_type   crossing_type NOT NULL,
  border_point    VARCHAR(100)  NOT NULL,
  status          crossing_status NOT NULL DEFAULT 'clear',
  risk_level      risk_level,                            -- set if flagged
  officer_id      UUID          NOT NULL REFERENCES users(id),
  crossed_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_border_passport  ON border_logs(passport_number);
CREATE INDEX IF NOT EXISTS idx_border_status    ON border_logs(status);
CREATE INDEX IF NOT EXISTS idx_border_crossed   ON border_logs(crossed_at DESC);

-- ── WATCHLIST ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_type watchlist_type NOT NULL,
  identifier_value VARCHAR(120)  NOT NULL,
  risk_level      risk_level    NOT NULL,
  source          VARCHAR(120)  NOT NULL,               -- INTERPOL, RIB, etc.
  reason          TEXT,
  added_by        UUID          REFERENCES users(id),
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watchlist_value  ON watchlist(identifier_value);
CREATE INDEX IF NOT EXISTS idx_watchlist_active ON watchlist(is_active);

-- ── AUDIT LOG (everything logged) ────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID          REFERENCES users(id),
  action          VARCHAR(80)   NOT NULL,               -- 'approve_app','flag_crossing', etc.
  entity_type     VARCHAR(40)   NOT NULL,               -- 'application','border_log', etc.
  entity_id       UUID,
  payload         JSONB,
  ip_address      VARCHAR(45),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor     ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity    ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON audit_log(created_at DESC);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','applications'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_%1$s ON %1$s;
       CREATE TRIGGER trg_updated_%1$s BEFORE UPDATE ON %1$s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at();', t);
  END LOOP;
END $$;

-- ── REFERENCE SEQUENCE ────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS app_ref_seq START 43 INCREMENT 1;
