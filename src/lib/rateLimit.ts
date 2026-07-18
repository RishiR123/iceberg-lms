/**
 * A minimal in-memory sliding-window rate limiter.
 *
 * Scope and limits: this lives in the process, so it resets on restart and does
 * NOT coordinate across multiple instances. On a single Node process (a typical
 * small deployment) it's a real brake on password guessing. A multi-instance or
 * serverless deployment should move this to Redis or similar — the call sites
 * won't need to change, only this module.
 */

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

// Opportunistic cleanup so the Map can't grow without bound.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hit] of buckets) {
    if (hit.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Records one attempt for `key` and reports whether it is allowed.
 * @param limit  max attempts permitted within the window
 * @param windowMs  window length in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  sweep(now);

  const hit = buckets.get(key);

  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (hit.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: hit.resetAt - now };
  }

  hit.count += 1;
  return { allowed: true, remaining: limit - hit.count, retryAfterMs: 0 };
}

/** Clears the counter for a key — call on a *successful* login so a good user isn't penalised. */
export function rateLimitReset(key: string) {
  buckets.delete(key);
}
