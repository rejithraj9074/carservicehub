// @ts-check
const { test, expect } = require('@playwright/test');

test('should display manual sign in form elements', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/login');
  
  // Check if email input is visible
  const emailInput = page.locator('#email');
  await expect(emailInput).toBeVisible();
  
  // Check if password input is visible
  const passwordInput = page.locator('#password');
  await expect(passwordInput).toBeVisible();
  
  // Check if role selection is visible
  const roleSelect = page.locator('#role');
  await expect(roleSelect).toBeVisible();
  
  // Check if sign in button is visible
  const signInButton = page.locator('button[type="submit"]:has-text("Sign In")');
  await expect(signInButton).toBeVisible();
});

test('should show validation errors for empty form submission', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/login');
  
  // Click the sign in button without filling the form
  const signInButton = page.locator('button[type="submit"]:has-text("Sign In")');
  await signInButton.click();
  
  // Check if validation errors are displayed
  await expect(page.locator('text=Email is required')).toBeVisible();
  await expect(page.locator('text=Password is required')).toBeVisible();
  await expect(page.locator('text=Please select a user role')).toBeVisible();
});

test('should successfully sign in with valid credentials', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/login');
  
  // Fill the form with valid data
  const emailInput = page.locator('#email');
  await emailInput.fill('test@example.com');
  
  const passwordInput = page.locator('#password');
  await passwordInput.fill('password123');
  
  // Select a role
  const roleSelect = page.locator('#role');
  await roleSelect.click();
  const customerOption = page.locator('li[data-value="customer"]');
  await customerOption.click();
  
  // Mock the API response for successful login
  await page.route('**/api/auth/login', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'fake-jwt-token',
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'customer'
        }
      })
    });
  });
  
  // Click the sign in button
  const signInButton = page.locator('button[type="submit"]:has-text("Sign In")');
  await signInButton.click();
  
  // Wait for success message in the snackbar
  await expect(page.locator('.MuiAlert-message:has-text("Welcome back, Test User!")')).toBeVisible();
});