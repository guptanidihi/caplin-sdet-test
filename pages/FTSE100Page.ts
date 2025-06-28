import { Page, expect } from '@playwright/test';
import { CookieHelper } from '../helpers/CookieHelper';

// Type definition for constituent data
type Constituent = {
  name: string;
  percentChange?: number | null;
  marketCapInMillions?: number | null;
  marketCapText?: string | null;
};

export class FTSE100Page {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Helper method to convert Market Cap text (e.g., "8,321.50") into a float number
  private parseMarketCap(marketCapText: string): number | null {
    if (!marketCapText) return null;
    const normalized = marketCapText.replace(/,/g, '').trim(); // Remove commas
    const value = parseFloat(normalized); // Convert to float
    return isNaN(value) ? null : value;
  }

  // Navigates to the base URL and accepts cookies
  async navigate() {
    await this.page.goto('/');
    await CookieHelper.acceptCookies(this.page);
    console.log(this.page.url()); // Log current URL
  }

  // Navigates to the FTSE 100 constituents table
  async goToFTSE100Table() {
    const link = this.page.locator('a', { hasText: 'View FTSE 100' });

    // Open link in same tab by removing target="_blank"
    await link.evaluate((a: HTMLAnchorElement) => a.removeAttribute('target'));
    await link.click();

    // Ensure correct page is loaded
    console.log(this.page.url());
    expect(this.page.url()).toContain('indices/ftse-100/constituents');
  }

  // Extracts top 10 constituents sorted by highest % change
  async extractTop10Constituents() {
    const data: Constituent[] = [];

    // Click on % change header to open sort options
    await this.page.locator('th.percentualchange span.indented.clickable').click();

    // Wait for sort dropdown to be visible
    const dropdown = this.page.locator('span.dropmenu.dropdown.expanded');
    await dropdown.waitFor({ state: 'visible' });

    // Click "Highest – lowest" sort option
    const highestLowest = dropdown.locator('li.sort-option div[title="Highest – lowest"]');
    await highestLowest.click();

    // Extract top 10 rows from table
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

  // Extracts bottom 10 constituents sorted by lowest % change
  async extractLast10Constituents() {
    const data: Constituent[] = [];

    // Click % change column header to trigger sort menu
    await this.page.locator('th.percentualchange span.indented.clickable').click();

    const dropdown = this.page.locator('th.percentualchange .dropmenu.dropdown.expanded');
    await expect(dropdown).toBeVisible();

    // Select "Lowest – highest" sort option
    const options = dropdown.locator('li.sort-option div[title="Lowest – highest"]');
    await expect(options.first()).toBeVisible();
    await options.first().evaluate((el: HTMLElement) => el.click());

    // Wait for sorting effect to settle
    await this.page.waitForTimeout(500); 

    // Click header again if necessary to collapse sort menu
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

  // Extracts all constituents across 5 pages where Market Cap > 7 million
  async extractMarketCapConstituents() {
    const data: Constituent[] = [];

    // Click Market Cap header to open sort dropdown
    const marketCapHeader = this.page.locator('th.marketcap span.indented.clickable');
    await marketCapHeader.click();

    // Wait for dropdown to appear
    const dropdown = this.page.locator('th.marketcap .dropmenu.dropdown.expanded');
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });

    // Click "Highest – lowest" sorting
    const sortOption = dropdown.locator('li.sort-option div[title="Highest – lowest"]');
    await sortOption.first().click();

    // Loop through first 5 pages of the table
    for (let pageNum = 1; pageNum <= 5; pageNum++) {
      if (pageNum > 1) {
        // Navigate to the next page using paginator
        const pageLink = this.page.locator(`.paginator a.page-number`, { hasText: `${pageNum}` });
        await pageLink.waitFor({ state: 'visible', timeout: 5000 });

        await Promise.all([
          this.page.waitForNavigation({ waitUntil: 'networkidle' }),
          pageLink.click()
        ]);
      }

      // Extract data from rows on the current page
      const rows = await this.page.locator('tbody tr').all();
      for (const row of rows) {
        const cells = await row.locator('td').allTextContents();

        const name = cells[1]?.trim() || '';
        const marketCapText = cells[3]?.trim() || '';

        if (!name || !marketCapText) continue;

        const marketCapInMillions = this.parseMarketCap(marketCapText);

        // Only include if Market Cap > 7 million
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
