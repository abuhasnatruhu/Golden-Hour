const { chromium } = require('playwright');

async function testAllFeatures() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const issues = [];
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      issues.push(`Console Error: ${msg.text()}`);
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    issues.push(`Page Error: ${error.message}`);
  });
  
  try {
    console.log('🔍 Starting comprehensive testing...\n');
    
    // Test 1: Load the page
    console.log('1. Loading page...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Test 2: Check if Next Golden Hour card appears
    console.log('2. Checking for Next Golden Hour card...');
    const goldenHourCard = await page.locator('text="NEXT GOLDEN HOUR"').isVisible().catch(() => false);
    if (!goldenHourCard) {
      issues.push('Next Golden Hour card is not visible on initial load');
    } else {
      console.log('✅ Next Golden Hour card found');
    }
    
    // Test 3: Test location search
    console.log('3. Testing location search...');
    const searchInput = await page.locator('input[placeholder*="Enter location"]').first();
    if (searchInput) {
      await searchInput.click();
      await searchInput.fill('Bali, Indonesia');
      await page.waitForTimeout(1000);
      
      // Check if suggestions appear
      const suggestions = await page.locator('[role="listbox"]').isVisible().catch(() => false);
      if (suggestions) {
        console.log('✅ Location suggestions appear');
        await page.locator('[role="option"]').first().click();
      } else {
        issues.push('Location suggestions do not appear');
      }
    } else {
      issues.push('Location search input not found');
    }
    
    // Test 4: Click Search button
    console.log('4. Testing search button...');
    const searchButton = await page.locator('button:has-text("Search")').first();
    if (searchButton) {
      await searchButton.click();
      await page.waitForTimeout(3000);
      
      // Check if golden hour times appear
      const timesCard = await page.locator('text="Golden Hour Times"').isVisible().catch(() => false);
      if (!timesCard) {
        issues.push('Golden Hour Times card does not appear after search');
      } else {
        console.log('✅ Golden Hour Times card appears');
      }
    } else {
      issues.push('Search button not found');
    }
    
    // Test 5: Check weather data
    console.log('5. Checking weather data...');
    const weatherData = await page.locator('text=/\\d+°C/').isVisible().catch(() => false);
    if (!weatherData) {
      issues.push('Weather data not displayed');
    } else {
      console.log('✅ Weather data displayed');
    }
    
    // Test 6: Test date picker
    console.log('6. Testing date picker...');
    const dateInput = await page.locator('input[type="date"], button:has-text("Add date")').first();
    if (dateInput) {
      await dateInput.click();
      await page.waitForTimeout(1000);
      
      // Try to select tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      if (await dateInput.getAttribute('type') === 'date') {
        await dateInput.fill(dateString);
      } else {
        // Calendar picker logic
        const nextDay = await page.locator('[role="gridcell"]:not([aria-disabled="true"])').nth(1);
        if (nextDay) {
          await nextDay.click();
        }
      }
      console.log('✅ Date picker works');
    } else {
      issues.push('Date picker not found');
    }
    
    // Test 7: Check API endpoints
    console.log('7. Testing API endpoints...');
    
    // Test weather API
    const weatherResponse = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/weather?lat=-8.65&lon=115.13');
        return { status: res.status, ok: res.ok };
      } catch (err) {
        return { error: err.message };
      }
    });
    
    if (weatherResponse.error || !weatherResponse.ok) {
      issues.push(`Weather API issue: ${weatherResponse.error || `Status ${weatherResponse.status}`}`);
    } else {
      console.log('✅ Weather API works');
    }
    
    // Test golden-hour API
    const goldenHourResponse = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/golden-hour?lat=-8.65&lon=115.13&date=' + new Date().toISOString());
        return { status: res.status, ok: res.ok };
      } catch (err) {
        return { error: err.message };
      }
    });
    
    if (goldenHourResponse.error || !goldenHourResponse.ok) {
      issues.push(`Golden Hour API issue: ${goldenHourResponse.error || `Status ${goldenHourResponse.status}`}`);
    } else {
      console.log('✅ Golden Hour API works');
    }
    
    // Test places API
    const placesResponse = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/places?query=Bali');
        return { status: res.status, ok: res.ok };
      } catch (err) {
        return { error: err.message };
      }
    });
    
    if (placesResponse.error || !placesResponse.ok) {
      issues.push(`Places API issue: ${placesResponse.error || `Status ${placesResponse.status}`}`);
    } else {
      console.log('✅ Places API works');
    }
    
    // Test 8: Check for Google Calendar button
    console.log('8. Checking calendar buttons...');
    const calendarButton = await page.locator('button:has-text("Add to Google Calendar")').isVisible().catch(() => false);
    if (!calendarButton) {
      issues.push('Calendar buttons not visible');
    } else {
      console.log('✅ Calendar buttons found');
    }
    
    // Test 9: Check for Time Cards
    console.log('9. Checking time cards...');
    const sunriseCard = await page.locator('text="Sunrise"').isVisible().catch(() => false);
    const sunsetCard = await page.locator('text="Sunset"').isVisible().catch(() => false);
    if (!sunriseCard || !sunsetCard) {
      issues.push('Time cards (Sunrise/Sunset) not visible');
    } else {
      console.log('✅ Time cards displayed');
    }
    
    // Test 10: Check responsive design
    console.log('10. Testing responsive design...');
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.waitForTimeout(1000);
    const mobileMenu = await page.locator('[aria-label="Menu"], button:has-text("☰")').isVisible().catch(() => false);
    console.log(`Mobile menu visible: ${mobileMenu}`);
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
  } catch (error) {
    issues.push(`Test execution error: ${error.message}`);
  }
  
  // Print results
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(50));
  
  if (issues.length === 0) {
    console.log('✅ All tests passed! No issues found.');
  } else {
    console.log(`❌ Found ${issues.length} issue(s):\n`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  await browser.close();
}

// Run the tests
testAllFeatures().catch(console.error);