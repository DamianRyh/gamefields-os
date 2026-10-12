# Gamefields Engineering v0.9 — Automatic Structural Optimizer

## Goal

Turn the existing pre-design calculation chain into a deterministic design-space search:

`geometry → Frame 3D → Eurocode → Stability → connections/foundation → rank feasible designs`

## Search variables

- post section
- rail section
- perimeter post spacing
- base-plate thickness
- anchor diameter
- footing width/length
- footing depth

The search grid is explicit and configurable through `/api/engineering/optimize`.

## Two-stage search

1. Structural candidates are solved with GF Frame 3D and screened through Eurocode and Stability engines.
2. The lightest structurally feasible seeds are expanded into connection/foundation candidates and ranked.

This avoids running the full connection/foundation permutation against structurally invalid designs.

## Objective

v0.9 minimizes a transparent **relative cost index** composed of configurable weights for:

- estimated structural steel mass,
- concrete volume,
- base-plate mass,
- anchor diameter/count,
- support count.

The score is not a supplier quotation and must not be presented as a guaranteed PLN cost.

## Feasibility

A candidate is considered feasible only when the current pre-design screens report no structural member failures, no SLS failure, no stability/Class-4 failure and no connection/foundation failure.

## Outputs

- best feasible design,
- top alternatives,
- structural/connection candidate counts,
- steel mass,
- concrete volume,
- base-plate mass,
- structural and connection utilization,
- JSON API result,
- CSV ranking export.

## Product UI

`/engineering/production` exposes a manual **RUN OPTIMIZER** action. The optimizer does not run automatically on page load because the design-space search performs many Frame 3D solves.

## Release boundary

All v0.9 results remain `PRE_DESIGN`. Optimization does not replace project-specific actions, correct Eurocode/National Annex selection, nonlinear/global verification where required, anchor product verification, geotechnical design, fabrication detailing, or qualified structural-engineer approval.
