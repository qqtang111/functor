import { chromium } from 'playwright';

const browser = await chromium.launch({
  channel: 'msedge',
  headless: false,
});
const page = await browser.newPage();

const errors = [];
page.on('pageerror', err => errors.push(err.message));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

try {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);

  const title = await page.title();
  console.log('=== PAGE TITLE:', title);

  const hasContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return {
      rootChildren: root ? root.children.length : 0,
      rootHTML: root ? root.innerHTML.slice(0, 500) : 'NO ROOT',
      bodyVisible: getComputedStyle(document.body).opacity,
    };
  });
  console.log('=== CONTENT:', JSON.stringify(hasContent, null, 2));

  if (errors.length > 0) {
    console.log('=== ERRORS:', errors.join('\n'));
  }

  await page.screenshot({ path: 'vibe-screenshot.png', fullPage: false });
  console.log('=== SCREENSHOT saved: vibe-screenshot.png');

  console.log('=== Browser open for 5s, check Edge window...');
  await page.waitForTimeout(5000);
} catch (e) {
  console.log('=== FAILED:', e.message);
}

await browser.close();
console.log('=== DONE');
