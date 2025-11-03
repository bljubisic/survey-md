import { expect, test } from '@playwright/test';

test('index page has expected h2 with survey text', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h2')).toContainText('Hi! Please pick a number.');
});
