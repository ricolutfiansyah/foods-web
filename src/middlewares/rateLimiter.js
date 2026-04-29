import rateLimit from 'express-rate-limit';

const limitHandler = {
    windowMs: 15 * 60 * 1000,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    },
    statusCode: 429,
    skip: () => process.env.NODE_ENV === 'development'
};

export const globalLimiter = rateLimit({
    ...limitHandler,
    limit: 100
});

export const authLimiter = rateLimit({
    ...limitHandler,
    limit: 10
});

export const strictLimiter = rateLimit({
    ...limitHandler,
    limit: 30
});
