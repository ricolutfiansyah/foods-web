import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });
};

export const verifyToken = (token, isRefresh = false) => {
  const secret = isRefresh ? process.env.REFRESH_TOKEN_SECRET : process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const fingerprintRequest = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  return crypto.createHash('sha256').update(userAgent).digest('hex');
};