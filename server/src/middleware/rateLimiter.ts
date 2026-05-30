import rateLimit from 'express-rate-limit'
import { ApiError } from '../utils/ApiError.js'

const handler = (_req: any, _res: any, next: any, options: any) => {
  next(ApiError.tooMany(options.message))
}

/** Strict limit for auth endpoints (register, login, forgot-password) */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max:      10,
  message:  'Too many auth attempts. Please wait 15 minutes before trying again.',
  standardHeaders: true,
  legacyHeaders:   false,
  handler,
})

/** Moderate limit for general API endpoints */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max:      120,
  message:  'Too many requests. Slow down.',
  standardHeaders: true,
  legacyHeaders:   false,
  handler,
})

/** Strict limit for email sending (verification, password reset) */
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max:      5,
  message:  'Too many email requests. Please wait an hour.',
  standardHeaders: true,
  legacyHeaders:   false,
  handler,
})