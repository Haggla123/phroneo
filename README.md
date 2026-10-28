# PHRONEO – Website and admin dashboard
Frontend: React + Vite + React Router + react-i18next. Backend: Express + MongoDB. German default, English available.

## Run locally
1. Copy `.env.example` to `.env` and set `MONGODB_URI`, a unique `JWT_SECRET`, and `VITE_API_URL` for your environment.
2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` for the initial admin, then run `npm run admin:create` once. The initial account is provisioned on the server; there is no public admin registration page.
3. Remove the initial admin password from `.env` after provisioning.
4. Start the API with `npm run server:dev` and the website with `npm run dev`.

After signing in at `/admin`, an administrator can add or remove other admin accounts in **Admin accounts**. Admin passwords are hashed by the server. Program and submission changes are stored in MongoDB and shared with public visitors.

Run `npm run build` to create the production frontend in `dist/`.

## Edit content
- **Programs** (dates, texts, images, DE/EN): `public/content/programs.json`, or via Decap CMS at `/admin` (`public/admin/config.yml`).
  The CMS is NOT live until you set a Git repo + auth (GitHub OAuth proxy or Netlify Identity/Git Gateway). Page copy lives in `src/locales/{de,en}.js` – not CMS-editable yet (next step: move into CMS file collections).
- **Impressum data**: `src/config.js` (unfilled fields show a red "[ANGABE ERFORDERLICH]").

## NOT done / must be supplied
- **Legal**: Privacy Policy is an outline only; Impressum needs real data. Have both reviewed by a German-law professional.
- **Photos**: none included; placeholders are marked. Use authentic, licensed images (+ alt text) in the CMS.
- **Forms**: submissions are stored by the API in MongoDB. Review retention and access controls before collecting real personal data.
- **Fonts**: system serif/sans stack (no Google Fonts → avoids GDPR issues). For brand fonts, self-host via `@fontsource`.
- **Copy**: all text is draft, program data is sample. Bible text: pick a licensed translation before quoting.
- **SEO limits**: titles/meta set client-side per route; for strong indexing add prerendering (e.g. vite-plugin-ssr / react-snap), `/de` `/en` URL prefixes with hreflang, sitemap.xml, robots.txt, OG image.
- **Hosting**: needs SPA fallback (`public/_redirects` covers Netlify/Cloudflare Pages).
- **QA**: not browser- or screen-reader-tested here; run Lighthouse/axe and test with NVDA/VoiceOver. Gold (#C7A86C) is used on navy only; on cream, text uses a darker gold (#7a5f25).

## v1.1 – design + brand
Homepage follows the approved mockup. Logo files in `public/brand/` were extracted from the supplied JPEG (transparent PNG, approximate): **please send the original vector (SVG/AI/PDF) to replace them.**
**Fonts:** Cormorant Garamond + Inter are bundled locally via @fontsource (no Google servers, GDPR-friendly).
Bible texts: Luther 1912 (DE) and KJV (EN), both public domain.
