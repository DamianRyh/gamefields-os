# Cage homepage photographs — CAGE-HERO-3

Matches the Play/Court product-presentation approach: one fixed product camera, transparent background, native Cycles shadow catcher and four real material-coating renders (gray/red/blue/green). Uses unchanged Cage 90 and Cage 180 CAD r2 Blender masters; geometry and object transforms are checked during rendering. No model or Studio configuration change.

`render.py` lives with reproducible source assets in `models/cage-hero-r3`; open it using Blender 3.6 background mode. It reads the existing model masters relative to the repository root and emits 1920×1080 RGBA PNGs. WebP exports retain the alpha channel. `manifest.json` records source hashes and the camera for every render.

`runtime.template.js` is inserted in homepage 3462 immediately before the existing `const studio=(arena=model,params={})...` statement, after the prior Cage media declarations. Fill `__CAGE_IMAGES__` with the WordPress media URLs. Existing media wrappers resolve the new functions dynamically; the static card replacements run after this assignment. Keep Play/Court and 3D viewer handlers intact. The shared `heroColour` retains colour between products and the existing 3D CTA.

The hero gets the same four accessible colour radio buttons as Play/Court, including arrow/Home/End keys. Cards keep hover/touch colour preview. Image decode completes before a swap; a request counter discards obsolete colour requests. Source renders are uploaded to WordPress media; no Studio deployment is required.
