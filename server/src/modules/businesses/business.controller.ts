import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import * as businessService from './business.service.js'

export const getListings = asyncHandler(async (req: Request, res: Response) => {
  const result = await businessService.getPublicListings(req.query as any)
  return ApiResponse.success(res, result.listings, 'Listings retrieved.', 200, result.meta)
})

export const getListingBySlug = asyncHandler(async (req: Request, res: Response) => {
  const listing = await businessService.getListingBySlug(req.params.slug as string, req.user?.id)
  return ApiResponse.success(res, { listing })
})

export const createListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await businessService.createListing(req.user!.id, req.body)
  return ApiResponse.created(res, { listing }, 'Profile created.')
})

export const updateListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await businessService.updateListing(req.user!.id, req.params.id, req.body)
  return ApiResponse.success(res, { listing }, 'Listing updated.')
})

export const deleteListing = asyncHandler(async (req: Request, res: Response) => {
  await businessService.deleteListing(req.user!.id, req.params.id)
  return ApiResponse.noContent(res)
})

export const getMyListings = asyncHandler(async (req: Request, res: Response) => {
  const listings = await businessService.getMyListings(req.user!.id)
  return ApiResponse.success(res, listings)
})

export const submitForReview = asyncHandler(async (req: Request, res: Response) => {
  const listing = await businessService.submitForReview(req.user!.id, req.params.id)
  return ApiResponse.success(res, { listing }, 'Listing submitted for review.')
})

export const getSimilarListings = asyncHandler(async (req: Request, res: Response) => {
  const listings = await businessService.getSimilarListings(req.params.id)
  return ApiResponse.success(res, listings)
})