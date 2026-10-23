# Studio ↔ OS: inwentaryzacja i braki zgodności geometrii

Raport obejmuje osiem modeli Studio i25komponentów OS zweryfikowanych po SHA. Rozdziela geometrię Studio od deskryptorów podłoża OS; wskazuje braki mapowania instancji, połączeń i obrysów. Jest to ukończony audyt danych, bez zatwierdzenia technicznego BOM. Poniżej zachowano szczegółowy kontrakt techniczny i źródła.

Evidence date: **2026-10-23**. This is an evidence-only inventory of eight Studio model revisions and the pinned OS engine. It does not establish that the displayed Studio construction is the assembled OS configuration. Every record retains `geometryCorrespondence: "UNCONFIRMED"` and `manufacturingApproved: false`.

## Reproduce

With Node 24, from this project:

```sh
node scripts/audit-studio-owned-geometry.mjs --os-root /path/to/gamefields-os
```

The OS root is optional. Without it, OS runtime source hashes remain `NOT_AVAILABLE_LOCALLY`, with `actualSha256: null`; no network request or substitution is performed. The script writes only `docs/studio-owned-geometry-gaps-2026-10-23.json`. It never regenerates geometry, modifies models, updates the catalog or grants BOM approval. No wall-clock timestamp enters the report.

The audit recomputes the Studio measurements with the existing `measureArenaGeometry()` implementation and asserts deep equality with `lib/arena-geometry-data.mjs`, including all referenced asset SHA-256 values and combined source revisions. Its W1 GLB bounds use the same documented per-node transform convention as that builder; this is not a new generic glTF scene validator.

It verifies the pinned engine bytes, catalog bytes and component registry revision against `lib/vendor/owned-modular/evidence.json`. With a local OS checkout it also verifies the original engine and all 25 referenced runtime component GLBs at their exact canonical paths. A mismatched file fails the audit; an absent file remains explicitly unavailable. Original evidence date `2026-10-22` is retained as provenance, separately from this audit date.

Execution with the existing local OS checkout on 2026-10-23: all Studio revisions matched; pinned and OS source engine matched; **25/25 OS runtime assets matched**. Two consecutive executions produced byte-identical JSON with SHA-256 `9bc4dfd3420a87d7d04bd5be1c5e4e12e848326d6ebee0b18ab7ceae986ed1ae`.

Pinned engine SHA-256: `492af823b06f689d8421cf310978234a261d3e3a35ec65e74aebcde685a61715`. Per-file Studio and OS SHA-256 values are included in the JSON rather than shortened here.

## Eight-model inventory

Lengths are **metres**. Bounds below are ordered **X × Z × Y**, not commercial length × width × height. Studio floor area is the measured sum of top-face triangle projected areas, in **m²**; it is not derived by multiplying bounding-box dimensions.

| Studio ID | Construction bounds X × Z × Y | Surface bounds X × Z × Y | Studio top-triangle area | OS default digital assembly |
|---|---|---|---:|---|
| w1 | 5.09 × 5.831395 × 1 | 4.99 × 4.99 × 0 | 19.553002 | Unavailable: source-only family |
| o1 | 6.002 × 6.62306 × 1.516 | 5.902 × 5.902 × 0 | 27.353366 | Unavailable: source-only family |
| p1 | 5.653 × 7.93938 × 1.22399 | 5.571602 × 7.137828 × 0.000845 | 39.251386 | Unavailable: source-only family |
| street15 | 16.650002 × 10.104 × 1.325 | 15 × 10 × 0.2 | 149.155 | Unavailable: source-only family; no parts registered |
| circle-cage-1 | 6.722908 × 6.12 × 0.91 | 6 × 6 × 0.2 | 28.26298 | Circle family, `levels:1`, 8 digital instances |
| circle-cage-2 | 6.722908 × 6.12 × 1.81 | 6 × 6 × 0.2 | 28.26298 | Circle family, `levels:2`, 16 digital instances |
| street-field | 7.024 × 4.984 × 1.091 | 7.3 × 5.3 × 0.2 | 38.69 | Rectangle, 28 digital instances |
| octagon | 5.298 × 5.642 × 1.218 | 6 × 6 × 0.2 | 29.823379 | Octagon, 16 digital instances |

OS defaults come from `normalize()`: long 4, short 3, goals 2, entries 1, levels 1 except the explicit Cage 180 variant at levels 2. These instance counts describe those particular digital plans only. A normalized config object is shown even for a source-only family, but its assembly result is deliberately unavailable in this audit, consistent with the inspector guard in `owned-configuration.mjs`.

## Known numerical differences

| Supported OS family / Studio variant | OS authored reference dimensions | OS floor descriptor | Numerical comparison with Studio surface |
|---|---|---|---|
| Circle / Cage 90 | 6 × 6 | Circle radius 3.55, depth 0.2 | Diameter 7.1 vs Studio span 6: +1.1 on X/Z. Analytic circle area 39.591921 vs Studio 28.26298: +11.328941 m² |
| Circle / Cage 180 | 6 × 6 | Same circle floor, levels 2 | Same floor delta; additional level does not alter this floor descriptor |
| Street Field / Panna Grid | 6.214 × 4.648 | Rectangle 7.31 × 5.304, depth 0.2 | +0.01 m X, +0.004 m Z; analytic rectangle area +0.08224 m² |
| Octagon / Panna Octa | 4.962 × 4.962 | Octagon radius 3.247176600877182, depth 0.2 | Floor area and X/Z bounds **null**: actual floor mesh/orientation is not pinned here |

These are differences between an OS **authored floor descriptor** and Studio **measured surface geometry**. Analytic circle area and triangulated mesh area are different measurement methods. They are not manufacturing discrepancies proven by a common surface definition. In particular, matching the Circle reference diameter to the Studio span would ignore that OS's floor descriptor is larger. Conversely, close Street Field floor spans do not establish component correspondence.

For source-only W1/O1/P1/Street15, OS reference dimensions, assembly floor, assembly area, comparison deltas and instance counts remain null. There is no synthesized assembly or estimate from a family label. All transformed OS assembly mesh bounds are null: this audit verifies component bytes but does not transform and merge their mesh scene graphs.

## Data required before a Studio-derived BOM

1. An approved mapping from each exact Studio mesh revision to named component instances, including positions, rotations, scale convention, source revisions and stable instance IDs. Same family or same bounds is insufficient.
2. Component decomposition and assembly rules for the four source-only families; Street Arena 15 additionally lacks registered component articles in this engine.
3. Confirmed mating interfaces, pitches, allowed combinations, corner/goal/entry substitutions, stacking rules and tolerances. Existing OS digital placement rules are not manufacturing sign-off.
4. Separate playing-field, surface/slab, construction and required-clearance outlines with explicit coordinate/height datums. Octagon's actual OS floor mesh and orientation must be pinned before geometric floor comparison.
5. Approved connection, fastener, anchor and foundation quantities; installation assumptions and exclusions; revision approval by the responsible constructor/manufacturer.

Until these are provided, the OS inspector may report digital instance quantities for a supported **independent OS configuration**. It must not claim that these quantities are the active Studio model's bill of materials or an approved manufacturing BOM. No application behavior or displayed model was changed by this stage.
