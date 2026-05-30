import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { uploadFile, deleteFile } from '../../services/storage.service.js'

export interface DocumentUploadInput {
  name: string
  fileBuffer: Buffer
  mimeType: string
  fileSize: number
  businessId?: string
  dealId?: string
  type?: string
  access?: 'PUBLIC_TEASER' | 'DATA_ROOM' | 'RESTRICTED'
  isNda?: boolean
}

export const uploadDocument = async (userId: string, input: DocumentUploadInput) => {
  if (input.fileSize > 20 * 1024 * 1024) {
    throw ApiError.badRequest('File too large. Maximum size is 20 MB.')
  }

  if (input.businessId) {
    const business = await prisma.businessProfile.findUnique({
      where: { id: input.businessId },
      select: { userId: true },
    })
    if (!business) throw ApiError.notFound('Business profile not found.')
    if (business.userId !== userId) throw ApiError.forbidden('You do not own this business profile.')
  }

  if (input.dealId) {
    const deal = await prisma.deal.findUnique({ where: { id: input.dealId } })
    if (!deal) throw ApiError.notFound('Deal not found.')
    if (deal.initiatorId !== userId && deal.receiverId !== userId) {
      throw ApiError.forbidden('You are not a party to this deal.')
    }
  }

  const folder = input.dealId ? `deals/${input.dealId}` : `users/${userId}`
  const url = await uploadFile(input.fileBuffer, input.name, input.mimeType, folder)

  return prisma.document.create({
    data: {
      name: input.name,
      url,
      type: input.type || 'General',
      fileType: input.mimeType,
      fileSize: input.fileSize,
      userId,
      businessId: input.businessId,
      dealId: input.dealId,
      access: input.access || 'DATA_ROOM',
      isNda: input.isNda ?? false,
    },
  })
}

export const getDealDocuments = async (dealId: string, userId: string) => {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } })
  if (!deal) throw ApiError.notFound('Deal not found.')
  if (deal.initiatorId !== userId && deal.receiverId !== userId) {
    throw ApiError.forbidden('You are not a party to this deal.')
  }

  return prisma.document.findMany({
    where: { dealId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
  })
}

export const getMyDocuments = async (userId: string) => {
  return prisma.document.findMany({
    where: { userId, dealId: null },
    orderBy: { createdAt: 'desc' },
  })
}

export const deleteDocument = async (docId: string, userId: string) => {
  const doc = await prisma.document.findUnique({ where: { id: docId } })
  if (!doc) throw ApiError.notFound('Document not found.')
  if (doc.userId !== userId) throw ApiError.forbidden('You do not own this document.')

  await deleteFile(doc.url)
  await prisma.document.delete({ where: { id: docId } })
}