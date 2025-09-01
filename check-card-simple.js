const { chromium } = require('playwright');

async function checkCard() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Loading page and searching for Bali...');
  
  // Go directly to URL with location
  await page.goto('http://localhost:3002/?lat=-8.3405&lng=115.092&locationName=Bali', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  console.log('\nChecking what card is displayed...');
  
  // Check for the Next Golden Hour card elements
  const hasNextGoldenHour = await page.locator('text="NEXT GOLDEN HOUR"').isVisible().catch(() => false);
  
  // Look for mountain background elements
  const hasSkyGradient = await page.locator('div.bg-gradient-to-b.from-sky-700.via-orange-300.to-red-500').count();
  const hasMountains = await page.locator('div[style*="clipPath"]').count();
  const hasYellowSun = await page.locator('div.bg-yellow-300.rounded-full').count();
  
  // Check for weather badges
  const hasGoldenHourBadge = await page.locator('text=/Golden Hour:/').isVisible().catch(() => false);
  const hasBlueHourBadge = await page.locator('text=/Blue Hour:/').isVisible().catch(() => false);
  const hasScoreBadge = await page.locator('text=/Score:.*\\/100/').isVisible().catch(() => false);
  
  console.log('\n=== CARD ANALYSIS ===');
  console.log('Has "NEXT GOLDEN HOUR" text:', hasNextGoldenHour);
  console.log('Has sky gradient (from-sky-700 via-orange-300):', hasSkyGradient > 0);
  console.log('Has mountain layers (clipPath):', hasMountains, 'elements');
  console.log('Has yellow sun:', hasYellowSun > 0);
  console.log('Has Golden Hour badge:', hasGoldenHourBadge);
  console.log('Has Blue Hour badge:', hasBlueHourBadge);
  console.log('Has Score badge:', hasScoreBadge);
  
  if (hasSkyGradient > 0 && hasMountains > 0) {
    console.log('\n✅ ORIGINAL mountain sunset card IS displaying!');
  } else if (hasNextGoldenHour) {
    console.log('\n⚠️ Next Golden Hour card is showing but WITHOUT mountain background');
    
    // Get the actual HTML to see what's rendering
    const cardContainer = await page.locator('div:has(> div > div > svg)').filter({ hasText: 'NEXT GOLDEN HOUR' }).first();
    const classes = await cardContainer.getAttribute('class').catch(() => '');
    console.log('Card container classes:', classes);
  } else {
    console.log('\n❌ No Next Golden Hour card found');
  }
  
  // Take screenshot
  await page.screenshot({ path: 'actual-card.png', fullPage: false });
  console.log('\nScreenshot saved as actual-card.png');
  
  await browser.close();
}

checkCard().catch(console.error);