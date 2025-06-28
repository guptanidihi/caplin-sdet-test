import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { FTSE100Page } from '../pages/FTSE100Page';

test.use({ trace: 'on' });

test.describe('FTSE 100 Test Scenarios', () => {
   let page: Page;
  let ftsePage: FTSE100Page;

  test.beforeEach(async ({ page: sharedPage }) => {
    page = sharedPage; // use the default page
    ftsePage = new FTSE100Page(page);
    await ftsePage.navigate(); // navigate to home on each test
  });

  test('Top 10 constituents with highest % change', async () => {
    await ftsePage.goToFTSE100Table();
    const data = await ftsePage.extractTop10Constituents();

    expect(data.length).toBe(10);
    console.log('Name of Top 10 constituents with highest % change are:\n', data.map(d => d.name));
  });

  test('Top 10 constituents with lowest % change', async () => {
    await ftsePage.goToFTSE100Table();
    const data = await ftsePage.extractLast10Constituents();

    expect(data.length).toBe(10);
    console.log('Name of Top 10 constituents with lowest % change are:\n', data.map(d => d.name));
  });

test('Constituents where Market Cap > 7 million', async () => {
  await ftsePage.goToFTSE100Table();
  const data = await ftsePage.extractMarketCapConstituents();

  console.log('✅ Constituents with Market Cap > 7 million:');
  console.table(
    data.map((item) => ({
      Name: item.name,
      'Market Cap (Text)': item.marketCapText,
      'Market Cap (M)': item.marketCapInMillions,
    }))
  );
});

  test('Lowest average index month over last 3 years [placeholder]', async () => {
    console.log('This feature requires historical index data access to automate.');
    expect(true).toBe(true);
  });
});