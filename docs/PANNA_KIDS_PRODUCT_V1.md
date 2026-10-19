# Panna Kids — first sales journey

## Implemented scope

`/products/panna-kids` is an additive product page and five-step preference configurator using the existing GAMEFIELDS Studio visual language. Product → appearance → scope → site → summary. `/products/panna-kids/inquiries` is the administrator inbox. Existing Studio/Builder, Objects, PLAY/Radar, engineering and commercial tools remain available.

The page presents three studio renders authored from the actual supplied GLB, an optional orbit/zoom/pan GLB view, live panel-color changes, source-measured evidence, draft persistence, shareable snapshots, a downloadable text brief and a server inquiry flow. Fixed source geometry is never resized; changing a color is a material change only. No radius/size slider or invented module compatibility is introduced.

On 2026-10-17 the owner explicitly allowed public GLBs, superseding the earlier website withdrawal for this product. `public/products/panna-kids/panna-kids.glb` is byte-identical to the supplied `panna-kids-o1.glb`. This browser model is downloadable by design. Other source-gallery assets are still withheld; the standalone export uses an explicit four-file allowlist and does not copy the private library.

## Evidence and specification limits

Run `python3 scripts/models/panna_kids_evidence.py` to reproduce `lib/products/panna-kids-evidence.json` from the original GLB and its audited catalogue.

- SHA-256: `1b3a58dff0e5b2edcdb6a6f53acd1ae0438147e8422b5e33237be9c9239a4c34`.
- Source geometry contains 172 meshes.
- Full imported bounding box: 6.002 × 6.623 × 1.516 m. Includes protruding components and supports; this is not the playing diameter or a manufacturing drawing.
- Source-name groups: PO1 × 6, PO2 × 4, PO3 × 2, BR1 × 2, S1 × 8, high PO2 posts × 4.
- Group descriptions follow source names/extras, including low panels, passages, headers and goals. Grouping is a scene inventory, not a manufacturing BOM or certified SKU mapping.
- Authored sheet metadata says 2 mm; a frame material name says powder-coated steel. These are source annotations, not material certification, measured mass, verified coating specification or load capacity.
- Production dimensions, usable diameter, actual materials, mass, connectors, anchors, ground requirements, safety approval, finish availability and supplier price remain unconfirmed.

Color choices and surface options are preferences for discussion. The 3D panel material changes color, but the studio renders remain the original base appearance. Neither the GLB nor the generic circular engine constitutes an approved Panna Kids structural design. Engineer Gate is always required.

## Proposed commercial target

The owner requested a price proposal. `PANNA_KIDS_TARGET` is an explicit, unapproved `BUDGETARY_DEFAULT` sales target:

- Proposed base construction supply target: **PLN 24,900 net**.
- Excludes surfacing, site preparation/foundations, transport, site installation and project engineering.
- No discount, confirmed catalogue price, market-price claim or final quote is implied. Preferences carry no fabricated surcharges.
- Illustrative target gross margin: 30%, reused as a provisional planning assumption from the existing commercial defaults. At this selling target, the all-in cost of the included scope must not exceed **PLN 17,430 net**: `24,900 × (1 − 0.30)`.
- Actual cost is unknown. The cost ceiling is a reverse-pricing constraint, not an estimate. It must cover the included fabrication/procurement, finish, workshop labor, packaging, overhead and risk allowance before claiming the margin.
- Validate the target against a manufacturing BOM and current supplier/workshop quotes. VAT treatment and final commercial conditions must be established for the transaction.

One shared price label drives the page and brief. The server records the commercial-policy snapshot with each inquiry. Bump the catalogue version for future changes that alter quote interpretation. Nothing can be ordered or auto-approved through this flow.

## Data and persistence

The strict versioned contract in `lib/products/panna-kids.ts` accepts only Panna Kids preferences and project identity/revision. Unknown client fields such as `priceNetPln`, dimensions or engineering approval are rejected. Server-side data determines the commercial snapshot.

`gamefields:panna-kids:projects:v1` stores up to five named drafts in the current browser. Users explicitly save; edits are marked as unsaved. Reload restores the latest saved draft. New sketches use distinct UUIDs. Schema validation rejects incompatible stored/shared data. Storage errors are visible, with brief download as a fallback. This is browser persistence, not an authenticated cross-device customer account.

Shared links encode one immutable version of preferences, including city/project name. Dedicated contact-form fields never enter the link, browser drafts or brief. Brief download does not submit an inquiry. The UI explains these distinctions.

## Server inquiry and administrator access

`POST /api/products/panna-kids/inquiries` validates origin, JSON, payload size (16 KiB), project schema, contact details and acknowledgment. It atomically saves configuration, contact and commercial snapshot to D1. Success is shown only after persistence, with a reference tied to the submitted revision. Later draft edits cannot change the stored snapshot. Stable submission IDs make retries idempotent, including after an ambiguous network failure; conflicting payloads return 409. An atomic per-email limit permits five new inquiries per hour while preserving successful retries.

Missing/unmigrated storage returns 503, never a fake success. No automatic email is sent. Client requests time out after 30 seconds and preserve the draft and retry identity.

`GET` on the same endpoint requires the existing verified GAMEFIELDS administrator role and returns the latest 50 inquiries. Anonymous users receive 401; authenticated non-admins receive 403. No public read-by-reference or customer data endpoint is introduced. The inbox renders stored text as React text and does not auto-send messages or approve engineering.

Apply `drizzle/0011_panna_kids_inquiries.sql` to the target D1 database using the existing controlled migration process before production inquiry collection. Database migrations in tests affect ephemeral local databases only. Configure the existing administrator identity policy before staff access. No production database has been migrated by this task.

## Public Pages review versus application

Public entry: `https://damianryh.github.io/gamefields-os/?view=panna-kids`.

`pnpm build:modular:review` exports the same product component with a relative asset base and `inquiryEndpoint={null}`. GitHub Pages has no server/database endpoint. Therefore the public version deliberately displays a brief-download handoff rather than a fake submission form or contact collection. It includes model/color review, local drafts and shared snapshots. The full application route exposes the tested server form when deployed with its D1 migration.

Existing modular and source-review links remain functional; the static router also supports history navigation. The deployment verifies the public Panna Kids GLB hash and three WebP renders; old withheld source/component URLs remain 404.

## Asset reproduction

With Blender 4.3 and Pillow in the authoring environment:

```sh
blender --background --factory-startup --python scripts/models/render_panna_kids.py
python3 scripts/models/encode_panna_images.py
python3 scripts/models/panna_kids_evidence.py
```

Only image rendering, camera/light/background setup and WebP encoding are applied. Source meshes are not stretched, simplified or replaced. PNG intermediates live in ignored `.sites-runtime/panna-kids-render`; small WebP derivatives are committed. CI consumes committed images and does not require Blender/Pillow.

## Validation and next milestone

- `pnpm exec tsc --noEmit`, scoped ESLint and `pnpm build`.
- `pnpm test:panna-kids`: strict contracts, original GLB identity, source inventory and price/approval assumptions.
- `pnpm test:play`: includes actual D1 inquiry persistence, failure paths, idempotency, validation, rate limit and administrator authorization in addition to the existing 88 PLAY HTTP checks.
- `pnpm test:modular:viewer`: production application journey, native unit scale, color updates, saved/reopened/shared versions, brief download, actual inquiry submission, responsive screenshots and existing modular regressions.
- `pnpm build:modular:review && pnpm test:modular:review`: static product journey without a backend, old asset withdrawal and modular regression checks.

Next: obtain workshop confirmation of the source-to-SKU mapping, nominal dimensions/usable area, allowable assembly rules, interfaces/materials and manufacturing costs; accept or revise the proposed sales target. Then enable confirmed variants, full source-backed geometry/StructuralModel/BOM/cost and a reviewed commercial offer. Production ordering, payments, automatic email, cross-device accounts and delivery tracking are not claimed as implemented.
