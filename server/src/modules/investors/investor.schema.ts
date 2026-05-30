import { z } from 'zod'
import { ProfileType } from '@prisma/client'

const investorProfileBaseSchema = z.object({
  profileType: z
    .nativeEnum(ProfileType)
    .refine((value) => ['BUY_BUSINESS', 'INVEST'].includes(value), 'Invalid investor profile type.')
    .default('INVEST'),
  title: z.string().min(3).max(150).trim(),
  firmName: z.string().max(100).trim().optional(),
  investorType: z.enum([
    'Angel Investor',
    'Private Equity',
    'Venture Capital',
    'Strategic Buyer',
    'Family Office',
    'Corporate Investor',
    'Investment Fund',
  ]),
  bio: z.string().max(2000).optional(),
  currency: z.string().min(3).max(5).default('USD'),
  minTicket: z.coerce.number().positive('Min ticket must be positive.'),
  maxTicket: z.coerce.number().positive('Max ticket must be positive.'),
  industries: z.array(z.string().min(1)).min(1, 'Select at least one industry.'),
  countries: z.array(z.string().min(1)).min(1, 'Select at least one country.'),
  dealTypes: z.array(z.string().min(1)).min(1, 'Select at least one deal type.'),
})

export const createInvestorProfileSchema = z.object({
  body: investorProfileBaseSchema.refine((data) => data.maxTicket >= data.minTicket, {
    message: 'Max ticket must be greater than or equal to min ticket.',
    path: ['maxTicket'],
  }),
})

export const updateInvestorProfileSchema = z.object({
  body: investorProfileBaseSchema.partial().refine(
    (data) => {
      if (data.minTicket !== undefined && data.maxTicket !== undefined) {
        return data.maxTicket >= data.minTicket
      }

      return true
    },
    {
      message: 'Max ticket must be greater than or equal to min ticket.',
      path: ['maxTicket'],
    }
  ),
})

export const investorQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  investorType: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  dealType: z.string().optional(),
  search: z.string().optional(),
})

export type CreateInvestorProfileInput = z.infer<typeof investorProfileBaseSchema>
export type UpdateInvestorProfileInput = Partial<CreateInvestorProfileInput>
export type InvestorQueryInput = z.infer<typeof investorQuerySchema>