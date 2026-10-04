# Design QA — Studio live design preview

## Evidence

- Source visual truth: `/Users/mac/Desktop/Screenshot 2026-10-04 at 15.39.23.png`
- Implementation screenshot: `/Users/mac/Documents/Codex/2026-10-04/build/work/studio-live-preview/outputs/design-qa/qa-urban-contrast.png`
- Comparison board: `/Users/mac/Documents/Codex/2026-10-04/build/work/studio-live-preview/outputs/design-qa/qa-comparison-urban.png`
- Additional state: `/Users/mac/Documents/Codex/2026-10-04/build/work/studio-live-preview/outputs/design-qa/qa-classic-lines.png`
- Browser: Codex in-app browser, local Studio at port 4174
- Browser CSS viewport reported by the page: 1024 × 964, device pixel ratio 2
- Source raster: 1814 × 1140 px
- Implementation capture: 1280 × 720 px
- Normalization: both images fitted without cropping into equal 1280 × 720 comparison cells
- State: Street Football 3×3 → Design → Urban Contrast → realistic view

## Full-view comparison

The source exposes the product defect: `Urban Contrast` is selected while the realistic canvas still shows the Organic Flow court. The implementation preserves the selected-card state, hierarchy, spacing, typography, tokens and controls while changing the large court asset, badge and palette to Urban Contrast in the same interaction.

The dominant preview asset is readable at full-view scale, so a separate focused crop is not required. Classic Lines was captured independently to confirm the second new asset and selected state.

## Required fidelity surfaces

- Fonts and typography: existing Studio typography and hierarchy are unchanged.
- Spacing and layout rhythm: existing guided-design grid, card sizing, canvas and footer are unchanged.
- Colors and visual tokens: selected-card green, canvas chrome and badges remain consistent; each preview now uses its matching palette.
- Image quality and asset fidelity: all three previews are 1672 × 941 WebP assets with a consistent park, perspective, lighting and crop. Urban and Classic images are sharp and complete in the browser.
- Copy and content: design names, palette labels and accessible image descriptions now match the selected direction.

## Interaction verification

- Organic Flow loads `/studio/organic-flow-park.webp`.
- Urban Contrast changes immediately to `/studio/urban-contrast-park.webp`; browser reports `complete=true`, natural width 1672.
- Classic Lines changes immediately to `/studio/classic-lines-park.webp`; browser reports `complete=true`, natural width 1672.
- `Widok z góry` replaces the realistic stage with the live court drawing.
- Returning to `Widok realistyczny` retains the selected Classic Lines asset and badge.
- Selected cards expose `aria-pressed`.
- Browser console: no errors or warnings.

## Findings

- No actionable P0, P1 or P2 issues.
- P3: the generated visualizations are conceptual, so exact paint boundaries should be confirmed during future production visualization work.

## Comparison history

- Initial source finding: selected direction and realistic image were inconsistent.
- Fix: mapped each curated design direction to its own optimized realistic asset and preloaded all assets.
- Post-fix evidence: Urban and Classic captures show matching card, image, badge and palette with no console errors.

## Implementation checklist

- [x] Match selected direction to realistic asset.
- [x] Preload all curated assets.
- [x] Preserve top-view workflow.
- [x] Verify all three direction states.
- [x] Verify console and production build.

final result: passed
