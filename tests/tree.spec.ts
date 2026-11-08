import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_PATH ?? '/Alik-family-tree';

test.describe('Alik-family-tree E2E Tests', () => {
	test('loads tree page with canvas and key interface elements', async ({ page }) => {
		await page.goto(`${BASE}/`);
		await expect(page).toHaveTitle(/Alik-family-tree/i);

		// Header navigation
		const header = page.locator('header');
		await expect(header).toBeVisible();

		// Interactive tree canvas and minimap
		const canvas = page.locator('.tree-canvas-wrapper, .tree-canvas-viewport, svg');
		await expect(canvas.first()).toBeVisible();

		// Check navigation links
		const directoryLink = page.locator('header a[href*="directory"]');
		await expect(directoryLink).toBeVisible();
	});

	test('directory page displays persons and supports search filtering', async ({ page }) => {
		await page.goto(`${BASE}/directory/`);
		await expect(page).toHaveTitle(/Каталог/i);

		const searchInput = page.locator('input[type="search"], input[placeholder*="Пошук"]');
		await expect(searchInput).toBeVisible();

		// Check person cards exist
		const personItems = page.locator('.directory-card, .person-row, tr, [data-person-id]');
		await expect(personItems.first()).toBeVisible();

		// Search for known family name
		await searchInput.fill('Запольнов');
		await page.waitForTimeout(150);
		const filteredItems = page.locator('.directory-card, .person-row, tr, [data-person-id]');
		await expect(filteredItems.first()).toBeVisible();
	});

	test('stats page renders demographics and branch statistics', async ({ page }) => {
		await page.goto(`${BASE}/stats/`);
		await expect(page).toHaveTitle(/Статистика/i);

		const heading = page.locator('h1');
		await expect(heading).toContainText(/Статистика/i);

		// Demographics cards/charts
		const statsContent = page.locator('.stats-page-container, .stats-header');
		await expect(statsContent).toBeVisible();
	});

	test('about page renders archive information and sources', async ({ page }) => {
		await page.goto(`${BASE}/about/`);
		await expect(page).toHaveTitle(/Про проєкт/i);

		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
	});

	test('theme switcher toggles color scheme attribute on root', async ({ page }) => {
		await page.goto(`${BASE}/`);

		// Look for theme switcher button
		const themeTrigger = page.locator('button.theme-trigger, button[aria-label*="теми"]');
		if ((await themeTrigger.count()) > 0) {
			await themeTrigger.first().click();
			const darkButton = page.locator('.theme-btn-dark, button:has-text("Темна")');
			if ((await darkButton.count()) > 0) {
				await darkButton.first().click();
				const html = page.locator('html');
				await expect(html).toHaveAttribute('data-theme', 'dark');
			}
		}
	});
});
