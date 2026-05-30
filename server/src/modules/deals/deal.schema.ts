import { z } from 'zod'
import { DealStatus } from '@prisma/client'

export const createDealSchema = z.object({
  body: z.object({
    businessId: z.string().uuid('Invalid business ID.'),
    message: z
      .string()
      .min(20, 'Please introduce yourself with at least 20 characters.')
      .max(1000),
  }),
})

export const createInvestorDealSchema = z.object({
  params: z.object({
    investorProfileId: z.string().uuid('Invalid investor profile ID.'),
  }),
  body: z.object({
    businessId: z.string().uuid('Invalid business ID.'),
    message: z
      .string()
      .min(20, 'Please introduce yourself with at least 20 characters.')
      .max(1000),
  }),
})

export const updateDealStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(DealStatus, {
      errorMap: () => ({ message: 'Invalid deal status.' }),
    }),
    notes: z.string().max(500).optional(),
  }),
})

export const signNdaSchema = z.object({
  body: z.object({
    agreed: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the NDA.' }),
    }),
  }),
})

export type CreateDealInput = z.infer<typeof createDealSchema>['body']
export type CreateInvestorDealInput = z.infer<typeof createInvestorDealSchema>['body']
export type UpdateDealStatusInput = z.infer<typeof updateDealStatusSchema>['body']
export type SignNdaInput = z.infer<typeof signNdaSchema>['body']