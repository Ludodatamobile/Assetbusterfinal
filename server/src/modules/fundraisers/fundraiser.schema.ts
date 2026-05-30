import { z } from "zod";
import { DealType } from "@prisma/client";

const emptyToUndefined = (value: unknown) => value === "" ? undefined : value;

const optionalText = (max = 5000) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().trim().url("Website must be a valid URL.").max(255).optional(),
);

const optionalMoney = z.preprocess(
  emptyToUndefined,
  z.coerce.number().nonnegative().optional(),
);

const optionalPercent = z.preprocess(
  emptyToUndefined,
  z.coerce.number().min(0).max(100).optional(),
);

const optionalInt = (min = 0, max?: number) =>
  z.preprocess(
    emptyToUndefined,
    max === undefined
      ? z.coerce.number().int().min(min).optional()
      : z.coerce.number().int().min(min).max(max).optional(),
  );

const fundraiserBodySchema = z.object({
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(30).max(5000),
  industry: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(100),
  city: optionalText(100),

  businessName: optionalText(150),
  website: optionalUrl,
  headline: optionalText(180),
  shortSummary: optionalText(500),

  dealType: z.nativeEnum(DealType).default("INVESTMENT"),
  currency: z.string().trim().min(3).max(5).default("USD").transform((value) => value.toUpperCase()),
  askAmount: z.coerce.number().positive(),
  askPercent: optionalPercent,
  askRate: optionalPercent,

  runSales: optionalMoney,
  ebitda: optionalMoney,
  grossRevenue: optionalMoney,
  netProfit: optionalMoney,
  monthlyRevenue: optionalMoney,
  monthlyProfit: optionalMoney,
  employees: optionalInt(),
  established: optionalInt(1800, new Date().getFullYear()),

  businessModel: optionalText(1200),
  productsServices: optionalText(1500),
  customerBase: optionalText(1200),
  growthOpportunities: optionalText(1500),
  competitiveAdvantages: optionalText(1500),

  fundingStage: optionalText(100),
  useOfFunds: optionalText(1500),
  traction: optionalText(1500),
  runway: optionalText(300),
  minInvestment: optionalMoney,
  targetInvestor: optionalText(700),
  previousFunding: optionalMoney,
  revenueModel: optionalText(1000),
  keyMetrics: optionalText(1500),
  investorHighlights: optionalText(1500),
  exitStrategy: optionalText(1000),
  pitchDeckReady: z.boolean().optional(),

  isConfidential: z.boolean().optional(),
  ndaRequired: z.boolean().optional(),
  financialsAvailable: z.boolean().optional(),
  dataRoomReady: z.boolean().optional(),
});

export const listFundraisersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    search: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    country: z.string().trim().optional(),
    currency: z.string().trim().optional(),
    fundingStage: z.string().trim().optional(),
    minAsk: z.coerce.number().nonnegative().optional(),
    maxAsk: z.coerce.number().nonnegative().optional(),
    sortBy: z.enum(["featured", "newest", "oldest", "askAmount"]).default("featured"),
  }),
});

export const createFundraiserSchema = z.object({
  body: fundraiserBodySchema,
});

export const updateFundraiserSchema = z.object({
  body: fundraiserBodySchema.partial(),
});

export const fundraiserIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const fundraiserSlugParamsSchema = z.object({
  params: z.object({
    slug: z.string().min(2),
  }),
});