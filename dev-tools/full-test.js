const { chromium } = require('playwright');

async function fullTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const issues = [];
  const successes = [];
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      issues.push(`Console Error: ${msg.text()}`);
    }
  });
  
  console.log('🔍 Starting comprehensive test...\n');
  
  try {
    // 1. Load page
    console.log('1. Loading page...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    successes.push('Page loads successfully');
    
    // 2. Click on Where input
    console.log('2. Testing location input...');
    const whereButton = await page.locator('text="Where"').first();
    if (await whereButton.isVisible()) {
      await whereButton.click();
      await page.waitForTimeout(500);
      
      // Type in the search box that appears
      await page.keyboard.type('Bali, Indonesia');
      await page.waitForTimeout(2000);
      
      // Check for suggestions
      const suggestion = await page.locator('text="Bali"').nth(1);
      if (await suggestion.isVisible({ timeout: 3000 })) {
        await suggestion.click();
        successes.push('Location search works');
        await page.waitForTimeout(1000);
      } else {
        issues.push('Location suggestions do not appear');
      }
    } else {
      issues.push('Where input not found');
    }
    
    // 3. Click Search
    console.log('3. Clicking Search button...');
    const searchButton = await page.locator('button:has-text("Search")');
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(5000);
      successes.push('Search button works');
    } else {
      issues.push('Search button not found');
    }
    
    // 4. Check if Next Golden Hour card appears
    console.log('4. Checking for Next Golden Hour card...');
    const goldenHourCard = await page.locator('text="NEXT GOLDEN HOUR"');
    if (await goldenHourCard.isVisible({ timeout: 5000 })) {
      successes.push('Next Golden Hour card displays after search');
      
      // Check for countdown
      const countdown = await page.locator('text=/starts in|ends in/i');
      if (await countdown.isVisible()) {
        successes.push('Countdown timer is working');
      } else {
        issues.push('Countdown timer not showing');
      }
    } else {
      issues.push('Next Golden Hour card does not appear after search');
    }
    
    // 5. Check for weather data
    console.log('5. Checking weather data...');
    const tempData = await page.locator('text=/\\d+°C/');
    if (await tempData.isVisible()) {
      successes.push('Weather data displays');
      
      // Check for photography conditions
      const goldenQuality = await page.locator('text=/Golden Hour:/');
      const blueQuality = await page.locator('text=/Blue Hour:/');
      const score = await page.locator('text=/Score:/');
      
      if (await goldenQuality.isVisible() && await blueQuality.isVisible() && await score.isVisible()) {
        successes.push('Photography conditions display');
      } else {
        issues.push('Photography conditions not fully displayed');
      }
    } else {
      issues.push('Weather data not showing');
    }
    
    // 6. Check Time Cards
    console.log('6. Checking time cards...');
    const sunriseCard = await page.locator('text="Sunrise"');
    const sunsetCard = await page.locator('text="Sunset"');
    const goldenMorning = await page.locator('text=/Morning Golden Hour/i');
    const goldenEvening = await page.locator('text=/Evening Golden Hour/i');
    
    if (await sunriseCard.isVisible() && await sunsetCard.isVisible()) {
      successes.push('Time cards display');
      if (await goldenMorning.isVisible() && await goldenEvening.isVisible()) {
        successes.push('Golden hour times display');
      } else {
        issues.push('Golden hour time details not showing');
      }
    } else {
      issues.push('Time cards not visible');
    }
    
    // 7. Check Calendar buttons
    console.log('7. Checking calendar buttons...');
    const googleCalBtn = await page.locator('button:has-text("Add to Google Calendar")');
    const iosCalBtn = await page.locator('button:has-text("Add to iOS Calendar")');
    
    if (await googleCalBtn.isVisible() && await iosCalBtn.isVisible()) {
      successes.push('Calendar buttons display');
    } else {
      issues.push('Calendar buttons not visible');
    }
    
    // 8. Test date picker
    console.log('8. Testing date picker...');
    const whenButton = await page.locator('text="When"').first();
    if (await whenButton.isVisible()) {
      await whenButton.click();
      await page.waitForTimeout(1000);
      
      // Try to find calendar or date picker
      const calendar = await page.locator('[role="grid"], [role="dialog"]');
      if (await calendar.isVisible({ timeout: 2000 })) {
        // Click on a date
        const dateCell = await page.locator('[role="gridcell"]:not([aria-disabled="true"])').nth(5);
        if (await dateCell.isVisible()) {
          await dateCell.click();
          successes.push('Date picker works');
          await page.waitForTimeout(2000);
        } else {
          issues.push('Cannot select date in picker');
        }
      } else {
        issues.push('Date picker does not open');
      }
    } else {
      issues.push('When button not found');
    }
    
    // 9. Test API endpoints directly
    console.log('9. Testing API endpoints...');
    
    const apis = [
      { url: '/api/weather?lat=-8.65&lon=115.13', name: 'Weather API' },
      { url: '/api/golden-hour?lat=-8.65&lon=115.13&date=' + new Date().toISOString(), name: 'Golden Hour API' },
      { url: '/api/places?query=Bali', name: 'Places API' },
      { url: '/api/nearby-places?lat=-8.65&lon=115.13', name: 'Nearby Places API' }
    ];
    
    for (const { url, name } of apis) {
      const response = await page.evaluate(async (apiUrl) => {
        try {
          const res = await fetch(apiUrl);
          const data = await res.json();
          return { ok: res.ok, status: res.status, hasData: !!data };
        } catch (err) {
          return { error: err.message };
        }
      }, url);
      
      if (response.ok && response.hasData) {
        successes.push(`${name} works`);
      } else {
        issues.push(`${name} issue: ${response.error || `Status ${response.status}`}`);
      }
    }
    
    // 10. Check responsive design
    console.log('10. Testing responsive design...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    
    const mobileSearch = await page.locator('button:has-text("Search")');
    if (await mobileSearch.isVisible()) {
      successes.push('Mobile responsive design works');
    } else {
      issues.push('Mobile layout has issues');
    }
    
  } catch (error) {
    issues.push(`Test execution error: ${error.message}`);
  }
  
  // Print comprehensive results
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n✅ SUCCESSES (${successes.length}):`);
  successes.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
  
  if (issues.length > 0) {
    console.log(`\n❌ ISSUES FOUND (${issues.length}):`);
    issues.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
  } else {
    console.log('\n🎉 No issues found!');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`Summary: ${successes.length} passed, ${issues.length} failed`);
  console.log('='.repeat(60));
  
  await browser.close();
}

fullTest().catch(console.error);