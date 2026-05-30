import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { AdminAnalyticsService } from './adminAnalytics.service.js'

export class AdminAnalyticsController {

  static overview = asyncHandler(async (_req: Request, res: Response) => {
    const data = await AdminAnalyticsService.getPlatformOverview()
    return ApiResponse.success(res, data)
  })

  static userGrowth = asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(String(req.query.days ?? 30))
    const data = await AdminAnalyticsService.getUserGrowth(days)
    return ApiResponse.success(res, data)
  })

  static listingsByIndustry = asyncHandler(async (_req: Request, res: Response) => {
    const data = await AdminAnalyticsService.getListingsByIndustry()
    return ApiResponse.success(res, data)
  })

  static listingsByCountry = asyncHandler(async (_req: Request, res: Response) => {
    const data = await AdminAnalyticsService.getListingsByCountry()
    return ApiResponse.success(res, data)
  })

  static dealFunnel = asyncHandler(async (_req: Request, res: Response) => {
    const data = await AdminAnalyticsService.getDealFunnel()
    return ApiResponse.success(res, data)
  })

  static recentActivity = asyncHandler(async (_req: Request, res: Response) => {
    const data = await AdminAnalyticsService.getRecentActivity()
    return ApiResponse.success(res, data)
  })
}