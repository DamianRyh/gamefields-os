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
  const owned=page.frameLocator('[data-testid="owned-modular"]');
  await owned.locator('canvas[data-ready="true"]').waitFor({timeout:60000});
  assert.equal(await owned.locator('#family-label').textContent(),'Panna Grid');
  const count=Number(await owned.locator('#count').textContent());
  await owned.getByRole('slider',{name:'Moduły na długości',exact:true}).press('ArrowRight');
  await owned.locator(`canvas[data-ready="true"][data-instance-count="${count+4}"]`).waitFor();
  assert.equal(await owned.locator('canvas').getAttribute('data-scales'),'1,1,1');
  await owned.getByRole('slider',{name:'Moduły na długości',exact:true}).press('ArrowLeft');
  await owned.locator(`canvas[data-ready="true"][data-instance-count="${count}"]`).waitFor();
  await owned.getByLabel('Rodzina konstrukcji').selectOption('octagon');
  await owned.locator('canvas[data-ready="true"][data-family="octagon"]').waitFor();
  assert.equal(await owned.locator('#count').textContent(),'16');
  assert.equal(await owned.locator('#family-label').textContent(),'Panna Octa');
  await owned.getByRole('button',{name:'Komponent',exact:true}).click();
  await owned.locator('canvas[data-ready="true"][data-instance-count="1"]').waitFor();
  assert.equal(await owned.locator('canvas').getAttribute('data-scales'),'1,1,1');
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
    "PASS: owner component families, approved names, module growth/removal, rigid scale, part isolation, API validation, catalogue and responsive viewer.",
  );
} finally {
  await browser.close();
}
