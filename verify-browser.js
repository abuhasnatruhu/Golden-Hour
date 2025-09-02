const { chromium } = require('playwright');

(async () => {
  console.log('🌐 Opening browser to verify exact specification...');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show the browser so user can see
    slowMo: 500      // Slow down actions so they're visible
  });
  
  const page = await browser.newPage();
  
  console.log('📍 Navigating to http://localhost:3004...');
  await page.goto('http://localhost:3004');
  
  // Wait for the page to load
  await page.waitForTimeout(2000);
  
  console.log('🔍 Checking for exact specification elements...');
  
  // Check for the main headline - should show "Next Evening Golden Hour Today" or similar
  const mainHeadline = await page.textContent('h1, h2, .text-4xl, .text-3xl, .text-2xl');
  console.log('📌 Main headline found:', mainHeadline);
  
  // Check if it contains "Evening Golden Hour"
  if (mainHeadline && mainHeadline.includes('Evening Golden Hour')) {
    console.log('✅ VERIFIED: Evening Golden Hour is displayed as primary!');
  } else if (mainHeadline && mainHeadline.includes('Morning Golden Hour')) {
    console.log('❌ ERROR: Still showing Morning Golden Hour instead of Evening!');
  }
  
  // Check for the exact specification text
  const pageText = await page.textContent('body');
  
  // Check for key indicators
  const checks = [
    { text: 'Next Evening Golden Hour Today', label: 'Smart headline' },
    { text: 'Evening Golden Hour', label: 'Evening priority' },
    { text: '5:30 PM', label: 'Evening start time' },
    { text: '7:00 PM', label: 'Evening end time' },
    { text: 'Dhaka, Bangladesh', label: 'Location' },
    { text: 'Morning Golden Hour was', label: 'Morning reference' }
  ];
  
  console.log('\n📊 Verification Results:');
  console.log('========================');
  
  for (const check of checks) {
    if (pageText.includes(check.text)) {
      console.log(`✅ ${check.label}: "${check.text}" - FOUND`);
    } else {
      console.log(`❌ ${check.label}: "${check.text}" - NOT FOUND`);
    }
  }
  
  // Check if the error message is gone
  if (pageText.includes('EXACT SPECIFICATION NOT ACTIVE')) {
    console.log('\n⚠️ WARNING: "EXACT SPECIFICATION NOT ACTIVE" error still visible!');
  } else {
    console.log('\n✅ Good: No "EXACT SPECIFICATION NOT ACTIVE" error found');
  }
  
  // Take a screenshot for evidence
  await page.screenshot({ path: 'exact-spec-verification.png', fullPage: true });
  console.log('\n📸 Screenshot saved as exact-spec-verification.png');
  
  console.log('\n🎯 FINAL VERDICT:');
  if (mainHeadline && mainHeadline.includes('Evening Golden Hour') && 
      pageText.includes('5:30 PM') && pageText.includes('7:00 PM')) {
    console.log('✅✅✅ EXACT SPECIFICATION IS WORKING! Evening priority enforced!');
  } else {
    console.log('❌ Issues found - check the screenshot for details');
  }
  
  // Keep browser open for 5 seconds so user can see
  console.log('\n👀 Keeping browser open for observation...');
  await page.waitForTimeout(5000);
  
  await browser.close();
  console.log('✅ Browser verification complete!');
})();