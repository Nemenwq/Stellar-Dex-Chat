import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import OfflineStatusBanner from './OfflineStatusBanner';
import * as offlineMessageQueue from '@/lib/offlineMessageQueue';

// Mock dependencies
vi.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(() => ({
    isOnline: true,
    wasOffline: false,
    resetWasOffline: vi.fn(),
  })),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: vi.fn(() => ({
    addToast: vi.fn(),
  })),
}));

vi.mock('@/lib/offlineStatusSchema', () => ({
  offlineStatusToastSchema: {
    safeParse: vi.fn(() => ({ success: true, data: {} })),
  },
}));

vi.mock('@/lib/offlineMessageQueue', () => ({
  subscribeToQueuedMessageCount: vi.fn(),
  setQueuedMessageCount: vi.fn(),
  getQueuedMessageCount: vi.fn(() => 0),
}));

describe('OfflineStatusBanner - Optimistic UI Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should show banner immediately when going offline', async () => {
    const { useOnlineStatus } = await import('@/hooks/useOnlineStatus');
    (useOnlineStatus as any).mockReturnValue({
      isOnline: false,
      wasOffline: false,
      resetWasOffline: vi.fn(),
    });

    render(<OfflineStatusBanner />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    expect(screen.getByText(/You are offline/i)).toBeInTheDocument();
  });

  it('should show reconnecting state when coming back online', async () => {
    const { useOnlineStatus } = await import('@/hooks/useOnlineStatus');
    let isOnline = false;
    
    (useOnlineStatus as any).mockImplementation(() => ({
      get isOnline() { return isOnline; },
      wasOffline: true,
      resetWasOffline: vi.fn(),
    }));

    const { rerender } = render(<OfflineStatusBanner />);

    await waitFor(() => {
      expect(screen.getByText(/You are offline/i)).toBeInTheDocument();
    });

    // Simulate coming back online
    isOnline = true;
    rerender(<OfflineStatusBanner />);

    await waitFor(() => {
      expect(screen.getByText(/Reconnecting/i)).toBeInTheDocument();
    });
  });

  it('should display optimistic pending count', async () => {
    const { useOnlineStatus } = await import('@/hooks/useOnlineStatus');
    (useOnlineStatus as any).mockReturnValue({
      isOnline: false,
      wasOffline: false,
      resetWasOffline: vi.fn(),
    });

    (offlineMessageQueue.getQueuedMessageCount as any).mockReturnValue(3);

    render(<OfflineStatusBanner />);

    await waitFor(() => {
      expect(screen.getByText(/3 messages waiting to send/i)).toBeInTheDocument();
    });
  });

  it('should hide banner after reconnection delay', async () => {
    const { useOnlineStatus } = await import('@/hooks/useOnlineStatus');
    let isOnline = false;
    
    (useOnlineStatus as any).mockImplementation(() => ({
      get isOnline() { return isOnline; },
      wasOffline: true,
      resetWasOffline: vi.fn(),
    }));

    const { rerender } = render(<OfflineStatusBanner />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    // Simulate coming back online
    isOnline = true;
    rerender(<OfflineStatusBanner />);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('should update aria-label based on connection state', async () => {
    const { useOnlineStatus } = await import('@/hooks/useOnlineStatus');
    let isOnline = false;
    
    (useOnlineStatus as any).mockImplementation(() => ({
      get isOnline() { return isOnline; },
      wasOffline: true,
      resetWasOffline: vi.fn(),
    }));

    const { rerender } = render(<OfflineStatusBanner />);

    await waitFor(() => {
      expect(screen.getByLabelText('Offline status')).toBeInTheDocument();
    });

    isOnline = true;
    rerender(<OfflineStatusBanner />);

    await waitFor(() => {
      expect(screen.getByLabelText('Reconnecting')).toBeInTheDocument();
    });
  });

  it('should show loading skeleton initially when online', async () => {
    const { useOnlineStatus } = await import('@/hooks/useOnlineStatus');
    (useOnlineStatus as any).mockReturnValue({
      isOnline: true,
      wasOffline: false,
      resetWasOffline: vi.fn(),
    });

    render(<OfflineStatusBanner />);

    // Should show loading skeleton initially
    const skeleton = document.querySelector('[aria-hidden="true"]');
    expect(skeleton).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(document.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    });
  });
});
