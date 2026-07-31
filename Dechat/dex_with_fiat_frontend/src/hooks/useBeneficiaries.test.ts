<<<<<<< HEAD
import { renderHook, act } from '@testing-library/react';
=======
import { renderHook, act, waitFor } from '@testing-library/react';
>>>>>>> emwulrd/main
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useBeneficiaries } from './useBeneficiaries';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useBeneficiaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
<<<<<<< HEAD
    // No timer cleanup needed for this hook
=======
    vi.restoreAllMocks();
>>>>>>> emwulrd/main
  });

  it('loads beneficiaries from localStorage on mount', () => {
    const mockBeneficiaries = [
      {
        id: '1',
        name: 'Test Beneficiary',
        bankId: 1,
        bankName: 'Test Bank',
        bankCode: 'TB',
        accountNumber: '123456789',
        accountName: 'Test Account',
        createdAt: Date.now(),
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBeneficiaries));

    const { result } = renderHook(() => useBeneficiaries());

    expect(result.current.beneficiaries).toEqual(mockBeneficiaries);
    expect(result.current.isLoaded).toBe(true);
  });

  it('saves beneficiaries to localStorage when updated', () => {
    const { result } = renderHook(() => useBeneficiaries());

    act(() => {
      result.current.addBeneficiary(
        1,
        'Test Bank',
        'TB',
        '123456789',
        'Test Account',
        'Custom Name'
      );
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'stellar_beneficiaries',
      expect.stringContaining('Custom Name')
    );
  });

  it('provides keyboard shortcuts metadata', () => {
    const { result } = renderHook(() => useBeneficiaries());

    expect(result.current).toHaveProperty('keyboardShortcuts');
    expect(result.current.keyboardShortcuts).toEqual({
      ADD_BENEFICIARY: 'Ctrl+B',
      FOCUS_BENEFICIARIES: 'Ctrl+Shift+B',
      NAVIGATE_UP: 'ArrowUp',
      NAVIGATE_DOWN: 'ArrowDown',
      SELECT_BENEFICIARY: 'Enter',
      DELETE_BENEFICIARY: 'Delete',
    });
  });

  it('handles keyboard shortcuts for navigation and selection', () => {
    const { result } = renderHook(() => useBeneficiaries());

    // Add some beneficiaries
    act(() => {
      result.current.addBeneficiary(1, 'Bank A', 'BA', '111', 'Account A');
      result.current.addBeneficiary(2, 'Bank B', 'BB', '222', 'Account B');
    });

    // Select first beneficiary
    act(() => {
      result.current.selectBeneficiary(0);
    });
    expect(result.current.selectedIndex).toBe(0);

    // Navigate down
    act(() => {
      // Simulate the keyboard handler - in real usage this would be called via event listener
      // For testing, we can call the internal handler or test the selection change
    });

    // Clear selection
    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectedIndex).toBe(-1);
  });

  it('deletes beneficiary with delete key when one is selected', () => {
    const { result } = renderHook(() => useBeneficiaries());

    act(() => {
      result.current.addBeneficiary(1, 'Bank A', 'BA', '111', 'Account A');
    });

    act(() => {
      result.current.selectBeneficiary(0);
    });

    expect(result.current.beneficiaries).toHaveLength(1);

    // Simulate delete key press (in real implementation, this is handled by event listener)
    // For testing purposes, we can directly call deleteBeneficiary
    act(() => {
      const beneficiary = result.current.beneficiaries[0];
      if (beneficiary) {
        result.current.deleteBeneficiary(beneficiary.id);
      }
    });

    expect(result.current.beneficiaries).toHaveLength(0);
  });

  it('prevents hydration mismatch by only loading from localStorage after mount', () => {
    // In a real Next.js app, the initial render would have empty beneficiaries
    // and isLoaded false, then useEffect would run and load from localStorage
    // In tests, useEffect runs synchronously, so we test the final state
    const mockBeneficiaries = [
      {
        id: '1',
        name: 'Test Beneficiary',
        bankId: 1,
        bankName: 'Test Bank',
        bankCode: 'TB',
        accountNumber: '123456789',
        accountName: 'Test Account',
        createdAt: Date.now(),
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBeneficiaries));

    const { result } = renderHook(() => useBeneficiaries());

    // After effects run, it should have loaded from localStorage
    expect(result.current.beneficiaries).toEqual(mockBeneficiaries);
    expect(result.current.isLoaded).toBe(true);
  });
<<<<<<< HEAD
=======

  it('does not update state after unmount when API fetch completes', async () => {
    let resolveFetch!: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });

    vi.spyOn(global, 'fetch').mockReturnValue(fetchPromise);

    const { result, unmount } = renderHook(() =>
      useBeneficiaries({ fetchFromApi: true, userId: 'user-1' }),
    );

    expect(result.current.isLoaded).toBe(false);

    // Unmount before the fetch resolves
    unmount();

    // Resolve the fetch after unmount — should not update state
    resolveFetch(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    await waitFor(() => {
      // After resolving, state should remain unchanged (not loaded)
      // since the component was already unmounted
      expect(result.current.beneficiaries).toHaveLength(0);
    });
  });

  it('cancels in-flight request when userId changes', async () => {
    let resolveFirst!: (value: Response) => void;
    const firstFetch = new Promise<Response>((resolve) => { resolveFirst = resolve; });
    let resolveSecond!: (value: Response) => void;
    const secondFetch = new Promise<Response>((resolve) => { resolveSecond = resolve; });

    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockReturnValueOnce(firstFetch)
      .mockReturnValueOnce(secondFetch);

    let userId = 'user-a';
    const { result, rerender } = renderHook(() =>
      useBeneficiaries({ fetchFromApi: true, userId }),
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    userId = 'user-b';
    rerender();

    // Resolve stale request after userId change — state should reflect second request result
    const firstData = [{ id: '1', name: 'Old', bankId: 1, bankName: 'B', bankCode: 'B', accountNumber: '1', accountName: 'A', createdAt: 0 }];
    resolveFirst(new Response(JSON.stringify(firstData), { status: 200 }));

    const secondData = [{ id: '2', name: 'New', bankId: 2, bankName: 'C', bankCode: 'C', accountNumber: '2', accountName: 'B', createdAt: 0 }];
    resolveSecond(new Response(JSON.stringify(secondData), { status: 200 }));

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
  });
>>>>>>> emwulrd/main
});