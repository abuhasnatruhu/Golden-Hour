const { chromium } = require('playwright');

async function verifyRemoval() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('1. Loading page with Dhaka location...');
  await page.goto('http://localhost:3002/?lat=23.8041&lng=90.4152&locationName=Dhaka', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  console.log('\n2. Checking for Evening Golden Hour text...');
  
  // Check for any "Evening Golden Hour" text
  const eveningGoldenText = await page.locator('text="Evening Golden Hour"').count();
  const eveningGoldenWithColon = await page.locator('text=/Evening Golden Hour.*Starts/').count();
  const startsEndsPattern = await page.locator('text=/Starts:.*Ends:/').count();
  
  console.log('   - "Evening Golden Hour" text found:', eveningGoldenText, 'times');
  console.log('   - "Evening Golden Hour Starts" pattern found:', eveningGoldenWithColon, 'times');
  console.log('   - "Starts: ... Ends:" pattern found:', startsEndsPattern, 'times');
  
  // Check for the beige/brown card specifically
  const yellowBgCards = await page.locator('.bg-yellow-50').count();
  const goldenHourCards = await page.locator('div:has-text("Golden Hours")').count();
  
  console.log('   - Yellow/beige background elements:', yellowBgCards);
  console.log('   - "Golden Hours" card sections:', goldenHourCards);
  
  // Check what cards ARE showing
  console.log('\n3. Verifying what IS displayed:');
  const nextGoldenHourCard = await page.locator('text="NEXT GOLDEN HOUR"').count();
  const sunTimesCard = await page.locator('text="Sun Times"').count();
  const blueHoursCard = await page.locator('text="Blue Hours"').count();
  
  console.log('   ✓ Next Golden Hour card:', nextGoldenHourCard > 0 ? 'VISIBLE' : 'NOT FOUND');
  console.log('   ✓ Sun Times card:', sunTimesCard > 0 ? 'VISIBLE' : 'NOT FOUND');
  console.log('   ✓ Blue Hours card:', blueHoursCard > 0 ? 'VISIBLE' : 'NOT FOUND');
  
  // Final verdict
  console.log('\n' + '='.repeat(60));
  if (eveningGoldenText === 0 && startsEndsPattern === 0) {
    console.log('✅ SUCCESS: Evening Golden Hour card has been REMOVED!');
    console.log('   No "Evening Golden Hour" text found anywhere on the page.');
  } else {
    console.log('❌ ISSUE: Evening Golden Hour content still found!');
    console.log('   The card may not be fully removed.');
    
    // Try to get more context about where it appears
    if (eveningGoldenText > 0) {
      const element = await page.locator('text="Evening Golden Hour"').first();
      const parentClass = await element.locator('..').getAttribute('class');
      console.log('   Found in element with parent class:', parentClass?.substring(0, 100));
    }
  }
  console.log('='.repeat(60));
  
  // Take screenshot for visual confirmation
  await page.screenshot({ path: 'evening-card-check.png', fullPage: true });
  console.log('\nScreenshot saved as evening-card-check.png');
  
  await browser.close();
}

verifyRemoval().catch(console.error);