import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const html = await readFile("dist/modular-review/index.html");
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (pathname.startsWith("/models/gamefields/")) {
    const file = resolve("dist/modular-review", "." + pathname),
      root = resolve("dist/modular-review/models/gamefields") + "/";
    if (!file.startsWith(root)) {
      response.writeHead(400).end();
      return;
    }
    try {
      const data = await readFile(file);
      response.setHeader(
        "Content-Type",
        file.endsWith(".glb") ? "model/gltf-binary" : "application/json",
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
  for (const [name, file, meshes] of [
    ["GAMEFIELDS P1", "boisko-p1", 358],
    ["Panna Kids O1", "panna-kids-o1", 172],
    ["GAMEFIELDS W1", "boisko-w1", 118],
  ]) {
    await page.getByRole("navigation", { name: "Wybierz produkt GAMEFIELDS" }).getByRole("button", { name, exact: true }).click();
    await page.waitForFunction(({file, meshes}) => {
      const d = document.querySelector('[data-testid="source-glb-viewer"]')?.dataset;
      return d?.loaded === "true" && d?.assetUrl?.endsWith('/' + file + '.glb') && d?.meshCount === String(meshes);
    }, {file, meshes});
    assert.equal(await page.getByTestId("live-budget").count(), 0, "Prototype rates must not price source parts");
    assert.equal(await page.getByTestId("modular-scene").count(), 0);
  }
  await page.reload();
  await page.getByTestId("native-configurator").waitFor();
  await page.getByRole("button", { name: "SKŁADANIE K1", exact: true }).click();
  await page.getByRole("slider", { name: "Liczba zespołów K1" }).press("End");
  await page.waitForFunction(() => document.querySelector('[data-testid="source-glb-viewer"]')?.dataset.meshCount === "96");
  assert.equal(await page.getByTestId("source-glb-viewer").getAttribute("data-instance-scales"), Array(8).fill("1,1,1").join(";"));
  await page.getByRole("navigation", { name: "Wybierz produkt GAMEFIELDS" }).getByRole("button", { name: "System koncepcyjny" }).click();
  await page.getByTestId("live-budget").waitFor();
  await page.getByRole("link", { name: "COMPONENT LIBRARY v1.0 ↗" }).click();
  await page
    .getByRole("heading", { name: "Komponenty, nie skalowany model." })
    .waitFor();
  assert.equal(await page.locator("article").count(), 12);
  await page.getByRole("link", { name: "← MODULAR PRODUCT" }).click();
  await page.getByTestId("live-bom").waitFor();
  await page
    .getByRole("link", { name: "WASZE PANELE / MODELE Z BLENDERA ↗" })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="source-glb-viewer"]')?.dataset
        .meshCount === "358" &&
      document.querySelector('[data-testid="source-glb-viewer"]')?.dataset
        .loaded === "true",
  );
  for (const [name, meshes] of [
    ["panna-kids-o1", 172],
    ["boisko-w1", 118],
  ]) {
    await page.getByRole("button", { name: new RegExp(name) }).click();
    await page.waitForFunction(
      (count) =>
        document.querySelector('[data-testid="source-glb-viewer"]')?.dataset
          .meshCount === String(count),
      meshes,
    );
  }
  await page.getByRole("button", { name: "CZĘŚCI", exact: true }).click();
  for (const [name, meshes] of [
    ["K1", 12],
    ["K2", 9],
    ["K3", 34],
    ["K4", 34],
    ["S1", 2],
    ["PO1", 12],
    ["PO2", 10],
    ["PO3", 11],
    ["RW1", 7],
    ["RW2", 15],
    ["ST1", 2],
    ["E1", 1],
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await page.waitForFunction(
      ({ count, name }) => {
        const d = document.querySelector(
          '[data-testid="source-glb-viewer"]',
        )?.dataset;
        return (
          d?.meshCount === String(count) &&
          d?.loaded === "true" &&
          d?.assetUrl?.endsWith("/" + name.toLowerCase() + ".glb")
        );
      },
      { count: meshes, name },
    );
  }
  await page.getByRole("button", { name: "SKŁADANIE K1", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="source-glb-viewer"]')?.dataset
        .instanceCount === "3",
  );
  await page.getByRole("slider", { name: "Liczba zespołów K1" }).press("End");
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="source-glb-viewer"]')?.dataset
        .instanceCount === "8",
  );
  assert.equal(
    await page.getByTestId("source-glb-viewer").getAttribute("data-mesh-count"),
    "96",
  );
  assert.ok(
    (
      await page
        .getByTestId("source-glb-viewer")
        .getAttribute("data-instance-scales")
    )
      .split(";")
      .every((scale) => scale === "1,1,1"),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.goto(base + "?view=source&model=boisko-w1");
  await page.waitForFunction(() => {
    const d = document.querySelector('[data-testid="source-glb-viewer"]')?.dataset;
    return d?.loaded === "true" && d?.assetUrl?.endsWith("/boisko-w1.glb") && d?.meshCount === "118";
  });
  assert.equal(await page.locator(".gf-source-choice").count(), 3);
  assert.equal(await page.getByRole("button", { name: /boisko-w1/ }).getAttribute("aria-pressed"), "true");
  await page.getByRole("button", { name: /boisko-p1/ }).click();
  assert.equal(new URL(page.url()).searchParams.get("model"), "boisko-p1");
  await page.reload();
  await page.waitForFunction(() => document.querySelector('[data-testid="source-glb-viewer"]')?.dataset.meshCount === "358");
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  console.log(
    "PASS: static public review, live modular growth, budget, fixed panel sizes, upper layer, catalogue navigation and mobile; 3 uploaded GLBs, 12 derived components, eight 1:1 K1 instances; no external requests or runtime errors.",
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
