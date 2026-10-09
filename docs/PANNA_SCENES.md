# Panna Ø 7 m — greenscreen scenes

Twelve separate conceptual AI clean plates in `public/studio/panna/`: Park, School, Courtyard and Warsaw PKiN × perspective, aerial and ground. Generated using built-in Imagegen; original PNGs remain in the Codex generated_images directory. WebP derivatives are encoded at quality 92 for browser loading.

## Prompt set
Master: Photorealistic natural daylight 16:9 clean plate of a circular Panna Football arena, diameter 7 metres, charcoal low boards and two opposite small white goals. Elevated oblique camera. Uniform pure #00ff00 playing floor, no pattern, markings, texture, shadows, people or objects on the disk. Warsaw neighbourhood park, trees, paving, benches and lamps. No text or logos.

Camera edits preserve the same arena: (a) vertical overhead, true circular floor; (b) eye height 1.8m outside the arena, slight downward camera, full arena in a broad shallow ellipse.

Location edits replace only the environment: contemporary Polish school courtyard; Warsaw residential courtyard between apartment buildings; conceptual public plaza with recognizable Palace of Culture and Science. Preserve circular arena position, scale, goals and uninterrupted pure green floor. Muted natural planting, daylight, 16:9. Warsaw aerial correction uses a strictly vertical drone view with only a cropped architectural roof edge, no sky or frontal landmark facade. Generated scenes are illustrative rather than surveyed locations.

## Rendering contract
A cached flood-filled chroma mask identifies the playing floor. Green holes behind white goal netting inside the arena bounds also receive artwork. Every material/pattern/colour/branding update renders the shared SVG library into a 600×600 texture and projects it to the measured elliptical silhouette. The mask preserves the photographic boards, goals and surrounding environment. The projection is affine and conceptual, not a survey-calibrated engineering model.

The editor uses circular clipping for artwork and surface branding, continuous circular boards, two opposed goals and a fixed 7m diameter. Equipment, band branding, transform controls, undo/redo and JSON remain available in the plan. As in the existing 3×3 photo compositor, optional equipment and band branding are edited in the plan; the photo contains fixed goal/board geometry. Night/event colour treatment is illustrative. Turf retains the existing green-and-lines rendering convention while retaining the chosen artwork in JSON.

New round JSON has `courtShape: circle`, `diameter: 7`, `length: 7`, `width: 7`. Legacy rectangular 1×1 JSON without a shape remains rectangular. The server and summary use πD²/4, not the enclosing square; existing price rates are unchanged.
