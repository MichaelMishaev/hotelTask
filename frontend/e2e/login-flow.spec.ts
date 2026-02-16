import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('can type email and password', async ({ page }) => {
    await page.goto('/login');
    const email = page.getByTestId('login-email');
    const password = page.getByTestId('login-password');

    await email.fill('john@example.com');
    await password.fill('guest123');

    await expect(email).toHaveValue('john@example.com');
    await expect(password).toHaveValue('guest123');
  });

  test('toggle password visibility', async ({ page }) => {
    await page.goto('/login');
    const password = page.getByTestId('login-password');
    const toggle = page.getByTestId('toggle-password');

    await password.fill('secret');
    await expect(password).toHaveAttribute('type', 'password');

    await toggle.click();
    await expect(password).toHaveAttribute('type', 'text');

    await toggle.click();
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('remember me checkbox works', async ({ page }) => {
    await page.goto('/login');
    const checkbox = page.getByTestId('remember-me');

    await expect(checkbox).not.toBeChecked();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test('sign in button disabled without email', async ({ page }) => {
    await page.goto('/login');
    const submit = page.getByTestId('login-submit');
    await expect(submit).toBeDisabled();
  });

  test('sign in button enabled with email', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill('john@example.com');
    const submit = page.getByTestId('login-submit');
    await expect(submit).toBeEnabled();
  });
});
