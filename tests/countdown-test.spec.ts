import { test, expect } from '@playwright/test';

test.describe('Countdown Timer Tests', () => {
  test('countdown timer shows full format with days, hours, minutes, seconds', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for golden hour display to load
    await page.waitForSelector('.text-5xl', { timeout: 10000 });
    
    // Wait a bit for countdown to initialize
    await page.waitForTimeout(3000);
    
    // Look for countdown text
    const countdownElements = await page.locator('span.animate-pulse').all();
    
    let foundCountdown = false;
    for (const element of countdownElements) {
      const text = await element.textContent();
      console.log('Found animated text:', text);
      
      // Check if it matches countdown format
      if (text && (text.includes('starts in') || text.includes('ends in'))) {
        foundCountdown = true;
        
        // Should show format like "1d 5h 30m 45s" or "5h 30m 45s" or "30m 45s"
        expect(text).toMatch(/(starts|ends) in (\d+d )?\d+h \d+m \d+s|(starts|ends) in \d+m \d+s|(starts|ends) in \d+s/);
        
        // Verify it includes seconds
        expect(text).toContain('s');
        
        // If it includes days, it should also show hours, minutes, seconds
        if (text.includes('d ')) {
          expect(text).toMatch(/\d+d \d+h \d+m \d+s/);
        }
        
        break;
      }
    }
    
    expect(foundCountdown).toBe(true);
  });

  test('countdown updates every second', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for countdown to appear
    await page.waitForTimeout(3000);
    
    // Find countdown element
    const countdownElements = await page.locator('span.animate-pulse').all();
    
    let countdownElement = null;
    let initialText = '';
    
    for (const element of countdownElements) {
      const text = await element.textContent();
      if (text && (text.includes('starts in') || text.includes('ends in'))) {
        countdownElement = element;
        initialText = text;
        break;
      }
    }
    
    expect(countdownElement).not.toBeNull();
    expect(initialText).toBeTruthy();
    
    // Wait 2 seconds
    await page.waitForTimeout(2000);
    
    // Get updated text
    const updatedText = await countdownElement!.textContent();
    
    console.log('Initial countdown:', initialText);
    console.log('Updated countdown:', updatedText);
    
    // Text should have changed (countdown decreased)
    expect(updatedText).not.toBe(initialText);
    
    // Extract seconds from both texts to verify countdown is working
    const getSeconds = (text: string) => {
      const match = text.match(/(\d+)s/);
      return match ? parseInt(match[1]) : null;
    };
    
    const initialSeconds = getSeconds(initialText);
    const updatedSeconds = getSeconds(updatedText!);
    
    if (initialSeconds !== null && updatedSeconds !== null) {
      // Seconds should have decreased (or wrapped around from 0 to 59)
      const expectedDiff = initialSeconds > 2 ? initialSeconds - updatedSeconds : 60 + initialSeconds - updatedSeconds;
      expect(expectedDiff).toBeGreaterThanOrEqual(1);
      expect(expectedDiff).toBeLessThanOrEqual(3);
    }
  });

  test('current time updates independently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find the clock display
    const clockDisplay = page.locator('.font-mono').first();
    
    // Get initial time
    const initialTime = await clockDisplay.textContent();
    console.log('Initial time:', initialTime);
    
    // Wait 2 seconds
    await page.waitForTimeout(2000);
    
    // Get updated time
    const updatedTime = await clockDisplay.textContent();
    console.log('Updated time:', updatedTime);
    
    // Time should have changed
    expect(initialTime).not.toBe(updatedTime);
    
    // Both should be valid time formats
    expect(initialTime).toMatch(/\d{2}:\d{2}:\d{2}/);
    expect(updatedTime).toMatch(/\d{2}:\d{2}:\d{2}/);
  });
});