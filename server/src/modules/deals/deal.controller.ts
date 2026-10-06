import { requiredParam } from "../../utils/requestParam.js";
import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import * as dealService from './deal.service.js'

export const createDeal = asyncHandler(async (req: Request, res: Response) => {
  const deal = await dealService.createDeal(req.user!.id, req.body)
  return ApiResponse.created(res, { deal }, 'Enquiry sent successfully.')
})

export const createInvestorDeal = asyncHandler(async (req: Request, res: Response) => {
  const deal = await dealService.createInvestorDeal(
    req.user!.id,
    requiredParam(req, "investorProfileId"),
    req.body,
  )

  return ApiResponse.created(
    res,
    { deal },
    'Investor connection request sent successfully.',
  )
})

export const getMyDeals = asyncHandler(async (req: Request, res: Response) => {
  const result = await dealService.getMyDeals(
    req.user!.id,
    req.query.page as string,
    req.query.limit as string,
  )

  return ApiResponse.success(res, result.deals, 'Deals retrieved.', 200, result.meta)
})

export const getDealById = asyncHandler(async (req: Request, res: Response) => {
  const deal = await dealService.getDealById(requiredParam(req, "id"), req.user!.id)
  return ApiResponse.success(res, { deal })
})

export const advanceDealStatus = asyncHandler(async (req: Request, res: Response) => {
  const deal = await dealService.advanceDealStatus(requiredParam(req, "id"), req.user!.id, req.body)
  return ApiResponse.success(res, { deal }, 'Deal status updated.')
})

export const signNda = asyncHandler(async (req: Request, res: Response) => {
  const deal = await dealService.signNda(requiredParam(req, "id"), req.user!.id)
  return ApiResponse.success(res, { deal }, 'NDA signed.')
})

export const withdrawDeal = asyncHandler(async (req: Request, res: Response) => {
  const deal = await dealService.withdrawDeal(requiredParam(req, "id"), req.user!.id)
  return ApiResponse.success(res, { deal }, 'Deal withdrawn.')
})