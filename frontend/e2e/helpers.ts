import type { Page } from '@playwright/test';

const MOCK_GUEST_USER = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Guest',
  token: 'mock-jwt-token-for-testing',
};

export async function loginAsGuest(page: Page) {
  await page.goto('/login');
  await page.evaluate((user) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', user.token);
  }, MOCK_GUEST_USER);
}
