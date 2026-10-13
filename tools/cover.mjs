#!/usr/bin/env node
// Renders tools/cover.html to docs/cover.png (the itch.io cover and the README header).
// 630×500 is itch's recommended cover size; it renders at 2× so the thumbnail stays sharp.
// Needs the network once: the page loads its fonts from Google Fonts.
//   node tools/cover.mjs [out.png]
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const SRC = fileURLToPath(new URL('./cover.html', import.meta.url));
const out = process.argv[2] ?? fileURLToPath(new URL('../docs/cover.png', import.meta.url));

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 630, height: 500 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(SRC).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
  console.log(`[cover] fonts loaded: ${[...new Set(fonts)].join(', ') || 'none (fell back to system fonts)'}`);
  await page.locator('.cover').screenshot({ path: out });
  console.log(`[cover] wrote ${out}`);
} finally {
  await browser.close();
}
