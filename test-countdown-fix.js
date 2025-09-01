const { chromium } = require('playwright');

async function testCountdownFix() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing countdown fix...\n');
  
  // Test with Dhaka location
  console.log('1. Testing with Dhaka location');
  await page.goto('http://localhost:3002/?lat=23.8041&lng=90.4152&locationName=Dhaka', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // Look for countdown elements
  const pageContent = await page.textContent('body');
  
  // Check for "Calculating..." text
  if (pageContent.includes('Calculating...') || pageContent.includes('calculating...')) {
    console.log('   ❌ Still showing "Calculating..."');
  } else {
    console.log('   ✓ Not showing "Calculating..."');
  }
  
  // Check for time patterns
  const hasCountdown = /\d+h\s+\d+m\s+\d+s/.test(pageContent) || 
                       /\d+m\s+\d+s/.test(pageContent) ||
                       /\d+\s+second/.test(pageContent);
  
  if (hasCountdown) {
    console.log('   ✓ Countdown timer found!');
    
    // Extract the countdown
    const patterns = [
      /(\d+h\s+\d+m\s+\d+s)/,
      /(\d+m\s+\d+s)/,
      /(\d+\s+seconds?)/
    ];
    
    for (const pattern of patterns) {
      const match = pageContent.match(pattern);
      if (match) {
        console.log('   Countdown:', match[1]);
        break;
      }
    }
  } else {
    console.log('   ❌ No countdown timer found');
  }
  
  // Take screenshot
  await page.screenshot({ path: 'countdown-dhaka.png', fullPage: false });
  console.log('   Screenshot: countdown-dhaka.png\n');
  
  // Test with New York location
  console.log('2. Testing with New York location');
  await page.goto('http://localhost:3002/?lat=40.7128&lng=-74.006&locationName=New%20York', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  const nyContent = await page.textContent('body');
  const nyHasCountdown = /\d+h\s+\d+m\s+\d+s/.test(nyContent) || 
                          /\d+m\s+\d+s/.test(nyContent) ||
                          /\d+\s+second/.test(nyContent);
  
  if (nyHasCountdown) {
    console.log('   ✓ Countdown timer found for New York!');
    const patterns = [
      /(\d+h\s+\d+m\s+\d+s)/,
      /(\d+m\s+\d+s)/,
      /(\d+\s+seconds?)/
    ];
    
    for (const pattern of patterns) {
      const match = nyContent.match(pattern);
      if (match) {
        console.log('   Countdown:', match[1]);
        break;
      }
    }
  } else {
    console.log('   ❌ No countdown for New York');
  }
  
  await page.screenshot({ path: 'countdown-ny.png', fullPage: false });
  console.log('   Screenshot: countdown-ny.png\n');
  
  // Summary
  console.log('=' + '='.repeat(50));
  if (hasCountdown && nyHasCountdown) {
    console.log('✅ SUCCESS: Countdown is working for multiple locations!');
  } else {
    console.log('❌ ISSUE: Countdown is not working properly');
    console.log('   Check the screenshots for visual confirmation');
  }
  console.log('=' + '='.repeat(50));
  
  await browser.close();
}

testCountdownFix().catch(console.error);
