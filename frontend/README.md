# BPMS Rwanda — Frontend

**Border and Passport Management System**  
Rwanda Directorate General of Immigration and Emigration (DGIE)

---

## Demo Logins

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Citizen  | any email              | any password |
| Officer  | uwase@dgie.gov.rw      | any password |
| Admin    | admin@dgie.gov.rw      | any password |

---

## Features

**Citizen Portal**
- Multi-step application form (Passport, Visa, Renewal, Emergency)
- Document upload with drag-and-drop
- Appointment booking with time slot picker
- MTN Mobile Money and bank card payment
- Real-time application status tracking
- Digital permit download (QR code)

**Officer / Admin Portal**
- Applications dashboard with search and filter
- Approve / reject applications with confirmation flows
- Border crossing recording with automatic watchlist screening
- Security watchlist management (add / remove entries)
- Analytics dashboard with charts and officer performance
- Role-based access control (Officer → Supervisor → Admin)

---

## Tech Stack

- React 18
- React Router v6
- Vite 5
- Vanilla CSS (CSS variables, no external framework)

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

---

## Deploy to Vercel

### Option A — GitHub + Vercel (Recommended)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import the GitHub repository
4. Vercel auto-detects Vite — click **Deploy**
5. Your app is live in ~2 minutes

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel
```

---

## Project Structure

```
src/
├── context/          AuthContext, ToastContext
├── data/             mockData.js (all mock data in one file)
├── components/
│   ├── ui/           Button, Badge, Card, Input, Select, Modal, Stat, EmptyState
│   ├── layout/       Navbar, AdminSidebar
│   └── shared/       BarChart, PieChart, StepBar
├── pages/
│   ├── auth/         Login (login + register + forgot)
│   ├── portal/       CitizenDashboard, Apply, Status, Appointments
│   └── admin/        AdminDashboard, Applications, BorderLogs, Analytics, Watchlist
└── App.jsx           All routes and layouts
```

---

## Notes for the Developer

- All data is currently **mocked** in `src/data/mockData.js`
- Replace with real Supabase calls once the backend is ready
- The `AuthContext` simulates login — replace with `supabase.auth.signInWithPassword()`
- `vercel.json` handles SPA routing (all paths redirect to `index.html`)

---

*University of Rwanda — Computer Science Department*  
*Supervisors: MR. Idi KAJEGUHAKWA*  
*Students: BARAKA Johnson (222021186) · KARENZI MUCYO David (222021192)*
