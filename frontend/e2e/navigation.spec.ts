import { test, expect } from '@playwright/test';
import { loginAsGuest } from './helpers';

test.describe('Page Navigation - All Routes Render', () => {
  test('Login page renders with form and demo buttons', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
    await expect(page.getByTestId('demo-guest')).toBeVisible();
    await expect(page.getByTestId('demo-staff')).toBeVisible();
    await expect(page.getByTestId('demo-admin')).toBeVisible();
  });

  test('Search page renders with calendar', async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/search');
    await expect(page.getByTestId('search-page')).toBeVisible();
    await expect(page.getByText('Select Stay Dates')).toBeVisible();
  });

  test('Not Found page renders for unknown routes', async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/nonexistent-page');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Room Not Found')).toBeVisible();
    await expect(page.getByTestId('not-found-search')).toBeVisible();
    await expect(page.getByTestId('not-found-home')).toBeVisible();
  });

  test('Edit Profile page renders', async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/profile');
    await expect(page.getByTestId('edit-profile-page')).toBeVisible();
  });

  test('Digital Key page renders', async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/digital-key');
    await expect(page.getByTestId('digital-key-page')).toBeVisible();
  });

  test('Digital Key Walkthrough page renders', async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/digital-key/guide');
    await expect(page.getByTestId('digital-key-walkthrough-page')).toBeVisible();
  });

  test('Loyalty Rewards page renders', async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/rewards');
    await expect(page.getByTestId('loyalty-rewards-page')).toBeVisible();
  });

  test('Concierge Services page renders', async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/concierge');
    await expect(page.getByTestId('concierge-services-page')).toBeVisible();
  });

  test('My Bookings page renders', async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/bookings');
    await expect(page.getByTestId('guest-dashboard-page')).toBeVisible();
    await expect(page.getByText('My Bookings')).toBeVisible();
  });
});
