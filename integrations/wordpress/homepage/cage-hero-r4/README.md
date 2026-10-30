# Cage homepage photography refinement — CAGE-HERO-4

Independent art/visual QA identified r3 problems: over-lit gray coating (opaque median RGB ~211/214/215), flat equal-weight lighting, an excessively broad shadow and an entry notch centred in the foreground. R4 uses a dominant key900W/fill220W/rim500W, world.22, exposure−.3, powder-coating roughness.48 and the opposite camera azimuth. Cage180 uses a lower camera z4.8 to occupy the hero more effectively. Source model geometry is unchanged.

Two native Cycles view layers separate the product from the receiver. A camera-invisible white bounce plane preserves equal illumination in the product layer. Shadow alpha is recovered as (FullAlpha−ProductAlpha)/(1−ProductAlpha), clamped and scaled by.48, then the unmodified product is composited over it. This keeps wire opacity independent from shadow strength and avoids premultiplication fringes.

Proofs: Cage90gray, Cage90green and Cage180gray at1280×720; opaque gray median136/141/143. Two independent reviewers checked material separation, lighter shadow and camera direction. Final renders use1920×1080, up to128 adaptive samples on product and32 on the broad receiver, with native Metal acceleration and denoising. Four original coating hexes are retained.

The existing CAGE-HERO-3 interaction code remains in place: decoded image-node swaps, request cancellation, four keyboard colour choices and shared selected colour. R4 changes only its image map before `const cageHeroLabels=` and the static gray posters. Model files, Studio, prices and Play/Court media remain unchanged. `asset-override.js` and the media map document the bounded WordPress update; reproducible renderer and images live under models/cage-hero-r4.
