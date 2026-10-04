# Gamefields backlog

Updated: 2026-10-04

## P0 — current Studio iteration

- Validate the three Basketball 3×3 realistic previews at desktop and mobile breakpoints.
- Open a focused PR for `feat/studio-multisport-realistic-previews`, run full CI and publish after approval.

Acceptance: selecting Basketball 3×3 and then Organic Flow, Urban Contrast or Classic Lines updates the realistic image immediately; switching back to Street Football restores its own imagery; unsupported sports never display the wrong court.

## P1 — Studio workflow

- Build the automated realistic compositor: neutral scene per sport, calibrated court mask and homography, Canvas/WebGL texture layer, sport lines/equipment above the graphic.
- Add Tennis and Padel as the next calibrated scenes, each starting with three dominant color directions.
- Extend realistic preview coverage to the highest-value Signature presets after the compositor is stable.
- Add location context so visualization surroundings can reflect park, school, housing estate or club.
- Add comparison mode for two selected directions using the same camera and location.
- Persist selected visualization context with the Builder project.

## P1 — platform integration

- Complete and verify the WordPress MU-plugin installation through hosting access.
- Move the canonical public experience to `gamefields.eu/play` with same-origin auth.
- Merge or rebase PR #13 only after its CI and product review are complete.

## P2 — quality

- Add a Studio-specific browser test for sport/direction/image mapping and cached switching.
- Add image asset budgets and automated checks for dimensions, format and maximum size.
- Validate accessibility labels and keyboard selection across the full guided workflow.
