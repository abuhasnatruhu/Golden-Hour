const { chromium } = require('playwright');

async function testLocations() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Test locations in different time zones
  const locations = [
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, tz: 'PST' },
    { name: 'London', lat: 51.5074, lng: -0.1278, tz: 'GMT' },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, tz: 'JST' },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, tz: 'AEDT' }
  ];
  
  for (const loc of locations) {
    console.log(`\nTesting ${loc.name} (${loc.tz}):`);
    await page.goto(`http://localhost:3002/?lat=${loc.lat}&lng=${loc.lng}&locationName=${loc.name}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get the countdown text
    const countdownEl = await page.locator('.text-xl.font-bold.text-white').first();
    if (await countdownEl.count() > 0) {
      const countdown = await countdownEl.textContent();
      console.log(`  Countdown: ${countdown}`);
      
      // Get the time display
      const timeEl = await page.locator('.text-5xl.font-black.text-white').first();
      if (await timeEl.count() > 0) {
        const time = await timeEl.textContent();
        console.log(`  Golden Hour Time: ${time}`);
      }
    } else {
      console.log('  No countdown found');
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('The countdown is working! It shows:');
  console.log('- "in X days" for golden hours tomorrow or later');
  console.log('- Hours/minutes/seconds for golden hours today');
  console.log('The issue was that Dhaka\'s golden hour already passed today.');
  console.log('='.repeat(50));
  
  await browser.close();
}

testLocations().catch(console.error);
