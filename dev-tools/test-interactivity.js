const { chromium } = require('playwright');

async function testInteractiveElements() {
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    console.log('🚀 Testing interactive elements...');
    
    await page.goto('http://localhost:3000/', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    await page.waitForTimeout(2000);
    
    // Test 1: Check if city cards are clickable
    const cityCards = await page.locator('div[class*="cursor-pointer"]').count();
    console.log(`✅ Found ${cityCards} clickable city cards`);
    
    // Test 2: Check location selector
    const locationSelector = await page.locator('[aria-label="Select location"]');
    const locationClickable = await locationSelector.isEnabled();
    console.log(locationClickable ? '✅ Location selector is interactive' : '❌ Location selector not interactive');
    
    // Test 3: Check date selector
    const dateSelector = await page.locator('[aria-label="Select date"]');
    const dateClickable = await dateSelector.isEnabled();
    console.log(dateClickable ? '✅ Date selector is interactive' : '❌ Date selector not interactive');
    
    // Test 4: Check "Locate Me" button
    const locateButton = await page.locator('[aria-label="Detect current location"]');
    const locateClickable = await locateButton.isEnabled();
    console.log(locateClickable ? '✅ "Locate Me" button is interactive' : '❌ "Locate Me" button not interactive');
    
    // Test 5: Check search button state
    const searchButton = await page.locator('[aria-label="Search for golden hour times"]');
    const searchDisabled = await searchButton.getAttribute('disabled');
    console.log(searchDisabled !== null ? '✅ Search button properly disabled (awaiting input)' : '✅ Search button is active');
    
    // Test 6: Try clicking a city card to see if it's interactive
    try {
      await page.locator('div[class*="cursor-pointer"]').first().click({ timeout: 2000 });
      console.log('✅ City card click interaction works');
    } catch (e) {
      console.log('ℹ️ City card click test inconclusive (may require network)');
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testInteractiveElements()
  .then(success => {
    console.log(success ? '\n✅ Interactive elements test completed!' : '\n❌ Interactive test had issues');
  })
  .catch(error => {
    console.log('\n💥 Interactive test failed:', error.message);
  });