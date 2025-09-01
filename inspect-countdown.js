const { chromium } = require('playwright');

async function inspectCountdown() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Loading page with Dhaka location...\n');
  await page.goto('http://localhost:3002/?lat=23.8041&lng=90.4152&locationName=Dhaka', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // Look for the countdown container
  const countdownContainer = await page.locator('.text-xl.font-bold.text-white').first();
  
  if (await countdownContainer.count() > 0) {
    const text = await countdownContainer.textContent();
    console.log('Found countdown container with text:', text);
    
    // Get the parent element to see context
    const parent = await countdownContainer.locator('..').first();
    const parentText = await parent.textContent();
    console.log('Parent text:', parentText);
  } else {
    console.log('No countdown container found');
  }
  
  // Check for any element with "calculating" text
  const calcElements = await page.locator('text=/[Cc]alculating/').all();
  console.log('\nElements with "calculating":', calcElements.length);
  for (const el of calcElements) {
    const text = await el.textContent();
    console.log(' -', text);
  }
  
  // Look for the "Happens in" text and what follows it
  const happensIn = await page.locator('text="Happens in"').first();
  if (await happensIn.count() > 0) {
    const parent = await happensIn.locator('../..').first();
    const fullText = await parent.textContent();
    console.log('\n"Happens in" section full text:', fullText);
  }
  
  await browser.close();
}

inspectCountdown().catch(console.error);
