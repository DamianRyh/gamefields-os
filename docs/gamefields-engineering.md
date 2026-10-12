# Gamefields Engineering

Gamefields Engineering is the technical layer behind Gamefields Studio. It converts a court configuration into a parametric structural model, a preliminary bill of materials and a pre-design structural screen.

## Current scope — v0.2

- Presets: GF-PANNA-7000, GF-1V1-10X6, GF-3V3-15X10.
- Parametric dimensions, board height, ball-stop height and post spacing.
- Steel grades S235, S275, S355.
- SHS/RHS section library.
- Generated structural nodes (`Nxxx`) and members (`Mxxx`).
- Preliminary BOM and steel mass estimate.
- Preliminary wind and board-level impact load cases.
- Elastic post bending screen and approximate serviceability deflection screen.
- Automatic post-section optimizer selecting the lightest library SHS that passes the active preliminary checks.
- `POST /api/engineering/analyze` for use by Gamefields Studio or other clients.

### Analysis API

`POST /api/engineering/analyze` accepts a preset plus optional geometry, material, section and load overrides. It returns the generated node/member model, load-screen result and post-section optimization result. The response is always identified as `pre-design` so downstream clients cannot silently treat it as an approved calculation package.

## Safety boundary

v0.2 is explicitly **pre-design** software. It is not a certified Eurocode implementation and must not be used as a substitute for a structural engineer's final calculations or approval.

The current engine does not verify global frame behaviour, buckling, interaction, second-order effects, section classification, fatigue, joints, welds, bolts, anchors, foundations, geotechnics, gates, goals or accidental actions.

Wind pressure is a direct project input. A future location engine must derive design wind actions from location, terrain, height, orography and the applicable National Annex.

## Standards roadmap

The architecture is prepared for an EN 1990 / EN 1991 / EN 1993 workflow. As of October 2026, the second-generation Eurocodes have completed formal voting and definitive texts have been distributed to National Standards Bodies, but the common European date of publication is 30 September 2027 and conflicting first-generation standards are scheduled for withdrawal by 30 March 2028. The standards engine must therefore version the exact Eurocode generation and National Annex used for every project.

## Next milestone — v0.3

The next engineering milestone is the transition from isolated post screening to project-level structural design data:

1. Standards profile + National Annex version on every project.
2. Location/terrain wind action input model.
3. Explicit load cases and ULS/SLS combination objects.
4. Solver-neutral frame-analysis payload for Robot / IDEA / future FEA adapter.
5. Baseplate, anchor and foundation data contracts.
6. Calculation-report data model with immutable input snapshot.

Later milestones add member stability, interaction and section classification; joint design; foundations/geotechnics; fabrication outputs; IFC/STEP/DXF adapters; and the engineer verification workflow.

**v0.2 milestone status: implemented on `feat/gamefields-engineering-v01`; CI validation is required before merge.**
