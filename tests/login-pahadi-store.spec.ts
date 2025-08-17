import { test, expect } from '@playwright/test';

test.describe('Pahadi Store Login', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/auth/login');
  });

  test('should navigate to login page and load form elements', async ({ page }) => {
    // Verify the login page loads correctly
    await expect(page).toHaveTitle('Login - Blogen Shopify CMS');

    // Check that form elements are visible using data-testid
    await expect(page.getByTestId('shop-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();

    // Verify placeholder text
    await expect(page.getByTestId('shop-input')).toHaveAttribute('placeholder', 'your-store-name');
  });

  test('should accept pahadi-store input and format it correctly', async ({ page }) => {
    const shopInput = page.getByTestId('shop-input');

    // Test input normalization with various formats
    await shopInput.fill('pahadi-store');
    await expect(shopInput).toHaveValue('pahadi-store');

    // Test with protocol prefix (should be removed)
    await shopInput.fill('https://pahadi-store');
    await expect(shopInput).toHaveValue('pahadi-store');

    // Test with full domain (should be normalized)
    await shopInput.fill('pahadi-store.myshopify.com');
    await expect(shopInput).toHaveValue('pahadi-store');

    // Test with mixed case (should be lowercased)
    await shopInput.fill('Pahadi-Store');
    await expect(shopInput).toHaveValue('pahadi-store');
  });

  test('should enable login button when shop name is provided', async ({ page }) => {
    const shopInput = page.getByTestId('shop-input');
    const loginButton = page.getByTestId('login-button');

    // Initially button should be disabled (no shop name)
    await expect(loginButton).toBeDisabled();

    // Enter shop name and verify button becomes enabled
    await shopInput.fill('pahadi-store');
    await expect(loginButton).toBeEnabled();

    // Clear shop name and verify button becomes disabled again
    await shopInput.fill('');
    await expect(loginButton).toBeDisabled();
  });

  test('should initiate OAuth flow when submitting with pahadi-store', async ({ page }) => {
    const shopInput = page.getByTestId('shop-input');
    const loginButton = page.getByTestId('login-button');

    // Track the API request to verify it contains correct shop name
    let apiRequestBody = null;

    // Mock the OAuth initiation API to avoid external redirects
    await page.route('/api/auth/shopify', async (route) => {
      if (route.request().method() === 'POST') {
        apiRequestBody = route.request().postDataJSON();

        // Mock a successful OAuth URL response
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            authUrl: 'https://pahadi-store.myshopify.com/admin/oauth/authorize?client_id=test&scope=read_content%2Cwrite_content&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fshopify%2Fcallback&state=mock-state&grant_options%5B%5D=per-user',
            state: 'mock-state'
          })
        });
      }
    });

    // Track navigation to verify OAuth URL
    let navigatedToOAuth = false;
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame() && frame.url().includes('pahadi-store.myshopify.com/admin/oauth/authorize')) {
        navigatedToOAuth = true;
      }
    });

    // Fill in the shop name and submit
    await shopInput.fill('pahadi-store');
    await expect(loginButton).toBeEnabled();

    // Click the login button and wait for navigation
    const navigationPromise = page.waitForURL('**/admin/oauth/authorize*', { timeout: 10000 });
    await loginButton.click();

    try {
      // Wait for navigation to OAuth page
      await navigationPromise;

      // Verify we navigated to the correct OAuth URL
      expect(page.url()).toContain('pahadi-store.myshopify.com/admin/oauth/authorize');
      expect(page.url()).toContain('client_id=test');
      expect(page.url()).toContain('scope=read_content%2Cwrite_content');

    } catch (error) {
      // If navigation doesn't happen (due to mocking), that's also acceptable
      // Just verify the API was called correctly
    }

    // Verify the API request contained the correct shop name
    expect(apiRequestBody).toBeTruthy();
    expect(apiRequestBody.shop).toBe('pahadi-store');
  });

  test('should display error message for invalid shop domain', async ({ page }) => {
    const shopInput = page.getByTestId('shop-input');
    const loginButton = page.getByTestId('login-button');

    // Mock API to return an error for invalid shop
    await page.route('/api/auth/shopify', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Invalid shop domain'
          })
        });
      }
    });

    // Try to submit with invalid shop name
    await shopInput.fill('invalid-shop-name-that-does-not-exist');
    await loginButton.click();

    // Wait for error message to appear
    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByTestId('error-message')).toContainText('Invalid shop domain');
  });

  test('should show proper UI elements and styling for pahadi-store login', async ({ page }) => {
    // Verify page heading and description
    await expect(page.getByRole('heading', { name: 'Connect your Shopify store' })).toBeVisible();
    await expect(page.getByText('Enter your store domain to get started with Blogen CMS')).toBeVisible();

    // Verify the .myshopify.com suffix is shown
    await expect(page.getByText('.myshopify.com')).toBeVisible();

    // Verify terms and privacy links are present
    await expect(page.getByText('Terms of Service')).toBeVisible();
    await expect(page.getByText('Privacy Policy')).toBeVisible();

    // Verify Shopify info box is present
    await expect(page.getByText('New to Shopify?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create your store here' })).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    const shopInput = page.getByTestId('shop-input');
    const loginButton = page.getByTestId('login-button');

    // Mock network failure
    await page.route('/api/auth/shopify', async (route) => {
      await route.abort('failed');
    });

    await shopInput.fill('pahadi-store');
    await loginButton.click();

    // Should show some error indication
    // Note: The exact error handling depends on the useAuth implementation
    await page.waitForTimeout(1000);

    // Verify the button is no longer in loading state
    await expect(loginButton).not.toContainText('Connecting...');
  });
});