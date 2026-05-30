import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import * as advisorService from './advisor.service.js'

export const getAdvisors = asyncHandler(async (req: Request, res: Response) => {
  const result = await advisorService.getPublicAdvisors(req.query as any)
  return ApiResponse.success(res, result.advisors, 'Advisors retrieved.', 200, result.meta)
})

export const getAdvisorById = asyncHandler(async (req: Request, res: Response) => {
  const advisor = await advisorService.getAdvisorById(req.params.id)
  return ApiResponse.success(res, { advisor })
})

export const getMyProfiles = asyncHandler(async (req: Request, res: Response) => {
  const profiles = await advisorService.getMyAdvisorProfiles(req.user!.id)
  return ApiResponse.success(res, { profiles })
})

export const createProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await advisorService.createAdvisorProfile(req.user!.id, req.body)
  return ApiResponse.created(res, { profile }, 'Advisor profile created.')
})

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await advisorService.updateAdvisorProfile(req.user!.id, req.params.id, req.body)
  return ApiResponse.success(res, { profile }, 'Advisor profile updated.')
})