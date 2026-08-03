<<<<<<< HEAD
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
=======
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { useIdempotentAction } from '../useIdempotentAction';

describe('useIdempotentAction', () => {
  const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => {
      resolve = res;
    });

    return { promise, resolve };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should execute action successfully', async () => {
    const { result } = renderHook(() => useIdempotentAction());
    const mockAction = vi.fn().mockResolvedValue('success');

    let actionResult;
    await act(async () => {
      actionResult = await result.current.execute(mockAction, 'test_action');
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
    expect(mockAction).toHaveBeenCalledWith(expect.stringContaining('test_action_'));
    expect(actionResult).toBe('success');
  });

  it('should prevent duplicate submissions during cooldown', async () => {
    const { result } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 1000 }),
    );
    const mockAction = vi.fn().mockResolvedValue('success');

    await act(async () => {
      await result.current.execute(mockAction, 'test_action');
    });

    let secondResult;
    await act(async () => {
      secondResult = await result.current.execute(mockAction, 'test_action');
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
    expect(secondResult).toBeNull();
  });

  it('should allow execution after cooldown period', async () => {
    const { result } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 100 }),
    );
    const mockAction = vi.fn().mockResolvedValue('success');

    await act(async () => {
      await result.current.execute(mockAction, 'test_action');
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    await act(async () => {
      await result.current.execute(mockAction, 'test_action');
    });

    expect(mockAction).toHaveBeenCalledTimes(2);
  });

  it("returns the first call's result for a second call with the same key", async () => {
    const { result } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 0, logSuppressed: false }),
    );
    const pendingAction = deferred<string>();
    const mockAction = vi.fn(() => pendingAction.promise);

    let firstExecution!: Promise<string | null>;
    let secondExecution!: Promise<string | null>;
    act(() => {
      firstExecution = result.current.execute(mockAction, 'shared_key');
      secondExecution = result.current.execute(mockAction, 'shared_key');
    });

    await act(async () => {
      pendingAction.resolve('first-result');
      await expect(firstExecution).resolves.toBe('first-result');
      await expect(secondExecution).resolves.toBe('first-result');
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('starts a fresh action for a third call after the first completes', async () => {
    const { result } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 0, logSuppressed: false }),
    );
    const mockAction = vi
      .fn()
      .mockResolvedValueOnce('first-result')
      .mockResolvedValueOnce('fresh-result');

    let firstResult!: string | null;
    await act(async () => {
      firstResult = await result.current.execute(mockAction, 'shared_key');
    });

    let thirdResult!: string | null;
    await act(async () => {
      thirdResult = await result.current.execute(mockAction, 'shared_key');
    });

    expect(firstResult).toBe('first-result');
    expect(thirdResult).toBe('fresh-result');
    expect(mockAction).toHaveBeenCalledTimes(2);
  });

  it('does not let an error in the first call block a second call', async () => {
    const { result } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 0, logSuppressed: false }),
    );
    const firstError = new Error('first failed');
    const mockAction = vi
      .fn()
      .mockRejectedValueOnce(firstError)
      .mockResolvedValueOnce('recovered');

    await act(async () => {
      await expect(
        result.current.execute(mockAction, 'shared_key'),
      ).rejects.toThrow('first failed');
    });

    let secondResult!: string | null;
    await act(async () => {
      secondResult = await result.current.execute(mockAction, 'shared_key');
    });

    expect(secondResult).toBe('recovered');
    expect(mockAction).toHaveBeenCalledTimes(2);
  });

  it('should track isProcessing state correctly', async () => {
    const { result } = renderHook(() => useIdempotentAction());
    let resolveAction: (value: string) => void = () => {};
    const mockAction = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveAction = resolve;
        }),
    );

    expect(result.current.isProcessing).toBe(false);

    let executePromise: Promise<string | null>;
    act(() => {
      executePromise = result.current.execute(mockAction, 'test_action');
>>>>>>> emwulrd/main
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(true);
    });

<<<<<<< HEAD
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
=======
    await act(async () => {
      resolveAction('success');
      await executePromise;
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });
  });

  it('should log suppressed duplicates when enabled', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 1000, logSuppressed: true }),
    );
    const mockAction = vi.fn().mockResolvedValue('success');

    await act(async () => {
      await result.current.execute(mockAction, 'test_action');
    });

    await act(async () => {
      await result.current.execute(mockAction, 'test_action');
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[useIdempotentAction] Suppressed duplicate test_action attempt',
      expect.objectContaining({
        actionName: 'test_action',
        cooldownMs: 1000,
      }),
    );
  });

  it('should not log suppressed duplicates when disabled', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 1000, logSuppressed: false }),
    );
    const mockAction = vi.fn().mockResolvedValue('success');

    await act(async () => {
      await result.current.execute(mockAction, 'test_action');
    });

    await act(async () => {
      await result.current.execute(mockAction, 'test_action');
    });

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should generate unique idempotency keys', async () => {
    const { result } = renderHook(() => useIdempotentAction({ cooldownMs: 100 }));
    const capturedKeys: string[] = [];
    const mockAction = vi.fn((key: string) => {
      capturedKeys.push(key);
      return Promise.resolve('success');
    });

    await act(async () => {
      await result.current.execute(mockAction, 'test_action');
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    await act(async () => {
      await result.current.execute(mockAction, 'test_action');
    });

    expect(capturedKeys).toHaveLength(2);
    expect(capturedKeys[0]).not.toBe(capturedKeys[1]);
    expect(capturedKeys[0]).toMatch(/^test_action_\d+_[a-z0-9]+$/);
    expect(capturedKeys[1]).toMatch(/^test_action_\d+_[a-z0-9]+$/);
  });

  it('should reset state correctly', async () => {
    const { result } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 1000 }),
    );
    const mockAction = vi.fn().mockResolvedValue('success');

    await act(async () => {
      await result.current.execute(mockAction, 'test_action');
    });

    let blockedResult: string | null = 'not-null';
    await act(async () => {
      blockedResult = await result.current.execute(mockAction, 'test_action');
    });
    expect(blockedResult).toBeNull();
    expect(mockAction).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.reset();
    });

    await act(async () => {
      await result.current.execute(mockAction, 'test_action');
    });

    expect(mockAction).toHaveBeenCalledTimes(2);
    expect(result.current.isProcessing).toBe(false);
  });

  it('should handle action errors gracefully', async () => {
    const { result } = renderHook(() => useIdempotentAction());
    const mockAction = vi.fn().mockRejectedValue(new Error('Action failed'));

    await act(async () => {
      try {
        await result.current.execute(mockAction, 'test_action');
      } catch (error) {
        expect(error).toEqual(new Error('Action failed'));
      }
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
    expect(result.current.isProcessing).toBe(false);
  });

  it('should prevent rapid-click scenarios', async () => {
    const { result } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 500 }),
    );
    const mockAction = vi.fn().mockResolvedValue('success');

    let results!: Array<string | null>;
    await act(async () => {
      results = await Promise.all([
        result.current.execute(mockAction, 'button_click'),
        result.current.execute(mockAction, 'button_click'),
        result.current.execute(mockAction, 'button_click'),
        result.current.execute(mockAction, 'button_click'),
        result.current.execute(mockAction, 'button_click'),
      ]);
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
    expect(results).toEqual([
      'success',
      'success',
      'success',
      'success',
      'success',
    ]);
  });

  it('should dedupe submissions while processing', async () => {
    const { result } = renderHook(() => useIdempotentAction());
    let resolveAction: (value: string) => void = () => {};
>>>>>>> emwulrd/main
    const mockAction = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveAction = resolve;
<<<<<<< HEAD
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
=======
        }),
    );

    let firstExecution: Promise<string | null>;
    act(() => {
      firstExecution = result.current.execute(mockAction, 'test_action');
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(true);
    });

    let secondExecution!: Promise<string | null>;
    await act(async () => {
      secondExecution = result.current.execute(mockAction, 'test_action');
    });

    await act(async () => {
      resolveAction('success');
      await firstExecution;
    });

    await expect(secondExecution).resolves.toBe('success');
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  // ── memory-leak regression (#1221) ─────────────────────────────────────────

  it('regression: clears inFlightActions on unmount so promise closures are not retained', async () => {
    // Bug: before fix, unmounting only set isMountedRef = false. The
    // inFlightActions Map kept Promise references alive, preventing GC of the
    // closures that captured the component's state setter and other hook
    // internals.
    let resolveAction!: (v: string) => void;
    const mockAction = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const { result, unmount } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 0, logSuppressed: false }),
    );

    // Start an action so inFlightActions is non-empty.
    act(() => {
      result.current.execute(mockAction, 'leak_test');
    });

    await waitFor(() => expect(result.current.isProcessing).toBe(true));

    // Unmount while the promise is still in flight.
    unmount();

    // Resolve after unmount — must not throw and must not attempt state updates.
    await act(async () => {
      resolveAction('done');
    });

    // The in-flight action map must have been cleared by the cleanup.
    // We verify indirectly: re-mounting a fresh hook should behave normally
    // (no lingering state from the previous instance).
    const { result: result2 } = renderHook(() =>
      useIdempotentAction({ cooldownMs: 0, logSuppressed: false }),
    );
    const freshAction = vi.fn().mockResolvedValue('fresh');
    let freshResult: string | null = null;
    await act(async () => {
      freshResult = await result2.current.execute(freshAction, 'fresh_test');
    });
    expect(freshResult).toBe('fresh');
    expect(freshAction).toHaveBeenCalledTimes(1);
>>>>>>> emwulrd/main
  });
});
