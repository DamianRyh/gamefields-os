# Studio live estimate — 2026-10-21

Owner instruction: re-enable recalculation and rebuild it correctly. This supersedes the Sprint0 recommendation to leave quote calls disabled. The request is enabled again; no invented commercial prices are shipped.

## Public behavior

Summary action shows current calculation state. Summary displays itemised quantities and unit/line prices, net and gross where configured, exclusions and rate-card version. Loading clears the previous estimate; aborted/out-of-order requests cannot replace a newer project. Errors offer retry. Unknown items are not zero: a partial quote has no overall total, only an explicitly labelled subtotal. The inquiry handoff includes the current estimate snapshot alongside the existing project. Project JSON remains unchanged and never persists estimates as authoritative prices.

The former hidden cost/margin formula is replaced with explicit selling rates. No silent acrylic fallback, guessed equipment price or VAT rate. Background scenery and colours do not affect costs. Turf/sand do not charge the painted graphic. Two goal objects representing source-arena built-in goals are excluded from extra equipment; additional goals are separate. Source arena floor quantities come from the projected top triangles of current Blender meshes, including exterior slab margins and clipped corners. A test recomputes all eight quantities from source assets. Billable m² is rounded to two decimals before multiplication, matching displayed quantities. No source geometry is changed.

## Runtime configuration

Set **QUOTE_RATE_CARD** to an owner-supplied JSON object in the existing Site runtime environment. Production inspection found no QUOTE_* rates on2026-10-21; only the unrelated retained secret key was present. Missing rate card returns a successful `unpriced` calculation with quantities. Invalid configuration returns503 and retry UI. The public API never discloses internal cost/margin or secret runtime variables.

Required identity: `version` (nonempty text), `currency: "PLN"`. Optional `vatRate` is a fraction from0through1; omitted means gross unknown, never assumed23%. All prices below are nonnegative finite **net selling prices**; explicit0means included/free, omitted means unknown.

| Field | Unit / meaning |
|---|---|
| surfaces[stable material value].materialNetPerM2 | Material per m² |
| surfaces[stable material value].installationNetPerM2 | Surface installation per m² |
| patternNetPerM2["1"…"4"] | Graphic execution per m² by existing pattern complexity |
| linesNet | One complete sport line layout; one configured standard rate |
| arenaNet[stable arenaModel] | Base construction including built-in goals |
| arenaInstallationNet[stable arenaModel] | Construction installation; explicit0 if included in base |
| finishNet["gloss" or "metal"] | Surcharge from base matte finish |
| equipmentNet[exact equipment name] | Additional equipment per piece |
| brandingNetPerItem | Per floor graphic/text item and panel text/logo layer |
| designNet | Design preparation per project |
| transportNet | Transport assumption per project; location confirmed in offer |
| exclusions | Additional clear exclusions, array of strings |

Material keys remain `Akryl sportowy`, `EPDM`, `Sztuczna trawa 60 mm`, `Moduły sportowe`, `Piasek sportowy`, `Beton sportowy`. Arena keys remain `o1`, `p1`, `w1`, `circle-cage-1`, `circle-cage-2`, `street-field`, `street15`, `octagon`. Renaming public labels does not change these.

An empty, valid starting configuration below intentionally contains **no numeric prices**. Replace/add rates from the actual owner rate sheet; never deploy test fixture numbers as prices.

```json
{"version":"UZUPELNIJ-WERSJE-CENNIKA","currency":"PLN","surfaces":{},"patternNetPerM2":{},"arenaNet":{},"arenaInstallationNet":{},"finishNet":{},"equipmentNet":{},"exclusions":[]}
```

## Limits and verification

This is an indicative scope calculator, not engineering approval or a complete CPQ. Groundwork, foundation, utilities and permits are excluded. Special finish without a rate remains pending. Graphics are rated by existing complexity; scaling/rotation/shadow and positions do not infer extra engineering costs. No region, availability or tax jurisdiction is inferred from a preview background. Commercial confirmation of rates/conditions remains outstanding.

Checks: TypeScript; studio-scope; product-names; studio-ux; quote-engine; built Worker quote-api; build; existing mobile goals; manual CUA desktop/mobile summary. See the release receipt for actual completion results and remaining limits. Pricing fixtures are deliberately artificial and local only. No additional customer email was sent.
