import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminGuard from '../AdminGuard';
import { useStellarWallet } from '@/contexts/StellarWalletContext';
import { getAdmin } from '@/lib/stellarContract';

vi.mock('@/contexts/StellarWalletContext');
vi.mock('@/lib/stellarContract');
vi.mock('@/components/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}));

describe('AdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders landing page when connection address is empty', async () => {
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: '' },
    } as unknown as ReturnType<typeof useStellarWallet>);
    vi.mocked(getAdmin).mockResolvedValue('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  it('shows error if connected address has invalid format (Zod validation)', async () => {
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: {
        address: 'invalid-address-not-starting-with-g-or-correct-length',
      },
    } as unknown as ReturnType<typeof useStellarWallet>);

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Invalid wallet address format. Access denied.'),
      ).toBeInTheDocument();
    });
  });

  it('shows error if contract admin address has invalid format (Zod validation)', async () => {
    // Valid user address but invalid admin address from contract
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
    } as unknown as ReturnType<typeof useStellarWallet>);
    vi.mocked(getAdmin).mockResolvedValue('invalid-admin-address'); // Invalid format

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Invalid contract configuration. Access denied.'),
      ).toBeInTheDocument();
    });
  });

  it('renders children when connected address matches admin address exactly', async () => {
    const validAddr = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: validAddr },
    } as unknown as ReturnType<typeof useStellarWallet>);
    vi.mocked(getAdmin).mockResolvedValue(validAddr);

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('renders landing page when valid connected address does not match valid admin address', async () => {
    const userAddr = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    const adminAddr = 'GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: userAddr },
    } as unknown as ReturnType<typeof useStellarWallet>);
    vi.mocked(getAdmin).mockResolvedValue(adminAddr);

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });
});
