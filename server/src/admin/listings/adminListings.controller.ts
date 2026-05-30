import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { AdminListingsService } from './adminListings.service.js'

export class AdminListingsController {

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminListingsService.getAllListings(req.query as any)
    return ApiResponse.paginated(res, result.data as any[], result.pagination)
  })

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const listing = await AdminListingsService.getListingById(req.params.id)
    return ApiResponse.success(res, listing)
  })

  static approve = asyncHandler(async (req: Request, res: Response) => {
    await AdminListingsService.approveListing(req.params.id, req.admin!.id)
    return ApiResponse.success(res, null, 'Listing approved and published')
  })

  static reject = asyncHandler(async (req: Request, res: Response) => {
    await AdminListingsService.rejectListing(req.params.id, req.admin!.id, req.body.reason)
    return ApiResponse.success(res, null, 'Listing rejected')
  })

  static suspend = asyncHandler(async (req: Request, res: Response) => {
    await AdminListingsService.suspendListing(req.params.id, req.admin!.id)
    return ApiResponse.success(res, null, 'Listing suspended')
  })

  static feature = asyncHandler(async (req: Request, res: Response) => {
    await AdminListingsService.featureListing(req.params.id, req.admin!.id, true)
    return ApiResponse.success(res, null, 'Listing featured')
  })

  static unfeature = asyncHandler(async (req: Request, res: Response) => {
    await AdminListingsService.featureListing(req.params.id, req.admin!.id, false)
    return ApiResponse.success(res, null, 'Listing unfeatured')
  })

  static setPremium = asyncHandler(async (req: Request, res: Response) => {
    await AdminListingsService.setPremium(req.params.id, req.admin!.id, req.body.isPremium === true)
    return ApiResponse.success(res, null, 'Premium status updated')
  })

  static stats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await AdminListingsService.getListingStats()
    return ApiResponse.success(res, stats)
  })
}