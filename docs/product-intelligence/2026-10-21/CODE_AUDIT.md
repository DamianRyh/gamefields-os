# Code audit — Sprint 0 / Etap 0, 21.10.2026

## Scope and source authority

Read-only audit; no application edits, rebuild or publication. `Studio/` means `/Users/mac/Documents/Gamefields/work/studio-street15`, HEAD `142391e275bb481b50279949a0ea26599ed251d0`; clean when inspected. Its AGENTS.md requires preserving300patterns,19palettes, sports,hiddenKraków,React19/Vinext/Cloudflare,Zod,JSON and frozen migrations. `Root/` means `/Users/mac/Documents/Gamefields`, HEAD `2ed72e423af22b9204f8faf4bafa4a2d0a78b1ff`, heavily dirty (including old published-studio copies, models and legacy PLAY files); no root AGENTS.md found. `OwnedOS/` is `work/owned-modular`, HEAD `72e8540f81d62743b1808f2a7cc1c47dd78a3309`, also dirty. These are distinct checkouts. Their HEADs alone do not establish current remote production SHA. Do not reset, consolidate or publish the dirty root as the active Studio.

Runtime production browser benchmarking belongs to the parent audit. This report does not assert a fresh live deployment check or verified remote default branch. Previous runtime checks are explicitly historical evidence from the immediately preceding implementation session; fresh checks below are domain-only, not browser tests.

## Fresh evidence (without touching build)

- Studio `node tests/studio-scope.mjs` PASS:300patterns,19palettes,12Signature directions,assets present,Krakówhidden,no retired account calls.
- Studio `node tests/product-names.mjs` PASS:8names,stable IDs/codes,title migration and preservation of custom names/geometry/colours.
- Studio `node tests/studio-ux.mjs` PASS:exact Signature state including custom colours and title-change policy.
- OwnedOS `node tests/owned-modular.mjs` PASS:single-family components,rigidscale,discrete growth,BOM,rejected mixed/unknown assets.

No env secrets or customer projects were inspected. No prices were validated against commercial rates. No real inquiry was sent.

## Architecture that must be preserved

WordPress is the public marketing/catalog/contact layer and embeds/links the separately deployed Studio. Studio is React19/Vinext with a single `Project` plus Zod schema, SVG pattern engine, calibrated photo/homography compositor for generic3x3 and WebGL Blender mesh previews for source arenas. The current editing workspace owns material/pattern/palette/lines/logo parameters in Surface; Graphics manages added objects. The full pattern library is an in-app view, not a separate replacement engine. Radar is its own route pair. Owned modular OS uses its own assembly schema, source component allowlists and BOM, and is not a subtype of the Studio free-position graphics editor. Court Objects has a third, product-specific decorative-object price calculator.

Do not infer deployment authority from names such as published-studio or root app/page.tsx. Root retains legacy PLAY code while active Studio AGENTS retires PLAY. Frozen migrations remain untouched.

## Highest priority findings

1. **Pricing is not live in Studio.** API implementation exists, but `Studio/app/page.tsx:223` comments out the request and clears quote state. Pattern-library copy at347 says prices are calculated after applying a pattern: a confirmed copy/implementation mismatch. Do not enable pricing merely to match the copy; rates,commercial policy and area semantics need owner validation first. API computes area,execution complexity,paint,labour,equipment,logistics,overhead/risk/margin and market floors. Construction/BOM-specific rates and verified regional taxes are not modelled;1.23 VAT is hardcoded.
2. **Dimensions have different meanings across renderers.** Studio plan changes proportions; generic photo preview remains a15×10 calibrated scene (honestly warned in UI). Octagon uses rectangular bounding area labelled as such, not polygon surfacing quantity. Source Blender arena dimensions must remain source-authoritative.
3. **Compatibility is strongest in owned OS, not free-form Studio imports.** UI equipment options are sport-filtered but schema accepts arbitrary equipment names and position/scale. This is not structural safety,collision checking or supplier availability. Owned OS rejects mixed assets,external URLs and scaling and preserves one construction family.
4. **Save is browser-local plus JSON.** One autosaved draft, not account storage, multi-project history or share links. Import/export and aliases work; do not replace this contract. Inquiry strips graphics and truncates18000chars; delivery and intact long summaries require a bounded integration test before claims of complete lead persistence.
5. **Sport breadth exists in data but not current selector.** Current selector admits arena profiles and generic3x3. Eight canonical names/schema render paths do not mean eight visible arena choices; w1 has a renderer/schema but no current sport-profile selector card. Preserve dormant sport data; expose later only with corresponding preview/constraints.
6. **SVG support is not a sanitisation claim.** Surface upload validates MIME/size and stores data URLs. Safe SVG roundtrip was tested; this audit has not tested hostile SVG or established a sanitisation guarantee. Panel logo pipeline separately rasterises accepted image types.

## Status meanings and feature map

`EXISTING`: implementation found, not proven active end-to-end. `WORKING`: bounded domain/runtime evidence exists (evidence column distinguishes fresh vs prior). `PARTIAL`: known scope limitation or missing integration. `BROKEN`: deterministic contradiction or failing behaviour, not automatically a live outage. `MISSING`: absent in bounded active-code search. `RECOMMENDED`: proposed extension, never represented as shipped. Full26-row map: FEATURE_MAP.csv.

## Regression gates and phased architecture recommendation

Sprint0 should create an adapter map and dependency graph, not a new rendering/pricing system. Retain Project JSON and owned assembly schema; introduce explicit product registry references and migration versioning only as additive adapters. Keep appearance, source geometry, technical BOM and commercial estimate separate. An estimate must carry rate-set version,currency,tax basis and assumptions; source-model assemblies cannot be priced from decorative-object formulas.

Next controlled work: (P0) correct pricing copy/record rate governance and authoritative deployment map; (P1) define dimension semantics and validated geometry quantities; (P1) define equipment compatibility boundary and long-inquiry transport; (P1) versioned draft/import recovery strategy; (P2) expose dormant sports only after renderer and constraints QA. No redesign or new workflow is implemented in Sprint0.

Before later publication use AGENTS checks:TypeScript,test:studio,build,test:mobile; targeted Surface/Blender/JSON/Radar/reflow and owned-module checks when their respective contracts change. Preserve all300patterns,19palettes,12presets,8stableproduct IDs,hiddenKraków,source geometry,blank default panel names and line policy. Historical runtime PASS does not certify WCAG,performance budgets,physical devices,construction engineering or commercial accuracy.
