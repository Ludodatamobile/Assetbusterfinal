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

const optionalBoolean = z.preprocess(
  (value) => {
    if (value === "") return undefined;
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  },
  z.boolean().optional(),
);

const optionalStringArray = z.preprocess(
  (value) => {
    if (value === "" || value === undefined || value === null) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return value;
  },
  z.array(z.string().trim().min(1).max(120)).max(30).optional(),
);

const fundingServiceBodySchema = z.object({
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(30).max(5000),
  industry: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(100),
  city: optionalText(100),

  businessName: optionalText(150),
  website: optionalUrl,
  headline: optionalText(180),
  shortSummary: optionalText(500),

  dealType: z.nativeEnum(DealType).default(DealType.BUSINESS_LOAN),
  currency: z.string().trim().min(3).max(5).default("USD").transform((value) => value.toUpperCase()),
  askAmount: optionalMoney,

  fundingServiceType: optionalText(100),
  capitalProviderType: optionalText(120),
  capitalTypes: optionalStringArray,
  ticketMin: optionalMoney,
  ticketMax: optionalMoney,
  targetCompanyStage: optionalText(150),
  collateralRequired: optionalBoolean,
  repaymentTerms: optionalText(1000),
  processingTime: optionalText(200),
  regionsCovered: optionalStringArray,
  eligibilityCriteria: optionalText(2000),
  requiredDocuments: optionalText(2000),
  feesDescription: optionalText(1200),
  regulatoryLicense: optionalText(300),
  fundingServiceHighlights: optionalText(1500),

  isConfidential: optionalBoolean,
  ndaRequired: optionalBoolean,
});

export const listFundingServicesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    search: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    country: z.string().trim().optional(),
    currency: z.string().trim().optional(),
    fundingServiceType: z.string().trim().optional(),
    capitalProviderType: z.string().trim().optional(),
    capitalType: z.string().trim().optional(),
    minTicket: z.coerce.number().nonnegative().optional(),
    maxTicket: z.coerce.number().nonnegative().optional(),
    sortBy: z.enum(["featured", "newest", "oldest", "ticketSize"]).default("featured"),
  }),
});

export const createFundingServiceSchema = z.object({
  body: fundingServiceBodySchema,
});

export const updateFundingServiceSchema = z.object({
  body: fundingServiceBodySchema.partial(),
});

export const fundingServiceIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const fundingServiceSlugParamsSchema = z.object({
  params: z.object({
    slug: z.string().min(2),
  }),
});

export const fundingServiceEnquirySchema = z.object({
  body: z.object({
    message: z.string().trim().min(20).max(3000),
  }),
});

export type CreateFundingServiceInput = z.infer<typeof createFundingServiceSchema>["body"];
export type UpdateFundingServiceInput = z.infer<typeof updateFundingServiceSchema>["body"];