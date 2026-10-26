# Gamefields homepage — Figma implementation, 26.10.2026

Production: https://www.gamefields.eu/ · WordPress page **3462** · template `templates/page-full.php`.

Design: https://www.figma.com/design/amrUt5HzG9dUqbHeRkeSuS?node-id=36-502 (desktop), node 36:779 (mobile). This is the marketing homepage, not the separate Studio application.

## Source and build

`build.py` composes a scoped Gutenberg custom HTML block from `style.css`, `script.js`, `contact-template.html`, `contact-existing.js`, the existing offer media map, and the bundled Inter font. Run `python3 build.py`; `homepage.html` is the WordPress payload and `index.html` is a local preview shell. The preview shell does not execute WordPress shortcodes; `verify.mjs` uses an authenticated WordPress-rendered QA preview so it can check the actual CF7 fields.

The Figma Button component is a design-library mapping, not a WordPress runtime dependency. Its visual roles are implemented by the shared `.gh-btn` / `.gh-primary` classes. React components in the separate Studio cannot be loaded as Gutenberg page code. Existing product renders, concept images, material photos and tokens were reused; the exact painted pattern SVG was imported to WordPress media **4100**. Inter is embedded from the bundled SIL-OFL font to avoid third-party font requests. Its license is in `assets/Inter-LICENSE.txt`.

## Behavior

- Hero family selection changes the product render and every main Studio link.
- Catalogue contains eight steel constructions; product dialogs provide model-specific Studio links.
- Manual carousel, keyboard-accessible controls, hover/focus card state, native dialogs and focus restoration.
- Structure/surface/design layer preview; separate sports-surface entry; visual direction links pass supported `arena`, `pattern`, `palette`, `variant` query parameters.
- 3D iframe is absent initially and created only on request. It opens the existing Studio on the selected arena, provides an independent fallback link, and is removed on close.
- Existing CF7 form `a71dc3a` and project-detail review/removal remain. Studio inquiry messages validate origin, source, JSON and size before filling the field and acknowledging the request.
- No production-cost figures or markup rates are exposed. Concept images remain explicitly labelled; no unverified portfolio claims.

## Deployment and rollback

Updated existing published page 3462 via the WordPress REST API after draft QA on page **4101**. Final publication: `2026-10-26T13:55:27` as returned by WordPress. Revision **4104** includes the final theme typography correction; revision **4103** is the initial release. The preceding version is revision **4098** (`2026-10-21T20:01:04`); restore it through WordPress Revisions if rollback is needed. A full local backup of the old page is retained in the task output folder, not committed as an unrelated historical page dump. Page URL, SEO fields, template and CF7 delivery settings were retained. Cache purge completed.

WordPress converted an inline `&&` to an HTML entity during draft rendering. The message-handler conditions use equivalent nested guards so the rendered script stays valid.

## Validation

`verify.mjs`: passed at 375, 390, 430, 768 and 1440 px; one H1; no horizontal overflow; model selection and links; eight-item catalogue; dialogs; material image decode; layer selection; mobile menu; contact fields; project query and removal; no JS exceptions.

`verify-live.mjs`: passed against the public WordPress page at 390 and 1440 px, including theme interaction, all image decodes, lazy iframe creation/removal and selected-model routing. Visual checks compared the mobile/desktop top sections with the Figma reference. No test inquiry was sent; email delivery is not reverified by this release. Three-dimensional rendering is provided by the existing Studio rather than a new renderer on the marketing page.

## Panna collection priority — 26.10.2026

Published to page 3462 at `2026-10-26T14:10:31`. Hero defaults to Panna Play and offers six priority families in a compact swipe selector. Product carousel and full catalogue use one explicit order: Panna Play, Panna Court, Panna Cage 90, Panna Cage 180, Panna Octa, Panna Grid, Panna Ring, Street Arena 15. Street Arena 15 is last in both collections and absent from hero shortcuts. Category artwork features Panna Court; modular-system artwork features Panna Grid. Concept presets open Panna Court.

Draft checks passed at five widths; public checks passed at 390/1440 px, including catalogue order, image decoding, 3D selection and contact-field preservation, with no JS errors. Previous production revision 4104 is the rollback point for this update. Results: `verification.json` and `live-verification.json`.
