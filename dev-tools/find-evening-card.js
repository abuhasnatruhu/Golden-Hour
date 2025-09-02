const { chromium } = require('playwright');

async function findEveningCard() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Loading page with location...');
  await page.goto('http://localhost:3002/?lat=23.8041&lng=90.4152&locationName=Dhaka', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // Scroll to bottom to see all cards
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  
  console.log('\nSearching for Evening Golden Hour elements...\n');
  
  // Find all elements containing "Evening Golden Hour"
  const elements = await page.locator(':text("Evening Golden Hour")').all();
  console.log(`Found ${elements.length} element(s) with "Evening Golden Hour"`);
  
  for (let i = 0; i < elements.length; i++) {
    const elem = elements[i];
    
    // Get parent element info
    const parentHTML = await elem.locator('..').innerHTML();
    const grandparentClass = await elem.locator('../..').getAttribute('class');
    
    console.log(`\nElement ${i + 1}:`);
    console.log('Parent class:', grandparentClass?.substring(0, 100));
    
    // Check if it has "Starts" and "Ends" nearby
    if (parentHTML.includes('Starts') && parentHTML.includes('Ends')) {
      console.log('>>> This element has "Starts" and "Ends" pattern!');
      console.log('HTML snippet:', parentHTML.substring(0, 200));
      
      // Try to identify which component this is
      const isInTimeCard = grandparentClass?.includes('card') || grandparentClass?.includes('Card');
      const isInGoldenDisplay = grandparentClass?.includes('golden') || parentHTML.includes('mountain');
      
      console.log('Likely in TimeCard component:', isInTimeCard);
      console.log('Likely in GoldenHourDisplay:', isInGoldenDisplay);
    }
  }
  
  // Also check for any standalone cards at the bottom
  console.log('\n\nChecking for cards after main content...');
  const allCards = await page.locator('.card, [class*="card"], [class*="Card"]').all();
  console.log(`Total cards on page: ${allCards.length}`);
  
  // Take full page screenshot
  await page.screenshot({ path: 'full-page-evening.png', fullPage: true });
  console.log('\nFull page screenshot saved as full-page-evening.png');
  
  await browser.close();
}

findEveningCard().catch(console.error);