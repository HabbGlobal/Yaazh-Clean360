# Yaazh Clean360

Smart waste collection scheduling application for a Pradesa Sabha municipality. Residents track their collection day, assigned lorry, readiness voting, complaints and service rating; administrators manage zones, schedules and service feedback.

The project is a single **Next.js 16** (App Router) application — the UI and the API both live here, deployed as one Vercel project. API routes under `app/api/**` replace what used to be a separate Express server.

| Layer     | Stack                                                          |
| --------- | --------------------------------------------------------------- |
| Frontend  | Next.js 16 (App Router), React 19, GSAP / three / ogl           |
| API       | Next.js Route Handlers (`app/api/**`), MongoDB + Mongoose, JWT  |
| Email     | Gmail (Nodemailer) for OTP and complaint-status emails          |

---

## Features

- **Public landing page** — animated hero, zone selection deck, feature grid, FAQ and bilingual-ready copy.
- **Resident journey** — sign up → email OTP verification → zone selection → resident dashboard.
- **Resident dashboard** — collection schedule, daily readiness voting (with 7-day history), complaint reporting with photo evidence, service rating and feedback.
- **Admin workspace** — overview stats, zone management, schedule management, complaint inbox, votes and feedback summaries.
- **Authentication** — register, login, JWT session, email OTP verification, password reset via OTP.
- **Email service** — Gmail (Nodemailer) for OTP and complaint-status emails.

---

## Prerequisites

- **Node.js 20.9+** (required by Next.js 16)
- **MongoDB** — a local instance (`mongod`) on `127.0.0.1:27017`, or a hosted database (e.g. **MongoDB Atlas**). A hosted database is required for the Vercel deployment, since Vercel's serverless functions cannot reach a database on your local machine.
- **npm** (any recent version)

---

## Step-by-step setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

| Variable              | Purpose                                                       | Example                                             |
| ---------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| `MONGODB_URI`          | MongoDB connection string                                      | `mongodb://127.0.0.1:27017/yaazh-clean360`          |
| `JWT_SECRET`           | Secret used to sign session tokens (use a long random value)   | `replace-with-a-long-random-secret`                  |
| `EMAIL_USER`           | Gmail address used to send OTP emails                          | `your-gmail-address@gmail.com`                       |
| `EMAIL_APP_PASSWORD`   | Gmail 16-character **app password**                            | *(see the Email notes below)*                        |
| `EMAIL_FROM`           | Sender shown in emails                                         | `Yaazh Clean360 <your-gmail-address@gmail.com>`     |
| `ADMIN_EMAIL`          | Seeded admin email                                              | `Admin@yaazh360.com`                                 |
| `ADMIN_PASSWORD`       | Seeded admin password                                           | `Admin@#1805`                                        |

> `NEXT_PUBLIC_API_URL` is no longer needed — the client calls the API on the same origin (`/api/...`) by default. Set it only if you want to point the frontend at an API hosted elsewhere.

### 3. Start MongoDB

Make sure a MongoDB server is running and reachable, for example:

```bash
mongod --dbpath ./data/db
```

Or use a hosted database (Atlas) and put its connection string in `MONGODB_URI`.

### 4. Seed the database

Seed the five zones (with their base64 map images) and the administrator account:

```bash
npm run seed:zones
npm run seed:admin
```

### 5. Run the app

```bash
npm run dev
```

Open **http://localhost:3000**. The API lives on the same origin at `http://localhost:3000/api`.

### 6. Sign in

Use the seeded administrator account to access the admin workspace:

| Field    | Value              |
| -------- | ------------------ |
| Email    | `Admin@yaazh360.com` |
| Password | `Admin@#1805`      |

After logging in, an administrator is sent to `/admin`. Residents (who have selected a zone) go to `/dashboard`.

---

## Common scripts

| Command             | Description                                    |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Start the Next.js dev server (port 3000)        |
| `npm run build`      | Production build                                |
| `npm start`          | Serve the production build                      |
| `npm run lint`       | Run the linter                                  |
| `npm run seed:zones` | Upsert the five zones with base64 images        |
| `npm run seed:admin` | Upsert the administrator account                |

---

## Project structure

```
app/
  page.tsx, login/, signup/, dashboard/, admin/, ...   # App Router pages
  api/                                                  # Route handlers (the former Express API)
    auth/, users/, zones/, schedules/, resident/, admin/
components/     # Landing, common, auth, dashboard and admin components
assets/         # Static images (logo, favicon, zone maps, welcome image)
lib/            # Client-side API client, auth storage, types, helpers
server/         # Backend logic used only by the API routes
  db.ts         # Cached Mongoose connection (serverless-friendly)
  auth.ts       # JWT auth/role guard for route handlers
  handler.ts    # Error-handling wrapper + body validation helper
  models/       # Mongoose schemas (User, Zone, Schedule, Complaint, Vote, Feedback)
  validators/   # Zod schemas
  utils/        # ApiError, email (Nodemailer), jwt
scripts/        # seedZones.ts, seedAdmin.ts
```

---

## Deploying to Vercel

This is a standard Next.js project, so Vercel auto-detects the build — no `vercel.json` needed.

1. Push this repo to GitHub (if you haven't already) and import it in the [Vercel dashboard](https://vercel.com/new).
2. In the project's **Environment Variables** settings, add: `MONGODB_URI` (a hosted Atlas connection string — a local `mongod` won't be reachable from Vercel), `JWT_SECRET`, `EMAIL_USER`, `EMAIL_APP_PASSWORD`, `EMAIL_FROM`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
3. Deploy. Once live, run the seed scripts once against the production database (e.g. locally with `MONGODB_URI` set to the Atlas URI) so the zones and admin account exist.

---

## Notes

- **Email / OTP** — the app sends verification and reset codes through Gmail. Create an [app password](https://support.google.com/accounts/answer/185833) for your Gmail account and put it in `EMAIL_APP_PASSWORD` (do **not** use your normal Gmail password). Until configured, the seeded admin can still log in (admin login doesn't require email).
- **Zone images** — `npm run seed:zones` reads the zone map images from `assets/images/` (e.g. `Zone01-RB9593.png`) and stores them base64-encoded inside the `Zone` documents, so the client renders them without extra HTTP requests.
- **Favicon** — served from `assets/favicon.jpg` via the app metadata in `app/layout.tsx`.
- **Database connections** — `server/db.ts` caches the Mongoose connection on the global object so repeated serverless invocations (and Next.js dev hot-reload) reuse a single connection instead of opening a new one per request.

---

## Troubleshooting

| Problem                                            | Fix                                                                                              |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------|
| `Cannot connect to MongoDB`                        | Start `mongod` (or a Docker/Atlas instance) and check `MONGODB_URI` in `.env.local`.             |
| Page loads but data says "Unable to load"          | Confirm `MONGODB_URI` is set and the database is reachable.                                       |
| Sign-up says *"Email service is not configured"*   | Add `EMAIL_USER` and `EMAIL_APP_PASSWORD` to `.env.local`.                                       |
| `401` on resident/admin pages                      | You are signed out — log in again; tokens are stored in browser local storage.                   |
| Zone cards are blank                               | Re-run `npm run seed:zones` after placing the zone images in `assets/images/`.                   |
