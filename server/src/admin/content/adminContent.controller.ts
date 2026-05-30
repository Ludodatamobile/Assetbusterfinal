import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { AdminContentService } from './adminContent.service.js'

export class AdminContentController {

  static getFeaturedListings = asyncHandler(async (_req: Request, res: Response) => {
    return ApiResponse.success(res, await AdminContentService.getFeaturedListings())
  })

  static getFeaturedInvestors = asyncHandler(async (_req: Request, res: Response) => {
    return ApiResponse.success(res, await AdminContentService.getFeaturedInvestors())
  })

  static featureListing = asyncHandler(async (req: Request, res: Response) => {
    await AdminContentService.setListingFeatured(req.params.id, req.admin!.id, true)
    return ApiResponse.success(res, null, 'Listing featured')
  })

  static unfeatureListing = asyncHandler(async (req: Request, res: Response) => {
    await AdminContentService.setListingFeatured(req.params.id, req.admin!.id, false)
    return ApiResponse.success(res, null, 'Listing unfeatured')
  })

  static setPremiumListing = asyncHandler(async (req: Request, res: Response) => {
    await AdminContentService.setPremiumListing(req.params.id, req.admin!.id, req.body.isPremium === true)
    return ApiResponse.success(res, null, 'Listing premium status updated')
  })

  static setPremiumInvestor = asyncHandler(async (req: Request, res: Response) => {
    await AdminContentService.setPremiumInvestor(req.params.id, req.admin!.id, req.body.isPremium === true)
    return ApiResponse.success(res, null, 'Investor premium status updated')
  })

  static getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminContentService.getAuditLogs(req.query as any)
    return ApiResponse.paginated(res, result.logs as any[], result.meta)
  })

  static stats = asyncHandler(async (_req: Request, res: Response) => {
    return ApiResponse.success(res, await AdminContentService.getContentStats())
  })

  static createCampaign = asyncHandler(async (req: Request, res: Response) => {
    const campaign = await AdminContentService.createCampaign(req.admin!.id, req.body)
    const isScheduled = campaign.status === 'SCHEDULED'
    return ApiResponse.created(
      res,
      campaign,
      isScheduled ? 'Campaign scheduled successfully' : 'Campaign is being sent',
    )
  })

  static listCampaigns = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminContentService.listCampaigns(req.query as any)
    return ApiResponse.paginated(res, result.data as any[], result.pagination)
  })

  static cancelCampaign = asyncHandler(async (req: Request, res: Response) => {
    await AdminContentService.cancelCampaign(req.params.id, req.admin!.id)
    return ApiResponse.success(res, null, 'Campaign cancelled')
  })
}