import assert from "node:assert/strict";
import {testPannaKidsFlow} from "./panna-kids-flow.mjs";
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
const base = process.env.MODULAR_VIEWER_URL || "http://127.0.0.1:5173";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/engineering/modular-3d");
  await page
    .locator('[data-testid="modular-scene"] [data-component="PANEL_STANDARD"]')
    .first()
    .waitFor();
  await page.waitForTimeout(700);
  const instances = () => page.locator("[data-instance-id]");
  const count = await instances().count();
  const budget = await page
    .locator('[data-testid="live-budget"] b')
    .innerText();
  await page.getByRole("slider", { name: /^Długość/ }).press("ArrowRight");
  await page.waitForFunction(
    (n) => document.querySelectorAll("[data-instance-id]").length > n,
    count,
  );
  assert.notEqual(
    await page.locator('[data-testid="live-budget"] b').innerText(),
    budget,
  );
  const panelWidths = await page
    .locator('[data-component="PANEL_STANDARD"]')
    .evaluateAll((nodes) => nodes.map((n) => n.style.width));
  assert.ok(
    panelWidths.every((width) => width === "51px"),
    "No stretching to fit dimensions",
  );
  const grownCount = await instances().count();
  await page.getByRole("slider", { name: /^Długość/ }).press("ArrowLeft");
  await page.waitForFunction(
    (n) => document.querySelectorAll("[data-instance-id]").length < n,
    grownCount,
  );
  assert.equal(await instances().count(), count);
  await page.getByRole("slider", { name: /^Piłkochwyt/ }).press("Home");
  await page.waitForFunction(
    () => !document.querySelector('[data-component="BALLSTOP_POST"]'),
  );
  assert.equal(
    await page.locator('[data-component="BALLSTOP_PANEL"]').count(),
    0,
  );
  const beforeGate = await instances().count();
  await page.getByRole("slider", { name: /^Wejścia/ }).press("End");
  await page.waitForFunction(
    () =>
      document.querySelectorAll('[data-component="GATE_MODULE"]').length === 2,
  );
  assert.equal(
    await instances().count(),
    beforeGate,
    "Gate replaces a panel; no overlay",
  );
  for (const type of [
    "PANEL_STANDARD",
    "PANEL_BRANDING",
    "GOAL_MODULE",
    "GATE_MODULE",
    "POST_STANDARD",
    "CORNER_STANDARD",
  ])
    assert.ok(
      (await page.locator(`[data-component="${type}"]`).count()) > 0,
      type + " visible",
    );
  await page.getByRole("button", { name: "Panna", exact: true }).click();
  await page.waitForFunction(
    () => !document.querySelector('[data-component="CORNER_STANDARD"]'),
  );
  assert.equal(await page.locator('[data-component="GATE_MODULE"]').count(), 2);
  const circleCount = await instances().count();
  await page.getByRole("slider", { name: /^Średnica/ }).press("End");
  await page.waitForFunction(
    (n) => document.querySelectorAll("[data-instance-id]").length > n,
    circleCount,
  );
  for (const input of [
    { shape: "TRIANGLE" },
    { goalCount: 3 },
    { gateCount: 1.1 },
    { ballStopHeightM: -1 },
    { lengthM: 100000 },
  ]) {
    const response = await page.request.post(
      base + "/api/engineering/modular",
      { data: input },
    );
    assert.equal(response.status(), 400);
  }
  const response = await page.request.post(base + "/api/engineering/modular", {
    data: { lengthM: 16.5, gateCount: 2, ballStopHeightM: 0 },
  });
  assert.equal(response.status(), 200);
  const json = await response.json();
  assert.equal(json.engineeringGate.approved, false);
  assert.equal(json.structuralModel.meta.totalHeightM, 1);
  assert.equal(json.layout.specialModules.gates.length, 2);
  const registry = await page.request.get(base + "/api/engineering/components");
  assert.equal((await registry.json()).components.length, 12);
  await mkdir("outputs/modular", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "No horizontal overflow",
    );
    await page.screenshot({
      path: `outputs/modular/viewer-${width}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("link", { name: "COMPONENT LIBRARY v1.0 ↗" }).click();
  await page
    .getByRole("heading", { name: "Komponenty, nie skalowany model." })
    .waitFor();
  assert.equal(await page.locator("article").count(), 12);
  assert.equal(await page.getByRole("link", {name:/^WASZE MODELE GLB/}).count(), 1);
  await page.goto(base + "/engineering/source-models");
  await page.waitForFunction(()=>document.querySelector('[data-testid="source-glb-viewer"]')?.dataset.loaded==='true');
  assert.equal(await page.getByTestId("source-glb-viewer").count(), 1);
  const glbResponse = await page.request.get(base + "/models/gamefields/source/boisko-w1.glb");
  assert.equal(glbResponse.status(), 200);
  await page.goto(base + "/engineering/modular-3d?product=boisko-p1&scene=urban");
  await page.waitForFunction(()=>{const d=document.querySelector('[data-testid="source-glb-viewer"]')?.dataset;return d?.loaded==='true'&&d.backgroundReady==='true'&&d.cameraMode==='fixed-scene'},{},{timeout:60000});
  await testPannaKidsFlow(page,{url:base+"/products/panna-kids",production:true});
  assert.deepEqual(errors, []);
  console.log(
    "PASS: live slider growth/removal, constant panel width, BOM/budget, gate replacement, circle gates, upper layer removal, API validation, catalogue and responsive viewer.",
  );
} finally {
  await browser.close();
}
