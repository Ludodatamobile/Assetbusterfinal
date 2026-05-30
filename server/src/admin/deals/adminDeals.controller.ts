import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { AdminDealsService } from './adminDeals.service.js'
import type { DealStatus } from '@prisma/client'

export class AdminDealsController {

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminDealsService.getAllDeals(req.query as any)
    return ApiResponse.paginated(res, result.data as any[], result.pagination)
  })

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const deal = await AdminDealsService.getDealById(req.params.id)
    return ApiResponse.success(res, deal)
  })

  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, notes } = req.body
    await AdminDealsService.updateDealStatus(req.params.id, req.admin!.id, status as DealStatus, notes)
    return ApiResponse.success(res, null, 'Deal status updated')
  })

  static stats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await AdminDealsService.getDealStats()
    return ApiResponse.success(res, stats)
  })
}