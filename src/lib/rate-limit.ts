interface RateLimitEntry {
  attempts: number;
  resetAt: number;
  blockedUntil?: number;
}

// In-memory rate limit store (can be upgraded to Redis later)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes after max attempts

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
      rateLimitStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export function getClientIp(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback (won't work in serverless, but good for development)
  return "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // If no entry exists, allow and create one
  if (!entry) {
    const newEntry: RateLimitEntry = {
      attempts: 1,
      resetAt: now + WINDOW_MS,
    };
    rateLimitStore.set(ip, newEntry);
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Check if currently blocked
  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  // Check if window has expired
  if (entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      attempts: 1,
      resetAt: now + WINDOW_MS,
    };
    rateLimitStore.set(ip, newEntry);
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Check if max attempts reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    // Block for BLOCK_DURATION_MS
    entry.blockedUntil = now + BLOCK_DURATION_MS;
    rateLimitStore.set(ip, entry);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil(BLOCK_DURATION_MS / 1000),
    };
  }

  // Increment attempts
  entry.attempts += 1;
  rateLimitStore.set(ip, entry);

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - entry.attempts,
    resetAt: entry.resetAt,
  };
}

export function resetRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

