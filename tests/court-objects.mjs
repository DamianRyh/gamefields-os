import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

let server;
let base = process.env.COURT_OBJECTS_URL || 'http://127.0.0.1:5173/objects';
if (process.env.COURT_OBJECTS_STANDALONE === '1') {
  const html = await readFile(new URL('../dist/court-objects/gamefields-court-objects/dist/index.html', import.meta.url));
  server = createServer((request, response) => { response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end(html); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port + '/court-objects/';
}
const screenshots = process.env.COURT_OBJECTS_SCREENSHOTS || 'outputs/court-objects';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await mkdir(screenshots, { recursive: true });
try {
  await page.goto(base);
  await page.getByRole('heading', { name: 'YOUR COURT', exact: true }).waitFor();
  await page.waitForTimeout(500);
  const art = page.locator('.co-art svg');
  const geometry = () => art.locator(':scope > g').first().innerHTML();
  const fingerprints = new Set();
  for (const sport of ['Football', 'Basketball', 'Tennis', 'Multi']) {
    await page.getByRole('button', { name: sport, exact: true }).click();
    await page.waitForTimeout(250);
    fingerprints.add(await geometry());
  }
  assert.equal(fingerprints.size, 4, 'Sports must change SVG geometry');
  await page.getByRole('button', { name: 'Football', exact: true }).click();
    await page.waitForTimeout(250);
  for (const palette of ['Night Game', 'Clay', 'Concrete', 'Forest', 'Heatwave', 'Varsity', 'Signal Blue']) {
    const before = await art.locator('rect').first().getAttribute('fill');
    await page.getByRole('button', { name: palette, exact: true }).click();
    await page.waitForTimeout(250);
    assert.notEqual(await art.locator('rect').first().getAttribute('fill'), before, 'Palette changes SVG fill');
  }
  const cropBefore = await art.locator(':scope > g').first().getAttribute('transform');
  await page.getByRole('button', { name: 'The corner', exact: true }).click();
    await page.waitForTimeout(250);
  assert.notEqual(await art.locator(':scope > g').first().getAttribute('transform'), cropBefore);
  for (const control of ['Scale', 'Horizontal', 'Vertical', 'Rotation']) {
    const transform = await art.locator(':scope > g').first().getAttribute('transform');
    await page.getByRole('slider', { name: new RegExp('^'+control) }).press('End');
    await page.waitForTimeout(100);
    assert.notEqual(await art.locator(':scope > g').first().getAttribute('transform'), transform, control+' changes SVG transform');
  }
  await page.getByRole('button', { name: 'Reset composition' }).click();
    await page.waitForTimeout(250);
  await page.getByRole('checkbox', { name: 'HIDE LABEL' }).check();
  await page.getByLabel('Court name', { exact: true }).fill('MY COURT');
  assert.equal(await art.locator('text').first().textContent(), 'MY COURT');
  const texture = page.getByRole('checkbox', { name: 'Subtle surface texture' });
  await texture.uncheck();
  assert.equal(await art.locator('rect[filter]').count(), 0);
  await texture.check();
  assert.equal(await art.locator('rect[filter]').count(), 1);
  const expected = [[249, 499, 699, 1149], [349, 599, 799, 1249], [499, 749, 949, 1399]];
  for (let f = 0; f < 3; f++) {
    await page.getByRole('button', { name: ['50 × 70 CM', '70 × 100 CM', '100 × 140 CM'][f] }).click();
    await page.waitForTimeout(250);
    for (let m = 0; m < 4; m++) {
      await page.getByRole('button', { name: new RegExp('^'+['Fine Art Print', 'Framed Print', 'Aluminium Panel', 'Court Surface Edition'][m]) }).click();
    await page.waitForTimeout(250);
      const rendered = await page.locator('.co-price').innerText();
      assert.equal(Number(rendered.split('PLN')[0].replace(/\D/g, '')), expected[f][m]);
    }
  }
  await page.getByRole('button', { name: 'ROOM VIEW', exact: true }).click();
    await page.waitForTimeout(250);
  await page.locator('.co-room-art').waitFor();
  const large = await page.locator('.co-room-art').boundingBox();
  await page.getByRole('button', { name: '50 × 70 CM' }).click();
    await page.waitForTimeout(250);
  await page.waitForTimeout(230);
  const small = await page.locator('.co-room-art').boundingBox();
  assert.ok(large.width > small.width, 'Room view shows physical size change');
  await page.getByRole('button', { name: 'ARTWORK', exact: true }).click();
    await page.waitForTimeout(250);
  await page.getByRole('button', { name: 'SAVE DESIGN', exact: true }).click();
    await page.waitForTimeout(250);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('gamefields-current')));
  assert.ok(saved.id !== 'GF-052');
  assert.equal(saved.name, 'MY COURT');
  await page.reload();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.co-art svg text').first().textContent(), 'MY COURT');
  await page.getByRole('button', { name: 'COPY DESIGN LINK' }).click();
    await page.waitForTimeout(250);
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  assert.ok(new URL(shared).searchParams.has('design'));
  const fresh = await browser.newContext();
  const recipient = await fresh.newPage();
  await recipient.goto(shared);
  await recipient.locator('.co-art svg text').first().waitFor();
  assert.equal(await recipient.locator('.co-art svg text').first().textContent(), 'MY COURT');
  await fresh.close();
  await page.getByRole('button', { name: /BUILD THIS COURT FOR REAL/ }).click();
    await page.waitForTimeout(250);
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name', { exact: true }).fill('Prototype Test');
  await dialog.getByLabel('Email', { exact: true }).fill('test@example.com');
  await dialog.getByLabel('City', { exact: true }).fill('Warsaw');
  await dialog.getByLabel('Approximate location').fill('Central park');
  await dialog.getByLabel('Message').fill('A football court inspired by this design.');
  await dialog.getByRole('button', { name: 'SAVE COURT ENQUIRY' }).click();
    await page.waitForTimeout(250);
  await dialog.getByRole('heading', { name: 'ALL SET.' }).waitFor();
  assert.equal(await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('gamefields-real-')).length), 1);
  await page.keyboard.press('Escape');
  await page.locator('.co-purchase').getByRole('button', { name: 'ORDER YOUR COURT' }).click();
    await page.waitForTimeout(250);
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name', { exact: true }).fill('Prototype Test');
  await dialog.getByLabel('Email', { exact: true }).fill('test@example.com');
  await dialog.getByLabel('Shipping address').fill('Example Street 1, Warsaw');
  await dialog.getByRole('button', { name: 'SAVE ORDER DRAFT' }).click();
    await page.waitForTimeout(250);
  await dialog.getByRole('heading', { name: 'ALL SET.' }).waitFor();
  assert.equal(await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('gamefields-order-')).length), 1);
  await page.keyboard.press('Escape');
  for (const width of [375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.waitForTimeout(230);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No overflow at '+width);
    if (width < 700) {
      assert.ok(await page.locator('.co-mobile-bar').isVisible());
      const positions = await page.evaluate(() => ({ preview: document.querySelector('.co-preview-column').getBoundingClientRect().top, options: document.querySelector('.co-options').getBoundingClientRect().top }));
      assert.ok(positions.preview < positions.options, 'Mobile preview before controls');
    }
    await page.screenshot({ path: path.join(screenshots, 'court-'+width+'.png'), fullPage: true });
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log('PASS: 4 sports, 7 palettes, crop and transforms, texture, labels, all 12 prices, room scale, save/restore/share, both forms and 4 responsive widths.');
} finally { await browser.close(); if (server) await new Promise(resolve => server.close(resolve)); }
