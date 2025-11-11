import { LRUCache } from 'lru-cache';
import type { UserStats } from '@/types';

// In-memory LRU cache fallback
const memoryCache = new LRUCache<string, { data: UserStats; timestamp: number }>({
  max: 500, // Store up to 500 users
  ttl: 1000 * 60 * 60 * 24, // 24 hours
  updateAgeOnGet: true,
});

// Upstash Redis client (lazy-loaded)
let upstashClient: any = null;

async function getUpstashClient() {
  if (upstashClient) return upstashClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    const { Redis } = await import('@upstash/redis');
    upstashClient = new Redis({
      url,
      token,
    });
    return upstashClient;
  } catch (error) {
    console.warn('Upstash Redis not available, using memory cache:', error);
    return null;
  }
}

// Cache key builder
function buildCacheKey(username: string, privateData: boolean = false): string {
  return `gh-unwrapped-2025:${username.toLowerCase()}${privateData ? ':private' : ''}`;
}

// Get cached stats
export async function getCachedStats(
  username: string,
  privateData: boolean = false
): Promise<{ data: UserStats; stale: boolean } | null> {
  const key = buildCacheKey(username, privateData);

  // Try Upstash first
  const redis = await getUpstashClient();
  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return { data: cached as UserStats, stale: false };
      }
    } catch (error) {
      console.warn('Upstash get error:', error);
      // Fall through to memory cache
    }
  }

  // Try memory cache
  const memoryCached = memoryCache.get(key);
  if (memoryCached) {
    const age = Date.now() - memoryCached.timestamp;
    const isStale = age > 1000 * 60 * 60 * 12; // Consider stale after 12 hours
    return { data: memoryCached.data, stale: isStale };
  }

  return null;
}

// Set cached stats
export async function setCachedStats(
  username: string,
  data: UserStats,
  privateData: boolean = false
): Promise<void> {
  const key = buildCacheKey(username, privateData);

  // Store in Upstash
  const redis = await getUpstashClient();
  if (redis) {
    try {
      await redis.set(key, data, {
        ex: 60 * 60 * 24, // 24 hours
      });
    } catch (error) {
      console.warn('Upstash set error:', error);
    }
  }

  // Always store in memory cache as backup
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// Delete cached stats (for privacy/GDPR)
export async function deleteCachedStats(username: string): Promise<void> {
  const publicKey = buildCacheKey(username, false);
  const privateKey = buildCacheKey(username, true);

  // Delete from Upstash
  const redis = await getUpstashClient();
  if (redis) {
    try {
      await redis.del(publicKey, privateKey);
    } catch (error) {
      console.warn('Upstash delete error:', error);
    }
  }

  // Delete from memory
  memoryCache.delete(publicKey);
  memoryCache.delete(privateKey);
}

// Check if cache is available
export async function isCacheAvailable(): Promise<boolean> {
  const redis = await getUpstashClient();
  return redis !== null;
}
