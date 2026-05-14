# SafeHaven Integrated Web App

SafeHaven is a complete Domestic Violence Reporting and Support System with a React frontend and Node.js/Express backend.

## Run The Project

### 1) Start backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:4000`.

### 2) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Demo Login Credentials

- Victim: `victim@safehaven.test` / `Victim@123`
- Support Staff: `staff@safehaven.test` / `Staff@123`
- Admin: `admin@safehaven.test` / `Admin@123`

## Implemented Features (SRS-aligned)

- JWT authentication flow: signup, login, session restore, logout
- Protected routes and dashboard access control
- Role-based experience:
  - Victim dashboard (reporting, profile, feedback, support, status tracking)
  - Support Staff/Admin dashboard (incident queue and status updates)
- Incident reporting connected to backend API
- Case status tracking connected to backend statuses
- Profile editing connected to backend profile endpoint
- Feedback submission connected to backend feedback endpoint
- Support request submission connected to backend support endpoint
- Resource library backed by seeded resources
- Seeded demo data for users, reports, resources, notifications
- SMS/email simulation via backend logs
- Responsive layout and accessible feedback regions for success/error states
- User-friendly error handling for auth, validation, permission, and network failures

## Non-Functional Coverage

- Fast responses with API timeout and lightweight pages (<10s target)
- Secure feel through JWT auth, protected APIs, helmet, and rate limiting
- Reliable startup using seeded SQLite database and graceful API error messages
- Responsive UI for desktop/tablet/mobile
- Clear navigation and feedback across authentication and dashboard flows
# SafeHaven Reporting & Support System

Integrated full-stack web app for secure domestic violence reporting, case tracking, and support coordination.

## Tech Stack

- Frontend: React + Vite + React Router + Axios
- Backend: Node.js + Express + JWT auth
- Data: In-memory seeded demo data for quick testing

## Quick Start

```bash
npm run install:all
npm run dev
```

Apps:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`

## Demo Credentials

- Victim  
  - Email: `victim@safehaven.test`
  - Password: `Victim@123`
- Support Staff  
  - Email: `staff@safehaven.test`
  - Password: `Staff@123`
- Admin  
  - Email: `admin@safehaven.test`
  - Password: `Admin@123`

## Implemented Features (SRS Coverage)

- Full auth flow: signup, login, token-based session, protected dashboard routes
- JWT persisted in `localStorage`, API auth via `Authorization: Bearer <token>`
- Role-based UI:
  - Victim dashboard: report incident, case tracking, profile update, feedback, support request, resources
  - Staff/Admin dashboard: incident queue and case status updates, support request form, resources
- Report incident flow with success feedback and status timeline tracking
- Profile edit flow connected to backend persistence (session memory)
- Feedback and support request submission with user-friendly confirmations
- Realistic seeded demo data:
  - Accounts for victim/staff/admin
  - Preloaded reports and resources
- SMS/Email simulation:
  - Incident submission and support tickets log simulated notifications in backend console
- User-friendly error handling:
  - Clear API validation and auth errors
  - Timeout and generic fallback messaging
  - Unauthorized session reset handling
- Responsive, accessible, calming visual design:
  - Mobile-friendly layout, readable contrast, clear form labels, structured navigation

## Reliability & Non-Functional Notes

- API timeout configured at 10s to satisfy fast-response expectation
- Clear route guards and auth checks to provide secure-feel access control
- Minimal setup and deterministic demo credentials for reliable first-run testing

## Available API Endpoints

- Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- Profile: `GET /api/profile`, `PUT /api/profile`
- Reports: `GET /api/reports`, `POST /api/reports`, `PATCH /api/reports/:id/status`
- Other: `POST /api/feedback`, `POST /api/support-requests`, `GET /api/resources`, `GET /api/dashboard/stats`
