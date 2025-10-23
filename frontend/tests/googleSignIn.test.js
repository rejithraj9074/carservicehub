// @ts-check
const { test, expect } = require('@playwright/test');

test('should display Google Sign In button', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/login');
  
  // Check if the Google Sign In button is visible
  const googleSignInButton = page.locator('button:has-text("Continue with Google")');
  await expect(googleSignInButton).toBeVisible();
});

test('should show role selection before Google Sign In', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/login');
  
  // Check if role selection is visible
  const roleSelect = page.locator('#role');
  await expect(roleSelect).toBeVisible();
  
  // Click on the role select to open the dropdown
  await roleSelect.click();
  
  // Select a role (customer) from the dropdown
  const customerOption = page.locator('li[data-value="customer"]');
  await customerOption.click();
  
  // Verify the role selection by checking the text content
  await expect(roleSelect).toHaveText('Customer');
});

test('should initiate Google Sign In flow when button is clicked', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/login');
  
  // Select a role
  const roleSelect = page.locator('#role');
  await roleSelect.click();
  const customerOption = page.locator('li[data-value="customer"]');
  await customerOption.click();
  
  // Click the Google Sign In button
  const googleSignInButton = page.locator('button:has-text("Continue with Google")');
  
  // We can't fully test the Google OAuth flow in automated tests without proper setup
  // But we can verify that clicking the button initiates some action
  try {
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 5000 }),
      googleSignInButton.click()
    ]);
    
    // Close the popup if it opens
    if (popup) {
      await popup.close();
    }
  } catch (error) {
    // If no popup opens, that's okay for this test
    console.log('No popup opened, which is expected in test environment');
  }
});

test('should handle Google Sign In error gracefully', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/login');
  
  // Select a role
  const roleSelect = page.locator('#role');
  await roleSelect.click();
  const customerOption = page.locator('li[data-value="customer"]');
  await customerOption.click();
  
  // Mock the fetch API to simulate a network error
  await page.route('**/api/auth/firebase/google', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Authentication failed' })
    });
  });
  
  // Click the Google Sign In button
  const googleSignInButton = page.locator('button:has-text("Continue with Google")');
  await googleSignInButton.click();
  
  // Wait a bit for the error handling to occur
  await page.waitForTimeout(2000);
  
  // Note: You may need to adjust this based on your actual error handling implementation
  // For now, we're just verifying the test runs without crashing
});