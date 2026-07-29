import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMasking, SENSITIVE_TERMS_UPDATED_KEY } from './useMasking';

describe('useMasking', () => {
  it('returns unmasked text when disabled', () => {
    const { result } = renderHook(() =>
      useMasking('this is damn annoying', { enabled: false }),
    );
    expect(result.current).toBe('this is damn annoying');
  });

  it('masks sensitive terms when enabled', () => {
    const { result } = renderHook(() =>
      useMasking('this is damn annoying', { enabled: true }),
    );
    expect(result.current).not.toContain('damn');
  });

  it('regression: cleans up its storage listener on unmount (no leaked subscription)', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useMasking('hello world', { enabled: true }));

    const storageAddCalls = addSpy.mock.calls.filter(([type]) => type === 'storage').length;
    expect(storageAddCalls).toBe(1);

    unmount();

    const storageRemoveCalls = removeSpy.mock.calls.filter(([type]) => type === 'storage').length;

    // Before the fix, there was no cleanup function returned from the
    // effect, so `removeEventListener('storage', ...)` was never called and
    // this assertion would fail (0 !== 1) after unmount.
    expect(storageRemoveCalls).toBe(1);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('regression: repeated mount/unmount cycles do not accumulate listeners', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    for (let i = 0; i < 5; i += 1) {
      const { unmount } = renderHook(() => useMasking('hello world', { enabled: true }));
      unmount();
    }

    const totalAdds = addSpy.mock.calls.filter(([type]) => type === 'storage').length;
    const totalRemoves = removeSpy.mock.calls.filter(([type]) => type === 'storage').length;

    expect(totalAdds).toBe(5);
    expect(totalRemoves).toBe(5);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('rebuilds the masking manager when a sensitive-terms storage event fires', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useMasking(text, { enabled: true }),
      { initialProps: { text: 'this is damn annoying' } },
    );

    expect(result.current).not.toContain('damn');

    // Simulate another tab/settings screen signalling that the sensitive
    // terms configuration changed; this should not throw and the hook
    // should keep functioning (manager rebuilt via refreshToken).
    window.dispatchEvent(
      new StorageEvent('storage', { key: SENSITIVE_TERMS_UPDATED_KEY }),
    );

    rerender({ text: 'this is damn annoying' });
    expect(result.current).not.toContain('damn');
  });
});
