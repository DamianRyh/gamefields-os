# Pricing rebuild validation — 2026-10-21

- TypeScript: PASS.
- studio-scope: PASS,300patterns/19palettes/12Signature,hiddenKraków and retired account scope preserved.
- product-names and studio-ux: PASS;8stable IDs,custom names,colours and geometry preserved.
- quote-engine: PASS;8Blenderfloor quantities checked against actual top triangles, billable quantity rounded to display precision,unknown rates,partial totals,equipment,lines,complexity,VAT/cents,invalid card rejection.
- built Worker quote-api: PASS with test-only rates, no rates and malformed configuration; validates request/schema/pattern/size and no-store; amount updates with dimensions.
- Build: PASS. Existing large-chunk and Leaflet asset-resolution warnings remain; no new performance-score claim.
- Existing mobile regression: PASS96O1/P1 +48Street scene combinations,16P1material switches,JSON colours,draft persistence,Radar flow at375/390/430/1440. An earlier attempt timed out while build output was being regenerated; rerun on stable artifacts passed. No renderer changes.
- Manual CUA: desktop/mobile390 summary; page width390,dialog366 within viewport; local fixture line toggle adds200net and undo restores previous price. Fixture version TEST-NOT-FOR-SALE never installed in production. Final copy and two-decimal billing adjustment checked by TypeScript/domain and rebuilt API tests; no change to camera/material flows.

Production numeric rates are outstanding. Owner was asked for the rate sheet after runtime inspection showed no QUOTE_* configuration. This release restores requests, quantities, itemisation and valid estimate/partial/unpriced/error states; it does not manufacture commercial prices. Source deployment receipt and production screenshots are recorded with the repository publication report.

No production customer/project data,Blenderassets,JSONschema or SQLmigrations changed. No new inquiry test or email sent. The existing18000-character inquiry handoff limit remains a known boundary for exceptionally large projects; this release puts the current estimate first but does not claim complete long-project transport.
