# Product architecture — Sprint 0 decision proposal

Status: proposed architecture, 21.10.2026. No application change, migration, rate approval or publication. Source and bounded working evidence: CODE_AUDIT.md and FEATURE_MAP.csv. Benchmark observations supplied by the parent browser audit: USM distinguishes module dimensions from external dimensions; Roomle exposes a part list with article IDs and quantities; an IKEA add/undo interaction updates both the model and displayed price. These observations inform acceptance criteria; they do not establish equivalent functionality in Gamefields or describe every competitor product.

## Preserve the current system

Keep the existing Studio Project and Zod validation, stable arenaModel IDs/product codes, legacy automatic-title migration and user-defined names. Keep JSON import/export and browser-local draft recovery working before adding any persistence service. Preserve300patterns,19palettes,12Signature presets,all sport profiles,prepared images,hiddenKraków,source Blender geometry and asset paths. Preserve existing source-specific slab thickness and default blank panel lettering/line policy. Do not touch frozen applied SQL or revive retired PLAY. Dirty root OS and active Studio remain separate checkouts/deployment units; no replacement engine or indiscriminate copy between them.

## Additive bounded contracts

| Contract | Existing owner | Proposed extension and boundary |
|---|---|---|
| Product registry | public/catalog/product-names.json, sport profiles | Reference stable productId/code, family and source revision. Extend through an adapter; retain old names as aliases and leave media URLs stable. |
| Project appearance | Existing Project fields and objects | Continue controlling material,pattern,palette,colours,lines,branding and scene. Source revision and technical options may be referenced additively; old JSON must parse without them. |
| Geometry | Source Blender assets, court geometry helpers, scene calibration | Distinguish playable dimensions,module pitch,external envelope,clearance and actual surfacing polygon. Do not treat photo perspective or rectangular bounding area as a measured quantity. |
| Assembly/BOM | GF-OWNED-ASSEMBLY-1, owned modular engine | Generate derived articleId,quantity,unit,family,sourceRevision from validated assembly. Instances remain family-owned,unit scale and discrete module growth. Source-only families stay source-only until actual component models and joins are verified. |
| Estimate | Existing quote API, currently disconnected UI | Separate versioned rate set,quantity basis,currency,tax assumptions,scope/exclusions and status. Keep live calculation OFF until owner-approved commercial data and API tests exist. |
| Inquiry | Current summary and origin-checked handoff | Compose a human-readable snapshot and validated payload referencing Project/assembly/estimate versions. Add transport acknowledgement and completeness checks before delivery claims. Never silently truncate JSON. |

Adapters derive BOM and quote requests; appearance is not a bill of materials. Identical colours do not imply identical engineering configuration. A validated assembly is not a signed construction design. A local draft is not cloud sync. A decorative Court Objects price is not an arena estimate.

## Twelve conceptual modules within four existing tools

These are responsibilities and contextual sections, not twelve new tabs.

| Conceptual module | Existing entry point | Context and ownership |
|---|---|---|
| 1 Sport | Konstrukcja → Zmień boisko | Existing sport profiles; expose only after preview/constraints verification. |
| 2 Realisation type | Konstrukcja | New/renovation/event decision proposed as a compatible optional reference, not inferred from a scene. |
| 3 Dimensions | Konstrukcja | Source arena dimensions read-only; generic dimensions explicitly distinguish plan from calibrated photo. |
| 4 Surface | Nawierzchnia | Current material picker and relevant material limitations. |
| 5 Style/pattern library | Nawierzchnia → Zmień wzór | Keep Signature and full300catalog rather than duplicate library. |
| 6 Colours | Nawierzchnia | Preserve19palettes and custom colours. |
| 7 Lines/zones | Nawierzchnia | Existing toggle,line colour and sport semantics. |
| 8 Construction/equipment | Konstrukcja / Wyposażenie | Construction source/family and appearance in the former; compatible optional objects in the latter. |
| 9 Branding | Nawierzchnia / Grafika | Add floor logo/text in Surface; select/transform/manage objects in Graphics; panel branding remains construction-specific. |
| 10 Preview/variant comparison | Shared preview + contextual summary | Existing cameras/undo remain; explicit saved variant snapshots are a later additive capability. |
| 11 Calculation | Contextual summary | Individual quote now; estimate shown only with approved rates and visibly stated assumptions. |
| 12 Summary/inquiry | Existing Podsumowanie | Editable groups,downloadJSON and contact handoff,with future delivery verification. |

Keep files reachable through existing Pliki; keep scene/location controls contextual. Disclose advanced settings progressively and preserve the currently tested keyboard,dialog focus and mobile panel behavior.

## Geometry and quantity semantics

Following the observed USM distinction, label module pitch separately from exterior dimensions. A cage diameter,goal projection and outer foundation must not share one ambiguous length. Represent the technical quantities in an adapter keyed by stable source revision; no mandatory change to legacy Project fields. For Octagon obtain actual polygon area before estimating surfacing; current bbox display remains honest. Photo plates stay labelled conceptual when dimensions differ from their calibrated15×10scene. Engineering clearance and permissible joins require verified source data, not graphical guesswork.

Following the observed Roomle part list, show articleId and quantity from owned-engine BOM. Article IDs need an owner-maintained mapping to real components and revisions; UI mesh IDs alone are not supplier article numbers. One compatible family per assembly remains mandatory, with invalid/mixed/external/scaled inputs rejected. Do not generalise the rule away to enable visually attractive but unsupported combinations.

## Consistent changes, undo and estimates

Following the observed IKEA add/undo behavior, a configuration transaction should update the appearance/assembly snapshot and derived quantities together. Undo restores the prior canonical configuration; BOM and any enabled estimate are recomputed from it rather than maintained as independently mutable counters. A stale asynchronous quote must never replace a newer one. Existing free-form object movement remains a visual operation unless explicitly tied to a validated technical instance. Until rate approval the UI continues individual quotation; no placeholder numeric totals.

## Incremental delivery and release gates

Sprint0 freezes the evidence map,contracts,risks and ordered backlog. Sprint1 may fix proven copy/navigation issues without replacing the workspace. Sprints2–4 extend rendering,personalisation and technical assembly through small adapters. Sprint5 may enable estimates only after commercial approval and complete tests. Sprint6 measures performance and stabilises the integrated flows.

Every implemented slice needs a rollback path,old-JSON fixtures,approved scope and relevant regression evidence. Required repository checks remain TypeScript,test:studio,build,test:mobile; add targeted Blender,Surface,owned-engine,Radar,inquiry and estimate tests for affected contracts. Keep benchmark claims separate from shipped capability. CSS viewport reflow is an approximation of200% workspace size, not native browser zoom or physical-device research; no certification claim follows from these checks.
