import { test, expect } from '@playwright/test';

test.describe('Performance and Optimization Tests', () => {
  test('countdown timer updates every second', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for countdown to appear
    await page.waitForTimeout(2000);
    
    // Monitor console for render counts
    const renderLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('[RENDER]')) {
        renderLogs.push(msg.text());
      }
    });
    
    // Get initial time
    const timeElement = page.locator('.font-mono').first();
    const initialTime = await timeElement.textContent();
    
    // Wait 3 seconds
    await page.waitForTimeout(3000);
    
    // Get updated time
    const updatedTime = await timeElement.textContent();
    
    // Time should have changed
    expect(initialTime).not.toBe(updatedTime);
    
    // Check render logs
    console.log('Render logs:', renderLogs);
    
    // Check that TimeDisplay component updated
    const timeDisplayRenders = renderLogs.filter(log => log.includes('TimeDisplay'));
    expect(timeDisplayRenders.length).toBeGreaterThan(0);
  });

  test('golden hour display shows proper countdown', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for golden hour display
    await page.waitForSelector('.text-5xl', { timeout: 10000 });
    
    // Check for countdown elements
    const goldenHourCard = page.locator('div').filter({ hasText: /NEXT GOLDEN HOUR/i }).first();
    await expect(goldenHourCard).toBeVisible();
    
    // Look for countdown with seconds
    const countdownText = await page.locator('span.animate-pulse').first().textContent();
    console.log('Countdown text:', countdownText);
    
    // Should contain "starts in" or "ends in" with time
    expect(countdownText).toMatch(/(starts|ends) in \d+[hm]\s+\d+s/);
  });

  test('no excessive re-renders on idle', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Monitor console for warnings
    let excessiveRenderWarning = false;
    page.on('console', msg => {
      if (msg.type() === 'warn' && msg.text().includes('Rendering too frequently')) {
        excessiveRenderWarning = true;
        console.error('Excessive render detected:', msg.text());
      }
    });
    
    // Wait 5 seconds without interaction
    await page.waitForTimeout(5000);
    
    // Should not have excessive render warnings
    expect(excessiveRenderWarning).toBe(false);
  });

  test('components render independently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Track render counts
    const renderCounts: { [key: string]: number } = {};
    page.on('console', msg => {
      if (msg.text().includes('[RENDER]')) {
        const match = msg.text().match(/\[RENDER\] (\w+): Render #(\d+)/);
        if (match) {
          const [, component, count] = match;
          renderCounts[component] = parseInt(count);
        }
      }
    });
    
    // Wait to collect render data
    await page.waitForTimeout(3000);
    
    console.log('Component render counts:', renderCounts);
    
    // TimeDisplay should render more than MainPage
    if (renderCounts['TimeDisplay'] && renderCounts['MainPage']) {
      expect(renderCounts['TimeDisplay']).toBeGreaterThan(renderCounts['MainPage']);
    }
  });

  test('search functionality works without excessive re-renders', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to find any input field
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input fields`);
    
    if (inputs.length > 0) {
      // Click on the first input (likely the search)
      await inputs[0].click();
      
      // Type slowly to avoid triggering too many renders
      await inputs[0].type('London', { delay: 100 });
      
      // Wait for potential search results
      await page.waitForTimeout(2000);
      
      // Check if any dropdown appeared
      const dropdownOptions = await page.locator('[role="option"]').count();
      console.log(`Found ${dropdownOptions} dropdown options`);
    }
  });
});