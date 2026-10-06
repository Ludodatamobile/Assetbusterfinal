import { requiredParam } from "../../utils/requestParam.js";
import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { AdminUsersService } from './adminUsers.service.js'

export class AdminUsersController {

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminUsersService.getAllUsers(req.query as any)
    return ApiResponse.paginated(res, result.data as any[], result.pagination)
  })

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const user = await AdminUsersService.getUserById(requiredParam(req, "id"))
    return ApiResponse.success(res, user)
  })

  static suspend = asyncHandler(async (req: Request, res: Response) => {
    await AdminUsersService.suspendUser(requiredParam(req, "id"), req.admin!.id, req.body.reason)
    return ApiResponse.success(res, null, 'User suspended successfully')
  })

  static reactivate = asyncHandler(async (req: Request, res: Response) => {
    await AdminUsersService.reactivateUser(requiredParam(req, "id"), req.admin!.id)
    return ApiResponse.success(res, null, 'User reactivated successfully')
  })

  static verify = asyncHandler(async (req: Request, res: Response) => {
    await AdminUsersService.verifyUser(requiredParam(req, "id"), req.admin!.id)
    return ApiResponse.success(res, null, 'User verified successfully')
  })

  static remove = asyncHandler(async (req: Request, res: Response) => {
    await AdminUsersService.deleteUser(requiredParam(req, "id"), req.admin!.id)
    return ApiResponse.success(res, null, 'User deleted successfully')
  })

  static stats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await AdminUsersService.getUserStats()
    return ApiResponse.success(res, stats)
  })
}