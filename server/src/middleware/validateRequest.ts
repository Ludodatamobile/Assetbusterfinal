import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { ApiError } from '../utils/ApiError.js'

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        
        return next(
          new ApiError(400, `Validation error: ${errors.map(e => e.message).join(', ')}`)
        )
      }
      next(error)
    }
  }
}