/**
 * Simple in-memory rate limiter for API routes
 * For production with multiple instances, consider Redis-based solution like @upstash/ratelimit
 */

type RateLimitStore = Map<string, { count: number; resetAt: number }>;

const stores: Record<string, RateLimitStore> = {};

export interface RateLimitConfig {
  interval: number; // milliseconds
  maxRequests: number;
}

export function rateLimit(identifier: string, config: RateLimitConfig): { success: boolean; remaining: number; resetAt: number } {
  const { interval, maxRequests } = config;
  const now = Date.now();
  
  // Get or create store for this identifier
  if (!stores[identifier]) {
    stores[identifier] = new Map();
  }
  
  const store = stores[identifier];
  const key = Math.floor(now / interval).toString();
  
  // Clean up old entries
  for (const [k, v] of store.entries()) {
    if (v.resetAt < now) {
      store.delete(k);
    }
  }
  
  // Get or create entry
  let entry = store.get(key);
  
  if (!entry) {
    entry = { count: 0, resetAt: now + interval };
    store.set(key, entry);
  }
  
  // Check limit
  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }
  
  // Increment
  entry.count++;
  
  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  const ip = cfConnectingIp || realIp || forwarded?.split(",")[0] || "unknown";
  
  return ip.trim();
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  orders: { interval: 60 * 1000, maxRequests: 5 }, // 5 orders per minute
  analytics: { interval: 60 * 1000, maxRequests: 60 }, // 60 events per minute
  auth: { interval: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  api: { interval: 60 * 1000, maxRequests: 30 }, // 30 requests per minute (general)
} as const;
