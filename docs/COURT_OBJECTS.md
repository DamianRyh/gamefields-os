# GAMEFIELDS Court Objects

Frontend-only collectible court artwork configurator at `/objects`. The existing Studio remains available at `/`, with a Court Objects navigation link.

## Development

Use the existing checkout; no additional worktree is needed.

```sh
pnpm install --frozen-lockfile
pnpm dev --host 0.0.0.0
```

Open `http://localhost:5173/objects`.

## Validation

```sh
pnpm exec tsc --noEmit
pnpm exec eslint components/court-objects app/objects tests/court-objects.mjs
pnpm build
node tests/court-objects.mjs
```

The browser test expects the development server on port 5173 and Chromium at `/usr/bin/chromium`. Override with `COURT_OBJECTS_URL` and `CHROMIUM_PATH` if needed. It covers SVG geometry, palettes, composition controls, labels, texture, 12 price combinations, room scale, save/restore, share links in a fresh browser context, local enquiry/order drafts and responsive layouts. Screenshots are written to ignored `outputs/court-objects`. Use `pnpm build:objects` followed by `pnpm test:objects` to validate the standalone WordPress distribution without a development server.

## Structure

- `components/court-objects/data.ts`: curated palettes, layouts, materials, pricing and initial design.
- `components/court-objects/preview.tsx`: procedural sport SVG and CSS interior view.
- `components/court-objects/configurator.tsx`: controls, summary, local persistence and accessible dialogs.
- `app/objects/objects.css`: scoped editorial design and responsive layouts, using the existing Tailwind-enabled app shell.

Saved designs live in `gamefields-designs` and `gamefields-current` in localStorage. Design links contain validated parameters in the `design` URL query parameter and can be restored independently of localStorage. Signal Blue reproduces the blue/off-white/orange art direction alongside the six requested palettes.

## WordPress distribution

`pnpm build:objects` creates `dist/court-objects/gamefields-court-objects.zip`. Install through the WordPress plugin uploader. Activation creates `/court-objects/`, and Settings → Court Objects provides an explicit menu selector. The existing Studio and PLAY are unaffected. See `integrations/wordpress/court-objects/README.md` for installation, conflict handling and rollback. GitHub CI builds and uploads the ZIP after validation; pushing code does not install the plugin on WordPress.

Orders and real-court enquiries are local drafts only. There is no backend, payment collection, email transmission or production checkout. Form details are never included in shared design URLs. Browser storage can be cleared by the user and is not a durable order database.
