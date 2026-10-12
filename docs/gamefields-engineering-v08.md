# Gamefields Engineering v0.8 — Connection + Foundation Engine

## Scope

v0.8 extends the pre-design pipeline from member checks to the support interface:

`Frame 3D → reactions → anchor group → base plate → weld → footing → Engineer Gate`

## Implemented checks

- conservative support reaction envelope from GF Frame 3D,
- four-anchor group force distribution for biaxial base moments,
- anchor tension/shear interaction against project-supplied design resistances,
- base-plate concrete bearing screen,
- simplified plate cantilever bending screen,
- post-to-base fillet weld throat-area screen,
- footing self-weight, base pressure, eccentricity/contact, sliding and soil-bearing screens,
- JSON/CSV exports and full handoff-package integration.

## Project inputs

The engine deliberately treats the following as explicit project inputs rather than inventing product/site values:

- selected anchor design tension resistance,
- selected anchor design shear resistance,
- concrete strength,
- weld design shear strength,
- soil design bearing resistance,
- base friction coefficient,
- concrete density.

## Safety boundary

GF-CONNECTION-FOUNDATION-0.8 is **PRE-DESIGN ONLY**.

It does not replace detailed verification under the applicable editions and National Annexes of EN 1993-1-8, EN 1992-4, EN 1992 and EN 1997. In particular it does not yet verify the full concrete-anchor failure family (concrete cone, pull-out, pry-out, splitting, edge/spacing effects, supplementary reinforcement), component-method joint stiffness/resistance, detailed weld-group stresses, reinforced-concrete footing design, settlement, frost, groundwater or site-specific geotechnical behavior.

No fabrication or construction release is generated automatically. Qualified structural-engineer review remains mandatory.
