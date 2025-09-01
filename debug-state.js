const { chromium } = require('playwright');

async function debugState() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.text().includes('🔥')) {
      console.log('Console:', msg.text());
    }
  });
  
  console.log('Loading page with Dhaka location...\n');
  await page.goto('http://localhost:3002/?lat=23.8041&lng=90.4152&locationName=Dhaka', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check what's in the DOM
  const hasGoldenHourCard = await page.locator('.text-center.mb-8').count();
  console.log('Golden Hour card elements found:', hasGoldenHourCard);
  
  // Check for specific text
  const texts = [
    'NEXT GOLDEN HOUR',
    'Next Golden Hour',
    'Happens in',
    'Calculating',
    'starts in',
    'ends in'
  ];
  
  for (const text of texts) {
    const count = await page.locator(`text="${text}"`).count();
    if (count > 0) {
      console.log(`Found "${text}":`, count, 'times');
    }
  }
  
  // Get all visible text
  const bodyText = await page.textContent('body');
  
  // Look for time patterns
  const timePattern = /\d{1,2}:\d{2}\s*(AM|PM|am|pm)?/g;
  const times = bodyText.match(timePattern);
  if (times) {
    console.log('\nTimes found on page:', times.slice(0, 10));
  }
  
  await page.screenshot({ path: 'debug-state.png', fullPage: false });
  console.log('\nScreenshot saved as debug-state.png');
  
  await browser.close();
}

debugState().catch(console.error);
