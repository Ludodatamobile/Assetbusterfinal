import { Request, Response } from 'express'
import { AdminAuthService } from './adminAuth.service.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
}

export class AdminAuthController {
  static bootstrapStatus = asyncHandler(async (_req: Request, res: Response) => {
    const status = await AdminAuthService.getBootstrapStatus()
    return ApiResponse.success(res, status, 'Bootstrap status fetched')
  })

  static bootstrapSuperAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminAuthService.bootstrapSuperAdmin(req.body)

    res.cookie('adminRefreshToken', result.refreshToken, cookieOptions)

    return ApiResponse.created(
      res,
      {
        admin: result.admin,
        accessToken: result.accessToken,
      },
      'Super admin created successfully'
    )
  })

  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminAuthService.login(req.body)

    res.cookie('adminRefreshToken', result.refreshToken, cookieOptions)

    return ApiResponse.success(
      res,
      {
        admin: result.admin,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      'Admin login successful'
    )
  })

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.adminRefreshToken || req.body.refreshToken

    if (!refreshToken) {
      return ApiResponse.error(res, 'Refresh token is required', 401)
    }

    const result = await AdminAuthService.refreshAccessToken({ refreshToken })
    return ApiResponse.success(res, result, 'Token refreshed successfully')
  })

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.adminRefreshToken || req.body.refreshToken

    await AdminAuthService.logout(req.admin!.id, refreshToken)

    res.clearCookie('adminRefreshToken')

    return ApiResponse.success(res, null, 'Admin logged out successfully')
  })

  static getCurrentAdmin = asyncHandler(async (req: Request, res: Response) => {
    const admin = await AdminAuthService.getCurrentAdmin(req.admin!.id)
    return ApiResponse.success(res, admin)
  })

  static createAdmin = asyncHandler(async (req: Request, res: Response) => {
    const admin = await AdminAuthService.createAdmin(req.body, req.admin!.id)
    return ApiResponse.created(res, admin, 'Admin created successfully')
  })
}