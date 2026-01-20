// tests/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VakSpot/);
  });

  test('login page accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Inloggen');
  });

  test('register page accessible', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Account');
  });
});
