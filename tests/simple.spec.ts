import { test, expect } from '@playwright/test';

test.describe('Golden Hour App Basic Tests', () => {
  test('app loads successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for any content to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-screenshot.png' });
    
    // Check if the page has loaded (basic check)
    const title = await page.title();
    expect(title).toContain('Golden Hour');
    
    // Check for main heading
    const heading = await page.locator('h1').first().textContent();
    expect(heading).toContain('Golden Hour');
    
    console.log('Page title:', title);
    console.log('Main heading:', heading);
  });

  test('displays current time', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for time display with format HH:MM:SS
    const timeDisplay = await page.locator('text=/\\d{2}:\\d{2}:\\d{2}/').first().textContent();
    console.log('Current time display:', timeDisplay);
    
    expect(timeDisplay).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  test('displays golden hour times', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for golden hour calculation
    await page.waitForTimeout(2000);
    
    // Look for time in format like "5:30 AM" 
    const goldenHourTime = await page.locator('text=/\\d{1,2}:\\d{2}\\s*(AM|PM)/').first().textContent();
    console.log('Golden hour time:', goldenHourTime);
    
    expect(goldenHourTime).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/);
  });
});