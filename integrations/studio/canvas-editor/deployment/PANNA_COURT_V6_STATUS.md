# Panna Court v6 — prepared, not published

The existing public Site is appgprj_6abbd0ba26f0819197701343bf156f1b.
The WordPress home page is 3462; product key is p1, Panna Court.

Implemented locally:
- CAD-derived construction with 16 single inner sheets, external ribs/profiles, goals and hardware; no ground.
- Conversion preserves every triangle of the approved GLB, rotates into Studio coordinates and keeps inner/outer artwork faces.
- Planar perforation mapping only on the new mesh; other models keep their current mapping.
- Separate optional Studio surface asset unchanged.
- Approved GLB, DEFAULT/HOVER/detail web images and catalog thumbnail.
- Geometry dimensions/hashes regenerated; source conversion is reproducible.
- Prepared surgical WordPress edits replace only p1 graphics/gallery and retire the old p1 video from its UI. They have NOT been applied.

Validation passed:
- `pnpm exec tsc --noEmit`
- `pnpm test:studio`
- `pnpm build`
- `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium pnpm test:mobile`
- `node tests/panna-court-v6.mjs`
- Standalone WebGL: 142 meshes, no page errors, GL error 0; construction thumbnail rendered from the same meshes.

Mobile suite covers 8 O1/P1 views, 16 P1 material switches, colours/branding, JSON roundtrip, camera controls and Radar navigation at 375/390/430/1440 widths. The initial dependency approval limit cleared on retry; no remaining blocker.

Publication procedure: push this tested source, package its build output and matching hosting manifest, save/deploy the existing public Site without changing audience, then apply refreshed WordPress content/search anchors and purge cache. Native Sites deployment records own the final production version/status. Do not publish the source-only tree as a deployment archive.

Panna Court geometry is fetched separately from `/arenas/p1.json` to keep application bundles below the hosting asset-size limit. Base construction stays ground-free; the selected Studio surface is added separately.
