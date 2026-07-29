import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ChatMessage } from '@/types';
import { useChatPagination } from './useChatPagination';

const createMessages = (count: number): ChatMessage[] =>
  Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    role: 'user' as const,
    content: `Message ${i + 1}`,
    timestamp: new Date(),
  }));

describe('useChatPagination', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initial load returns first page', () => {
    const messages = createMessages(50);
    const { result } = renderHook(() => useChatPagination(messages, 20));

    expect(result.current.visibleMessages).toHaveLength(20);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.visibleMessages[0].id).toBe('31');
    expect(result.current.visibleMessages[19].id).toBe('50');
  });

  it('loadMore appends and advances cursor', () => {
    const messages = createMessages(50);
    const { result } = renderHook(() => useChatPagination(messages, 20));

    expect(result.current.visibleMessages).toHaveLength(20);

    act(() => {
      result.current.loadMore();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.visibleMessages).toHaveLength(40);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.visibleMessages[0].id).toBe('11');
    expect(result.current.visibleMessages[39].id).toBe('50');
  });

  it('hasMore is false when all messages fit in one page', () => {
    const messages = createMessages(10);
    const { result } = renderHook(() => useChatPagination(messages, 20));

    expect(result.current.visibleMessages).toHaveLength(10);
    expect(result.current.hasMore).toBe(false);
  });

  it('does not update state after unmount when setTimeout fires', () => {
    const messages = createMessages(50);
    const { result, unmount } = renderHook(() => useChatPagination(messages, 20));

    act(() => {
      result.current.loadMore();
    });

    // Unmount before the 400ms timer fires
    unmount();

    // Advancing the timer should not throw or warn about state updates on unmounted component
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(500);
      });
    }).not.toThrow();
  });

  it('regression: uses the latest messages/pageSize when the pending timer fires, not the stale closure from when loadMore was called', () => {
    const initialMessages = createMessages(30);
    const { result, rerender } = renderHook(
      ({ messages, pageSize }) => useChatPagination(messages, pageSize),
      { initialProps: { messages: initialMessages, pageSize: 20 } },
    );

    expect(result.current.visibleMessages).toHaveLength(20);

    act(() => {
      result.current.loadMore();
    });

    // Before the 400ms timer fires, several new messages arrive and the
    // list grows from 30 to 45. `getNextMessageCount` caps the next visible
    // count at the *total* message count it's given. A stale closure over
    // the original 30-message array would wrongly cap the next count at 30
    // (min(20 + 20, 30) = 30) even though 45 messages are now available -
    // under-showing 10 messages the user should be able to see immediately.
    const grownMessages = createMessages(45);
    rerender({ messages: grownMessages, pageSize: 20 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Correct: min(20 + 20, 45) = 40, computed against the *current*
    // message list at the time the timer fires - not the stale 30-message
    // list captured when loadMore() was called.
    expect(result.current.visibleMessages).toHaveLength(40);
    expect(result.current.visibleMessages[39].id).toBe('45');
  });

  it('isLoadingMore resets to false after loadMore completes', () => {
    const messages = createMessages(50);
    const { result } = renderHook(() => useChatPagination(messages, 20));

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.isLoadingMore).toBe(true);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.isLoadingMore).toBe(false);
  });
});
