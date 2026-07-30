<<<<<<< HEAD
import { useState, useCallback, useMemo, useEffect } from 'react';
import { DEFAULT_PAGE_SIZE, getNextMessageCount } from '@/lib/chatPaginationUtils';
=======
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/lib/chatPaginationUtils';

function dispatchSessionPaginationTelemetry(event: string, detail?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('session_pagination_telemetry', { detail: { event, ...detail } }),
    );
  }
}
>>>>>>> emwulrd/main

/**
 * Generic list pagination hook following the same virtualisation pattern
 * used by `useChatPagination` but for arbitrary item lists (sessions).
 */
export const useSessionPagination = <T,>(allItems: T[], pageSize: number = DEFAULT_PAGE_SIZE) => {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
<<<<<<< HEAD
=======
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
>>>>>>> emwulrd/main

  useEffect(() => {
    if (allItems.length <= pageSize) {
      setVisibleCount(pageSize);
    }
  }, [allItems.length, pageSize]);

<<<<<<< HEAD
=======
  useEffect(() => {
    dispatchSessionPaginationTelemetry('session_pagination_initialized', {
      pageSize,
      totalItems: allItems.length,
      visibleCount,
    });
  }, [allItems.length, pageSize, visibleCount]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

>>>>>>> emwulrd/main
  const visibleItems = useMemo(() => {
    if (!allItems || allItems.length === 0) return [] as T[];
    return allItems.slice(-visibleCount);
  }, [allItems, visibleCount]);

  const hasMore = useMemo(() => {
    return allItems.length > visibleCount;
  }, [allItems.length, visibleCount]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);

    // small delay for smoother UX, mirrors useChatPagination
<<<<<<< HEAD
    setTimeout(() => {
      setVisibleCount((prev: number) => getNextMessageCount(allItems, prev, pageSize));
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore, allItems, pageSize]);
=======
    timeoutRef.current = setTimeout(() => {
      setVisibleCount((prev: number) => {
        const next = Math.min(prev + pageSize, allItems.length);
        dispatchSessionPaginationTelemetry('session_pagination_loaded_more', {
          previousVisibleCount: prev,
          nextVisibleCount: next,
          pageSize,
          totalItems: allItems.length,
        });
        return next;
      });
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore, allItems.length, pageSize]);
>>>>>>> emwulrd/main

  return {
    visibleItems,
    hasMore,
    isLoadingMore,
    loadMore,
    setVisibleCount,
  } as const;
};
