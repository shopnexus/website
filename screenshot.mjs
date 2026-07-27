import { chromium } from '@playwright/test';
import fs from 'fs';

const OUT = '/home/toanehihi/workspace/shopnexus/website/.screenshots';
fs.mkdirSync(OUT, { recursive: true });

const pages = [
  { url: 'http://localhost:3000', name: 'home' },
  { url: 'http://localhost:3000/product/p1', name: 'product' },
  { url: 'http://localhost:3000/cart', name: 'cart' },
  { url: 'http://localhost:3000/checkout', name: 'checkout' },
  { url: 'http://localhost:3000/orders', name: 'orders' },
  { url: 'http://localhost:3000/dashboard', name: 'dashboard' },
  { url: 'http://localhost:3000/inbox', name: 'inbox' },
  { url: 'http://localhost:3000/sell', name: 'sell' },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const { url, name } of pages) {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    console.log(`✓ ${name}`);
  } catch(e) {
    console.log(`✗ ${name}: ${e.message}`);
  }
  await page.close();
}

await browser.close();
console.log('Done');
