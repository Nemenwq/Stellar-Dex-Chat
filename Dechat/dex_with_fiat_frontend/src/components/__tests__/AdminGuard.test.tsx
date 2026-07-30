import React from 'react';
<<<<<<< HEAD
import { render, screen, waitFor } from '@testing-library/react';
=======
import { render, screen } from '@testing-library/react';
>>>>>>> emwulrd/main
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminGuard, { stellarAddressSchema } from '../AdminGuard';
import { useStellarWallet } from '@/contexts/StellarWalletContext';
import { getAdmin } from '@/lib/stellarContract';

vi.mock('@/contexts/StellarWalletContext');
vi.mock('@/lib/stellarContract');
vi.mock('@/components/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}));

// ── stellarAddressSchema unit tests ──────────────────────────────────────
describe('stellarAddressSchema', () => {
  it('accepts a valid 56-char G-prefixed address', () => {
<<<<<<< HEAD
    const addr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDE';
=======
    const addr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV2';
>>>>>>> emwulrd/main
    expect(stellarAddressSchema.safeParse(addr).success).toBe(true);
  });

  it('rejects an address that does not start with G', () => {
<<<<<<< HEAD
    const addr = 'XABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDE';
=======
    const addr = 'XABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV2';
>>>>>>> emwulrd/main
    expect(stellarAddressSchema.safeParse(addr).success).toBe(false);
  });

  it('rejects an address shorter than 56 characters', () => {
    expect(stellarAddressSchema.safeParse('GABC').success).toBe(false);
  });

  it('rejects an address longer than 56 characters', () => {
<<<<<<< HEAD
    const addr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDE1';
=======
    const addr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV2X';
>>>>>>> emwulrd/main
    expect(stellarAddressSchema.safeParse(addr).success).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(stellarAddressSchema.safeParse('').success).toBe(false);
  });
});

// ── AdminGuard component tests ───────────────────────────────────────────
describe('AdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders landing page when connection address is empty', async () => {
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: '' },
    } as any);

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>
    );

    expect(await screen.findByTestId('landing-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('shows error if connected address has invalid format (Zod validation)', async () => {
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: 'invalid-address-not-starting-with-g-or-correct-length' },
    } as any);

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>
    );

    expect(await screen.findByText('Invalid wallet address format. Access denied.')).toBeInTheDocument();
  });

  it('shows error if contract admin address has invalid format (Zod validation)', async () => {
    vi.mocked(useStellarWallet).mockReturnValue({
<<<<<<< HEAD
      connection: { address: 'GABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDE' }, // 56 chars
=======
      connection: { address: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV2' }, // 56 chars
>>>>>>> emwulrd/main
    } as any);
    vi.mocked(getAdmin).mockResolvedValue('invalid-admin-address');

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>
    );

    expect(await screen.findByText('Invalid contract configuration. Access denied.')).toBeInTheDocument();
  });

  it('renders children when connected address matches admin address exactly', async () => {
<<<<<<< HEAD
    const validAddr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDE';
=======
    const validAddr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV2';
>>>>>>> emwulrd/main
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: validAddr },
    } as any);
    vi.mocked(getAdmin).mockResolvedValue(validAddr);

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>
    );

    expect(await screen.findByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders landing page when valid connected address does not match valid admin address', async () => {
<<<<<<< HEAD
    const userAddr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDE';
    const adminAddr = 'G1234567890123456789012345678901234567890123456789012345';
=======
    const userAddr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV2';
    const adminAddr = 'GBCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVW2';
>>>>>>> emwulrd/main
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: userAddr },
    } as any);
    vi.mocked(getAdmin).mockResolvedValue(adminAddr);

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>
    );

    expect(await screen.findByTestId('landing-page')).toBeInTheDocument();
  });

  it('shows error message when getAdmin throws', async () => {
<<<<<<< HEAD
    const validAddr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDE';
=======
    const validAddr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV2';
>>>>>>> emwulrd/main
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: validAddr },
    } as any);
    vi.mocked(getAdmin).mockRejectedValue(new Error('RPC failure'));

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>
    );

    expect(await screen.findByText('Failed to verify admin status. Please try again.')).toBeInTheDocument();
  });
});
<<<<<<< HEAD

// ── ARIA live-region tests (issue #1176) ──────────────────────────────────
describe('AdminGuard ARIA live-region announcements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loading state has aria-live="polite" announcement', () => {
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: 'GABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDE' },
    } as any);
    vi.mocked(getAdmin).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>
    );

    const statusElement = screen.getByText('Verifying admin access...');
    expect(statusElement).toHaveAttribute('role', 'status');
    expect(statusElement).toHaveAttribute('aria-live', 'polite');
  });

  it('loading spinner has role="status" and aria-label', () => {
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: 'GABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDE' },
    } as any);
    vi.mocked(getAdmin).mockImplementation(() => new Promise(() => {}));

    const { container } = render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>
    );

    const spinner = container.querySelector('[role="status"][aria-label="Loading spinner"]');
    expect(spinner).toBeInTheDocument();
  });

  it('error message has role="alert" and aria-live="assertive"', async () => {
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: 'invalid' },
    } as any);

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>
    );

    const errorHeading = await screen.findByRole('alert');
    expect(errorHeading).toHaveAttribute('aria-live', 'assertive');
    expect(errorHeading).toHaveTextContent('Invalid wallet address format. Access denied.');
  });

  it('error icon has role="img" and aria-label', async () => {
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: 'short' },
    } as any);

    const { container } = render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>
    );

    await waitFor(() => {
      const errorIcon = container.querySelector('[role="img"][aria-label="Error icon"]');
      expect(errorIcon).toBeInTheDocument();
    });
  });

  it('retry button has descriptive aria-label', async () => {
    const validAddr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDE';
    vi.mocked(useStellarWallet).mockReturnValue({
      connection: { address: validAddr },
    } as any);
    vi.mocked(getAdmin).mockRejectedValue(new Error('RPC failure'));

    render(
      <AdminGuard>
        <div data-testid="protected-content">Secret content</div>
      </AdminGuard>
    );

    const retryButton = await screen.findByRole('button', { name: /reload page to retry/i });
    expect(retryButton).toBeInTheDocument();
  });
});
=======
>>>>>>> emwulrd/main
