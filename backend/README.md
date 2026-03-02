# BPMS Rwanda — Backend API

Node.js + Express REST API with PostgreSQL for the Border and Passport Management System.

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Database**: PostgreSQL 15+
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Security**: helmet, cors, express-rate-limit
- **File uploads**: multer (local disk, swap with S3 for production)

---

## Local Setup

### 1. Prerequisites

```bash
# macOS
brew install postgresql@15 node

# Ubuntu / WSL
sudo apt install postgresql-15 nodejs npm
```

### 2. Create the database

```bash
psql -U postgres
CREATE DATABASE bpms_rwanda;
\q
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET
```

### 4. Install dependencies

```bash
npm install
```

### 5. Initialize & seed the database

```bash
npm run db:setup
# This runs db/schema.sql then db/seed.sql
```

### 6. Start the dev server

```bash
npm run dev
# API is live at http://localhost:4000
# Health check: http://localhost:4000/api/health
```

---

## Deploy to Render (Free Tier)

1. Create a **PostgreSQL** database on [render.com](https://render.com) → copy the Internal Database URL
2. Create a new **Web Service** → connect your GitHub repo (upload `bpms-api/` folder)
3. Set these environment variables in Render:
   - `DATABASE_URL` → the Internal DB URL from step 1
   - `JWT_SECRET` → run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `NODE_ENV` → `production`
   - `CORS_ORIGIN` → `https://your-frontend.vercel.app`
4. Build command: `npm install`  |  Start command: `npm start`
5. After deploy, run seed: use Render's shell or psql from your local machine:
   ```bash
   psql "your_render_db_url" -f db/seed.sql
   ```

---

## Demo Credentials (after seeding)

| Role       | Email                     | Password      |
|------------|---------------------------|---------------|
| Citizen    | baraka@gmail.com          | Password123!  |
| Citizen 2  | karenzi@gmail.com         | Password123!  |
| Officer    | uwase@dgie.gov.rw         | Password123!  |
| Officer 2  | rwema@dgie.gov.rw         | Password123!  |
| Supervisor | niyonzima@dgie.gov.rw     | Password123!  |
| Admin      | admin@dgie.gov.rw         | Password123!  |

---

## API Reference

### Auth
| Method | Path                        | Auth | Description               |
|--------|-----------------------------|------|---------------------------|
| POST   | /api/auth/register          | —    | Register new citizen      |
| POST   | /api/auth/login             | —    | Login, returns JWT        |
| GET    | /api/auth/me                | ✓    | Get current user          |
| POST   | /api/auth/change-password   | ✓    | Change own password       |

### Applications
| Method | Path                              | Auth        | Description              |
|--------|-----------------------------------|-------------|--------------------------|
| GET    | /api/applications                 | ✓           | List (own or all)        |
| POST   | /api/applications                 | applicant   | Submit new application   |
| GET    | /api/applications/:id             | ✓           | Get single + docs        |
| PATCH  | /api/applications/:id/status      | officer+    | Approve / reject         |
| PATCH  | /api/applications/:id/assign      | officer+    | Self-assign              |

### Appointments
| Method | Path                        | Auth      | Description              |
|--------|-----------------------------|-----------|--------------------------|
| GET    | /api/appointments           | ✓         | List own appointments    |
| GET    | /api/appointments/slots     | ✓         | Get booked slots         |
| POST   | /api/appointments           | applicant | Book appointment         |
| DELETE | /api/appointments/:id       | ✓         | Cancel appointment       |

### Border Logs
| Method | Path                        | Auth     | Description              |
|--------|-----------------------------|----------|--------------------------|
| GET    | /api/border-logs            | officer+ | List crossings           |
| POST   | /api/border-logs            | officer+ | Record + auto-screen     |
| GET    | /api/border-logs/stats      | officer+ | Today's stats            |

### Watchlist
| Method | Path                        | Auth        | Description              |
|--------|-----------------------------|-------------|--------------------------|
| GET    | /api/watchlist              | supervisor+ | List active entries      |
| POST   | /api/watchlist              | supervisor+ | Add entry                |
| DELETE | /api/watchlist/:id          | supervisor+ | Remove (soft delete)     |
| POST   | /api/watchlist/screen       | officer+    | Quick screen             |

### Analytics
| Method | Path                              | Auth        |
|--------|-----------------------------------|-------------|
| GET    | /api/analytics/summary            | supervisor+ |
| GET    | /api/analytics/applications-per-day | supervisor+ |
| GET    | /api/analytics/by-type            | supervisor+ |
| GET    | /api/analytics/by-status          | supervisor+ |
| GET    | /api/analytics/officers           | supervisor+ |
| GET    | /api/analytics/border-per-day     | supervisor+ |

### Users (Admin)
| Method | Path                          | Auth  | Description           |
|--------|-------------------------------|-------|-----------------------|
| GET    | /api/users/me                 | ✓     | Own profile           |
| PATCH  | /api/users/me                 | ✓     | Update profile        |
| GET    | /api/users                    | admin | List all users        |
| POST   | /api/users                    | admin | Create staff account  |
| PATCH  | /api/users/:id/toggle-active  | admin | Enable/disable        |
| PATCH  | /api/users/:id/role           | admin | Change role           |

### Documents
| Method | Path                                  | Auth | Description       |
|--------|---------------------------------------|------|-------------------|
| POST   | /api/documents/:appId                 | ✓    | Upload file       |
| GET    | /api/documents/:appId/:docId/download | ✓    | Download file     |

---

## Database Schema

```
users          ──< applications ──< documents
                         │
                    appointments
                         │
                    border_logs ──── (watchlist screening)
                         │
                     watchlist
                         │
                     audit_log
```

All destructive actions (approve, reject, flag, watchlist add/remove) are logged in `audit_log`.

---

## Role Hierarchy

```
applicant < officer < supervisor < admin
```

- **applicant** — submit applications, book appointments, view own data
- **officer** — process applications, record border crossings
- **supervisor** — all officer rights + analytics + watchlist management
- **admin** — full system access + user management
