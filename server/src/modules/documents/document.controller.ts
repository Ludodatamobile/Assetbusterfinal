import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { ApiError } from '../../utils/ApiError.js'
import * as documentService from './document.service.js'

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded.')

  const doc = await documentService.uploadDocument(req.user!.id, {
    name: req.file.originalname,
    fileBuffer: req.file.buffer,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    businessId: req.body.businessId,
    dealId: req.body.dealId,
    type: req.body.type,
    access: req.body.access,
    isNda: req.body.isNda === 'true',
  })

  return ApiResponse.created(res, { document: doc }, 'Document uploaded successfully.')
})

export const getDealDocuments = asyncHandler(async (req: Request, res: Response) => {
  const docs = await documentService.getDealDocuments(req.params.dealId, req.user!.id)
  return ApiResponse.success(res, docs, 'Documents retrieved.')
})

export const getMyDocuments = asyncHandler(async (req: Request, res: Response) => {
  const docs = await documentService.getMyDocuments(req.user!.id)
  return ApiResponse.success(res, docs, 'Documents retrieved.')
})

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  await documentService.deleteDocument(req.params.id, req.user!.id)
  return ApiResponse.noContent(res)
})