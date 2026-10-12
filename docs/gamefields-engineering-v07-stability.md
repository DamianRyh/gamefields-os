# Gamefields Engineering v0.7 — Stability Engine

## Scope

v0.7 adds a member-stability screening layer on top of GF Frame 3D and GF Eurocode Engine.

Implemented:

- idealized RHS/SHS cross-section classification screening,
- Euler critical load Ncr,
- minimum radius of gyration,
- non-dimensional slenderness lambda-bar,
- configurable buckling imperfection factor alpha,
- buckling reduction factor chi,
- preliminary buckling resistance Nb,Rd,
- shear screening,
- conservative N + M + V interaction screening,
- member-level second-order sensitivity NEd/Ncr,
- Euler moment amplification,
- per-member stability heat/status,
- Engineer Gate integration,
- Stability JSON and CSV exports.

## Important engineering limits

This is a pre-design screening engine, not a complete EN 1993 verification or a substitute for a qualified structural engineer.

The following remain mandatory before fabrication/construction release:

- project-specific Polish National Annex and action verification,
- confirmed profile manufacturing route and appropriate buckling curve,
- confirmed effective lengths, restraints and joint stiffness,
- nonlinear/global second-order analysis where required,
- geometric imperfections,
- full LTB verification where applicable,
- effective-section treatment for Class 4,
- detailed connection, weld, bolt and anchor design,
- foundation/geotechnical verification,
- independent solver cross-check and engineer sign-off.

## Defaults

The Stability Engine uses explicit pre-design defaults. In particular, alpha = 0.49 is intentionally treated as a conservative placeholder until the correct buckling curve can be selected from verified section/manufacturing information.

## Next target

v0.8 should focus on Connection Engine + Foundation Engine: connection-force extraction per support/joint, base-plate bending, anchor group actions, concrete checks, weld/bolt checks and project geotechnical inputs.
