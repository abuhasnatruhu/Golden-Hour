const { chromium } = require('playwright');

async function checkCard() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('1. Loading page...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('2. Clicking on Where field...');
  await page.locator('text="Where"').first().click();
  await page.waitForTimeout(1000);
  
  console.log('3. Typing location...');
  await page.keyboard.type('Santorini, Greece');
  await page.waitForTimeout(2000);
  
  // Try to click on suggestion
  try {
    await page.locator('text="Santorini"').nth(1).click();
    console.log('4. Selected Santorini from suggestions');
  } catch {
    console.log('4. No suggestions appeared - typing directly');
  }
  
  await page.waitForTimeout(1000);
  
  console.log('5. Clicking Search...');
  // Click the first enabled search button
  await page.locator('button:has-text("Search"):not([disabled])').first().click();
  await page.waitForTimeout(5000);
  
  console.log('6. Checking what card is displayed...');
  
  // Check for the Next Golden Hour card
  const hasNextGoldenHour = await page.locator('text="NEXT GOLDEN HOUR"').isVisible().catch(() => false);
  const hasMountainBackground = await page.locator('.bg-gradient-to-b.from-sky-700').isVisible().catch(() => false);
  const hasYellowSun = await page.locator('.bg-yellow-300.rounded-full').isVisible().catch(() => false);
  
  // Check the actual background classes
  const cardElement = await page.locator('text="NEXT GOLDEN HOUR"').locator('..').locator('..').first();
  const cardHTML = await cardElement.innerHTML().catch(() => '');
  
  console.log('\n=== RESULTS ===');
  console.log('Has "NEXT GOLDEN HOUR" text:', hasNextGoldenHour);
  console.log('Has mountain gradient background:', hasMountainBackground);
  console.log('Has yellow sun:', hasYellowSun);
  
  if (cardHTML.includes('from-sky-700') && cardHTML.includes('via-orange-300')) {
    console.log('✅ Original mountain sunset card is displaying!');
  } else {
    console.log('❌ Different card design is showing');
  }
  
  // Take screenshot
  await page.screenshot({ path: 'actual-card-display.png', fullPage: false });
  console.log('\nScreenshot saved as actual-card-display.png');
  
  // Log any relevant classes found
  const relevantClasses = cardHTML.match(/bg-gradient-[^"']*/g) || [];
  if (relevantClasses.length > 0) {
    console.log('\nGradient classes found:', relevantClasses);
  }
  
  await browser.close();
}

checkCard().catch(console.error);