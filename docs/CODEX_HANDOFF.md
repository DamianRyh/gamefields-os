# GAMEFIELDS — Codex handoff

Updated 2026-10-12 on `feat/gamefields-modular-product-v12`.

This handoff was reconstructed from the user's brief, `GAMEFIELDS-PRODUCT-CONTINUITY.md` and the checked-out implementation. The requested handoff/principles files were absent from the starting branch; no earlier milestone record was available there.

## Current milestone

Modular Product v1.2 is implemented with a single pure transaction in `app/engineering/modular-pipeline.ts`. API `/api/engineering/modular` and the live viewer `/engineering/modular-3d` call the same generator. A change produces geometry → product layout → independent 3D instances → structural model → BOM → component budget. No court mesh is resized along X/Y. Rectangle sliders step through 1.5 m bays; the generic circle resolves requested diameter by segment count.

- Goals/gates replace perimeter slots; branding is a panel variant.
- Rectangular corners are separate connector instances.
- Ballstop nets and separate prototype upper-post segments are reflected in scene, structural height and BOM.
- Structural ground rails do not cross goal/gate openings; headers carry goal/gate roles. Their sections and assumed fixed supports are provisional, not certified connection designs.
- All responses require Engineer Gate; approval is always false.
- Default component budgets retain BUDGETARY_DEFAULT provenance. Upper-post pricing reuses the existing provisional post allowance, explicitly disclosed. Surfacing, foundations, logistics and engineering are not included.

## Component Library v1.0

`component-library.ts` defines 12 catalogue contracts and unique stable asset keys. `/engineering/components` and `/api/engineering/components` expose the registry. Each scene instance resolves to a catalogue component id. GLB/PBR contracts specify metre units, Z-up and bottom-centred origin. Instance dimensions remain PROTOTYPE_BOUNDS, not instructions to stretch future GLBs.

Final dimensions, connection locations, weights, materials and GLB URLs are null/UNCONFIRMED/NOT_SUPPLIED. Compatibility lists are conceptual only. Unpriced equipment is not silently added to the BOM. Adding a GLB requires confirmed physical fit and validated connection interfaces; load/clone it via the asset key without changing Modular Geometry Engine.

## Validation

- `pnpm exec tsc --noEmit`
- `pnpm test:modular`: 54 configuration combinations, replacement/opening invariants, counts, structural heights, BOM/scene/cost parity, growth, API schema validation, safety and registry contracts.
- `pnpm test:modular:viewer`: serves the production build through a local Worker, exercises live controls, growth/removal, API validation, registry and responsive layouts. Uses `CHROMIUM_PATH` if supplied, otherwise system Chromium when available or Playwright's installed browser.
- `pnpm build`
- `pnpm test:play`, `pnpm test:mobile`, `pnpm build:objects`, `pnpm test:objects` preserve regression coverage.

New catalogue navigation uses document links because the current vinext production Link/prefetch runtime throws errors; the production viewer test covers this transition.

CI contains the modular engine/viewer checks and screenshot artifact. Verify remote CI before any merge. Do not auto-merge.

## Next unfinished milestone

Supply and integrate confirmed GAMEFIELDS component specifications and GLB/PBR assets, followed by engineer-reviewed opening/header, corner and upper-layer connections. Do not manufacture missing dimensions, capacities, ground parameters, supplier prices or approvals. The current circle is generic and is not Damian's exact Panna product.

Existing Studio/Builder, Objects, Radar/PLAY, Engineering/Frame3D/Eurocode/Stability, connections/foundations, Optimizer/Generator, costing/proposals, events and showroom directions remain additive and preserved.

## Public review distribution

`pnpm build:modular:review` creates a self-contained `dist/modular-review/index.html` from the same viewer and catalogue. `pnpm test:modular:review` validates the static distribution without backend/API calls. The `GAMEFIELDS Modular Public Preview` workflow publishes this artifact via GitHub Pages from the v1.2 feature branch, without merging or changing gamefields.eu.

Pages must first be enabled in repository Settings → Pages → Source: GitHub Actions. If disabled, the workflow validates/uploads the downloadable HTML and skips deployment with a warning. The connected app cannot enable Pages (GitHub returned HTTP 403 for the settings mutation); a repository administrator must enable it. Rerun the preview workflow after the setting changes. An existing github-pages environment must allow the feature branch and any required environment reviewers must approve deployment; do not remove protection rules to bypass review.

## 2026-10-13 — actual Blender source assets

Three uploaded GLBs and twelve rigidly normalized assemblies are preserved in `assets/private/gamefields/`; see `SOURCE_COMPONENTS.md`. Native-model viewer `/engineering/source-models` and the public `?view=source` review use GLTFLoader with authored materials. A K1 repeat study uses source-observed ~2.06 m placement with independent unit-scale instances. Curved source modules are not forced into the generic 1.5 m polygon system. Actual geometry is available; production compatibility, connection positions, dimensions and pricing remain unconfirmed/UNPRICED. `pnpm test:source-components` audits originals, component identities, rigid transform geometry conservation and provenance. Next milestone is confirmed manufacturing/connection rules before a full source-backed court/StructuralModel/BOM/price pipeline.

## Three-court model collection

The source-model page presents P1, Panna Kids O1 and W1 as three selectable court variants, preserving component and K1 study tools. Direct public selection: `?view=source&model=boisko-w1`. Selection updates the shareable URL and survives reload. These are source-backed model previews; pricing and production specifications remain unconfirmed. No whole-model resizing or engineering approval is introduced.

## Native-model configurator integration

P1, Panna Kids O1 and W1 can be selected in `/engineering/modular-3d` itself. Native mode embeds source geometry, twelve component assemblies and K1 repetition while hiding unrelated prototype budget/structure/dimension controls. The conceptual system and its complete existing pipeline remain intact, including state on switching back. Public deep link: `?view=viewer&product=boisko-w1`. Browser tests cover all three actual GLBs, reload selection, native K1 unit-scale growth and return to the conceptual pipeline. Full native manufacturing configuration still requires confirmed connection and assembly rules; do not substitute placeholder costs or assert an approved full-court design.

## Public model withdrawal — 2026-10-13

At the owner's request, native GLBs are withheld from the public website. Files are stored outside `public/` in `assets/private/gamefields/`; this is a packaging boundary, not GitHub access control. `NATIVE_MODELS_PUBLIC` is false, native product choices are hidden, source-review routes display an unavailable message, and the static build removes its model directory (including stale copies). CI verifies all fifteen former public GLB URLs return 404. The conceptual configurator remains available. Original native viewer and component logic are retained for future authenticated delivery.

The owner explicitly chose to keep GitHub public for now. Files and their history remain downloadable on GitHub; previously downloaded copies cannot be recalled. Do not claim models are confidential or protected by merely removing a download button. Re-enabling the browser viewer would again deliver model bytes to clients.

## 2026-10-17 — Panna Kids sales journey v1

See `PANNA_KIDS_PRODUCT_V1.md`. The owner now permits public GLBs and requested extracting existing product data plus a proposed price. A dedicated Panna Kids page uses original geometry, three studio renders, live panel color, source evidence, saved browser drafts, shared versions, brief download and an immutable inquiry snapshot in D1. The unapproved PLN 24,900 net base-construction target is explicitly BUDGETARY_DEFAULT; its 30% illustrative gross-margin target requires costs ≤ PLN 17,430, not an established production cost. No confirmed manufacturing dimensions, capacities or final quote are invented.

Panna Kids alone is explicitly exported at `/products/panna-kids/panna-kids.glb`; the old source gallery remains off. Public Pages entry `?view=panna-kids` offers a downloadable brief because Pages cannot persist server inquiries. The production application has a tested D1 form and verified-admin inbox; migration 0011 must be applied to the production database through the existing controlled process. No production DB migration or automatic email occurred. Native model size remains fixed pending confirmed assembly rules. All previous GAMEFIELDS routes/features are preserved.
