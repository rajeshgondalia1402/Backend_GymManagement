import jwt from 'jsonwebtoken';
import config from './env';

export interface JWTPayload {
  userId: string;
  role?: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.env.JWT_SECRET, {
    expiresIn: config.env.JWT_EXPIRATION,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.env.JWT_REFRESH_SECRET, {
    expiresIn: config.env.JWT_REFRESH_EXPIRATION,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, config.env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, config.env.JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Parse a duration string like "7d", "24h", "30m", "3600s" to milliseconds
 */
const parseDuration = (duration: string): number => {
  const match = duration.match(/^(\d+)([dhms]?)$/i);
  if (!match) {
    // Default to 7 days if format is invalid
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2]?.toLowerCase() || 'd';

  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000; // days
    case 'h': return value * 60 * 60 * 1000;      // hours
    case 'm': return value * 60 * 1000;            // minutes
    case 's': return value * 1000;                 // seconds
    default: return value * 24 * 60 * 60 * 1000;  // default to days
  }
};

export const getRefreshTokenExpiry = (): Date => {
  const expiresIn = config.env.JWT_REFRESH_EXPIRATION;
  const durationMs = parseDuration(expiresIn);
  return new Date(Date.now() + durationMs);
};
