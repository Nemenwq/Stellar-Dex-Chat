<<<<<<< HEAD
=======
'use client';

>>>>>>> emwulrd/main
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearCache,
  getContractBalance,
  getBridgeLimit,
  getTotalDeposited,
} from '@/lib/stellarContract';

export type BridgeStats = {
  balance: bigint | null;
  limit: bigint | null;
  totalDeposited: bigint | null;
  loading: boolean;
  error: string | null;
<<<<<<< HEAD
=======
  fetchCount: number;
  lastFetchedAt: Date | null;
>>>>>>> emwulrd/main
  refetchStats: () => Promise<void>;
  refresh: () => Promise<void>;
};

<<<<<<< HEAD
=======
function dispatchTelemetry(event: string, detail?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('bridge_stats_telemetry', { detail: { event, ...detail } }),
    );
  }
}

>>>>>>> emwulrd/main
export default function useBridgeStats(): BridgeStats {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [limit, setLimit] = useState<bigint | null>(null);
  const [totalDeposited, setTotalDeposited] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
<<<<<<< HEAD
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
=======
  const [fetchCount, setFetchCount] = useState(0);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const isMountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    dispatchTelemetry('bridge_stats_mounted');
>>>>>>> emwulrd/main
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refetchStats = useCallback(async () => {
    if (!isMountedRef.current) return;
<<<<<<< HEAD
=======
    const fetchId = ++fetchIdRef.current;
>>>>>>> emwulrd/main
    setLoading(true);
    setError(null);
    try {
      const [b, l, t] = await Promise.all([
        getContractBalance(),
        getBridgeLimit(),
        getTotalDeposited(),
      ]);
<<<<<<< HEAD
      if (!isMountedRef.current) return;
      setBalance(b);
      setLimit(l);
      setTotalDeposited(t);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (isMountedRef.current) setLoading(false);
=======
      if (!isMountedRef.current || fetchId !== fetchIdRef.current) return;
      setBalance(b);
      setLimit(l);
      setTotalDeposited(t);
      setFetchCount((c) => c + 1);
      setLastFetchedAt(new Date());
      dispatchTelemetry('bridge_stats_fetch_success', { balance: b, limit: l });
    } catch (err) {
      if (!isMountedRef.current || fetchId !== fetchIdRef.current) return;
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      dispatchTelemetry('bridge_stats_fetch_error', { error: msg });
    } finally {
      if (isMountedRef.current && fetchId === fetchIdRef.current) setLoading(false);
>>>>>>> emwulrd/main
    }
  }, []);

  const refresh = useCallback(async () => {
<<<<<<< HEAD
=======
    dispatchTelemetry('bridge_stats_manual_refresh');
>>>>>>> emwulrd/main
    clearCache();
    await refetchStats();
  }, [refetchStats]);

  // Initial fetch and 30-second polling
  useEffect(() => {
    void refetchStats();

    const interval = setInterval(() => {
      void refetchStats();
<<<<<<< HEAD
    }, 30000); // 30 seconds
=======
    }, 30000);
>>>>>>> emwulrd/main

    return () => clearInterval(interval);
  }, [refetchStats]);

  return {
    balance,
    limit,
    totalDeposited,
    loading,
    error,
<<<<<<< HEAD
=======
    fetchCount,
    lastFetchedAt,
>>>>>>> emwulrd/main
    refetchStats,
    refresh,
  };
}
