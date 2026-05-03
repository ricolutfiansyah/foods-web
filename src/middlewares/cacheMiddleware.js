import { redis } from '../config/redis.js';

/**
 * Cache middleware — checks Redis for cached response before hitting controller.
 * Intercepts res.json to capture and store successful responses.
 *
 * @param {string} key - Cache key (static) or function (req) => string (dynamic)
 * @param {number} ttl - Time to live in seconds (default: 60)
 */
export const cacheMiddleware = (key, ttl = 60) => {
    return async (req, res, next) => {
        const cacheKey = typeof key === 'function' ? key(req) : key;

        try {
            const cached = await redis.get(cacheKey);

            if (cached) {
                // Cache HIT — return cached response directly
                const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
                return res.status(200).json(data);
            }
        } catch (err) {
            console.error(`[Cache] Redis GET error for key "${cacheKey}":`, err.message);
            // Redis error — don't block request, continue to controller
        }

        // Cache MISS — intercept res.json to capture response
        const originalJson = res.json.bind(res);

        res.json = (body) => {
            // Only cache successful responses
            if (body && body.success === true) {
                redis.set(cacheKey, JSON.stringify(body), { ex: ttl }).catch((err) => {
                    console.error(`[Cache] Redis SET error for key "${cacheKey}":`, err.message);
                });
            }

            return originalJson(body);
        };

        next();
    };
};

/**
 * Invalidate one or more cache keys from Redis.
 * Silently catches errors to avoid blocking the request.
 *
 * @param {...string} keys - Cache keys to delete
 */
export const invalidateCache = async (...keys) => {
    try {
        await redis.del(...keys);
    } catch (err) {
        console.error(`[Cache] Redis DEL error for keys [${keys.join(', ')}]:`, err.message);
    }
};
