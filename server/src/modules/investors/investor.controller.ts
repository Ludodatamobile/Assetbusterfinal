import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import * as investorService from './investor.service.js'

export const getInvestors = asyncHandler(async (req: Request, res: Response) => {
  const result = await investorService.getPublicInvestors(req.query as any)
  return ApiResponse.success(res, result.investors, 'Investors retrieved.', 200, result.meta)
})

export const getInvestorById = asyncHandler(async (req: Request, res: Response) => {
  const investor = await investorService.getInvestorById(req.params.id)
  return ApiResponse.success(res, { investor })
})

export const getMyProfiles = asyncHandler(async (req: Request, res: Response) => {
  const profiles = await investorService.getMyInvestorProfiles(req.user!.id)
  return ApiResponse.success(res, { profiles })
})

export const createProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await investorService.createInvestorProfile(req.user!.id, req.body)
  return ApiResponse.created(res, { profile }, 'Investor profile created.')
})

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await investorService.updateInvestorProfile(req.user!.id, req.params.id, req.body)
  return ApiResponse.success(res, { profile }, 'Investor profile updated.')
})