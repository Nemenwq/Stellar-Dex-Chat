'use client';

<<<<<<< HEAD
import { useEffect, useState, useCallback } from 'react';
=======
import { useEffect, useState, useCallback, useRef } from 'react';
>>>>>>> emwulrd/main
import { fetchCryptoPrices } from '@/lib/cryptoPriceService';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  fiatAmount: number | null;
  fiatCurrency: string;
  displayText: string;
  isLoading: boolean;
  hasError: boolean;
  forceRefresh: () => Promise<void>;
}

const RATE_CACHE_TTL_MS = 60 * 1000;
const rateCache = new Map<string, { price: number; expiresAt: number }>();

function getRateCacheKey(tokenSymbol: string, fiatCurrency: string): string {
  return `${tokenSymbol.toUpperCase()}_${fiatCurrency.toLowerCase()}`;
}

/**
 * Hook to convert crypto amounts to fiat currency
 * @param amount - The amount in crypto (e.g., 100 XLM)
 * @param tokenSymbol - The token symbol (e.g., 'XLM', 'USDC')
 * @returns ConversionResult with fiat amount and display text
 */
export function useCurrencyConversion(
  amount: number | null | undefined,
  tokenSymbol: string = 'XLM',
): ConversionResult {
  const { fiatCurrency } = useUserPreferences();
  const [fiatAmount, setFiatAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

<<<<<<< HEAD
=======
  // Memory-leak fix (#1217): fetchCryptoPrices is async. Without a mounted
  // guard, every setState call inside convertAmount would fire even after the
  // component unmounts (e.g. navigating away mid-fetch), triggering the
  // "Can't perform a React state update on an unmounted component" warning and
  // leaking the closure referencing this component's state.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

>>>>>>> emwulrd/main
  const getCurrencySymbolForCode = useCallback((code: string): string => {
    const symbolMap: Record<string, string> = {
      usd: '$',
      eur: '€',
      gbp: '£',
      ngn: '₦',
      cad: 'CA$',
      aud: 'A$',
      jpy: '¥',
    };
    return symbolMap[code.toLowerCase()] || '';
  }, []);

  const convertAmount = useCallback(async (forceRefresh = false) => {
    if (!amount || amount <= 0 || !tokenSymbol) {
      setFiatAmount(null);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      const cacheKey = getRateCacheKey(tokenSymbol, fiatCurrency);
      const cachedRate = rateCache.get(cacheKey);
      const now = Date.now();
      let price: number | undefined;

      if (!forceRefresh && cachedRate && cachedRate.expiresAt > now) {
        price = cachedRate.price;
      } else {
        const prices = await fetchCryptoPrices([tokenSymbol], [fiatCurrency]);
<<<<<<< HEAD
=======

        // Guard: component may have unmounted while the fetch was in-flight.
        if (!isMountedRef.current) return;

>>>>>>> emwulrd/main
        price = prices?.[tokenSymbol.toUpperCase()]?.[fiatCurrency.toLowerCase()];

        if (typeof price === 'number') {
          rateCache.set(cacheKey, {
            price,
            expiresAt: now + RATE_CACHE_TTL_MS,
          });
        }
      }

<<<<<<< HEAD
=======
      if (!isMountedRef.current) return;

>>>>>>> emwulrd/main
      if (typeof price === 'number') {
        const converted = amount * price;
        setFiatAmount(converted);
        setHasError(false);
      } else {
        setFiatAmount(null);
        setHasError(true);
      }
    } catch (error) {
      console.error('Currency conversion error:', error);
<<<<<<< HEAD
      setFiatAmount(null);
      setHasError(true);
    } finally {
      setIsLoading(false);
=======
      if (!isMountedRef.current) return;
      setFiatAmount(null);
      setHasError(true);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
>>>>>>> emwulrd/main
    }
  }, [amount, tokenSymbol, fiatCurrency]);

  useEffect(() => {
    convertAmount();
  }, [convertAmount]);

  const forceRefresh = useCallback(() => convertAmount(true), [convertAmount]);

  // Format display text
  const displayText = useCallback((): string => {
    if (!amount) return '';

    if (isLoading) {
      return `${amount} ${tokenSymbol} ≈ ...`;
    }

    if (hasError || fiatAmount === null) {
      // Show only crypto amount without fiat equivalent
      return `${amount} ${tokenSymbol}`;
    }

    const symbol = getCurrencySymbolForCode(fiatCurrency);
    const formattedFiat = fiatAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${amount} ${tokenSymbol} ≈ ${symbol}${formattedFiat} ${fiatCurrency.toUpperCase()}`;
  }, [amount, tokenSymbol, fiatCurrency, fiatAmount, isLoading, hasError, getCurrencySymbolForCode]);

  return {
    originalAmount: amount || 0,
    originalCurrency: tokenSymbol,
    fiatAmount,
    fiatCurrency,
    displayText: displayText(),
    isLoading,
    hasError,
    forceRefresh,
  };
}
