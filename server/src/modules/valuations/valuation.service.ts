import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'

export interface ValuationInput {
  businessId:  string
  method:      'EBITDA Multiple' | 'Revenue Multiple' | 'DCF' | 'Asset-Based'
  value:       number
  multiplier?: number
  notes?:      string
}

// Run a valuation 

export const runValuation = async (userId: string, input: ValuationInput) => {
  // Check the user owns the listing
  const business = await prisma.businessProfile.findUnique({ where: { id: input.businessId } })
  if (!business)               throw ApiError.notFound('Business listing not found.')
  if (business.userId !== userId) throw ApiError.forbidden('You do not own this listing.')

  return prisma.valuation.create({
    data: {
      businessId:  input.businessId,
      method:      input.method,
      value:       input.value,
      multiplier:  input.multiplier,
      notes:       input.notes,
    },
  })
}

// Get valuations for a listing 

export const getValuations = async (businessId: string, userId: string) => {
  const business = await prisma.businessProfile.findUnique({ where: { id: businessId } })
  if (!business)               throw ApiError.notFound('Business listing not found.')
  if (business.userId !== userId) throw ApiError.forbidden('Access denied.')

  return prisma.valuation.findMany({
    where:   { businessId },
    orderBy: { createdAt: 'desc' },
  })
}

// Estimate valuation from financials

export const estimateValuation = (
  method:      string,
  runSales:    number,
  ebitda?:     number,
  multiplier?: number
): { low: number; mid: number; high: number } => {
  const mult = multiplier ?? 4

  switch (method) {
    case 'EBITDA Multiple': {
      if (!ebitda) throw ApiError.badRequest('EBITDA required for EBITDA Multiple method.')
      const ebitdaValue = runSales * (ebitda / 100)
      return { low: ebitdaValue * (mult - 1), mid: ebitdaValue * mult, high: ebitdaValue * (mult + 1) }
    }
    case 'Revenue Multiple': {
      return { low: runSales * (mult - 1), mid: runSales * mult, high: runSales * (mult + 1) }
    }
    case 'Asset-Based': {
      return { low: runSales * 0.8, mid: runSales * 1, high: runSales * 1.3 }
    }
    default:
      throw ApiError.badRequest(`Unknown valuation method: ${method}`)
  }
}

// Delete a valuation 

export const deleteValuation = async (id: string, userId: string) => {
  const val = await prisma.valuation.findUnique({
    where:   { id },
    include: { business: true },
  })
  if (!val)                           throw ApiError.notFound('Valuation not found.')
  if (val.business.userId !== userId) throw ApiError.forbidden('Access denied.')
  await prisma.valuation.delete({ where: { id } })
}