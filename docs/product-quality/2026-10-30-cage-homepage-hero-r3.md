# Cage homepage presentation — CAGE-HERO-3

Published on homepage 3462. Both Cage products now use native transparent Cycles photographs from their unchanged CAD r2 Blender masters: 1920×1080, fixed camera, soft shadow catcher, gray/red/blue/green coatings on frame and mesh, metallic goals. Materials/lighting only; no model topology, dimensions, Studio source or pricing changes. The former gray background rectangle is removed.

Eight alpha-preserving WebP assets and their render generator/source hashes are in models/cage-hero-r3. WordPress media copies are used by runtime.js; no additional Studio assets or deployment needed. Static card posters use the same new gray images. Hero colour uses the existing shared heroColour state, the existing dot styles, keyboard radio controls, and the existing 3D handoff. Cards retain hover/touch preview. Decoded image nodes are swapped atomically; obsolete requests are discarded to avoid blank flashes during rapid switches.

Before publication and on the public page, browser checks passed at 390 and 1440 px for both products: all four Full HD images decode, selected colour and keyboard arrows update, colour is retained when switching back to Play, no horizontal overflow and no page JavaScript errors. Screenshots were visually inspected to confirm both products actually appear, including Cage180 after rapid changes. Play/Court media, Studio models, construction order and native 3D viewer remain unchanged.

Local evidence: outputs/cage-hero-r3/live-verification.json and live-circle-cage-{1,2}-{390,1440}.png. Rendering: Blender3.6.5, Cycles48 samples, Filmic Medium High Contrast; no generative image replacement of product geometry.
