# BPMS Rwanda — Complete Project

Border and Passport Management System  
Rwanda Directorate General of Immigration and Emigration (DGIE)

---

## Project Structure

```
bpms-complete/
├── frontend/          React + Vite (deploy to Vercel)
└── backend/           Node.js + Express + PostgreSQL (deploy to Render)
```

---

## Quick Start (Local Development)

### Step 1 — Start the backend

```bash
cd backend
npm install
cp .env.example .env          # then edit .env with your DB credentials

# Create the database (PostgreSQL must be running)
psql -U postgres -c "CREATE DATABASE bpms_rwanda;"
psql -U postgres -d bpms_rwanda -f db/schema.sql
psql -U postgres -d bpms_rwanda -f db/seed.sql

npm run dev                   # API running at http://localhost:4000
```

### Step 2 — Start the frontend

```bash
cd frontend
npm install
# .env.local already points to http://localhost:4000/api
npm run dev                   # App running at http://localhost:5173
```

---

## Demo Login Credentials

| Role       | Email                   | Password     |
|------------|-------------------------|--------------|
| Citizen    | baraka@gmail.com        | Password123! |
| Officer    | uwase@dgie.gov.rw       | Password123! |
| Supervisor | niyonzima@dgie.gov.rw   | Password123! |
| Admin      | admin@dgie.gov.rw       | Password123! |

---

## Production Deployment

1. Deploy `backend/` to **Render** → see `backend/README.md`
2. Deploy `frontend/` to **Vercel** → set `VITE_API_URL` env variable to your Render URL
3. Update `CORS_ORIGIN` in Render to your Vercel frontend URL

---

*University of Rwanda — Computer Science Department*  
*Supervisors: MR. Idi KAJEGUHAKWA*  
*Students: BARAKA Johnson (222021186) · KARENZI MUCYO David (222021192)*
