import { test, expect } from '@playwright/test';
import { loginAsGuest } from './helpers';

test.describe('Edit Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/profile');
  });

  test('displays personal information section', async ({ page }) => {
    await expect(page.getByText('Personal Information')).toBeVisible();
  });

  test('displays account security section', async ({ page }) => {
    await expect(page.getByText('Account Security')).toBeVisible();
  });

  test('displays preferences section', async ({ page }) => {
    await expect(page.getByText('Preferences')).toBeVisible();
  });

  test('has save button in header', async ({ page }) => {
    await expect(page.getByTestId('profile-save')).toBeVisible();
  });
});

test.describe('Digital Key Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/digital-key');
  });

  test('shows unlock room button', async ({ page }) => {
    await expect(page.getByTestId('unlock-room-btn')).toBeVisible();
  });

  test('shows help and front desk buttons', async ({ page }) => {
    await expect(page.getByTestId('digital-key-help')).toBeVisible();
    await expect(page.getByTestId('digital-key-front-desk')).toBeVisible();
  });
});

test.describe('Digital Key Walkthrough Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/digital-key/guide');
  });

  test('shows step cards', async ({ page }) => {
    await expect(page.getByText('Step 01')).toBeVisible();
  });

  test('has get started button', async ({ page }) => {
    await expect(page.getByTestId('walkthrough-get-started')).toBeVisible();
  });
});

test.describe('Loyalty Rewards Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/rewards');
  });

  test('shows membership tier section', async ({ page }) => {
    await expect(page.getByText('Membership Tier')).toBeVisible();
  });

  test('shows how to earn section', async ({ page }) => {
    await expect(page.getByText('How to Earn')).toBeVisible();
  });
});

test.describe('Concierge Services Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsGuest(page);
    await page.goto('/concierge');
  });

  test('shows category filter pills', async ({ page }) => {
    await expect(page.getByText('Spa & Wellness')).toBeVisible();
    await expect(page.getByText('Fine Dining')).toBeVisible();
  });

  test('shows signature experiences section', async ({ page }) => {
    await expect(page.getByText('Signature Experiences')).toBeVisible();
  });
});
