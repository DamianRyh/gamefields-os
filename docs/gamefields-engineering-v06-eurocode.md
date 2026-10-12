# Gamefields Engineering v0.6 — Eurocode Engine

## Purpose

v0.6 adds a pre-design Eurocode screening layer on top of GF Frame 3D. It converts characteristic frame load-case results into explicit ULS/SLS combinations, checks every generated member, exposes a utilization heatmap and proposes lighter/heavier section candidates by member role.

## Current design profile

Default profile: `EC-FIRST-GEN-PL-PREDESIGN`.

The profile is explicit and configurable because Poland is in the transition period between first- and second-generation Eurocodes. The applicable Eurocode edition and Polish National Annex must be confirmed for every real project.

Default pre-design factors stored in the profile:

- gammaG = 1.35
- gammaQ = 1.50
- gammaM0 = 1.00
- serviceability screen = H/150

These are application defaults, not a substitute for selecting the correct factors, psi coefficients, action categories and National Annex values for a real project.

## Implemented combinations

ULS screening:

- `ULS-WIND-X`
- `ULS-WIND-Y`
- `ULS-IMPACT-X`
- `ULS-IMPACT-Y`

SLS screening:

- `SLS-WIND-X`
- `SLS-WIND-Y`
- `SLS-IMPACT-X`
- `SLS-IMPACT-Y`

The engine currently combines the self-weight case with one leading horizontal action at a time.

## Member checks

Every `Mxxx` receives:

- governing combination,
- N_Ed,
- My_Ed,
- Mz_Ed,
- elastic N_Rd,
- elastic My_Rd,
- elastic Mz_Rd,
- utilization,
- `OK / NOT_OK`,
- heat level: LOW / MEDIUM / HIGH / FAIL.

Current utilization is a conservative linear elastic cross-section screening interaction:

`N_Ed/N_Rd + My_Ed/My_Rd + Mz_Ed/Mz_Rd`

It is intentionally not described as a complete EN 1993 member verification.

## Auto-sizing

For each member role the engine finds the lightest available RHS/SHS section with estimated utilization <= 90% under the current force envelope.

A recommendation always has `requiresFrameResolve: true`. Changing a section changes stiffness and therefore the global force distribution, so a new GF Frame 3D analysis is mandatory before accepting the candidate.

## Engineer Gate

The gate now checks:

- representative legacy ULS/SLS cross-check,
- internal FEM result,
- global 3D frame result,
- Eurocode member utilization,
- Eurocode SLS displacement,
- fabrication register,
- connection/foundation review items,
- National Annex confirmation.

## Not yet implemented

Before fabrication/construction release the following remain mandatory:

- cross-section classification,
- member buckling,
- lateral torsional buckling,
- shear and full interaction equations,
- second-order / P-Delta effects,
- imperfections,
- semi-rigid connection behaviour,
- detailed weld/bolt/anchor resistance,
- concrete and foundation verification,
- project-specific wind model and terrain parameters,
- psi factors and complete action-combination logic where required,
- independent solver cross-check,
- qualified structural engineer approval.

## Exports

v0.6 adds:

- `EUROCODE JSON`
- `UTILIZATION CSV`

The full production JSON also contains the Eurocode result alongside the structural model, GF Frame 3D result, fabrication package and Engineer Gate.
