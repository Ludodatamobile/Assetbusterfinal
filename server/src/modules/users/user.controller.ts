import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import * as userService from './user.service.js'

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getMyProfile(req.user!.id)
  return ApiResponse.success(res, user)
})

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!.id, req.body)
  return ApiResponse.success(res, user, 'Profile updated.')
})

export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateAvatar(req.user!.id, req.body.avatarUrl)
  return ApiResponse.success(res, user, 'Avatar updated.')
})

export const deleteMyAccount = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteMyAccount(req.user!.id)
  return ApiResponse.noContent(res)
})

export const getSavedBusinesses = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getSavedBusinesses(
    req.user!.id,
    req.query.page as string,
    req.query.limit as string
  )

  return ApiResponse.success(res, result.items, 'Saved businesses retrieved.', 200, result.meta)
})

export const toggleSaveBusiness = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.saveBusinessToggle(req.user!.id, req.params.businessId)
  return ApiResponse.success(
    res,
    result,
    result.saved ? 'Business saved.' : 'Business removed from saved.'
  )
})

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await userService.getDashboardStats(req.user!.id)
  return ApiResponse.success(res, dashboard)
})

export const getProfileScore = asyncHandler(async (req: Request, res: Response) => {
  const score = await userService.recalcProfileScore(req.user!.id)
  return ApiResponse.success(res, { score })
})