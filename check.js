import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(4000);
    const html = await page.content();
    const title = await page.title();
    console.log('TITLE:', title);
    console.log('ERRORS:', errors.length > 0 ? errors.join('\n') : 'NONE');
    const hasContent = html.includes('FUNCTOR') || html.includes('functor');
    console.log('HAS_CONTENT:', hasContent);
    if (errors.length === 0) {
      await page.screenshot({ path: 'vibe-screenshot.png', fullPage: true });
      console.log('SCREENSHOT: vibe-screenshot.png saved');
    }
  } catch (e) {
    console.log('NAV_ERROR:', e.message);
  }
  console.log('ALL_ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
