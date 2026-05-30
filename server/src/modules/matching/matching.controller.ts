import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import * as matchingService from './matching.service.js'

export const getMatchesForInvestor = asyncHandler(async (req: Request, res: Response) => {
  const matches = await matchingService.getMatchesForInvestor(req.user!.id)
  ApiResponse.success(res, matches, `${matches.length} matched listings found.`)
})

export const getMatchesForBusiness = asyncHandler(async (req: Request, res: Response) => {
  const investors = await matchingService.getMatchesForBusiness(req.user!.id)
  ApiResponse.success(res, investors, `${investors.length} matched investors found.`)
})

export const getRecommended = asyncHandler(async (req: Request, res: Response) => {
  const listings = await matchingService.getRecommendedListings(req.user?.id)
  ApiResponse.success(res, listings, `${listings.length} recommended listings found.`)
})