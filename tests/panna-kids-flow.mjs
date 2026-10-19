import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
export async function testPannaKidsFlow(page, { url, production }) {
  await page.goto(url);
  await page
    .getByRole("heading", { name: "Małe boisko. Wielka gra." })
    .waitFor();
  await page.locator("input").first().waitFor();
  const name = page.getByLabel("Nazwa projektu", { exact: true });
  await name.fill("Panna Kids / test wersji");
  await page.getByRole("button", { name: "Zapisz szkic", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Zapisano szkic" })
    .waitFor();
  const firstSaved = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("gamefields:panna-kids:projects:v1"))[0],
  );
  assert.equal(firstSaved.name, "Panna Kids / test wersji");
  await page.reload();
  await page.waitForFunction(
    () => document.querySelector("input")?.disabled === false,
  );
  assert.equal(await name.inputValue(), "Panna Kids / test wersji");
  await page.getByRole("button", { name: /02.*Wygląd/ }).click();
  await page
    .getByRole("button", { name: "Głęboki niebieski", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Obróć model 3D", exact: true })
    .click();
  await page.waitForFunction(() => {
    const d = document.querySelector(
      '[data-testid="source-glb-viewer"]',
    )?.dataset;
    return (
      d?.loaded === "true" &&
      d?.meshCount === "172" &&
      d?.panelColor === "#2544a0"
    );
  });
  assert.equal(
    await page
      .getByTestId("source-glb-viewer")
      .getAttribute("data-instance-scales"),
    "1,1,1",
  );
  await page.getByRole("button", { name: "Ciepła biel", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="source-glb-viewer"]')?.dataset
        .panelColor === "#e8e4d8",
  );
  await page.getByLabel("Preferencja nawierzchni").selectOption("epdm");
  await page.getByRole("button", { name: /03.*Zakres/ }).click();
  await page.getByLabel("Chcę omówić branding / oznaczenia").check();
  await page.getByLabel("Montaż", { exact: true }).selectOption("request");
  await page.getByRole("button", { name: /04.*Miejsce/ }).click();
  await page.getByLabel("Miasto realizacji").fill("Gdańsk");
  await page.getByLabel("Stan miejsca").selectOption("existing");
  await page.getByRole("button", { name: "Zapisz szkic", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Zapisano szkic" })
    .waitFor();
  const saved = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("gamefields:panna-kids:projects:v1"))[0],
  );
  assert.equal(saved.city, "Gdańsk");
  assert.equal(saved.color, "chalk");
  assert.equal(saved.branding, true);
  assert.equal(saved.contact, undefined);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page
    .getByRole("button", { name: "Udostępnij link", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Skopiowano link" })
    .waitFor();
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  const parsed = JSON.parse(new URL(shared).searchParams.get("config"));
  assert.deepEqual(parsed, saved);
  assert.equal(parsed.email, undefined);
  await page.goto(shared);
  await page
    .getByRole("status")
    .filter({ hasText: "Otworzono udostępniony szkic" })
    .waitFor();
  assert.equal(await name.inputValue(), saved.name);
  await page.getByRole("button", { name: /05.*Podsumowanie/ }).click();
  assert.equal(
    await page.getByRole("slider").count(),
    0,
    "No invented resizable product geometry",
  );
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Pobierz brief", exact: true })
    .click();
  const download = await downloadEvent;
  assert.match(
    download.suggestedFilename(),
    /^GAMEFIELDS-Panna-Kids-r\d+\.txt$/,
  );
  if (production) {
    await page.getByLabel("Imię i nazwisko").fill("Test Panna");
    await page
      .getByLabel("E-mail", { exact: true })
      .fill("panna-ui@example.test");
    await page
      .getByLabel("Organizacja — opcjonalnie")
      .fill("Test Organization");
    await page
      .getByLabel(
        "Rozumiem, że wysyłam preferencje do wyceny, a nie zamówienie.",
      )
      .check();
    const endpoint = "**/api/products/panna-kids/inquiries";
    await page.route(endpoint, (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "INQUIRY_STORAGE_UNAVAILABLE" }),
      }),
    );
    await page
      .getByRole("button", { name: "Wyślij zapytanie o ofertę →", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "Nie udało się potwierdzić zapisu zapytania" })
      .waitFor();
    assert.equal(
      await page.getByLabel("E-mail", { exact: true }).inputValue(),
      "panna-ui@example.test",
    );
    assert.equal(
      await page
        .getByRole("status")
        .filter({ hasText: "Zapytanie przyjęte" })
        .count(),
      0,
    );
    await page.unroute(endpoint);
    await page
      .getByRole("button", { name: "Wyślij zapytanie o ofertę →", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "Zapytanie przyjęte" })
      .waitFor();
    assert.equal(new URL(page.url()).searchParams.get("email"), null);
  } else {
    assert.equal(
      await page.getByRole("button", { name: /Wyślij zapytanie/ }).count(),
      0,
    );
    assert.equal(await page.getByLabel("E-mail", { exact: true }).count(), 0);
    await page
      .getByRole("heading", { name: "Przygotuj brief do rozmowy." })
      .waitFor();
  }
  await mkdir("outputs/panna-kids", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "No horizontal overflow",
    );
    await page.screenshot({
      path: `outputs/panna-kids/${production ? "production" : "static"}-${width}.png`,
      fullPage: true,
    });
  }
  await page.reload();
  await page.waitForFunction(
    () => document.querySelector("input")?.disabled === false,
  );
  assert.equal(await name.inputValue(), saved.name);
  if (production)
    assert.equal(
      await page.getByLabel("E-mail", { exact: true }).inputValue(),
      "",
      "Contact details are not saved to browser storage",
    );
  const bad = new URL(url);
  bad.searchParams.set(
    "config",
    JSON.stringify({ ...saved, schemaVersion: 999 }),
  );
  await page.goto(bad.href);
  await page
    .getByRole("status")
    .filter({ hasText: "Link projektu jest nieprawidłowy" })
    .waitFor();
  assert.equal(await name.inputValue(), saved.name);
  console.log(
    `PASS: Panna Kids ${production ? "production inquiry" : "static brief"} flow: original GLB, live panel color, 1:1 scale, saved/reopened version, shared snapshot, download, responsive layout and invalid-link recovery.`,
  );
}
