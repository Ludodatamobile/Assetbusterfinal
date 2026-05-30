import { z } from 'zod'

const advisorBodySchema = z.object({
  title: z.string().min(3).max(150).trim(),
  firmName: z.string().max(120).trim().optional(),
  specialties: z.array(z.string().min(1)).min(1, 'Select at least one specialty.'),
  bio: z.string().max(2000).optional(),
  countries: z.array(z.string().min(1)).min(1, 'Select at least one country.'),
})

export const createAdvisorProfileSchema = z.object({
  body: advisorBodySchema,
})

export const updateAdvisorProfileSchema = z.object({
  body: advisorBodySchema.partial(),
})

export const advisorQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  specialty: z.string().optional(),
  country: z.string().optional(),
  search: z.string().optional(),
})

export type CreateAdvisorInput = z.infer<typeof advisorBodySchema>
export type UpdateAdvisorInput = Partial<CreateAdvisorInput>
export type AdvisorQuery = z.infer<typeof advisorQuerySchema>