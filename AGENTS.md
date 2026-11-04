# Velveteen project guide

This is a Vite + React adaptation of the original 8B Moth & Marigold one-page florist template. The original HTML, template notes and license/credits are preserved under `reference/`. Keep the recognizable editorial layout and interactions while rebranding for handmade pipe-cleaner/chenille-stem flowers.

## Run and verify

```bash
npm install
npm run dev
npm run build
```

Before finishing UI work, verify a production build and check desktop/mobile behavior, keyboard navigation, reduced motion, all anchors, and the custom-request/API flow. For backend changes, run `npm run test:backend`; a local build/test does not verify a live Atlas integration.

## Design and structure to preserve

- Preserve the original section order: opening, seasonal feature, work/gallery, horizontal story, standing orders, events, process, studio sessions, notes, FAQ, contact and footer. Keep the large whitespace, image proportions, type scale, sticky/scroll compositions, hover states, responsive breakpoints and overall pacing.
- Keep all existing `id`, `data-8b-section`, `data-8b-motion` and `data-8b-part` hooks. The GSAP selectors are intentionally close to the original; keep them synchronized with the component markup.
- Motion scene hooks: `scene:dusk` uses `.op__night`, `.op__photo`, `.op__w--1`, `.op__w--2`, `.op__and`, `.op__statement` and `.op__ribbon`; `scene:bench` uses `.bench__ph`, `.bench__row`, `.bench__name` and `.bench__rows`; `scene:drift` uses `.work__grid` and `.work__item`; `scene:hours` uses `.dusk__run`, `.dusk__stage`, `.dusk__track`, `.dusk__panel`, `.dusk__hour` and `.dusk__ph`; `scene:gather` uses `.ev__board` and `.ev__ph`; `scene:miles` uses `.gr__row`, `.gr__rows`, `.gr__pin` and `.gr__line`; `scene:letter` uses `.nt__frame` and `.nt__letter`; `scene:card` uses `.ct__card` and `.ct__room`; `scene:mark` uses `.ft__mark`, `.ft__rect`, `.ft__dome` and `.ft__bar`.
- `src/styles.css` is adapted from the original sectioned CSS. Keep the `data-8b-part` markers and adjust tokens before changing individual compositions. The current palette is warm ivory/blush `#efddd3`, deep burgundy `#32191e`, dusty rose `#c9858b`, and burgundy `#79384c`.
- Keep local Fontsource imports in `src/main.jsx`; avoid replacing the template's typography hierarchy with generic defaults.
- Use `src/data/siteContent.js` for copy and `src/components/sections.jsx` / `SiteChrome.jsx` for reusable sections and site chrome. Motion setup is in `src/motion.js`; the opening observer and setup lifecycle are in `src/hooks/useMotion.js`.
- Navigation, footer and all page links should remain usable. The homepage custom-request form submits through the validated API and is stored privately for owner review. Do not imply that an email is sent or a request is accepted until a separate, real notification/confirmation flow exists. Never invent studio contact details.
- The 27 product images are in `public/images/`. Every image must have appropriate alt text and retain its template placement/aspect ratio. Current third-party image sources and rights caveat are documented in `CREDITS.md`.
- Reduced motion must disable GSAP/Lenis animation while keeping all content and links available.

## Content and launch safety

- The public-facing business details are not supplied. Do not invent an address, city, phone, email, social account, opening hours, prices, shipping area, workshop schedule, delivery promise, product availability, sustainability claim, past clients or production capacity.
- Keep product language specific to handmade pipe-cleaner/chenille-stem flowers, bouquets, roses, tulips, sunflowers, craft sessions and personalized gifts. Do not substitute ordinary fresh-flower photography or turn the page into a generic marketplace grid.
- The current photos are search-derived illustrative assets, not confirmed licensed brand photography. Confirm rights or replace them with owned/licensed photographs before public or commercial use; see `CREDITS.md`.
- Do not remove the template attribution, generator metadata or license notices. Preserve the original project in `reference/`.
