import { z } from "zod";
import { DealType } from "@prisma/client";

export const STARTUP_CATEGORIES = [
  "Technology",
  "Fintech",
  "Healthtech",
  "Edtech",
  "Climate",
  "Energy",
  "Agritech",
  "Logistics",
  "E-commerce",
  "SaaS",
  "Marketplace",
  "AI / Automation",
  "Real Estate",
  "Consumer Products",
  "Media",
  "Other",
] as const;

export const STARTUP_STAGES = [
  "Idea",
  "Prototype",
  "MVP",
  "Pre-Revenue",
  "Revenue",
  "Growth",
  "Scaling",
] as const;

export const STARTUP_COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United States",
  "United Kingdom",
  "India",
  "United Arab Emirates",
] as const;

export const STARTUP_TYPES = [
  "Startup Idea",
  "MVP",
  "Operating Startup",
  "SaaS Product",
  "Marketplace",
  "Mobile App",
  "AI Product",
  "Hardware Product",
  "Social Enterprise",
  "Research / IP Project",
] as const;

const emptyToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

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

const optionalStringArray = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return undefined;

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return value;
}, z.array(z.string().trim().min(1).max(500)).max(12).optional());

const startupBodySchema = z.object({
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(30).max(5000),

  industry: optionalText(100),
  country: z.enum(STARTUP_COUNTRIES),
  city: optionalText(100),

  businessName: optionalText(150),
  website: optionalUrl,
  headline: optionalText(180),
  shortSummary: optionalText(500),

  dealType: z.nativeEnum(DealType).default("INVESTMENT"),
  currency: z
    .string()
    .trim()
    .min(3)
    .max(5)
    .default("USD")
    .transform((value) => value.toUpperCase()),
  askAmount: optionalMoney,

  startupType: z.enum(STARTUP_TYPES),
  startupCategory: z.enum(STARTUP_CATEGORIES),
  startupStage: z.enum(STARTUP_STAGES).default("Idea"),

  problemStatement: z.string().trim().min(20).max(2500),
  solutionStatement: z.string().trim().min(20).max(2500),
  targetMarket: optionalText(1500),
  marketSize: optionalText(1200),
  businessModel: optionalText(1200),
  revenueModel: optionalText(1000),
  productStatus: optionalText(500),
  tractionSummary: optionalText(1500),
  teamSummary: optionalText(1500),
  technologyStack: optionalText(1200),
  goToMarketStrategy: optionalText(1500),
  competitors: optionalText(1200),
  startupHighlights: optionalText(1500),
  fundingNeeded: optionalMoney,
  imageUrls: optionalStringArray,

  isConfidential: z.boolean().optional(),
  ndaRequired: z.boolean().optional(),
});

export const listStartupsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    search: z.string().trim().optional(),
    category: z.enum(STARTUP_CATEGORIES).optional(),
    country: z.enum(STARTUP_COUNTRIES).optional(),
    startupStage: z.enum(STARTUP_STAGES).optional(),
    currency: z.string().trim().optional(),
    minFunding: z.coerce.number().nonnegative().optional(),
    maxFunding: z.coerce.number().nonnegative().optional(),
    sortBy: z
      .enum(["featured", "newest", "oldest", "fundingNeeded"])
      .default("featured"),
  }),
});

export const createStartupSchema = z.object({
  body: startupBodySchema,
});

export const updateStartupSchema = z.object({
  body: startupBodySchema.partial(),
});

export const startupIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const startupSlugParamsSchema = z.object({
  params: z.object({
    slug: z.string().min(2),
  }),
});

export type CreateStartupInput = z.infer<typeof startupBodySchema>;
export type UpdateStartupInput = z.infer<typeof updateStartupSchema>["body"];