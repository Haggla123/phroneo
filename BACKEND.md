# PHRONEO API

The Express API is in `server/` and connects to MongoDB before listening. Configure `MONGODB_URI`, `JWT_SECRET` (unique, at least 32 characters), `PORT`, and `FRONTEND_URL` in the root `.env` for local development or in the deployment environment. The API rejects weak/missing JWT secrets at startup.

Install from the repository root with `npm install`. Provision the initial administrator once using `ADMIN_EMAIL`, `ADMIN_PASSWORD` (10+ characters), and `MONGODB_URI`, then run `npm run admin:create`. The script refuses to create a second initial administrator. Never commit secrets or retain the initial password in a production environment.

Start locally with `npm run server:dev`; production uses `npm run server`. The health endpoint is `GET /api/health` on the configured API port. The API uses Helmet, JSON payload limits, rate limits on login and submissions, and CORS restricted to `FRONTEND_URL`.

## Routes

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API liveness |
| GET | `/api/programs` | Public | List programs |
| GET | `/api/programs/:slug` | Public | Read one program |
| POST/PUT/DELETE | `/api/programs` and `/api/programs/:slug` | Admin JWT | Program management |
| GET | `/api/team` and `/api/team/:id` | Public | Read team |
| POST/PUT/DELETE | `/api/team` and `/api/team/:id` | Admin JWT | Team management |
| POST | `/api/submissions` | Public, rate limited | Submit contact request or community interest |
| GET | `/api/submissions` | Admin JWT | List at most 500 matching requests |
| PATCH | `/api/submissions/:id/status` | Admin JWT | Update request status |
| DELETE | `/api/submissions/:id` or `/api/submissions` | Admin JWT | Delete one or all requests |
| POST | `/api/submissions/:id/resend-email` | Admin JWT | Retry delivery of a contact request to the current recipient |
| GET/PUT | `/api/settings/contact-delivery` | Admin JWT | Read or update the contact form recipient email |
| POST | `/api/settings/contact-delivery/test` | Admin JWT | Send a delivery test to the saved recipient |
| GET | `/api/settings/legal-pages` | Public | Read approved/draft legal copy and its status |
| PUT | `/api/settings/legal-pages` | Admin JWT | Save Privacy Policy and Impressum content; approval is rejected while required fields or draft markers remain |
| GET | `/api/stories` | Public | List only published participant stories |
| GET | `/api/stories/admin` | Admin JWT | List all stories, including drafts |
| POST | `/api/stories` | Admin JWT | Create a story with recorded publication consent |
| PUT/DELETE | `/api/stories/:id` | Admin JWT | Update or remove a story |
| POST | `/api/auth/login` | Public, rate limited | Obtain 24-hour token |
| GET | `/api/auth/verify` | Bearer token | Verify current admin |
| GET/POST/DELETE | `/api/auth/admins` and `/api/auth/admins/:id` | Admin JWT | Manage admin accounts |

Admin APIs require `Authorization: Bearer <token>`. There is no public admin registration or password reset endpoint. Team and program images are stored as URLs or optimized data URLs. The current JSON request limit is 10 MB.

`npm run seed:programs` upserts records from `public/content/programs.json` by slug; it does not delete other records. It requires a configured database and should still be run only against the intended environment.

The frontend reads `VITE_API_URL` from the root `.env` because Vite is configured with `envDir: '..'`; only variables prefixed `VITE_` are exposed to the client bundle.

Contact request email delivery uses `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`; `SMTP_FROM_EMAIL` is optional. For Gmail use `smtp.gmail.com` with port `587` and a Google App Password. Keep the app password in the private server environment and never commit it. `CONTACT_RECIPIENT_EMAIL` is the initial recipient, and admins can change the active recipient through the authenticated `/api/settings/contact-delivery` endpoint. The value is persisted in MongoDB. Contact submissions are stored even if SMTP is unavailable, and an admin can retry delivery after fixing SMTP. The admin settings page has an authenticated test-email action.
