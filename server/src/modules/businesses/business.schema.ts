import { z } from 'zod'
import { DealType, ProfileType } from '@prisma/client'

const emptyToUndefined = (value: unknown) => value === '' ? undefined : value

const optionalText = (max = 5000) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional())

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().trim().url('Website must be a valid URL.').max(255).optional(),
)

const optionalMoney = z.preprocess(
  emptyToUndefined,
  z.coerce.number().nonnegative().optional(),
)

const optionalPercent = z.preprocess(
  emptyToUndefined,
  z.coerce.number().min(-100).max(100).optional(),
)

const optionalPositivePercent = z.preprocess(
  emptyToUndefined,
  z.coerce.number().min(0).max(100).optional(),
)

const optionalInt = (min = 0, max?: number) =>
  z.preprocess(
    emptyToUndefined,
    max === undefined
      ? z.coerce.number().int().min(min).optional()
      : z.coerce.number().int().min(min).max(max).optional(),
  )

const businessBodySchema = z.object({
  profileType: z
    .nativeEnum(ProfileType)
    .refine(
      (value) => ['SELL_BUSINESS', 'FRANCHISE_BRAND', 'RAISE_CAPITAL'].includes(value),
      'Invalid business profile type.',
    )
    .default('SELL_BUSINESS'),

  title: z.string().min(5, 'Title must be at least 5 characters.').max(150).trim(),
  description: z.string().min(10, 'Description must be at least 10 characters.').max(5000).trim(),
  industry: z.string().min(1, 'Industry is required.').max(100).trim(),
  country: z.string().min(1, 'Country is required.').max(100).trim(),
  city: optionalText(100),

  dealType: z.nativeEnum(DealType).default('FULL_SALE'),
  currency: z.string().trim().min(3).max(5).default('USD').transform((value) => value.toUpperCase()),
  askAmount: z.coerce.number().positive('Ask amount must be positive.'),

  askPercent: optionalPositivePercent,
  askRate: optionalPositivePercent,
  runSales: optionalMoney,
  ebitda: optionalMoney,
  ebitdaMargin: optionalPercent,
  employees: optionalInt(),
  established: optionalInt(1800, new Date().getFullYear()),
  outlets: optionalInt(),

  businessName: optionalText(150),
  legalEntityName: optionalText(180),
  website: optionalUrl,
  headline: optionalText(180),
  shortSummary: optionalText(500),

  grossRevenue: optionalMoney,
  netProfit: optionalMoney,
  monthlyRevenue: optionalMoney,
  monthlyProfit: optionalMoney,
  inventoryValue: optionalMoney,
  assetValue: optionalMoney,
  realEstateValue: optionalMoney,

  askingPriceReason: optionalText(1500),
  valuationMethod: optionalText(500),
  businessModel: optionalText(1200),
  productsServices: optionalText(1500),
  customerBase: optionalText(1200),
  keyClients: optionalText(1200),
  growthOpportunities: optionalText(1500),
  competitiveAdvantages: optionalText(1500),
  facilities: optionalText(1200),
  leaseTerms: optionalText(1200),

  reasonForSelling: optionalText(1200),
  assetsIncluded: optionalText(1500),
  sellerFinancing: z.boolean().optional(),
  transitionSupport: optionalText(1200),
  trainingIncluded: z.boolean().optional(),
  preferredBuyerType: optionalText(700),
  dealStructureNotes: optionalText(1500),

  isConfidential: z.boolean().optional(),
  ndaRequired: z.boolean().optional(),
  teaserSummary: optionalText(700),
  financialsAvailable: z.boolean().optional(),
  dataRoomReady: z.boolean().optional(),
})

export const createBusinessSchema = z.object({
  body: businessBodySchema,
})

export const updateBusinessSchema = z.object({
  body: businessBodySchema.partial(),
})

export const businessQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
  dealType: z.string().optional(),
  profileType: z.string().optional(),
  minAsk: z.string().optional(),
  maxAsk: z.string().optional(),
  search: z.string().optional(),
  verified: z.string().optional(),
  premium: z.string().optional(),
  featured: z.string().optional(),
  sortBy: z.enum(['rating', 'newest', 'askAmount', 'featured']).optional(),
})

export type CreateBusinessInput = z.infer<typeof businessBodySchema>
export type UpdateBusinessInput = Partial<CreateBusinessInput>
export type BusinessQueryInput = z.infer<typeof businessQuerySchema>