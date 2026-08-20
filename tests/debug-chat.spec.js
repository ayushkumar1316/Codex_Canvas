import { test, expect } from '@playwright/test';

test.setTimeout(120000);

test('debug: find AI chat after template', async ({ page }) => {
  await page.goto('/');
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  // Click SaaS template
  const saasBtn = page.locator('button:has-text("SaaS Landing Page")').first();
  if (await saasBtn.count() > 0) {
    await saasBtn.click();
    console.log('Clicked SaaS template');
    await page.waitForTimeout(10000);
  }
  
  // Take screenshot
  await page.screenshot({ path: 'after-saas.png', fullPage: true });
  
  // Find ALL textareas and inputs
  const allInputs = await page.locator('textarea, input, [contenteditable="true"]').all();
  console.log(`Found ${allInputs.length} input elements`);
  
  for (const inp of allInputs) {
    const tagName = await inp.evaluate(el => el.tagName);
    const type = await inp.getAttribute('type');
    const placeholder = await inp.getAttribute('placeholder');
    const className = await inp.getAttribute('class');
    const id = await inp.getAttribute('id');
    const testid = await inp.getAttribute('data-testid');
    const ariaLabel = await inp.getAttribute('aria-label');
    const visible = await inp.isVisible();
    console.log('Input:', { tagName, type, placeholder, className, id, testid, ariaLabel, visible });
  }
  
  // Also check if there's a new tab/window
  const pages = await page.context().pages();
  console.log(`Total pages: ${pages.length}`);
  for (const p of pages) {
    console.log('Page URL:', p.url());
  }
  
  await page.waitForTimeout(30000);
});