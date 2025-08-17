import { test, expect } from '@playwright/test';

test.describe('Site Availability', () => {
  test('should load the homepage successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Check that the page loads successfully by looking for our main elements using data-testid
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page.getByTestId('main-heading')).toBeVisible();
    await expect(page.getByTestId('main-heading')).toHaveText('Blogen Shopify CMS');
    await expect(page.getByTestId('app-name')).toHaveText('Blogen Shopify CMS');
    
    // Verify page title
    await expect(page).toHaveTitle('Blogen Shopify CMS');
    
    // Check that the page has loaded successfully (status should be 200)
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });
});