const { chromium } = require('playwright');

async function checkMountains() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Go directly with location params
  await page.goto('http://localhost:3002/?lat=-8.3405&lng=115.092&locationName=Bali', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  console.log('Checking for mountain elements...\n');
  
  // Different ways to find the mountains
  const clipPathElements = await page.locator('[style*="clipPath"]').count();
  const polygonElements = await page.locator('[style*="polygon"]').count();
  const mountainDivs = await page.locator('.bg-gray-900, .bg-gray-800').count();
  
  console.log('Elements with clipPath:', clipPathElements);
  console.log('Elements with polygon:', polygonElements);
  console.log('Gray background elements:', mountainDivs);
  
  // Check the specific gradient
  const skyGradient = await page.locator('.bg-gradient-to-b.from-sky-700.via-orange-300.to-red-500').count();
  console.log('Sky gradient elements:', skyGradient);
  
  // Get the full HTML of the card
  const card = await page.locator('text="NEXT GOLDEN HOUR"').locator('../..').first();
  const cardHTML = await card.innerHTML();
  
  // Check if clipPath is in the HTML
  if (cardHTML.includes('clipPath')) {
    console.log('\n✅ clipPath found in HTML! Mountains are rendering.');
  } else {
    console.log('\n❌ No clipPath in HTML. Mountains not rendering.');
  }
  
  if (cardHTML.includes('from-sky-700')) {
    console.log('✅ Sky gradient found in HTML');
  }
  
  // Check specific mountain layers
  const hasBackMountain = cardHTML.includes('polygon(0% 100%, 10% 60%');
  const hasMiddleMountain = cardHTML.includes('polygon(0% 100%, 15% 50%');
  const hasFrontMountain = cardHTML.includes('polygon(0% 100%, 5% 70%');
  
  console.log('\nMountain layers:');
  console.log('- Back mountain:', hasBackMountain ? '✅' : '❌');
  console.log('- Middle mountain:', hasMiddleMountain ? '✅' : '❌'); 
  console.log('- Front mountain:', hasFrontMountain ? '✅' : '❌');
  
  await page.screenshot({ path: 'mountain-check.png' });
  console.log('\nScreenshot saved as mountain-check.png');
  
  await browser.close();
}

checkMountains().catch(console.error);