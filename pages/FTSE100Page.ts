import { Page, expect } from '@playwright/test';
import { CookieHelper } from '../helpers/CookieHelper';

type Constituent = {
  name: string;
  percentChange?: number | null;
  marketCapInMillions?: number| null;
  marketCapText?: string| null;
};

export class FTSE100Page {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private parseMarketCap(marketCapText: string): number | null {
    if (!marketCapText) return null;
    const normalized = marketCapText.replace(/,/g, '').trim();
    const value = parseFloat(normalized);
    return isNaN(value) ? null : value;
  }

  async navigate() {
    await this.page.goto('/');
    await CookieHelper.acceptCookies(this.page);
    console.log(this.page.url());
  }

  async goToFTSE100Table() {
    const link = this.page.locator('a', { hasText: 'View FTSE 100' });

    // Removing `target="_blank"` so it opens in the same tab
    await link.evaluate((a: HTMLAnchorElement) => a.removeAttribute('target'));
    await link.click();

    console.log(this.page.url());
    expect(this.page.url()).toContain('indices/ftse-100/constituents');
  }

  async extractTop10Constituents() {
    const data: Constituent[] = [];
    await this.page.locator('th.percentualchange span.indented.clickable').click();

    const dropdown = this.page.locator('span.dropmenu.dropdown.expanded');
    await dropdown.waitFor({ state: 'visible' });

     const highestLowest = dropdown.locator('li.sort-option div[title="Highest – lowest"]');
      await highestLowest.click();

      const rows = await this.page.locator('tbody tr').all();

      for (let i = 0; i < Math.min(10, rows.length); i++) {
        const row = rows[i];
        const cells = await row.locator('td').allTextContents();

        const name = cells[1]?.trim() || '';

        if (!name) {
          console.warn(`Name missing in row ${i}`);
          continue;
        }

     data.push({ name });
  }
     return data;
  }

  async extractLast10Constituents() {
      const data: Constituent[] = [];
      await this.page.locator('th.percentualchange span.indented.clickable').click();

      const dropdown = this.page.locator('th.percentualchange .dropmenu.dropdown.expanded');
      await expect(dropdown).toBeVisible();

      const options = dropdown.locator('li.sort-option div[title="Lowest – highest"]');
      await expect(options.first()).toBeVisible();

      await options.first().evaluate((el: HTMLElement) => el.click());

      await this.page.waitForTimeout(500); 
      await this.page.locator('th.percentualchange span.indented.clickable').click();

      const rows = await this.page.locator('tbody tr').all();

      for (let i = 0; i < Math.min(10, rows.length); i++) {
        const row = rows[i];
        const cells = await row.locator('td').allTextContents();

        const name = cells[1]?.trim() || '';

        if (!name) {
          console.warn(`Name missing in row ${i}`);
          continue;
        }

     data.push({ name });
  }
     return data;
  }

async extractMarketCapConstituents() {
  const data: Constituent[] = [];

  // Step 1: Click Market Cap (m) header to open sort dropdown
  const marketCapHeader = this.page.locator('th.marketcap span.indented.clickable');
  await marketCapHeader.click();

  // Step 2: Wait for dropdown
  const dropdown = this.page.locator('th.marketcap .dropmenu.dropdown.expanded');
  await dropdown.waitFor({ state: 'visible', timeout: 5000 });

  // Step 3: Click "Highest – lowest"
  const sortOption = dropdown.locator('li.sort-option div[title="Highest – lowest"]');
  await sortOption.first().click();

  // Step 4: Loop through 5 pages
  for (let pageNum = 1; pageNum <= 5; pageNum++) {
    if (pageNum > 1) {
      // Wait for paginator to appear
      const pageLink = this.page.locator(`.paginator a.page-number`, { hasText: `${pageNum}` });
      await pageLink.waitFor({ state: 'visible', timeout: 5000 });

      // Click the link and wait for navigation
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle' }),
        pageLink.click()
      ]);
    }

    // Step 5: Extract rows from table
    const rows = await this.page.locator('tbody tr').all();

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();

      const name = cells[1]?.trim() || '';
      const marketCapText = cells[3]?.trim() || '';

      if (!name || !marketCapText) continue;

      const marketCapInMillions = this.parseMarketCap(marketCapText);

      if (marketCapInMillions !== null && marketCapInMillions > 7) {
        data.push({
          name,
          marketCapText,
          marketCapInMillions
        });
      }
    }
  }

  return data;
}
}

