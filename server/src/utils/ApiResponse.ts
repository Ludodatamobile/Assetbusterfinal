import { Response } from 'express'

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200,
    meta?: Record<string, any>
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    })
  }

  static paginated<T>(
    res: Response,
    data: T[],
    meta?: Record<string, any>,
    message?: string,
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    })
  }

  static created<T>(
    res: Response,
    data: T,
    message = 'Created successfully'
  ) {
    return this.success(res, data, message, 201)
  }

  static error(
    res: Response,
    error: string,
    statusCode = 500
  ) {
    return res.status(statusCode).json({
      success: false,
      error,
    })
  }

  static noContent(res: Response) {
    return res.status(204).send()
  }
}

export const sendSuccess = ApiResponse.success.bind(ApiResponse)
export const sendCreated = ApiResponse.created.bind(ApiResponse)
export const sendError = ApiResponse.error.bind(ApiResponse)
export const sendNoContent = ApiResponse.noContent.bind(ApiResponse)