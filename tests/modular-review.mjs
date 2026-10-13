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
  await page.getByRole("link", { name: "COMPONENT LIBRARY v1.0 ↗" }).click();
  await page
    .getByRole("heading", { name: "Komponenty, nie skalowany model." })
    .waitFor();
  assert.equal(await page.locator("article").count(), 12);
  await page.getByRole("link", { name: "← MODULAR PRODUCT" }).click();
  await page.getByTestId("live-bom").waitFor();
  assert.equal(await page.getByRole("link", { name: "WASZE PANELE / MODELE Z BLENDERA ↗" }).count(), 0);
  await page.goto(base + "?view=source");
  await page.getByRole("heading", { name: "Modele w przygotowaniu." }).waitFor();
  assert.equal(await page.getByTestId("source-glb-viewer").count(), 0);
  assert.equal(await page.getByRole("link", { name: /Pobierz/ }).count(), 0);
  await page.goto(base + "?view=viewer&product=boisko-w1");
  await page.locator("[data-instance-id]").first().waitFor();
  assert.equal(await page.getByTestId("native-configurator").count(), 0);
  assert.equal(existsSync("dist/modular-review/models"), false, "No native files in published artifact");
  const privateLibrary = JSON.parse(await readFile("assets/private/gamefields/library.json", "utf8"));
  for (const asset of [...privateLibrary.sources, ...privateLibrary.components]) {
    const response = await page.request.get(base + "/models/gamefields/" + asset.file);
    assert.equal(response.status(), 404, asset.file + " must not be public");
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  console.log(
    "PASS: static public review, live modular growth, budget, fixed panel sizes, upper layer, catalogue navigation and mobile; native preview withheld; all 15 native GLB endpoints return 404; no external requests or runtime errors.",
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
