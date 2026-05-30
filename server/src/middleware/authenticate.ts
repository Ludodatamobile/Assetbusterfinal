import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError.js'
import { verifyAccessToken } from '../utils/generateToken.js'
import { prisma } from '../config/prisma.js'
import { Role } from '@prisma/client'

/**
 * Internal helper — does NOT call next(), just resolves/throws
 */
async function resolveAuth(req: Request): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No token provided')
  }

  const token = authHeader.substring(7)
  const payload = verifyAccessToken(token)

  if (payload.type === 'admin') {
    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, isActive: true },
    })

    if (!admin?.isActive) {
      throw ApiError.unauthorized('Invalid admin account')
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role as Role,
      type: 'admin',
    }
  } else {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      throw ApiError.unauthorized('Invalid user account')
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      type: 'user',
    }
  }
}

/**
 * USER + ADMIN UNIFIED AUTH
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await resolveAuth(req)
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * ADMIN ONLY
 */
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await resolveAuth(req)
    if (!req.admin) {
      return next(ApiError.unauthorized('Admin authentication required'))
    }
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * USER ONLY
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await resolveAuth(req)
    if (!req.user) {
      return next(ApiError.unauthorized('User authentication required'))
    }
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * OPTIONAL AUTH
 */
export const authenticateOptional = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next()
  }

  try {
    await resolveAuth(req)
    next()
  } catch {
    // Optional — silently continue even if token is invalid
    next()
  }
}