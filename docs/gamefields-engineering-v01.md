# Gamefields Engineering v0.1

## Goal
Build a parametric engineering layer for Gamefields steel court systems. The configurator should turn a court type and dimensions into a repeatable technical product definition, BOM and eventually a verified fabrication package.

## Current scope
- Parametric presets: GF-PANNA-7000, GF-1V1-10X6, GF-3V3-15X10.
- Adjustable court dimensions, board height, ball-stop height and post spacing.
- Steel grade selection.
- Initial RHS/SHS profile library.
- Preliminary steel mass, coating area and BOM estimate.
- Dedicated `/engineering` interface.
- `/api/engineering/estimate` endpoint.

## Product data model to add next
1. Nodes and members with XYZ coordinates.
2. Member role: post, rail, goal, gate, brace, net support.
3. Section properties: A, Iy, Iz, Wel,y, Wel,z, It, mass per metre.
4. Material properties: fy, fu, E, density.
5. Connection objects: bolts, welds, plates, anchors.
6. Foundation objects: pad footing / strip footing / screw pile / base plate.
7. Load cases and combinations.
8. Fabrication IDs and revision state.

## Verification engine roadmap
The current estimator is deliberately NOT a structural verification engine. The next technical layer should calculate or exchange:
- permanent loads,
- wind actions,
- accidental / impact design assumptions,
- crowd or user actions where relevant,
- member utilisation,
- deflection,
- global stability,
- base plates and anchors,
- connection resistance,
- foundation reactions.

The normative set must be selected and confirmed for each target market/project before a design is marked verified. No UI action may present a preliminary estimate as engineer-approved.

## Integration architecture
`Gamefields Studio` -> `Engineering Input` -> `Parametric Model` -> `Analysis Adapter` -> `Verification Results` -> `Fabrication Model` -> `BOM / drawings / exports`.

Analysis adapters are intentionally separated from UI logic so the project can later connect to a commercial solver or an in-house calculation service.

## Status model
- concept: geometry only,
- preliminary: BOM and indicative member selection,
- verified: calculations completed with stored solver/version/results,
- approved: verified package reviewed by responsible engineer.

## Immediate v0.2 target
Generate a real member/node model for GF-3V3-15X10 and render elevation/plan with numbered structural members. Then create a solver-neutral JSON export that can be mapped into Robot/SCIA/RFEM or another analysis system.
