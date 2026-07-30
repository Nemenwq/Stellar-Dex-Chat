import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let mockAddress = '';
const getAdminMock = vi.fn<() => Promise<string>>();

vi.mock('@/contexts/StellarWalletContext', () => ({
  useStellarWallet: () => ({
    connection: { address: mockAddress },
  }),
}));

vi.mock('@/lib/stellarContract', () => ({
  getAdmin: () => getAdminMock(),
}));

vi.mock('@/components/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}));

const { default: AdminGuard } = await import('@/components/AdminGuard');

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('AdminGuard', () => {
  beforeEach(() => {
    mockAddress = '';
    getAdminMock.mockReset();
  });

  it('ignores stale async admin checks when wallet address changes', async () => {
    const firstCheck = createDeferred<string>();
    const secondCheck = createDeferred<string>();
    getAdminMock
      .mockImplementationOnce(() => firstCheck.promise)
      .mockImplementationOnce(() => secondCheck.promise);

    const oldAdminAddr = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'; // 56 chars
    const newUserAddr = 'GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'; // 56 chars

    mockAddress = oldAdminAddr;
    const { rerender } = render(
      <AdminGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminGuard>,
    );

    mockAddress = newUserAddr;
    rerender(
      <AdminGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminGuard>,
    );

    await act(async () => {
      secondCheck.resolve(oldAdminAddr);
      await secondCheck.promise;
    });

    await waitFor(() => {
      expect(screen.queryByTestId('landing-page')).not.toBeNull();
    });

    await act(async () => {
      firstCheck.resolve(oldAdminAddr);
      await firstCheck.promise;
    });

    await waitFor(() => {
      expect(screen.queryByTestId('landing-page')).not.toBeNull();
      expect(screen.queryByTestId('admin-content')).toBeNull();
    });
    expect(getAdminMock).toHaveBeenCalledTimes(2);
  });
});
