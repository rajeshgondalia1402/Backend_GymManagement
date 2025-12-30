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

export const getRefreshTokenExpiry = (): Date => {
  const expiresIn = config.env.JWT_REFRESH_EXPIRATION;
  const days = parseInt(expiresIn) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
