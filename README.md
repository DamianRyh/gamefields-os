# Gamefields OS

Street Football 15 × 10: `/products/street-football-15x10` or `?view=street-football-15x10` in the public static catalogue. Two-object GLB and Blender source: `public/products/street-football-15x10/`. Blank, independently recolorable panels and a separate 20 cm surface without markings. Test: `node tests/street-football-15x10.mjs` after `pnpm build:modular:review`.

Gamefields OS is the operating system and design environment behind Gamefields Studio.

## Gamefields Engineering v0.2

The repository contains an experimental **Gamefields Engineering** module at `/engineering`.

Current capabilities include parametric steel-court geometry, generated structural nodes and members, preliminary BOM, configurable pre-design wind/impact screening, serviceability screening, automatic SHS post-section optimization, and an analysis API at `POST /api/engineering/analyze`.

The calculation layer is intentionally marked **PRE-DESIGN**. It is not a certified Eurocode implementation and does not replace final structural calculations, connection/foundation design, or approval by an appropriately qualified structural engineer.

Technical scope and roadmap: [`docs/gamefields-engineering.md`](docs/gamefields-engineering.md).
