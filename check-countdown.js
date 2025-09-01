const { chromium } = require('playwright');

async function checkCountdown() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Checking countdown display with seconds...\n');
  
  // Load page with a specific location
  await page.goto('http://localhost:3002/?lat=23.8041&lng=90.4152&locationName=Dhaka', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // Take a screenshot
  await page.screenshot({ path: 'countdown-display.png', fullPage: false });
  
  // Get all text content
  const textContent = await page.textContent('body');
  
  // Look for countdown patterns
  const hasHoursMinutes = /\d+h\s+\d+m/.test(textContent);
  const hasSeconds = /\d+h\s+\d+m\s+\d+s/.test(textContent);
  
  console.log('Page loaded successfully');
  console.log('Has hours/minutes pattern:', hasHoursMinutes);
  console.log('Has seconds pattern:', hasSeconds);
  
  if (hasSeconds) {
    console.log('\n✅ SUCCESS: Countdown is displaying with seconds!');
    
    // Extract the actual countdown
    const match = textContent.match(/(\d+h\s+\d+m\s+\d+s)/);
    if (match) {
      console.log('Current countdown:', match[1]);
    }
  } else if (hasHoursMinutes) {
    console.log('\n⚠ WARNING: Countdown found but without seconds');
    const match = textContent.match(/(\d+h\s+\d+m)/);
    if (match) {
      console.log('Current countdown:', match[1]);
    }
  } else {
    console.log('\n❌ No countdown pattern found');
  }
  
  console.log('\nScreenshot saved as countdown-display.png');
  
  await browser.close();
}

checkCountdown().catch(console.error);
