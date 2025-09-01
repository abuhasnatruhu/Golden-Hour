const { chromium } = require('playwright');

async function testCountdown() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing countdown with seconds...\n');
  
  // Load page
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check for Next Golden Hour card
  const nextGoldenHourCard = await page.locator('text="NEXT GOLDEN HOUR"').count();
  console.log('✓ Next Golden Hour card found:', nextGoldenHourCard > 0);
  
  // Check for "Happens in" text
  const happensInText = await page.locator('text="Happens in"').count();
  console.log('✓ "Happens in" text found:', happensInText > 0);
  
  // Look for countdown with seconds pattern (e.g., "2h 34m 56s")
  const countdownWithSeconds = await page.locator('text=/\\d+h\\s+\\d+m\\s+\\d+s/').count();
  console.log('✓ Countdown with seconds found:', countdownWithSeconds > 0);
  
  // Get the actual countdown text
  try {
    const countdownElement = await page.locator('text=/\\d+h\\s+\\d+m\\s+\\d+s/').first();
    const countdownText = await countdownElement.textContent();
    console.log('  Countdown display:', countdownText);
    
    // Wait 2 seconds and check if seconds are updating
    const firstValue = countdownText;
    await page.waitForTimeout(2000);
    const secondValue = await countdownElement.textContent();
    console.log('  After 2 seconds:', secondValue);
    
    if (firstValue !== secondValue) {
      console.log('✓ Countdown is actively updating with seconds!');
    } else {
      console.log('⚠ Countdown may not be updating properly');
    }
  } catch (e) {
    console.log('⚠ Could not find countdown with seconds pattern');
    
    // Try to find any countdown-like text
    const anyCountdown = await page.locator('text=/\\d+h\\s+\\d+m/').first();
    if (await anyCountdown.count() > 0) {
      const text = await anyCountdown.textContent();
      console.log('  Found countdown without seconds:', text);
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: 'countdown-test.png', fullPage: false });
  console.log('\nScreenshot saved as countdown-test.png');
  
  await browser.close();
}

testCountdown().catch(console.error);
