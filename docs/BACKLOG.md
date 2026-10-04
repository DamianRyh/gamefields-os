# Gamefields backlog

Updated: 2026-10-04

## P0 — current Studio iteration

- Review the three live design previews at desktop and mobile breakpoints.
- Open a focused PR for `feat/studio-live-design-preview`, run full CI and publish after approval.

Acceptance: selecting Organic Flow, Urban Contrast or Classic Lines updates the selected card, realistic image, name and palette immediately; the image is complete from cache; the top-view toggle retains the selection.

## P1 — Studio workflow

- Extend realistic preview coverage to the highest-value Signature presets.
- Add location context so visualization surroundings can reflect park, school, housing estate or club.
- Add comparison mode for two selected directions using the same camera and location.
- Persist selected visualization context with the Builder project.

## P1 — platform integration

- Complete and verify the WordPress MU-plugin installation through hosting access.
- Move the canonical public experience to `gamefields.eu/play` with same-origin auth.
- Merge or rebase PR #13 only after its CI and product review are complete.

## P2 — quality

- Add a Studio-specific browser test for direction/image mapping and cached switching.
- Add image asset budgets and automated checks for dimensions, format and maximum size.
- Validate accessibility labels and keyboard selection across the full guided workflow.
