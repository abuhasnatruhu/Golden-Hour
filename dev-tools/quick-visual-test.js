const { chromium } = require('playwright');

async function quickVisualTest() {
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    console.log('🚀 Loading Golden Hour Calculator...');
    
    // Set a shorter timeout and don't wait for networkidle due to the console errors
    await page.goto('http://localhost:3000/', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Wait a bit for dynamic content to load
    await page.waitForTimeout(3000);
    
    console.log('✅ Page loaded');
    
    // Check main elements
    const titleExists = await page.locator('h1').count() > 0;
    console.log(titleExists ? '✅ Main title found' : '❌ Main title not found');
    
    const searchExists = await page.locator('[aria-label="Select location"]').count() > 0;
    console.log(searchExists ? '✅ Search elements found' : '❌ Search elements not found');
    
    const cityGridExists = await page.locator('text=Top 12 Photography Cities').count() > 0;
    console.log(cityGridExists ? '✅ City grid found' : '❌ City grid not found');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'golden-hour-test-screenshot.png', 
      fullPage: true 
    });
    console.log('📷 Screenshot saved as golden-hour-test-screenshot.png');
    
    return true;
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
quickVisualTest()
  .then(success => {
    if (success) {
      console.log('\n✅ Visual test completed successfully!');
    } else {
      console.log('\n❌ Visual test had issues');
    }
  })
  .catch(error => {
    console.log('\n💥 Test failed:', error.message);
  });