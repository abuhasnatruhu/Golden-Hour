const { chromium } = require('playwright');

async function testFixes() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Testing fixes for countdown and FAQ issues...\n');
  
  // Test 1: Check countdown in Next Golden Hour card
  console.log('1. Testing Next Golden Hour card countdown...');
  await page.goto('http://localhost:3002/?lat=23.8041&lng=90.4152&locationName=Dhaka', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check for countdown elements
  const hasNextGoldenCard = await page.locator('text="NEXT GOLDEN HOUR"').isVisible();
  const hasStartsIn = await page.locator('text=/Starts in|Ends in|Calculating/i').isVisible();
  const hasCountdownTime = await page.locator('text=/\\d+h \\d+m|\\d+ minutes?|calculating/i').isVisible();
  
  console.log('   ✓ Next Golden Hour card visible:', hasNextGoldenCard);
  console.log('   ✓ "Starts in/Ends in" text visible:', hasStartsIn);
  console.log('   ✓ Countdown time visible:', hasCountdownTime);
  
  if (!hasCountdownTime) {
    console.log('   ❌ ISSUE: Countdown not showing!');
  } else {
    console.log('   ✅ Countdown is working!');
  }
  
  // Test 2: Check FAQs don't appear when just selecting date
  console.log('\n2. Testing Dynamic FAQs behavior...');
  
  // First check initial state - FAQs should not be visible
  let faqVisible = await page.locator('text="Frequently Asked Questions"').isVisible({ timeout: 1000 }).catch(() => false);
  console.log('   Initial state - FAQs visible:', faqVisible);
  
  // Click on Photography Calendar date
  console.log('   Clicking on a calendar date...');
  const calendarDate = await page.locator('[role="gridcell"]:not([aria-disabled="true"])').nth(10);
  if (await calendarDate.isVisible()) {
    await calendarDate.click();
    await page.waitForTimeout(2000);
    
    // Check if FAQs appeared after date selection
    faqVisible = await page.locator('text="Frequently Asked Questions"').isVisible({ timeout: 1000 }).catch(() => false);
    console.log('   After date selection - FAQs visible:', faqVisible);
    
    if (faqVisible) {
      console.log('   ❌ ISSUE: FAQs appeared just from date selection!');
    } else {
      console.log('   ✅ FAQs correctly hidden after date selection');
    }
  }
  
  // Test 3: Verify FAQs appear after search
  console.log('\n3. Testing FAQs appear after search...');
  
  // Click search button
  const searchButton = await page.locator('button').filter({ hasText: 'Search' }).first();
  await searchButton.click({ force: true });
  await page.waitForTimeout(3000);
  
  faqVisible = await page.locator('text="Frequently Asked Questions"').isVisible({ timeout: 2000 }).catch(() => false);
  console.log('   After search - FAQs visible:', faqVisible);
  
  if (faqVisible) {
    console.log('   ✅ FAQs correctly shown after search');
  } else {
    console.log('   ⚠️ FAQs not showing even after search');
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const countdownFixed = hasCountdownTime;
  const faqFixed = !faqVisible; // Should not show on date selection alone
  
  if (countdownFixed && faqFixed) {
    console.log('✅ BOTH ISSUES FIXED!');
  } else {
    if (!countdownFixed) console.log('❌ Countdown still not working');
    if (!faqFixed) console.log('❌ FAQ still showing incorrectly');
  }
  
  await browser.close();
}

testFixes().catch(console.error);