import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
const directory = path.resolve(".sites-runtime/modular-tests");
await mkdir(directory, { recursive: true });
const bundle = await build({
  stdin: {
    contents:
      'export * from "./app/engineering/modular-pipeline";export * from "./app/engineering/component-library";export * from "./app/engineering/modular-product";export * from "./app/engineering/modular";',
    resolveDir: process.cwd(),
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const target = path.join(directory, "pipeline.mjs");
await writeFile(target, bundle.outputFiles[0].text);
const {
  generateModularProduct,
  modularRequestSchema,
  GAMEFIELDS_COMPONENT_LIBRARY,
  componentByAssetKey,
  summarizeModularProduct,
  DEFAULT_MODULAR_PRICEBOOK_PLN,
  buildRectangularModularLayout,
} = await import(pathToFileURL(target).href);
let cases = 0;
for (const shape of ["RECTANGLE", "CIRCLE"])
  for (const goalCount of [0, 1, 2])
    for (const gateCount of [0, 1, 2])
      for (const ballStopHeightM of [0, 3, 5]) {
        const product = generateModularProduct({
          shape,
          goalCount,
          gateCount,
          ballStopHeightM,
          brandingPanelCount: 12,
        });
        const { geometry, layout, scene3d, structuralModel, productSummary } =
          product;
        assert.equal(
          layout.panels.length,
          geometry.panels.length,
          "Openings replace slots",
        );
        assert.equal(
          layout.panels.filter((p) => p.role === "goal").length,
          goalCount,
        );
        assert.equal(
          layout.panels.filter((p) => p.role === "gate").length,
          gateCount,
        );
        assert.equal(
          new Set(scene3d.instances.map((i) => i.id)).size,
          scene3d.instances.length,
        );
        const perimeter = scene3d.instances.filter((i) =>
          [
            "PANEL_STANDARD",
            "PANEL_BRANDING",
            "GOAL_MODULE",
            "GATE_MODULE",
          ].includes(i.component),
        );
        assert.equal(perimeter.length, layout.moduleCount);
        assert.ok(
          perimeter.every((i) => i.dimensionsM.x === 1.5),
          "Fixed module length",
        );
        assert.equal(
          scene3d.instances.filter((i) => i.component === "POST_STANDARD")
            .length,
          layout.postsCount,
        );
        const upper = scene3d.instances.filter(
          (i) => i.component === "BALLSTOP_POST",
        );
        assert.equal(upper.length, ballStopHeightM ? layout.postsCount : 0);
        assert.equal(structuralModel.meta.totalHeightM, 1 + ballStopHeightM);
        assert.equal(
          Math.max(...structuralModel.nodes.map((n) => n.z)),
          1 + ballStopHeightM,
        );
        assert.equal(
          structuralModel.members.filter((m) => m.type === "goal").length,
          goalCount,
        );
        assert.equal(
          structuralModel.members.filter((m) => m.type === "gate").length,
          gateCount,
        );
        for (const line of productSummary.bom) {
          const matching = scene3d.instances.filter(
            (i) => i.assetKey === line.assetKey,
          );
          const actual =
            line.unit === "pcs"
              ? matching.length
              : Math.round(
                  matching.reduce(
                    (total, i) => total + i.dimensionsM.x * i.dimensionsM.z,
                    0,
                  ) * 100,
                ) / 100;
          assert.equal(line.quantity, actual, `BOM ↔ instances ${line.id}`);
        }
        assert.equal(
          productSummary.totalBudgetNetPln,
          Math.round(
            productSummary.bom.reduce((sum, b) => sum + b.totalBudgetPln, 0) *
              100,
          ) / 100,
        );
        assert.equal(productSummary.sourceStatus, "BUDGETARY_DEFAULT");
        assert.equal(product.engineeringGate.approved, false);
        assert.equal(
          structuralModel.modularProduct.engineerApprovalRequired,
          true,
        );
        scene3d.instances.forEach((i) =>
          assert.equal(componentByAssetKey(i.assetKey).id, i.componentId),
        );
        assert.equal(
          layout.specialModules.corners.length,
          shape === "RECTANGLE" ? 4 : 0,
        );
        cases++;
      }
const a = generateModularProduct({ lengthM: 15, widthM: 10.5 });
const b = generateModularProduct({ lengthM: 16.5, widthM: 10.5 });
assert.equal(b.layout.moduleCount, a.layout.moduleCount + 2);
assert.equal(b.layout.postsCount, a.layout.postsCount + 2);
assert.ok(b.structuralModel.nodes.length > a.structuralModel.nodes.length);
assert.ok(
  b.productSummary.totalBudgetNetPln > a.productSummary.totalBudgetNetPln,
);
assert.deepEqual(
  a.scene3d.instances
    .filter((i) => i.component === "PANEL_STANDARD")
    .map((i) => i.dimensionsM.x),
  Array(
    a.scene3d.instances.filter((i) => i.component === "PANEL_STANDARD").length,
  ).fill(1.5),
);
const circleA = generateModularProduct({ shape: "CIRCLE", diameterM: 7 });
const circleB = generateModularProduct({ shape: "CIRCLE", diameterM: 8.5 });
assert.ok(circleB.layout.moduleCount > circleA.layout.moduleCount);
assert.deepEqual(
  generateModularProduct({ lengthM: 16.5, widthM: 10.5 }),
  b,
  "Deterministic full pipeline",
);
for (const input of [
  null,
  { shape: "TRIANGLE" },
  { lengthM: Infinity },
  { lengthM: 0 },
  { lengthM: 100000 },
  { goalCount: NaN },
  { gateCount: 1.2 },
  { ballStopHeightM: -1 },
  { brandingPanelCount: 1e8 },
])
  assert.equal(modularRequestSchema.safeParse(input).success, false);
assert.throws(() => buildRectangularModularLayout(Infinity, 10));
assert.throws(() =>
  buildRectangularModularLayout(15, 10, {
    shape: "RECTANGLE",
    moduleWidthM: 0,
    minModulesPerSide: 4,
    id: "invalid",
    boardHeightM: 1,
  }),
);
assert.throws(() =>
  summarizeModularProduct(a.layout, {
    ...DEFAULT_MODULAR_PRICEBOOK_PLN,
    goalModulePlnEach: NaN,
  }),
);
assert.equal(Object.keys(GAMEFIELDS_COMPONENT_LIBRARY).length, 12);
assert.equal(
  new Set(Object.values(GAMEFIELDS_COMPONENT_LIBRARY).map((c) => c.assetKey))
    .size,
  12,
);
for (const component of Object.values(GAMEFIELDS_COMPONENT_LIBRARY)) {
  assert.equal(component.dimensions.status, "UNCONFIRMED");
  assert.equal(component.dimensions.xM, null);
  assert.equal(component.weightKg, null);
  assert.equal(component.connectionPoints, null);
  assert.equal(component.glb.url, null);
  assert.equal(component.engineerApproval, "REQUIRED");
  component.compatibleWith.forEach((id) =>
    assert.ok(GAMEFIELDS_COMPONENT_LIBRARY[id]),
  );
}
console.log(
  `PASS: ${cases} rectangle/circle configurations; replacement slots, fixed lengths, structural heights/openings, scene/BOM/budget agreement, growth, validation, Engineer Gate and 12 component contracts.`,
);
