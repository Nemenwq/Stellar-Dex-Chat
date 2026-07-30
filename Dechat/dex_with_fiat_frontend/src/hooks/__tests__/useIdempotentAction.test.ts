import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup, waitFor } from '@testing-library/react';
import { useIdempotentAction } from '../useIdempotentAction';

describe('useIdempotentAction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ── Initial state ──────────────────────────────────────────────────────

  it('returns initial state with isProcessing=false', () => {
    const { result } = renderHook(() => useIdempotentAction());

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.idempotencyKey).toBe('');
    expect(result.current.state.isProcessing).toBe(false);
  });

  it('initializes lastExecutionTime to -(cooldownMs) for immediate first execution', () => {
    const { result } = renderHook(() => useIdempotentAction({ cooldownMs: 3000 }));

    expect(result.current.state.lastExecutionTime).toBe(-3000);
  });

  // ── Execute async action ───────────────────────────────────────────────

  it('executes action successfully and returns the result', async () => {
    const { result } = renderHook(() => useIdempotentAction());
    const mockAction = vi.fn(async () => 'success-result');

    let executionResult: string | null = null;

    await act(async () => {
      executionResult = await result.current.execute(mockAction, 'test-action');
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
    expect(executionResult).toBe('success-result');
  });

  it('sets isProcessing=true during execution and false after completion', async () => {
    const { result } = renderHook(() => useIdempotentAction());
    const mockAction = vi.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve('done'), 100);
        })
    );

    const executionPromise = act(async () => {
      return result.current.execute(mockAction, 'test');
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(true);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    await executionPromise;

    expect(result.current.isProcessing).toBe(false);
  });

  it('generates unique idempotencyKey on each execution', async () => {
    const { result } = renderHook(() => useIdempotentAction({ cooldownMs: 0 }));
    const mockAction = vi.fn(async () => 'ok');

    let key1 = '';
    let key2 = '';

    await act(async () => {
      await result.current.execute(mockAction);
      key1 = result.current.idempotencyKey;
    });

    await act(async () => {
      await result.current.execute(mockAction);
      key2 = result.current.idempotencyKey;
    });

    expect(key1).not.toBe('');
    expect(key2).not.toBe('');
    expect(key1).not.toBe(key2);
  });

  // ── Cooldown / throttling ─────────────────────────────────────────────

  it('rejects duplicate calls within cooldown period', async () => {
    const { result } = renderHook(() => useIdempotentAction({ cooldownMs: 2000 }));
    const mockAction = vi.fn(async () => 'result');

    await act(async () => {
      await result.current.execute(mockAction, 'throttled-action');
    });

    expect(mockAction).toHaveBeenCalledTimes(1);

    // Try again immediately — should be suppressed
    let suppressedResult: string | null = 'unset';
    await act(async () => {
      suppressedResult = await result.current.execute(mockAction, 'throttled-action');
    });

    expect(mockAction).toHaveBeenCalledTimes(1); // Still 1
    expect(suppressedResult).toBeNull();
  });

  it('allows execution after cooldown period expires', async () => {
    const { result } = renderHook(() => useIdempotentAction({ cooldownMs: 1000 }));
    const mockAction = vi.fn(async () => 'ok');

    await act(async () => {
      await result.current.execute(mockAction);
    });

    expect(mockAction).toHaveBeenCalledTimes(1);

    // Advance past cooldown
    act(() => {
      vi.advanceTimersByTime(1001);
    });

    await act(async () => {
      await result.current.execute(mockAction);
    });

    expect(mockAction).toHaveBeenCalledTimes(2);
  });

  // ── Deduplication (in-flight actions) ──────────────────────────────────

  it('deduplicates concurrent calls with the same actionName', async () => {
    const { result } = renderHook(() => useIdempotentAction({ cooldownMs: 0 }));
    let resolveAction: (value: string) => void;
    const mockAction = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveAction = resolve;
        })
    );

    const promise1 = act(() => result.current.execute(mockAction, 'dedup-test'));
    const promise2 = act(() => result.current.execute(mockAction, 'dedup-test'));

    // Action should only be called once
    expect(mockAction).toHaveBeenCalledTimes(1);

    // Resolve the action
    act(() => {
      resolveAction!('shared-result');
    });

    const [res1, res2] = await Promise.all([promise1, promise2]);

    // Both promises should resolve to the same in-flight result
    expect(res1).toBe('shared-result');
    expect(res2).toBe('shared-result');
  });

  it('logs warning when duplicate action is suppressed', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 2000, logSuppressed: true })
    );
    const mockAction = vi.fn(async () => 'test');

    await act(async () => {
      await result.current.execute(mockAction, 'logged-action');
    });

    await act(async () => {
      await result.current.execute(mockAction, 'logged-action');
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Suppressed duplicate'),
      expect.any(Object)
    );

    consoleWarnSpy.mockRestore();
  });

  it('does not log when logSuppressed=false', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 2000, logSuppressed: false })
    );
    const mockAction = vi.fn(async () => 'test');

    await act(async () => {
      await result.current.execute(mockAction);
    });

    await act(async () => {
      await result.current.execute(mockAction);
    });

    expect(consoleWarnSpy).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  // ── Reset ──────────────────────────────────────────────────────────────

  it('reset() clears isProcessing and allows immediate re-execution', async () => {
    const { result } = renderHook(() => useIdempotentAction({ cooldownMs: 5000 }));
    const mockAction = vi.fn(async () => 'ok');

    await act(async () => {
      await result.current.execute(mockAction);
    });

    expect(mockAction).toHaveBeenCalledTimes(1);

    // Without reset, this would be throttled
    await act(async () => {
      const suppressedResult = await result.current.execute(mockAction);
      expect(suppressedResult).toBeNull();
    });

    // Reset and try again
    act(() => {
      result.current.reset();
    });

    await act(async () => {
      await result.current.execute(mockAction);
    });

    expect(mockAction).toHaveBeenCalledTimes(2);
  });

  it('reset() clears idempotencyKey', async () => {
    const { result } = renderHook(() => useIdempotentAction());
    const mockAction = vi.fn(async () => 'test');

    await act(async () => {
      await result.current.execute(mockAction);
    });

    expect(result.current.idempotencyKey).not.toBe('');

    act(() => {
      result.current.reset();
    });

    expect(result.current.idempotencyKey).toBe('');
  });

  // ── Error handling / rejection ─────────────────────────────────────────

  it('propagates errors from the action', async () => {
    const { result } = renderHook(() => useIdempotentAction());
    const mockAction = vi.fn(async () => {
      throw new Error('action-failed');
    });

    await expect(
      act(() => result.current.execute(mockAction, 'failing-action'))
    ).rejects.toThrow('action-failed');

    // isProcessing should be reset even after error
    expect(result.current.isProcessing).toBe(false);
  });

  it('clears in-flight action map entry after rejection', async () => {
    const { result } = renderHook(() => useIdempotentAction({ cooldownMs: 0 }));
    const mockAction = vi.fn(async () => {
      throw new Error('fail');
    });

    await act(async () => {
      try {
        await result.current.execute(mockAction, 'error-test');
      } catch {
        // Expected
      }
    });

    // Next call with same name should not be deduplicated (map was cleared)
    await act(async () => {
      try {
        await result.current.execute(mockAction, 'error-test');
      } catch {
        // Expected
      }
    });

    expect(mockAction).toHaveBeenCalledTimes(2);
  });

  // ── Unmount cleanup ────────────────────────────────────────────────────

  it('does not update state after unmount', async () => {
    const { result, unmount } = renderHook(() => useIdempotentAction());
    const mockAction = vi.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve('done'), 100);
        })
    );

    act(() => {
      result.current.execute(mockAction);
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // No state update error should occur (isMountedRef prevents it)
  });

  // ── Branch coverage ────────────────────────────────────────────────────

  it('covers actionName defaulting to "action" when not provided', async () => {
    const { result } = renderHook(() => useIdempotentAction());
    const mockAction = vi.fn(async () => 'default-name');

    await act(async () => {
      await result.current.execute(mockAction);
    });

    expect(mockAction).toHaveBeenCalled();
    expect(result.current.idempotencyKey).toContain('action_');
  });

  it('handles zero cooldownMs (no throttle, only dedup)', async () => {
    const { result } = renderHook(() => useIdempotentAction({ cooldownMs: 0 }));
    const mockAction = vi.fn(async () => 'ok');

    await act(async () => {
      await result.current.execute(mockAction);
    });

    await act(async () => {
      await result.current.execute(mockAction);
    });

    // Both execute because cooldown is 0
    expect(mockAction).toHaveBeenCalledTimes(2);
  });
});
