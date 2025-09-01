const { chromium } = require('playwright');

async function simpleDateTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Simple date test...\n');
  
  // Load page with location
  await page.goto('http://localhost:3002/?lat=23.8041&lng=90.4152&locationName=Dhaka', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // Look for the heading
  const heading = await page.locator('.text-yellow-100.uppercase').first();
  if (await heading.count() > 0) {
    const text = await heading.textContent();
    console.log('Golden Hour heading:', text);
    
    // Check text size
    const className = await heading.getAttribute('class');
    console.log('Heading classes:', className);
    
    if (text.length > 30) {
      console.log('Text is long (>30 chars), should use smaller font');
    }
  }
  
  // Check the date display
  const bodyText = await page.textContent('body');
  const today = new Date();
  const monthName = today.toLocaleDateString('en-US', { month: 'long' });
  
  if (bodyText.includes(monthName)) {
    console.log('\n✓ Page shows current month:', monthName);
  }
  
  // Take screenshot
  await page.screenshot({ path: 'simple-date-test.png', fullPage: false });
  console.log('\nScreenshot saved as simple-date-test.png');
  
  await browser.close();
}

simpleDateTest().catch(console.error);
