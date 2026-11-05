# Kraków · Rynek Główny — visualization assets

Release state: implemented locally, intentionally hidden and not published. The location's `enabled:false` flag must remain unchanged until the owner asks to show it. Public version 35 is unaffected.

Created on 2026-10-07 using built-in ImageGen, not the API/CLI fallback. Final plates are 1672 × 941 PNGs in `public/studio/`:

- `street-football-3x3-krakow-rynek-perspective-green-screen.png`
- `street-football-3x3-krakow-rynek-aerial-green-screen.png`
- `street-football-3x3-krakow-rynek-ground-green-screen.png`

Final prompt set / production brief:

1. Side: retain the elevated downward camera and clean court quadrilateral of the corrected Warsaw reference. Replace the surroundings with a photoreal architectural concept of Kraków Market Square, Sukiennice, unequal St Mary's towers and historic townhouses. Warm daylight, uncovered uniform chroma-green court, no markings, goals, objects, shadows, dots, text or watermark within the replacement plane.
2. Aerial: retain the reference's central downward camera and horizontal rectangular court. Replace Warsaw with Kraków's square and recognizable monument roofs. Nadir-style framing, uncovered uniform chroma-green rectangle; no court markings, people, goals, objects, text or watermark. The compositor extends the generated blank plane slightly to obtain an exact 3:2 playing surface.
3. Ground: use the Warsaw human-eye-level reference only for camera/framing, replacing architecture with Kraków's Cloth Hall, St Mary's Basilica and townhouses. Distinct low corner view with all four green court corners visible, warm daylight, uniform uncovered chroma green with no markings, texture, goals, shadows, text or watermark.

The side and aerial inputs needed a targeted camera correction; discarded first drafts are not referenced by the application. Actual final corners are calibrated in `components/street-football-realistic-preview.tsx` rather than assuming prompt coordinates were obeyed exactly. Generated architecture and monument placement are illustrative, not a verified parcel or survey. Permanent feasibility and monument approvals are not established.
