# PHRONEO website and admin dashboard

React/Vite client, Express API, and MongoDB database. German is the default language; English is available.

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`. Configure `MONGODB_URI`, a unique random `JWT_SECRET` (at least 32 characters), `FRONTEND_URL`, and the frontend `VITE_API_URL`.
3. Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` (at least 10 characters), then run `npm run admin:create` once. The guarded command refuses to create an admin if one already exists. Remove `ADMIN_PASSWORD` after setup.
4. Start MongoDB, then start the API with `npm run server:dev` and the website with `npm run dev`.

The API health endpoint is `GET /api/health`. The frontend is at `http://localhost:5173`; admin sign-in is at `/admin`.

To email contact requests through Gmail, use `smtp.gmail.com` on port `587`, the sender mailbox, and its Google App Password in the server's private environment. Never commit or share that password. Admins can change the recipient and send a test message under **Admin → Site settings**. Requests remain available in the admin inbox if SMTP is not configured.

## Checks and production build

- `npm test` runs the server-side input validation tests.
- `npm run build` produces the static frontend in `dist/`.
- `npm run preview` serves the built frontend locally.
- `npm run server` starts the API; set `NODE_ENV=production` and production environment variables in the deployment environment.

## Content and CMS

- Program fallback content: `public/content/programs.json`. `npm run seed:programs` upserts those records and preserves records not in the JSON file.
- Page copy: `client/src/locales/de.js` and `client/src/locales/en.js`.
- Team fallback content: `public/content/team.json`.
- Decap CMS config: `public/admin/config.yml`. CMS publishing is not operational until a Git provider and authentication backend are configured for the chosen host.
- Stories are managed in **Admin → Stories editor**. Enter both German and English text, record the participant's explicit publication consent, then choose whether to publish. Drafts are not returned by the public site API.
- Privacy Policy and Impressum are managed in **Admin → Site settings** and saved in MongoDB for all visitors. They remain visibly marked as drafts until an administrator completes and reviews them; editing a page clears its reviewed state.

## Release blockers / required owner input

- Complete and legally review the draft Privacy Policy and Impressum in **Admin → Site settings** before collecting personal data or launch. The privacy draft contains placeholders for controller identity, legal bases, production providers/transfers, retention, and the competent supervisory authority.
- Confirm donation eligibility language and provide verified bank/payment details. The site now directs visitors to Contact instead of displaying unverified account details.
- Confirm that the program descriptions, team bios/photos, and testimonials are genuine and approved for publication. Do not present sample testimonials as real.
- Configure production `VITE_API_URL`, `MONGODB_URI`, a unique `JWT_SECRET`, and an exact `FRONTEND_URL`; use HTTPS and a managed database with backups.
- Configure CMS authentication or remove/disable CMS access on the production site.
- Run browser/screen-reader accessibility and responsive checks on the intended production host, and agree on data retention/deletion rules for inquiries.

The server limits login and submission requests, applies security headers, validates submissions, and restricts submission list reads to 500 records per request. Admin APIs use a 24-hour JWT held in session storage; production deployment should use HTTPS.
