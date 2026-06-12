import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// reduce from 10 to 5 requests per user per minute
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: 'securra-ai',
});

// reduce global daily limit to 50
export const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '24 h'),
  analytics: true,
  prefix: 'securra-ai-global',
});