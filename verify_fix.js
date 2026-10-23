const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const filePath = 'file://' + path.resolve('index.html');
  await page.goto(filePath);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/screenshots/scrollbar_verified.png' });
  await browser.close();
  console.log("Screenshot generated.");
})();
