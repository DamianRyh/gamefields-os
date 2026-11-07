# Studio product entry QA — 2026-11-06

Source visual truth: `/Users/mac/.codex/generated_images/01a1247d-6668-7432-890f-89dc3757a626/exec-3b3b7dda-676e-4ee9-8f90-5219b24ba634.png` (selected option 1).
Implementation: `outputs/product-entry/hub-1487.png`, `hub-390.png`, `poster-390.png`, `poster-1487.png`, `ball-390.png`, `ball-1487.png`.
Viewport: desktop 1487 × 1058 CSS px, device scale 1. Source and implementation both 1487 × 1058 pixels; no density rescaling. Mobile 390 × 1058 CSS px, scale 1, full-page capture for catalogue.
State: product selection, poster editor after reload, ball panel controls. Browser-rendered production build, same existing StudioWorkspace.

## Comparison evidence
Full-view source/implementation pair: `outputs/product-entry/comparison.jpg`.
Focused typography/header pair: `outputs/product-entry/header-comparison.jpg`.

## Scope clarification
User explicitly required consistency with the current homepage and Studio instead of a replacement Studio. Therefore actual Blender models, the current surface library, homepage poster renderer and original 32-panel football replace the mock's imagined product illustrations. The nonexistent basket is replaced by the existing draft continuation. These are intentional product corrections, not missing visual assets.

## Findings and iteration history
- [Resolved P1] Print editors had a zero-height scene because hiding the public Workshop row left the scene in the automatic grid row. Added a print-mode grid override. Recaptured working desktop/mobile poster and ball views.
- [Resolved P2] Added product navigation clipped the mobile summary control. Changed mobile return to an accessible labelled arrow button, tightened existing header spacing and retained the complete Summary button. The UI test asserts its right edge remains within the viewport. `poster-390.png` is the post-fix evidence.
- [Resolved P2] Scene title collided with the framed poster on phones. Reserved top space and reduced the existing title field height. Post-fix mobile screenshot shows separate title and frame.
- No remaining actionable P0/P1/P2 visual findings.

## Required fidelity surfaces
- Typography: existing Gamefields/Inter families and plum text retained. Strong single-line desktop heading matches the source hierarchy; mobile wraps naturally. Labels and controls are readable at native capture scale.
- Layout rhythm: retained 3 + 2 product grid, aligned card captions, ivory background, compact header and bottom sequence. Mobile becomes a single column. Editor remains the existing scene with floating inspector / mobile sheet.
- Colours: existing plum #47132d, violet #6336f5, ivory and white; selected tabs use existing Studio rules.
- Image quality: actual model renders and existing SVG directions remain sharp and uncropped; neutral jersey is the original Blender cut. Decorative corner retains the selected generated asset. No invented replacement product geometry.
- Copy: five explicit product categories and short descriptions; no fabricated basket, prices or production-ready claim. Existing save/export and individual quotation language retained.

## Interaction verification
Browser tests cover all five catalogue entries, poster text, JSON export, persisted reload, 32-panel football and size/mode changes, cross-product JSON import, return to construction and bounded viewport. Runtime page errors checked by the UI test. Separate existing Studio regression checks cover models, surface materials, camera controls and Radar. Text escaping, 960 poster combinations, strict schema and private-logo omission pass contract tests.

## Follow-up polish
P3: imagery deliberately prioritises actual available products over the mock's shared photographic art direction.

final result: passed
