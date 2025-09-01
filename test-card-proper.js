const { chromium } = require('playwright');

async function testCard() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('1. Loading page...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log('2. Searching for Bali using the main search button...');
  
  // Click on the main search bar's Where field
  const whereDiv = await page.locator('div:has-text("Where")').filter({ hasText: 'Search destinations' }).first();
  await whereDiv.click();
  await page.waitForTimeout(500);
  
  // Type Bali
  await page.keyboard.type('Bali');
  await page.waitForTimeout(2000);
  
  // Select from dropdown if it appears
  try {
    const suggestion = await page.locator('[role="option"]').filter({ hasText: 'Bali' }).first();
    await suggestion.click();
    console.log('  - Selected Bali from suggestions');
  } catch {
    console.log('  - No suggestions, continuing...');
  }
  
  await page.waitForTimeout(1000);
  
  // Click the main Search button (not the floating one)
  console.log('3. Clicking the main Search button...');
  const searchButton = await page.locator('button').filter({ hasText: 'Search' }).first();
  await searchButton.click({ force: true }); // Force click in case something is overlapping
  
  console.log('4. Waiting for results...');
  await page.waitForTimeout(5000);
  
  console.log('\n=== CHECKING CARD DISPLAY ===');
  
  // Check what's displayed
  const hasNextGoldenHour = await page.locator('text="NEXT GOLDEN HOUR"').count();
  const hasSkyGradient = await page.locator('.bg-gradient-to-b.from-sky-700').count();
  const hasMountains = await page.locator('[style*="clipPath"]').count();
  const hasYellowSun = await page.locator('.bg-yellow-300.rounded-full').count();
  const hasTimeDisplay = await page.locator('text=/\\d{2}:\\d{2}\\s*(AM|PM)/').count();
  
  console.log('Next Golden Hour text found:', hasNextGoldenHour, 'times');
  console.log('Sky gradient elements:', hasSkyGradient);
  console.log('Mountain clipPath elements:', hasMountains);
  console.log('Yellow sun elements:', hasYellowSun);
  console.log('Time displays found:', hasTimeDisplay);
  
  if (hasNextGoldenHour > 0 && hasSkyGradient > 0 && hasMountains > 0) {
    console.log('\n✅ ORIGINAL MOUNTAIN SUNSET CARD IS DISPLAYING!');
  } else if (hasNextGoldenHour > 0) {
    console.log('\n⚠️ Card shows but missing mountain background elements');
  } else {
    console.log('\n❌ Next Golden Hour card not found at all');
    
    // Check if any error messages
    const errorText = await page.locator('text=/error|failed|unable/i').count();
    if (errorText > 0) {
      console.log('Found error messages on page');
    }
  }
  
  // Take screenshot of the result
  await page.screenshot({ path: 'card-test-result.png', fullPage: false });
  console.log('\nScreenshot saved as card-test-result.png');
  
  // Also log the actual HTML of the card area if found
  if (hasNextGoldenHour > 0) {
    const cardContainer = await page.locator('div').filter({ hasText: 'NEXT GOLDEN HOUR' }).first();
    const cardClasses = await cardContainer.getAttribute('class');
    console.log('\nCard container classes:', cardClasses?.substring(0, 200));
  }
  
  await browser.close();
}

testCard().catch(console.error);