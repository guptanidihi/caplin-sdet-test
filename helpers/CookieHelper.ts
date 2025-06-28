import { Page, expect } from '@playwright/test';

export class CookieHelper {
  static async acceptCookies(page: Page): Promise<void> {
    const cookieButton = page.getByRole('button', { name: /accept all cookies/i });

    try {
      // Wait for the cookie banner/button to appear (up to 10 seconds)
      await expect(cookieButton).toBeVisible({ timeout: 10000 });
      await cookieButton.click();
      console.log('Cookies Accepted');
    } catch {
      console.log('Cookie banner not visible');
    }
  }
}