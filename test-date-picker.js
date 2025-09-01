const { chromium } = require('playwright');

async function testDatePicker() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing date picker functionality...\n');
  
  // Load page
  await page.goto('http://localhost:3002/?lat=40.7128&lng=-74.006&locationName=New%20York', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Click on the When button to open date picker
  const whenButton = await page.locator('button:has-text("When")').first();
  if (await whenButton.count() > 0) {
    console.log('1. Found When button, clicking...');
    await whenButton.click();
    await page.waitForTimeout(1000);
    
    // Look for date input
    const dateInput = await page.locator('input[type="date"]').first();
    if (await dateInput.count() > 0) {
      const currentValue = await dateInput.inputValue();
      console.log('   Current date value:', currentValue);
      
      // Set a future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      console.log('   Setting date to:', futureDateStr);
      await dateInput.fill(futureDateStr);
      await page.waitForTimeout(2000);
      
      // Check if heading updated
      const heading = await page.locator('.text-yellow-100.uppercase').first();
      const newHeading = await heading.textContent();
      console.log('\n2. Updated heading:', newHeading);
      
      // Check if it contains the date
      const monthName = futureDate.toLocaleDateString('en-US', { month: 'long' });
      if (newHeading.includes(monthName.toUpperCase())) {
        console.log('   ✓ Heading shows the selected month!');
      }
      
      // Check if the font size changed for longer text
      const className = await heading.getAttribute('class');
      if (newHeading.length > 30 && className.includes('text-sm')) {
        console.log('   ✓ Font size reduced for longer text');
      }
    } else {
      console.log('   ⚠ Date input not found');
    }
  } else {
    console.log('⚠ When button not found');
  }
  
  await page.screenshot({ path: 'date-picker-test.png', fullPage: false });
  console.log('\nScreenshot saved as date-picker-test.png');
  
  await browser.close();
}

testDatePicker().catch(console.error);
