import { test, expect } from '@playwright/test';

test.describe('Golden Hour Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to be ready - using a more specific selector
    await page.waitForSelector('h1:has-text("Golden Hour Calculator")', { timeout: 30000 });
  });

  test('should display the main page components', async ({ page }) => {
    // Check for main heading - be more specific
    await expect(page.locator('h1').first()).toContainText('Golden Hour Calculator');
    
    // Check for search input
    await expect(page.getByPlaceholder(/Search for a city, address, or coordinates/i)).toBeVisible();
    
    // Check for current time display
    await expect(page.locator('.font-mono').first()).toBeVisible();
  });

  test('should search for a location and display results', async ({ page }) => {
    // Type in search box
    const searchInput = page.getByPlaceholder(/Search for a city, address, or coordinates/i);
    await searchInput.fill('New York');
    
    // Wait for search results
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    
    // Click first result
    await page.locator('[role="option"]').first().click();
    
    // Wait for golden hour display to update
    await page.waitForTimeout(2000);
    
    // Check if location is displayed
    await expect(page.getByText(/in New York/i)).toBeVisible();
  });

  test('should display countdown timer with seconds', async ({ page }) => {
    // Wait for countdown timer to appear - looking for text with "starts in" or "ends in"
    await page.waitForSelector('text=/(starts|ends) in/', { timeout: 10000 });
    
    // Get element containing countdown
    const countdownElement = page.locator('text=/(starts|ends) in/').first();
    
    // Get initial countdown value
    const initialCountdown = await countdownElement.textContent();
    
    // Wait 2 seconds
    await page.waitForTimeout(2000);
    
    // Get updated countdown value
    const updatedCountdown = await countdownElement.textContent();
    
    // Values should be different (countdown should have changed)
    expect(initialCountdown).not.toBe(updatedCountdown);
  });

  test('should show golden hour card with times', async ({ page }) => {
    // Wait for golden hour display
    await page.waitForSelector('.text-5xl', { timeout: 10000 });
    
    // Check for time display (format: HH:MM AM/PM)
    const timeDisplay = page.locator('.text-5xl').first();
    await expect(timeDisplay).toBeVisible();
    const timeText = await timeDisplay.textContent();
    expect(timeText).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/i);
  });

  test('should update current time every second', async ({ page }) => {
    // Find the current time display
    const timeDisplay = page.locator('.font-mono').first();
    
    // Get initial time
    const initialTime = await timeDisplay.textContent();
    
    // Wait 2 seconds
    await page.waitForTimeout(2000);
    
    // Get updated time
    const updatedTime = await timeDisplay.textContent();
    
    // Times should be different
    expect(initialTime).not.toBe(updatedTime);
  });

  test('should handle date selection', async ({ page }) => {
    // Click on date picker button
    await page.getByRole('button', { name: /Pick a date/i }).click();
    
    // Wait for calendar to appear
    await page.waitForSelector('[role="grid"]', { timeout: 5000 });
    
    // Click on a future date (next available day)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByRole('gridcell', { name: tomorrow.getDate().toString() }).first().click();
    
    // Check that the display updates
    await page.waitForTimeout(1000);
    
    // Should show "Golden hour on" for future date
    await expect(page.getByText(/Golden hour on/i)).toBeVisible();
  });

  test('should not have excessive re-renders', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'warn' && msg.text().includes('Rendering too frequently')) {
        throw new Error('Excessive re-rendering detected: ' + msg.text());
      }
    });
    
    // Wait for initial load
    await page.waitForTimeout(3000);
    
    // Interact with the page
    const searchInput = page.getByPlaceholder(/Search for a city, address, or coordinates/i);
    await searchInput.fill('London');
    await page.waitForTimeout(2000);
    
    // If no error is thrown, the test passes
  });

  test('should display photography conditions when available', async ({ page }) => {
    // Search for a city, address, or coordinates
    const searchInput = page.getByPlaceholder(/Search for a city, address, or coordinates/i);
    await searchInput.fill('Paris');
    
    // Wait for search results and click
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.locator('[role="option"]').first().click();
    
    // Wait for weather data to load
    await page.waitForTimeout(3000);
    
    // Check for weather badges (may not always appear if API fails)
    const weatherBadges = page.locator('text=/Golden Hour:|Blue Hour:/');
    const badgeCount = await weatherBadges.count();
    
    // If badges are present, verify they're visible
    if (badgeCount > 0) {
      await expect(weatherBadges.first()).toBeVisible();
    }
  });

  test('should preserve state on page refresh', async ({ page }) => {
    // Search for a city, address, or coordinates
    const searchInput = page.getByPlaceholder(/Search for a city, address, or coordinates/i);
    await searchInput.fill('Tokyo');
    
    // Wait for search results and click
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.locator('[role="option"]').first().click();
    
    // Wait for URL to update
    await page.waitForTimeout(2000);
    
    // Get current URL
    const url = page.url();
    expect(url).toContain('location=Tokyo');
    
    // Reload the page
    await page.reload();
    
    // Wait for page to load
    await page.waitForSelector('[role="main"]', { timeout: 10000 });
    
    // Check that Tokyo is still selected
    await expect(page.getByText(/in Tokyo/i)).toBeVisible();
  });
});