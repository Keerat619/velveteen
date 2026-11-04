# Velveteen — handmade flowers & keepsakes

Velveteen is an existing React + Vite storefront for handmade pipe-cleaner/chenille-stem flowers. The full-stack integration keeps the original one-page site, its editorial layout, typography, responsive compositions, GSAP/ScrollTrigger choreography and Lenis scrolling, and adds backend-powered product browsing, a local shopping bag, checkout, custom-order requests and a private owner dashboard.

The original template remains available in [`reference/`](reference/), including its source HTML and project notes. The third-party image-source and rights caveat is documented in [`CREDITS.md`](CREDITS.md); confirm reuse rights or replace the illustrative images before commercial launch.

## Stack

- Frontend: React, Vite, React Router, Axios, GSAP/ScrollTrigger and Lenis
- API: Node.js, Express, Mongoose, express-validator and JWT owner authentication
- Database: MongoDB Atlas
- Payments: Cash on Delivery or Manual Payment selection only. The site does not collect card details or process online payments.

## Local development

Requirements: Node.js `>=20.19.0` and npm.

1. Install frontend dependencies and prepare backend environment:

   ```bash
   npm install
   cp backend/.env.example backend/.env
   ```

2. Fill in `backend/.env` with an Atlas `MONGO_URI`, a random `JWT_SECRET` of at least 32 characters, and a valid owner setup username/email/password. Use a replica-set-capable MongoDB deployment: checkout reserves finite stock and writes orders in a MongoDB transaction.

3. Install backend dependencies and start the API in a terminal:

   ```bash
   npm run backend:install
   npm run backend:dev
   ```

4. In another terminal, run the Vite site:

   ```bash
   npm run dev
   ```

   Vite serves the site on port 5173 and proxies `/api` to `http://127.0.0.1:5000` by default. Set `VITE_PROXY_TARGET` if the local API uses a different address. `VITE_API_URL` defaults to `/api`; keep API URLs relative in browser code.

5. Create the first owner account once, after the database is configured:

   ```bash
   npm run admin:create
   ```

   The script reads `ADMIN_USERNAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `backend/.env`, hashes the password, and refuses to create another account if one already exists. Remove the temporary `ADMIN_PASSWORD` value afterwards. There is no public admin registration. Sign in at `/admin/login`.

6. Add the studio's real catalogue from **Admin → Products**. Prices are stored in MongoDB and re-read by the API when an order is placed. Do not create purchasable products with placeholder or invented prices. Product images may use `/images/...` paths or secure HTTPS URLs. Leave stock blank when it is not tracked; finite stock is reserved atomically at checkout.

The site intentionally contains no invented product prices, owner credentials or studio contact details. With no database configured, the storefront remains viewable but will report that the catalogue/API is unavailable; checkout and persistent requests require a working backend and MongoDB connection.

## Environment files

- `.env.example`: browser-exposed Vite settings. Only variables prefixed with `VITE_` are bundled into the frontend; never put secrets here.
- `backend/.env.example`: private API/database, JWT, currency, CORS and one-time owner bootstrap settings. Never commit either `.env` file.
- `VITE_CURRENCY` is a display fallback. The API's `CURRENCY` controls product and order currency; configure them consistently.

## Features and access

- `/products` and `/products/:id`: active products loaded from the public API.
- `/cart` and `/checkout`: browser-persisted bag, customer/delivery form, and COD/manual-payment choice. The browser submits product IDs and quantities only; MongoDB product prices are the source of truth.
- `/order-confirmation/:orderNumber`: confirmation summary. If opened directly or refreshed, the customer must also enter the checkout email to look up the order.
- The homepage custom-request form posts to the API and is stored for owner review. This is an enquiry, not a paid order or a promise of availability or delivery.
- `/admin/login` and `/admin/dashboard`: owner-only JWT-protected order/custom-request management, status updates, dashboard counts and product CRUD. Customer order and request details are not exposed by public list APIs.

No card number, CVV or online-payment credentials are requested or stored. For Manual Payment, the studio shares any payment instructions after confirming the order; no transfer is initiated by this site.

## Tests and build

```bash
npm run build
npm run test:backend
npm audit --prefix backend
```

The backend test suite covers server-trusted order pricing, cart normalization, order-state transitions, health reporting and anonymous access restrictions. A production build and these unit/API checks do not replace a live Atlas checkout test.

## Deployment outline

### Frontend on Vercel

- Root directory: repository root
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to the deployed API base URL, for example `https://<your-api>.onrender.com/api` (no trailing slash required).
- Add a Vercel SPA rewrite to `/index.html` so deep links such as `/products/:id` and `/admin/dashboard` survive refreshes.
- Never put MongoDB or JWT credentials in Vercel's `VITE_*` variables.

### API on Render

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Set `NODE_ENV=production`, `MONGO_URI`, a long random `JWT_SECRET`, `CURRENCY`, and `CLIENT_URL` to the exact deployed frontend origin(s), comma-separated if necessary. Render supplies `PORT`.
- Confirm `GET /api/health` reports `database: connected` after deployment.
- Run the one-time owner bootstrap from the backend service shell/job with temporary `ADMIN_USERNAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment values, then remove the password value. Do not add public signup routes.

### MongoDB Atlas

Create a database user with least-required privileges, use a replica-set-capable Atlas cluster, and allow the Render service to reach the cluster through Atlas Network Access. Avoid a broad `0.0.0.0/0` rule when a narrower production policy is possible. Keep the URI, JWT secret and owner password private.

Set `CLIENT_URL` to the exact Vercel origin (and any real custom frontend origin) so the API CORS allowlist remains narrow. After deployment, test product CRUD, COD/manual order creation, stock reservation/cancellation, custom-request submission, admin access control and the health endpoint against the real database before launch.

## Project structure

- `src/components/sections.jsx`, `SiteChrome.jsx`, `PublicFrame.jsx` — original home sections and shared public chrome
- `src/pages/` — catalog, product, cart, checkout, confirmation and admin pages
- `src/context/` and `src/services/` — browser cart/session state and Axios API client
- `src/motion.js`, `src/hooks/useMotion.js` — preserved GSAP/ScrollTrigger/Lenis motion lifecycle
- `backend/src/models/` — Product, Order, CustomOrder and Admin schemas
- `backend/src/services/orderService.js` — server-trusted pricing, order persistence and stock handling
- `backend/src/routes/`, `controllers/`, `middleware/` — public and owner-protected API
- `public/images/` — locally stored illustrative flower images; review [`CREDITS.md`](CREDITS.md)
