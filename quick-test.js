const { chromium } = require('playwright');

async function quickTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Loading page...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
  
  // Take a screenshot to see what's on the page
  await page.screenshot({ path: 'page-state.png' });
  console.log('Screenshot saved as page-state.png');
  
  // Log all visible text
  const allText = await page.evaluate(() => document.body.innerText);
  console.log('\n=== Page Text ===');
  console.log(allText.substring(0, 500));
  
  // Check for key elements
  console.log('\n=== Element Check ===');
  
  const elements = [
    { selector: 'text="NEXT GOLDEN HOUR"', name: 'Next Golden Hour card' },
    { selector: 'button:has-text("Search")', name: 'Search button' },
    { selector: 'text="Where"', name: 'Where input' },
    { selector: 'text="When"', name: 'When input' },
    { selector: 'text="Golden Hour Calculator"', name: 'Main title' },
    { selector: 'input[type="text"]', name: 'Text input' },
    { selector: 'input[type="date"]', name: 'Date input' },
    { selector: '[placeholder*="location" i]', name: 'Location placeholder' }
  ];
  
  for (const { selector, name } of elements) {
    try {
      const visible = await page.locator(selector).first().isVisible({ timeout: 1000 });
      console.log(`${visible ? '✅' : '❌'} ${name}`);
    } catch {
      console.log(`❌ ${name} - not found`);
    }
  }
  
  // Check console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.reload();
  await page.waitForTimeout(2000);
  
  if (errors.length > 0) {
    console.log('\n=== Console Errors ===');
    errors.forEach(err => console.log('- ' + err));
  }
  
  await browser.close();
}

quickTest().catch(console.error);