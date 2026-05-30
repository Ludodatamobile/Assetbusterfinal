import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/env.js'

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (res.headersSent) {
    return next(err)
  }

  let statusCode = 500
  let message = 'Internal server error'
  let isOperational = false

  if (err instanceof ApiError) {
    statusCode = err.statusCode
    message = err.message
    isOperational = err.isOperational
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400
    message = 'Database error'
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  if (env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      statusCode,
      message,
      stack: err.stack,
      isOperational,
    })
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}