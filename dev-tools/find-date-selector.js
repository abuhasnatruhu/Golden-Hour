const { chromium } = require('playwright');

async function findDateSelector() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Finding date selector elements...\n');
  
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Look for any buttons
  const buttons = await page.locator('button').all();
  console.log('Found', buttons.length, 'buttons:');
  for (let i = 0; i < Math.min(10, buttons.length); i++) {
    const text = await buttons[i].textContent();
    console.log(`  Button ${i+1}: "${text}"`);
  }
  
  // Look for date inputs directly
  const dateInputs = await page.locator('input[type="date"]').all();
  console.log('\nFound', dateInputs.length, 'date inputs');
  
  // Look for elements with Calendar icon
  const calendarIcons = await page.locator('[data-lucide="calendar"]').all();
  console.log('Found', calendarIcons.length, 'calendar icons');
  
  // Try clicking on "Today" if it exists
  const todayElements = await page.locator('text=/Today/i').all();
  console.log('Found', todayElements.length, 'elements with "Today"');
  
  if (todayElements.length > 0) {
    console.log('\nClicking on first "Today" element...');
    await todayElements[0].click();
    await page.waitForTimeout(2000);
    
    // Check if date input appears
    const dateInputsAfter = await page.locator('input[type="date"]').all();
    console.log('Date inputs after click:', dateInputsAfter.length);
    
    if (dateInputsAfter.length > 0) {
      const value = await dateInputsAfter[0].inputValue();
      console.log('Date input value:', value);
    }
  }
  
  await page.screenshot({ path: 'date-selector-search.png', fullPage: false });
  console.log('\nScreenshot saved as date-selector-search.png');
  
  await browser.close();
}

findDateSelector().catch(console.error);
