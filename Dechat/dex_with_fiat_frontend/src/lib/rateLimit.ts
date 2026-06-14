import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitConfig {
  /** Maximum requests allowed per window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface Entry {
  count: number;
  resetAt: number;
}

// Module-level store — persists across requests within the same Node.js process.
const store = new Map<string, Entry>();

/**
 * Extract the real client IP, respecting reverse-proxy headers.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Check whether the given IP has exceeded the rate limit for a route.
 * Uses a fixed-window counter keyed by `route:ip`.
 *
 * @returns `null` when the request is allowed, or a ready-to-send 429
 *          NextResponse when the limit is exceeded.
 */
export function applyRateLimit(
  ip: string,
  route: string,
  config: RateLimitConfig,
): NextResponse | null {
  const key = `${route}:${ip}`;
  const now = Date.now();

  let entry = store.get(key);

  // Initialise or reset an expired window.
  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + config.windowMs };
    store.set(key, entry);
    return null;
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const retryAfterSecs = Math.ceil((entry.resetAt - now) / 1000);

    console.warn(
      JSON.stringify({
        event: 'rate_limit_exceeded',
        route,
        ip,
        count: entry.count,
        limit: config.maxRequests,
        retryAfterSecs,
        timestamp: new Date().toISOString(),
      }),
    );

    return NextResponse.json(
      {
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: retryAfterSecs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSecs),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        },
      },
    );
  }

  return null;
}
