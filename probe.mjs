import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:3111/login', { waitUntil:'domcontentloaded' })
await page.fill('input[name="identifier"]', 'khoakomlem@gmail.com')
await page.fill('input[name="password"]', 'visualc++')
await page.click('button[type="submit"]')
await page.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 25000 })
await page.goto('http://localhost:3111/orders', { waitUntil:'networkidle' })
await page.waitForTimeout(1500)

// Every navbar link with its badge text, so "which icon shows 2" is measured not guessed.
const badges = await page.$$eval('nav a', as => as.map(a => ({
  href: a.getAttribute('href'),
  text: (a.textContent||'').trim().replace(/\s+/g,' ').slice(0,30),
})).filter(x => x.href))
console.log(JSON.stringify(badges, null, 1))
console.log('localStorage cart-storage:', await page.evaluate(() => localStorage.getItem('cart-storage')))
await browser.close()
