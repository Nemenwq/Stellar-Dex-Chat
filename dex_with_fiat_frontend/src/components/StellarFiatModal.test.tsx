import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import StellarFiatModal from './StellarFiatModal';

vi.mock('@/contexts/StellarWalletContext', () => ({
  useStellarWallet: () => ({
    connection: {
      isConnected: true,
      publicKey: 'GABCDEF1234567890',
      address: 'GABCDEF1234567890',
      network: 'TESTNET',
    },
    signTx: vi.fn(),
  }),
}));

vi.mock('@/lib/stellarContract', () => ({
  depositToContract: vi.fn(),
  withdrawFromContract: vi.fn(),
  stroopsToDisplay: (stroops: bigint) => String(Number(stroops) / 1e7),
}));

const onClose = vi.fn();
const onDepositSuccess = vi.fn();

describe('StellarFiatModal', () => {
  let mockedContract: Awaited<ReturnType<typeof import('@/lib/stellarContract')>>;

  beforeEach(async () => {
    mockedContract = await import('@/lib/stellarContract');
    mockedContract.depositToContract.mockReset();
    mockedContract.withdrawFromContract.mockReset();
    onClose.mockReset();
    onDepositSuccess.mockReset();
  });

  it('shows a pending optimistic UI while the transaction is in progress and then confirms success', async () => {
    mockedContract.depositToContract.mockResolvedValueOnce('TXHASH123');

    const { getByRole } = render(
      React.createElement(StellarFiatModal, {
        isOpen: true,
        onClose,
        defaultAmount: '10',
        onDepositSuccess,
      }),
    );

    await waitFor(() => {
      expect(getByRole('button', { name: /deposit/i })).toBeInTheDocument();
    });

    fireEvent.click(getByRole('button', { name: /deposit/i }));

    expect(screen.getByText(/Deposit pending/i)).toBeInTheDocument();
    expect(screen.getByText(/10 XLM is being processed/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Transaction Confirmed/i)).toBeInTheDocument();
    });

    expect(screen.getByText('TXHASH123')).toBeInTheDocument();
  });

  it('shows an error state when the transaction fails', async () => {
    mockedContract.depositToContract.mockRejectedValueOnce(new Error('Network failure'));

    const { getByRole } = render(
      React.createElement(StellarFiatModal, {
        isOpen: true,
        onClose: onClose,
        defaultAmount: '2',
      }),
    );

    await waitFor(() => {
      expect(getByRole('button', { name: /deposit/i })).toBeInTheDocument();
    });

    fireEvent.click(getByRole('button', { name: /deposit/i }));

    await waitFor(() => {
      expect(screen.getByText(/Network failure/i)).toBeInTheDocument();
    });
  });
});
