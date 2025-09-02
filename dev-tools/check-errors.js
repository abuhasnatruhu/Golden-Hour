const { chromium } = require('playwright');

async function checkErrors() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
    errors.push(error.message);
  });
  
  console.log('Loading page...\n');
  await page.goto('http://localhost:3002/?lat=23.8041&lng=90.4152&locationName=Dhaka', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  if (errors.length > 0) {
    console.log('\nErrors found:', errors.length);
    errors.forEach(err => console.log(' -', err));
  } else {
    console.log('No errors detected');
  }
  
  await browser.close();
}

checkErrors().catch(console.error);
