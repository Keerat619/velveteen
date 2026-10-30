# Velveteen — handmade flowers & keepsakes

A React + Vite adaptation of the original 8B Moth & Marigold florist template. The page keeps its editorial one-page structure, typography hierarchy, whitespace, sticky hero, image compositions, responsive layouts and GSAP/ScrollTrigger/Lenis motion while changing the identity and content for Velveteen's handmade pipe-cleaner flowers, custom bouquets and gifts.

The original template remains available in [`reference/`](reference/), including the complete source HTML and its original project notes.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
npm run preview
```

## Enquiry form

The form creates a copyable enquiry draft by default. Once the studio's real email is known, set `VITE_CONTACT_EMAIL` in `.env` to have the form open a pre-addressed email draft:

```bash
cp .env.example .env
# Add the studio email to VITE_CONTACT_EMAIL in .env
```

There is deliberately no invented phone number, address, pricing or social profile in the page. Add the real studio contact details and confirmed product prices before publishing.

## Project structure

- `src/components/SiteChrome.jsx` — responsive navigation and footer
- `src/components/sections.jsx` — reusable, template-shaped page sections
- `src/data/siteContent.js` — product, gallery, process and FAQ content
- `src/motion.js` — GSAP, ScrollTrigger and Lenis setup; keeps the original scene selectors and scroll choreography
- `src/styles.css` — original template CSS layers, with Velveteen palette and wordmark adjustments
- `public/images/` — local pipe-cleaner flower product photos
- `reference/moth-and-marigold-original.html` — untouched original HTML source

## Photo note

The current product photographs are locally stored illustrative images surfaced from third-party product/tutor pages, with source links in [`CREDITS.md`](CREDITS.md). They depict chenille-stem/pipe-cleaner flowers rather than fresh flowers. Confirm reuse rights or replace them with Velveteen-owned product photography before commercial launch.
