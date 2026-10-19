import assert from "node:assert/strict";
import {testPannaKidsFlow} from "./panna-kids-flow.mjs";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const html = await readFile("dist/modular-review/index.html");
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (pathname.startsWith("/configurator-backgrounds/") || pathname.startsWith("/models/gamefields/") || pathname.startsWith("/products/panna-kids/")) {
    const file = resolve("dist/modular-review", "." + pathname),
      root = resolve("dist/modular-review") + "/";
    if (!file.startsWith(root)) {
      response.writeHead(400).end();
      return;
    }
    try {
      const data = await readFile(file);
      response.setHeader(
        "Content-Type",
        file.endsWith(".png") ? "image/png" : file.endsWith(".glb") ? "model/gltf-binary" : file.endsWith(".webp") ? "image/webp" : "application/json",
      );
      response.end(data);
    } catch {
      response.writeHead(404).end();
    }
    return;
  }
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.end(html);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [],
    external = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (/^https?:/.test(request.url()) && !request.url().startsWith(base))
      external.push(request.url());
  });
  await page.goto(base);
  await page.locator("[data-instance-id]").first().waitFor();
  const count = await page.locator("[data-instance-id]").count();
  const budget = await page.getByTestId("live-budget").innerText();
  await page.getByRole("slider", { name: /^Długość/ }).press("ArrowRight");
  await page.waitForFunction(
    (count) => document.querySelectorAll("[data-instance-id]").length > count,
    count,
  );
  assert.notEqual(await page.getByTestId("live-budget").innerText(), budget);
  assert.ok(
    await page
      .locator('[data-component="PANEL_STANDARD"]')
      .evaluateAll((nodes) =>
        nodes.every((node) => node.style.width === "51px"),
      ),
  );
  await page.getByRole("slider", { name: /^Piłkochwyt/ }).press("Home");
  await page.waitForFunction(
    () => !document.querySelector('[data-component="BALLSTOP_POST"]'),
  );
  await page.getByRole("link", { name: "COMPONENT LIBRARY v1.0 ↗" }).click();
  await page
    .getByRole("heading", { name: "Komponenty, nie skalowany model." })
    .waitFor();
  assert.equal(await page.locator("article").count(), 12);
  await page.getByRole("link", { name: "← MODULAR PRODUCT" }).click();
  await page.getByTestId("live-bom").waitFor();
  assert.equal(await page.getByRole("link", { name: "WASZE PANELE / MODELE Z BLENDERA ↗" }).count(), 1);
  await page.goto(base + "?view=source");
  await page.waitForFunction(()=>document.querySelector('[data-testid="source-glb-viewer"]')?.dataset.loaded==='true');
  assert.equal(await page.getByRole('button',{name:'CZĘŚCI',exact:true}).count(),1);
  await page.getByRole('button',{name:'CZĘŚCI',exact:true}).click();
  await page.waitForFunction(()=>{const d=document.querySelector('[data-testid="source-glb-viewer"]')?.dataset;return d?.loaded==='true'&&d.assetUrl.includes('/components/k1.glb')});
  await page.getByRole('button',{name:'SKŁADANIE K1',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-testid="source-glb-viewer"]')?.dataset.instanceCount==='3');
  await page.goto(base + "?view=viewer&product=boisko-w1");
  await page.getByTestId("native-configurator").waitFor();
  assert.equal(await page.getByTestId("native-configurator").count(), 1);
  const privateLibrary = JSON.parse(await readFile("assets/private/gamefields/library.json", "utf8"));
  for (const asset of [...privateLibrary.sources, ...privateLibrary.components]) {
    const response = await page.request.get(base + "/models/gamefields/" + asset.file);
    assert.equal(response.status(), 200, asset.file);
  }
  await testPannaKidsFlow(page,{url:base+"?view=panna-kids",production:false});
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  console.log(
    "PASS: static public review, live modular growth, budget, fixed panel sizes, upper layer, catalogue navigation and mobile; all owner-approved source and component GLBs public; no external requests or runtime errors.",
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
