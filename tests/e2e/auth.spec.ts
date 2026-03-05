import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.getByText('Welcome to DojoDash')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Register' })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid email')).toBeVisible();
  });

  test('should switch to register tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Register' }).click();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
  });

  test('should show password reset form', async ({ page }) => {
    await page.getByText('Forgot password?').click();
    await expect(page.getByText("Enter your email and we'll send you a reset link")).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/app/family');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Protected Routes', () => {
  test('admin dashboard requires admin role', async ({ page }) => {
    await page.goto('/app/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('coach dashboard requires coach role', async ({ page }) => {
    await page.goto('/app/coach');
    await expect(page).toHaveURL(/\/login/);
  });

  test('family dashboard requires family role', async ({ page }) => {
    await page.goto('/app/family');
    await expect(page).toHaveURL(/\/login/);
  });
});
