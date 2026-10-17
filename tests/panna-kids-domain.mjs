import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
await mkdir(".sites-runtime/panna-tests", { recursive: true });
const out = resolve(".sites-runtime/panna-tests/product.mjs");
const bundle = await build({
  entryPoints: ["lib/products/panna-kids.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
await writeFile(out, bundle.outputFiles[0].text);
const {
  pannaConfigurationSchema,
  pannaInquirySchema,
  newPannaConfiguration,
  pannaBrief,
  PANNA_KIDS,
  PANNA_KIDS_TARGET,
  pannaKidsEvidence,
} = await import(pathToFileURL(out).href);
const c = newPannaConfiguration(crypto.randomUUID());
assert.ok(pannaConfigurationSchema.safeParse(c).success);
for (const change of [
  { lengthM: 7 },
  { priceNetPln: 1 },
  { schemaVersion: 2 },
  { catalogueVersion: 2 },
  { productId: "boisko-w1" },
  { color: "invalid" },
  { revision: -1 },
])
  assert.equal(
    pannaConfigurationSchema.safeParse({ ...c, ...change }).success,
    false,
    JSON.stringify(change),
  );
assert.equal(PANNA_KIDS.dimensionsM, null);
assert.equal(PANNA_KIDS.priceNetPln, null);
assert.equal(PANNA_KIDS_TARGET.approved, false);
assert.equal(PANNA_KIDS_TARGET.confirmedCostNetPln, null);
assert.equal(
  PANNA_KIDS_TARGET.maximumAllInCostNetPln,
  PANNA_KIDS_TARGET.priceNetPln *
    (1 - PANNA_KIDS_TARGET.targetGrossMarginPct / 100),
);
const body = {
  submissionId: crypto.randomUUID(),
  configuration: { ...c, city: "Warszawa" },
  contact: { name: "Test", email: "test@example.test", company: "", note: "" },
  acknowledged: true,
};
assert.ok(pannaInquirySchema.safeParse(body).success);
assert.equal(
  pannaInquirySchema.safeParse({ ...body, acknowledged: false }).success,
  false,
);
assert.equal(
  pannaInquirySchema.safeParse({
    ...body,
    contact: { ...body.contact, email: "bad" },
  }).success,
  false,
);
assert.equal(
  pannaInquirySchema.safeParse({ ...body, configuration: { ...c, city: "" } })
    .success,
  false,
);
const bytes = await readFile("public/products/panna-kids/panna-kids.glb");
assert.equal(
  createHash("sha256").update(bytes).digest("hex"),
  pannaKidsEvidence.sha256,
);
assert.deepEqual(
  bytes,
  await readFile("assets/private/gamefields/source/panna-kids-o1.glb"),
);
assert.deepEqual(
  pannaKidsEvidence.inventory.map((r) => r.quantity),
  [6, 4, 2, 2, 8, 4],
);
assert.equal(pannaKidsEvidence.meshCount, 172);
assert.equal(pannaKidsEvidence.confirmedManufacturingDimensions, null);
assert.ok(pannaBrief(c).includes("BUDGETARY_DEFAULT"));
assert.ok(!pannaBrief(c).includes(".glb"));
console.log(
  "PASS: Panna Kids source identity, observed inventory, unconfirmed specification, explicit pricing target, strict versioned configuration and inquiry validation.",
);
