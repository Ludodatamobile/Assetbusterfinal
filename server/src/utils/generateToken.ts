// generateToken.ts
import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'

const tokenDuration = (value: string): SignOptions['expiresIn'] => {
  if (!/^[0-9]+(ms|s|m|h|d|w|y)?$/.test(value)) {
    throw new Error('Invalid JWT expiration duration')
  }
  return value as SignOptions['expiresIn']
}

export interface TokenPayload {
  id: string
  email: string
  role: string
  type?: 'user' | 'admin'
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: tokenDuration(env.JWT_EXPIRES_IN || '7d'),
  })
}

export function generateRefreshToken(payload: TokenPayload): string {
  const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET
  return jwt.sign(payload, secret, {
    expiresIn: tokenDuration(env.JWT_REFRESH_EXPIRES_IN || '30d'),
  })
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload
}

export function verifyRefreshToken(token: string): TokenPayload {
  const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET
  return jwt.verify(token, secret) as TokenPayload
}

export function generateVerificationToken(): string {
  return jwt.sign({ purpose: 'email-verification' }, env.JWT_SECRET, {
    expiresIn: '24h',
  })
}

export function generatePasswordResetToken(): string {
  return jwt.sign({ purpose: 'password-reset' }, env.JWT_SECRET, {
    expiresIn: '1h',
  })
}