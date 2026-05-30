import { Request, Response, NextFunction } from 'express'
import { Role } from '@prisma/client'
import { ApiError } from '../utils/ApiError.js'

/**
 * USER ROLE GUARD
 */
export const authorize = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User authentication required'))
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `User requires one of these roles: ${roles.join(', ')}`
        )
      )
    }

    next()
  }
}

/**
 * ADMIN ROLE GUARD
 */
export const authorizeAdmin = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(ApiError.unauthorized('Admin authentication required'))
    }

    if (!roles.includes(req.admin.role)) {
      return next(
        ApiError.forbidden(
          `Admin requires one of these roles: ${roles.join(', ')}`
        )
      )
    }

    next()
  }
}

/**
 * STRICT SUPER ADMIN ONLY
 */
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.admin) {
    return next(ApiError.unauthorized('Admin authentication required'))
  }

  if (req.admin.role !== 'SUPER_ADMIN') {
    return next(ApiError.forbidden('Super admin only'))
  }

  next()
}