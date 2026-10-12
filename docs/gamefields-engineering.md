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

## Safety boundary

v0.2 is explicitly **pre-design** software. It is not a certified Eurocode implementation and must not be used as a substitute for a structural engineer's final calculations or approval.

The current engine does not verify global frame behaviour, buckling, interaction, second-order effects, section classification, fatigue, joints, welds, bolts, anchors, foundations, geotechnics, gates, goals or accidental actions.

Wind pressure is a direct project input. A future location engine must derive design wind actions from location, terrain, height, orography and the applicable National Annex.

## Standards roadmap

The architecture is prepared for an EN 1990 / EN 1991 / EN 1993 workflow. As of October 2026, the second-generation Eurocodes have completed formal voting and definitive texts have been distributed to National Standards Bodies, but the common European date of publication is 30 September 2027 and conflicting first-generation standards are scheduled for withdrawal by 30 March 2028. The standards engine must therefore version the exact Eurocode generation and National Annex used for every project.

Planned steps:

1. Standards profile and National Annex versioning.
2. Location/terrain wind action engine.
3. Load combinations and project-specific design situations.
4. Frame solver / FEA adapter.
5. Member stability, interaction and section classification.
6. Joint, baseplate and anchor checks.
7. Foundation/geotechnical adapter.
8. Fabrication outputs: cutting lists, plates, bolts, welds and drawings.
9. IFC/STEP/DXF export adapters.
10. Engineer verification workflow and immutable calculation report.
