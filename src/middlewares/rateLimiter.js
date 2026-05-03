import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../config/redis.js';

const createRateLimitMiddleware = (limit, windowString) => {
    const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, windowString),
        prefix: 'rl:',
    });

    return async (req, res, next) => {
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            return next();
        }

        try {
            const identifier = req.ip ?? req.headers['x-forwarded-for'] ?? 'unknown';
            const { success, limit: rateLimit, remaining } = await ratelimit.limit(identifier);

            res.setHeader('X-RateLimit-Limit', rateLimit);
            res.setHeader('X-RateLimit-Remaining', remaining);

            if (!success) {
                return res.status(429).json({
                    success: false,
                    message: "Too many requests, please try again later."
                });
            }

            next();
        } catch (err) {
            console.error('[RateLimiter] Error:', err.message);
            next();
        }
    };
};

export const globalLimiter = createRateLimitMiddleware(100, '15 m');
export const authLimiter = createRateLimitMiddleware(10, '15 m');
export const strictLimiter = createRateLimitMiddleware(30, '15 m');
