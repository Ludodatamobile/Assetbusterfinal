import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { ApiError } from '../../utils/ApiError.js'
import * as valuationService from './valuation.service.js'

export const runValuation = asyncHandler(async (req: Request, res: Response) => {
  const valuation = await valuationService.runValuation(req.user!.id, req.body)
  ApiResponse.created(res, { valuation }, 'Valuation saved.')
})

export const getValuations = asyncHandler(async (req: Request, res: Response) => {
  const valuations = await valuationService.getValuations(req.params.businessId, req.user!.id)
  ApiResponse.success(res, valuations, `${valuations.length} valuations found.`)
})

export const estimateValuation = asyncHandler(async (req: Request, res: Response) => {
  const { method, runSales, ebitda, multiplier } = req.body

  if (!method || !runSales) throw ApiError.badRequest('method and runSales are required.')

  const estimate = valuationService.estimateValuation(
    method,
    parseFloat(runSales),
    ebitda ? parseFloat(ebitda) : undefined,
    multiplier ? parseFloat(multiplier) : undefined
  )

  ApiResponse.success(res, { estimate })
})

export const deleteValuation = asyncHandler(async (req: Request, res: Response) => {
  await valuationService.deleteValuation(req.params.id, req.user!.id)
  ApiResponse.noContent(res)
})