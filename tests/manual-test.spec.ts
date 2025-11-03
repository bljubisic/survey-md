import { expect, test } from '@playwright/test';

test.describe('Manual Test - Minimal Reproduction', () => {
	test('should update checked state when clicking - Test 1', async ({ page }) => {
		await page.goto('/manual-test');

		// Get the first item in Test 1
		const firstItem = page.locator('ul').first().locator('li').first();

		// Initial state should be false
		await expect(firstItem).toHaveAttribute('aria-checked', 'false');

		// Click the item
		await firstItem.click();
		await page.waitForTimeout(100);

		// Check if aria-checked updated
		const ariaChecked = await firstItem.getAttribute('aria-checked');
		console.log('After click, aria-checked:', ariaChecked);

		// Should now be true
		await expect(firstItem).toHaveAttribute('aria-checked', 'true');
	});

	test('should update checked state when clicking - Test 2 (reactive)', async ({ page }) => {
		await page.goto('/manual-test');

		// Get the first item in Test 2
		const firstItem = page.locator('ul').nth(1).locator('li').first();

		// Initial state should be false
		await expect(firstItem).toHaveAttribute('aria-checked', 'false');

		// Click the item
		await firstItem.click();
		await page.waitForTimeout(100);

		// Check if aria-checked updated
		const ariaChecked = await firstItem.getAttribute('aria-checked');
		console.log('After click, aria-checked (reactive):', ariaChecked);

		// Should now be true
		await expect(firstItem).toHaveAttribute('aria-checked', 'true');
	});

	test('manual browser test instructions', async ({ page }) => {
		await page.goto('/manual-test');

		// Just verify the page loads
		await expect(page.locator('h1')).toContainText('Manual Test');

		console.log('\n========================================');
		console.log('MANUAL TEST: Open http://localhost:5173/manual-test in your browser');
		console.log('Click on the colored boxes and check:');
		console.log('1. Does the background color change?');
		console.log('2. Does the text update to show true?');
		console.log('3. Check browser console for logs');
		console.log('========================================\n');
	});
});
