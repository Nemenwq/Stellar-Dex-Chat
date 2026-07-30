import { test, expect } from '@playwright/test';
<<<<<<< HEAD

test.describe('ReceiptDrawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');

    await page.addInitScript(() => {
      window.freighter = {
        isConnected: async () => ({ isConnected: true }),
        getAddress: async () => ({
          address:
            'GD5DJQD7KGYRY4TSK4K2V5J2D2J2XQK2T2D2J2XQK2T2D2J2XQK2T2D2J2XQK2T2D2J2XQK2',
        }),
        getNetwork: async () => ({ network: 'TESTNET' }),
        signTransaction: async () => ({
          signedTxXdr: 'AAAAAgAAAABzZXJ2aWNlX3BvaW50X2hvc3QAAAAAAAAAAAAA',
          error: null,
        }),
        requestAccess: async () => ({
          address:
            'GD5DJQD7KGYRY4TSK4K2V5J2D2J2XQK2T2D2J2XQK2T2D2J2XQK2T2D2J2XQK2T2D2J2XQK2',
        }),
      };
    });

    await page.waitForTimeout(800);
=======
import { gotoChatConnected } from './helpers';

test.describe('ReceiptDrawer', () => {
  test.beforeEach(async ({ page }) => {
    await gotoChatConnected(page);
>>>>>>> emwulrd/main
  });

  test('opens from header and closes via accessible close control', async ({
    page,
  }) => {
<<<<<<< HEAD
    await page.getByRole('button', { name: 'Receipts' }).click();
=======
    await page.getByRole('button', { name: 'Receipts' }).first().click();
>>>>>>> emwulrd/main
    await expect(
      page.getByRole('heading', { name: 'Transaction Receipts' }),
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Close transaction receipts' })
      .click();

<<<<<<< HEAD
    await expect(
      page.getByRole('heading', { name: 'Transaction Receipts' }),
    ).toBeHidden();
=======
    await expect(page.locator('.receipt-drawer-panel')).toHaveClass(/translate-x-full/);
>>>>>>> emwulrd/main
  });
});
