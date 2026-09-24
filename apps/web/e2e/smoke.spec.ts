import { expect, test } from '@playwright/test';

test.describe('Lumen web smoke', () => {
  test('SNS login, settings theme/locale, profile persists', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    await page.addInitScript(() => {
      sessionStorage.setItem('lumen-msw-browser', 'off');
    });

    await page.goto('/login');
    await page.evaluate(() => sessionStorage.clear());

    await expect(page.getByLabel('이메일')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: /Google로 계속|Continue with Google/ }),
    ).toBeVisible();

    await page
      .getByRole('button', { name: /Google로 계속|Continue with Google/ })
      .click();

    await page.waitForURL(/\/chats/, { timeout: 10_000});

    await page.goto('/settings');
    await expect(
      page.getByText('설정').or(page.getByText('Settings')).first(),
    ).toBeVisible();

    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.getByText('Settings')).toBeVisible();
    await expect(page.getByText('Theme')).toBeVisible();

    await page.getByRole('button', { name: 'Dark' }).click();
    await expect
      .poll(async () =>
        page.evaluate(() => document.documentElement.classList.contains('dark')),
      )
      .toBe(true);

    const nameInput = page.getByLabel('Name');
    await nameInput.fill('Playwright User');
    await page.getByRole('button', { name: 'Save' }).click({ force: true });

    await page.reload();
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.getByLabel('Name')).toHaveValue('Playwright User');
  });
});
