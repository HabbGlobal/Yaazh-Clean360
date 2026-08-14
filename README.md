# Yaazh Clean360

Smart waste collection scheduling application. The Next.js client lives in `client/`; the Express and MongoDB API lives in `server/`.

## Run locally

1. Copy `server/.env.example` to `server/.env`, set `MONGODB_URI` and a strong `JWT_SECRET`.
2. Copy `client/.env.local.example` to `client/.env.local` if the API does not run at `http://localhost:5000/api`.
3. Install dependencies in both folders: `npm.cmd install`.
4. Seed the five zones from `server`: `npm.cmd run seed:zones`.
5. Start the API: `npm.cmd run dev` in `server`, then start the UI with `npm.cmd run dev` in `client`.

Replace the five SVG placeholders in `client/public/images/zones/` with the supplied zone images and update the seeded `imageUrl` values if their file extensions change.
