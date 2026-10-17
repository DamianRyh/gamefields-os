# GAMEFIELDS product principles

Recorded from the user's product brief on 2026-10-12; supplements `GAMEFIELDS-PRODUCT-CONTINUITY.md`.

1. A court is a modular physical product. Dimension changes add/remove fixed components and posts; never scale a whole court model along X/Y. Camera zoom is independent of product dimensions.
2. Keep geometry, product options, scene instances, StructuralModel, BOM and budget in one reproducible transaction. The API and live UI share the same pipeline.
3. Goals and gates occupy replacement perimeter slots. Branding is a panel variant. Corners are distinct connectors. Ballstops form an independent upper layer, including its support segments.
4. Stable asset keys identify components. Manufacturing-confirmed GLBs and PBR material slots can replace rendering placeholders without changing the geometry engine. Never stretch final catalogue assets to fit an unconfirmed opening.
5. Unknown manufacturing dimensions, connection points, material/finish, mass, capacity and supplier prices must stay explicitly unknown. Prototype placement bounds are not production drawings.
6. BUDGETARY_DEFAULT is an indicative component allowance, not a current market price or a commercial offer. Scope exclusions and rate provenance must stay visible. Pricebook confirmation does not approve engineering.
7. Engineer Gate is mandatory. No auto-approval. Model supports/headers are preliminary assumptions; Eurocode inputs, anchor capacity and ground data require a documented project-specific source and engineer review.
8. Panna Circle remains a generic circular system until Damian's confirmed product specification is supplied. Do not label it a 1:1 product model.
9. Preserve all previous GAMEFIELDS functions and routes; develop additively. Keep Studio, Builder, surfaces/patterns, renovations, structures, Radar/map, Objects, Engineering, Frame3D, Eurocode, Stability, connections/foundations, Optimizer, Design Generator, PLN costing, Proposal Studio, events, showroom/micro-world and sport expansion.
10. UX should communicate physical assembly: size → visible added/removed component → updated BOM → updated budget. Maintain minimalist editorial presentation; no Basic/Pro/Premium SaaS tiers.
11. Commit small logical changes to the feature branch, run TypeScript/build/tests, open/update a PR to main, and verify CI. Do not merge failing CI or auto-merge engineering work.
