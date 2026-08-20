import { test, expect } from '@playwright/test';

test.setTimeout(480000);

test('edit-trace: make buttons slightly orange on SaaS template', async ({ page }) => {
  await page.goto('/');
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  page.on('console', msg => {
    const text = msg.text();
    console.log('BROWSER CONSOLE:', text);
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });
  
  // Click "SaaS Landing Page" template
  const saasBtn = page.locator('button:has-text("SaaS Landing Page")').first();
  if (await saasBtn.count() > 0) {
    await saasBtn.click();
    console.log('Clicked "SaaS Landing Page" template');
    await page.waitForTimeout(10000);
  }
  
  // Verify buttons exist on canvas
  await page.waitForTimeout(3000);
  const buttonsOnCanvas = await page.locator('button').count();
  console.log(`Buttons on canvas: ${buttonsOnCanvas}`);
  
  // Find AI chat input - it's an INPUT with aria-label "Describe what you want to create"
  const aiChatInput = page.locator('input[aria-label="Describe what you want to create"]').first();
  
  if (await aiChatInput.count() > 0) {
    console.log('Found AI chat input');
    await aiChatInput.fill('Make all the buttons slightly orange.');
    console.log('Filled input');
    await page.waitForTimeout(1000);
    await aiChatInput.press('Enter');
    console.log('Pressed Enter - sent edit command');
  } else {
    console.log('AI chat input NOT FOUND');
  }
  
  // Wait for FULL pipeline completion - 10 minutes max
  await page.waitForTimeout(600000);
  
  console.log('Test complete');
});