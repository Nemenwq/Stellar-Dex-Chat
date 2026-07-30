import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from '../page';

// Stub global fetch so tests can mock it safely
if (!global.fetch || typeof (global.fetch as unknown) !== 'function') {
  global.fetch = vi.fn() as unknown as typeof fetch;
} else {
  global.fetch = vi.fn() as unknown as typeof fetch;
}

// Mock dependencies
vi.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: vi.fn(() => false),
}));

vi.mock('@/hooks/useBridgeStats', () => ({
  default: vi.fn(() => ({
    balance: 1000000000000,
    totalDeposited: 5000000000000,
  })),
}));

vi.mock('@/components/AdminGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('@/components/AuditTable', () => ({
  default: () => <div data-testid="audit-table">Audit Table</div>,
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock('@/lib/stellarContract', () => ({
  stroopsToDisplay: vi.fn((value: number) => (value / 10000000).toFixed(2)),
}));

describe('AdminDashboard - Dark Mode Support', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockImplementation((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/admin/reconciliation')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            entries: [
              {
                id: '1',
                amount: 1000000000,
                status: 'completed',
                payoutStatus: 'completed',
                createdAt: new Date().toISOString(),
              },
            ],
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
            actions: [],
          }),
        } as Response);
      }

      if (url.includes('/api/admin/audit')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            entries: [
              {
                id: 'log-1',
                timestamp: new Date().toISOString(),
                action: 'bridge_paused',
                adminAddress: 'GADMINADDRESS',
                parameters: {
                  reason: 'maintenance',
                },
              },
            ],
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
            actions: ['bridge_paused'],
          }),
        } as Response);
      }

      return Promise.reject(new Error(`Unknown endpoint: ${url}`));
    });
  });

  it('renders with theme-aware classes', async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Check for theme-aware wrapper class
    const pageWrapper = document.querySelector('.theme-app');
    expect(pageWrapper).toBeInTheDocument();
  });

  it('applies CSS tokens for colors', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Verify no hardcoded Tailwind color classes
    const html = document.body.innerHTML;
    expect(html).not.toMatch(/bg-blue-\d+/);
    expect(html).not.toMatch(/text-gray-\d+/);
    expect(html).not.toMatch(/border-gray-\d+/);
  });

  it('uses theme utility classes for surfaces', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Bridge Balance')).toBeInTheDocument();
    });

    const card = screen.getByText('Bridge Balance').closest('div');
    expect(card?.className).toContain('theme-surface');
  });

  it('uses theme utility classes for text', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    const heading = screen.getByText('Admin Dashboard');
    expect(heading.className).toContain('theme-text-primary');
  });

  it('handles loading state with theme classes', () => {
    render(<AdminDashboard />);

    const loadingText = screen.getByText('Loading metrics...');
    expect(loadingText.className).toContain('theme-text-muted');
  });

  it('includes proper ARIA accessibility labels', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Check chart has ARIA label
    const chartContainer = screen.getByRole('img', {
      name: /transaction volume chart/i,
    });
    expect(chartContainer).toBeInTheDocument();

    // Check volume display has ARIA label
    const volumeDisplay = screen.getByLabelText(/30-day transaction volume/i);
    expect(volumeDisplay).toBeInTheDocument();

    // Check export button has ARIA label
    const exportButton = screen.getByRole('button', {
      name: /export audit log to csv file/i,
    });
    expect(exportButton).toBeInTheDocument();

    // Check table has ARIA label
    const auditTable = screen.getByRole('table', {
      name: /admin audit log entries/i,
    });
    expect(auditTable).toBeInTheDocument();

    // Check pagination buttons have ARIA labels
    const prevButton = screen.getByRole('button', {
      name: /go to previous page/i,
    });
    const nextButton = screen.getByRole('button', { name: /go to next page/i });
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    // Check table headers have scope
    const headers = screen.getAllByRole('columnheader');
    headers.forEach((header) => {
      expect(header).toHaveAttribute('scope', 'col');
    });
  });
});
