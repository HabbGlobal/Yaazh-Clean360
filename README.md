# Yaazh Clean360 

Smart waste collection scheduling application for a Pradesa Sabha municipality. Residents track their collection day, assigned lorry, readiness voting, complaints and service rating; administrators manage zones, schedules and service feedback.

The project is a two-part monorepo:
 
| Folder   | Stack                                                   | Default port |
| -------- | ------------------------------------------------------- | ------------ |
| `client` | Next.js 16 (App Router), React 19, GSAP / three / ogl   | 3000         |
| `server` | Express 5, TypeScript (tsx), MongoDB + Mongoose, JWT     | 5000         |

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
- **MongoDB** — a local instance (`mongod`) on `127.0.0.1:27017`, or a MongoDB Atlas URI
- **npm** (any recent version)

---

## Step-by-step setup

### 1. Install dependencies

Open two terminals — one for the API, one for the web app — and install both packages:

```bash
# Terminal 1 — API
cd server
npm install

# Terminal 2 — Web app
cd client
npm install
```

### 2. Start MongoDB

Make sure a MongoDB server is running and reachable, for example:

```bash
mongod --dbpath ./data/db
```

Or use a hosted database (Atlas) and put its connection string in `MONGODB_URI` in the next step.

### 3. Configure and run the API (`server`)

Create the environment file and open it in an editor:

```bash
cd server
cp .env.example .env
```

Minimum required values:

| Variable           | Purpose                                              | Example                                             |
| ------------------ | ---------------------------------------------------- | --------------------------------------------------- |
| `PORT`             | API port                                             | `5000`                                              |
| `MONGODB_URI`      | MongoDB connection string                            | `mongodb://127.0.0.1:27017/yaazh-clean360`          |
| `JWT_SECRET`       | Secret used to sign session tokens (use a long random value) | `replace-with-a-long-random-secret`          |
| `CLIENT_ORIGIN`    | Allowed web-app origin for CORS                      | `http://localhost:3000`                             |
| `EMAIL_USER`       | Gmail address used to send OTP emails                | `your-gmail-address@gmail.com`                      |
| `EMAIL_APP_PASSWORD` | Gmail 16-character **app password**                | *(see the Email notes below)*                       |
| `EMAIL_FROM`       | Sender shown in emails                               | `Yaazh Clean360 <your-gmail-address@gmail.com>`     |
| `ADMIN_EMAIL`      | Seeded admin email                                   | `Admin@yaazh360.com`                                |
| `ADMIN_PASSWORD`   | Seeded admin password                                | `Admin@#1805`                                       |

Seed the database (five zones with their base64 map images, and the administrator account):

```bash
npm run seed:zones
npm run seed:admin
```

Start the API:

```bash
npm run dev
```

The API listens on `http://localhost:5000`; the health check is at `http://localhost:5000/health` (expect `{"status":"ok"}`).

> Without `EMAIL_USER`/`EMAIL_APP_PASSWORD` the sign-up verification and password-reset flows will fail with *"Email service is not configured"*. The seeded admin account already has `emailVerified: true`, so admin login works without email.

### 4. Configure and run the web app (`client`)

Create the client environment file (only needed if the API is not at `http://localhost:5000/api`):

```bash
cd client
cp .env.local.example .env.local
```

`NEXT_PUBLIC_API_URL` defaults to `http://localhost:5000/api` when unset.

Start the web app:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### 5. Sign in

Use the seeded administrator account to access the admin workspace:

| Field    | Value              |
| -------- | ------------------ |
| Email    | `Admin@yaazh360.com` |
| Password | `Admin@#1805`      |

After logging in, an administrator is sent to `/admin`. Residents (who have selected a zone) go to `/dashboard`.

---

## Common scripts

### `server`

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the API with auto-reload (tsx watch)     |
| `npm run build`     | Compile TypeScript to `dist/`                  |
| `npm start`         | Run the compiled API (`node dist/server.js`)   |
| `npm run seed:zones`| Upsert the five zones with base64 images       |
| `npm run seed:admin`| Upsert the administrator account               |

### `client`

| Command        | Description                            |
| -------------- | -------------------------------------- |
| `npm run dev`  | Start the Next.js dev server (port 3000) |
| `npm run build`| Production build                        |
| `npm start`    | Serve the production build              |
| `npm run lint` | Run the linter                          |

---

## Project structure

```
client/
  app/            # App Router pages (/, /login, /signup, /dashboard, /admin, ...)
  components/     # Landing, common, auth, dashboard and admin components
  assets/         # Static images (logo, favicon, zone maps, welcome image)
  lib/            # API client, auth storage, types
server/
  src/
    app.ts        # Express app + route mounting
    server.ts     # Entry point
    config/       # Database connection
    controllers/  # Request handlers
    models/       # Mongoose schemas (User, Zone, Schedule, Complaint, Vote, Feedback)
    routes/       # /api/auth, /api/users, /api/zones, /api/schedules, /api/resident, /api/admin
    seeds/        # seedZones.ts, seedAdmin.ts
    validators/   # Zod schemas
    middleware/   # Auth + error handling
```

---

## Notes

- **Email / OTP** — the server sends verification and reset codes through Gmail. Create an [app password](https://support.google.com/accounts/answer/185833) for your Gmail account and put it in `EMAIL_APP_PASSWORD` (do **not** use your normal Gmail password). Until configured, the seeded admin can still log in.
- **Zone images** — `npm run seed:zones` reads the zone map images from `client/assets/images/` (e.g. `Zone01-RB9593.png`) and stores them base64-encoded inside the `Zone` documents, so the client renders them without extra HTTP requests.
- **Favicon** — served from `client/assets/favicon.jpg` via the app metadata in `client/app/layout.tsx`.

---

## Troubleshooting

| Problem                                            | Fix                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `Cannot connect to MongoDB`                        | Start `mongod` (or a Docker/Atlas instance) and check `MONGODB_URI`.                             |
| Page loads but data says "Unable to load"          | Confirm the API is running and `NEXT_PUBLIC_API_URL` in `client/.env.local` points to it.         |
| Sign-up says *"Email service is not configured"*   | Add `EMAIL_USER` and `EMAIL_APP_PASSWORD` to `server/.env`.                                      |
| `401` on resident/admin pages                      | You are signed out — log in again; tokens are stored in browser local storage.                   |
| Zone cards are blank                               | Re-run `npm run seed:zones` after placing the zone images in `client/assets/images/`.            |