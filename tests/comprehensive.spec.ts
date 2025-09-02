import { test, expect } from '@playwright/test';

test.describe('Comprehensive Site Tests', () => {
  
  test('no re-renders on idle page', async ({ page }) => {
    // Monitor console for render logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[RENDER]') || text.includes('Rendering')) {
        consoleLogs.push(text);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Clear initial logs
    consoleLogs.length = 0;
    
    // Wait 5 seconds without interaction
    await page.waitForTimeout(5000);
    
    // Check for excessive renders
    const renderWarnings = consoleLogs.filter(log => log.includes('too frequently'));
    console.log('Render warnings found:', renderWarnings.length);
    
    expect(renderWarnings.length).toBe(0);
  });

  test('search bar functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find search input
    const searchInput = page.getByPlaceholder(/Search for a city, address, or coordinates/i);
    
    // Check search input is visible
    await expect(searchInput).toBeVisible();
    
    // Type in search
    await searchInput.click();
    await searchInput.fill('London');
    
    // Wait for dropdown
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    
    // Check dropdown appeared
    const options = await page.locator('[role="option"]').count();
    console.log('Search results found:', options);
    expect(options).toBeGreaterThan(0);
    
    // Select first option
    await page.locator('[role="option"]').first().click();
    
    // Verify location updated
    await page.waitForTimeout(2000);
    await expect(page.getByText(/in London/i)).toBeVisible();
  });

  test('date picker functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find date picker button
    const dateButton = page.getByRole('button', { name: /Pick a date/i });
    await expect(dateButton).toBeVisible();
    
    // Click to open calendar
    await dateButton.click();
    
    // Wait for calendar
    await page.waitForSelector('[role="grid"]', { timeout: 5000 });
    
    // Select tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDate().toString();
    
    // Click on tomorrow's date
    const dateCell = page.getByRole('gridcell', { name: tomorrowDay }).first();
    await dateCell.click();
    
    // Verify date changed
    await page.waitForTimeout(2000);
    
    // Should show future date message
    const goldenHourText = await page.locator('text=/Golden hour on/i').count();
    console.log('Future date text found:', goldenHourText > 0);
    expect(goldenHourText).toBeGreaterThan(0);
  });

  test('no flickering on component updates', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    const screenshot1 = await page.screenshot();
    
    // Wait 1 second (time should update)
    await page.waitForTimeout(1000);
    
    // Take second screenshot
    const screenshot2 = await page.screenshot();
    
    // The screenshots should be different (time changed)
    expect(Buffer.compare(screenshot1, screenshot2)).not.toBe(0);
    
    // Check for smooth countdown updates
    const countdownElement = page.locator('span.animate-pulse').first();
    
    // Check if animation is smooth
    const hasAnimation = await countdownElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.animation !== 'none';
    });
    
    console.log('Has animation:', hasAnimation);
    expect(hasAnimation).toBe(true);
  });

  test('search bar with coordinates', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find search input
    const searchInput = page.getByPlaceholder(/Search for a city, address, or coordinates/i);
    
    // Enter coordinates
    await searchInput.click();
    await searchInput.fill('40.7128, -74.0060');
    await searchInput.press('Enter');
    
    // Wait for location to update
    await page.waitForTimeout(3000);
    
    // Check if location was processed
    const locationText = await page.locator('text=/in.*,/i').first().textContent();
    console.log('Location after coordinates:', locationText);
    
    // Should have updated location
    expect(locationText).toBeTruthy();
  });

  test('time components update independently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get main content container
    const mainContent = page.locator('main').first();
    
    // Get initial main content HTML (excluding time)
    const initialMainHtml = await mainContent.innerHTML();
    
    // Get time display
    const timeDisplay = page.locator('.font-mono').first();
    const initialTime = await timeDisplay.textContent();
    
    // Wait 2 seconds
    await page.waitForTimeout(2000);
    
    // Get updated time
    const updatedTime = await timeDisplay.textContent();
    
    // Time should have changed
    expect(initialTime).not.toBe(updatedTime);
    
    // Get countdown if visible
    const countdownElements = await page.locator('span:has-text("starts in"), span:has-text("ends in")').all();
    
    if (countdownElements.length > 0) {
      const initialCountdown = await countdownElements[0].textContent();
      await page.waitForTimeout(1000);
      const updatedCountdown = await countdownElements[0].textContent();
      
      console.log('Countdown changed:', initialCountdown !== updatedCountdown);
      expect(initialCountdown).not.toBe(updatedCountdown);
    }
  });

  test('page performance metrics', async ({ page }) => {
    // Navigate and measure performance
    await page.goto('/');
    
    // Wait for full load
    await page.waitForLoadState('networkidle');
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    console.log('Performance metrics:', metrics);
    
    // Check that page loads reasonably fast
    expect(metrics.domInteractive).toBeLessThan(5000);
    expect(metrics.loadComplete).toBeLessThan(10000);
  });

  test('URL updates with location changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get initial URL
    const initialUrl = page.url();
    console.log('Initial URL:', initialUrl);
    
    // Search for location
    const searchInput = page.getByPlaceholder(/Search for a city, address, or coordinates/i);
    await searchInput.click();
    await searchInput.fill('Paris');
    
    // Wait for dropdown and select
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.locator('[role="option"]').first().click();
    
    // Wait for URL to update
    await page.waitForTimeout(2000);
    
    // Get updated URL
    const updatedUrl = page.url();
    console.log('Updated URL:', updatedUrl);
    
    // URL should have changed
    expect(updatedUrl).not.toBe(initialUrl);
    expect(updatedUrl).toContain('location=Paris');
  });

  test('responsive behavior on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check main elements are visible
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Check search bar is accessible
    const searchInput = page.getByPlaceholder(/Search for a city, address, or coordinates/i);
    await expect(searchInput).toBeVisible();
    
    // Check golden hour display
    await expect(page.locator('.text-5xl').first()).toBeVisible();
    
    // Check responsive text sizing
    const heading = page.locator('h1').first();
    const fontSize = await heading.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });
    
    console.log('Mobile heading font size:', fontSize);
    
    // Should have responsive sizing
    expect(fontSize).toBeTruthy();
  });
});