-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPER_ADMIN', 'BUSINESS_OWNER', 'INVESTOR', 'FRANCHISE_PARTNER', 'ADVISOR', 'BUYER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'PENDING');

-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('SELL_BUSINESS', 'BUY_BUSINESS', 'FRANCHISE_BRAND', 'INVEST', 'RAISE_CAPITAL', 'FUNDING_SERVICE', 'STARTUP', 'ADVISOR');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('INQUIRY', 'NDA_SENT', 'NDA_SIGNED', 'NEGOTIATION', 'DUE_DILIGENCE', 'CLOSED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('FULL_SALE', 'PARTIAL_STAKE', 'BUSINESS_LOAN', 'INVESTMENT');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentAccess" AS ENUM ('PUBLIC_TEASER', 'DATA_ROOM', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "BroadcastStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BUSINESS_OWNER',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "profileImage" TEXT,
    "profileScore" INTEGER NOT NULL DEFAULT 0,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "memberSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileType" "ProfileType" NOT NULL DEFAULT 'SELL_BUSINESS',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "dealType" "DealType" NOT NULL DEFAULT 'FULL_SALE',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "askAmount" DECIMAL(18,2) NOT NULL,
    "askPercent" DECIMAL(5,2),
    "askRate" DECIMAL(5,2),
    "runSales" DECIMAL(18,2),
    "ebitda" DECIMAL(18,2),
    "ebitdaMargin" DECIMAL(7,2),
    "employees" INTEGER,
    "established" INTEGER,
    "outlets" INTEGER,
    "businessName" TEXT,
    "legalEntityName" TEXT,
    "website" TEXT,
    "headline" TEXT,
    "shortSummary" TEXT,
    "grossRevenue" DECIMAL(18,2),
    "netProfit" DECIMAL(18,2),
    "monthlyRevenue" DECIMAL(18,2),
    "monthlyProfit" DECIMAL(18,2),
    "inventoryValue" DECIMAL(18,2),
    "assetValue" DECIMAL(18,2),
    "realEstateValue" DECIMAL(18,2),
    "askingPriceReason" TEXT,
    "valuationMethod" TEXT,
    "businessModel" TEXT,
    "productsServices" TEXT,
    "customerBase" TEXT,
    "keyClients" TEXT,
    "growthOpportunities" TEXT,
    "competitiveAdvantages" TEXT,
    "facilities" TEXT,
    "leaseTerms" TEXT,
    "reasonForSelling" TEXT,
    "assetsIncluded" TEXT,
    "sellerFinancing" BOOLEAN NOT NULL DEFAULT false,
    "transitionSupport" TEXT,
    "trainingIncluded" BOOLEAN NOT NULL DEFAULT false,
    "preferredBuyerType" TEXT,
    "dealStructureNotes" TEXT,
    "isConfidential" BOOLEAN NOT NULL DEFAULT true,
    "ndaRequired" BOOLEAN NOT NULL DEFAULT true,
    "teaserSummary" TEXT,
    "financialsAvailable" BOOLEAN NOT NULL DEFAULT false,
    "dataRoomReady" BOOLEAN NOT NULL DEFAULT false,
    "fundingStage" TEXT,
    "useOfFunds" TEXT,
    "traction" TEXT,
    "runway" TEXT,
    "minInvestment" DECIMAL(18,2),
    "targetInvestor" TEXT,
    "previousFunding" DECIMAL(18,2),
    "revenueModel" TEXT,
    "keyMetrics" TEXT,
    "investorHighlights" TEXT,
    "exitStrategy" TEXT,
    "pitchDeckReady" BOOLEAN NOT NULL DEFAULT false,
    "fundingServiceType" TEXT,
    "capitalProviderType" TEXT,
    "capitalTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ticketMin" DECIMAL(18,2),
    "ticketMax" DECIMAL(18,2),
    "targetCompanyStage" TEXT,
    "collateralRequired" BOOLEAN NOT NULL DEFAULT false,
    "repaymentTerms" TEXT,
    "processingTime" TEXT,
    "regionsCovered" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "eligibilityCriteria" TEXT,
    "requiredDocuments" TEXT,
    "feesDescription" TEXT,
    "regulatoryLicense" TEXT,
    "fundingServiceHighlights" TEXT,
    "startupType" TEXT,
    "startupCategory" TEXT,
    "startupStage" TEXT,
    "problemStatement" TEXT,
    "solutionStatement" TEXT,
    "targetMarket" TEXT,
    "marketSize" TEXT,
    "productStatus" TEXT,
    "tractionSummary" TEXT,
    "teamSummary" TEXT,
    "technologyStack" TEXT,
    "goToMarketStrategy" TEXT,
    "competitors" TEXT,
    "startupHighlights" TEXT,
    "fundingNeeded" DECIMAL(18,2),
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "rating" DECIMAL(3,1) NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "enquiryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileType" "ProfileType" NOT NULL DEFAULT 'INVEST',
    "title" TEXT NOT NULL,
    "firmName" TEXT,
    "investorType" TEXT NOT NULL,
    "bio" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "minTicket" DECIMAL(18,2) NOT NULL,
    "maxTicket" DECIMAL(18,2) NOT NULL,
    "industries" TEXT[],
    "countries" TEXT[],
    "dealTypes" TEXT[],
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "dealsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvisorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileType" "ProfileType" NOT NULL DEFAULT 'ADVISOR',
    "title" TEXT NOT NULL,
    "firmName" TEXT,
    "specialties" TEXT[],
    "bio" TEXT,
    "countries" TEXT[],
    "rating" DECIMAL(3,1) NOT NULL DEFAULT 0,
    "dealsCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvisorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'INQUIRY',
    "ndaSigned" BOOLEAN NOT NULL DEFAULT false,
    "ndaSignedAt" TIMESTAMP(3),
    "notes" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "access" "DocumentAccess" NOT NULL DEFAULT 'DATA_ROOM',
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "isNda" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "businessId" TEXT,
    "dealId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Valuation" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "value" DECIMAL(18,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Valuation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "link" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedBusiness" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BroadcastCampaign" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'ALL',
    "status" "BroadcastStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BroadcastCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_country_idx" ON "User"("country");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_role_idx" ON "Admin"("role");

-- CreateIndex
CREATE INDEX "Admin_isActive_idx" ON "Admin"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRefreshToken_token_key" ON "AdminRefreshToken"("token");

-- CreateIndex
CREATE INDEX "AdminRefreshToken_adminId_idx" ON "AdminRefreshToken"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_slug_key" ON "BusinessProfile"("slug");

-- CreateIndex
CREATE INDEX "BusinessProfile_userId_idx" ON "BusinessProfile"("userId");

-- CreateIndex
CREATE INDEX "BusinessProfile_profileType_idx" ON "BusinessProfile"("profileType");

-- CreateIndex
CREATE INDEX "BusinessProfile_status_idx" ON "BusinessProfile"("status");

-- CreateIndex
CREATE INDEX "BusinessProfile_industry_idx" ON "BusinessProfile"("industry");

-- CreateIndex
CREATE INDEX "BusinessProfile_country_idx" ON "BusinessProfile"("country");

-- CreateIndex
CREATE INDEX "BusinessProfile_isFeatured_idx" ON "BusinessProfile"("isFeatured");

-- CreateIndex
CREATE INDEX "InvestorProfile_userId_idx" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE INDEX "InvestorProfile_profileType_idx" ON "InvestorProfile"("profileType");

-- CreateIndex
CREATE INDEX "InvestorProfile_investorType_idx" ON "InvestorProfile"("investorType");

-- CreateIndex
CREATE INDEX "InvestorProfile_isVerified_idx" ON "InvestorProfile"("isVerified");

-- CreateIndex
CREATE INDEX "AdvisorProfile_userId_idx" ON "AdvisorProfile"("userId");

-- CreateIndex
CREATE INDEX "AdvisorProfile_isVerified_idx" ON "AdvisorProfile"("isVerified");

-- CreateIndex
CREATE INDEX "Deal_businessId_idx" ON "Deal"("businessId");

-- CreateIndex
CREATE INDEX "Deal_initiatorId_idx" ON "Deal"("initiatorId");

-- CreateIndex
CREATE INDEX "Deal_receiverId_idx" ON "Deal"("receiverId");

-- CreateIndex
CREATE INDEX "Deal_status_idx" ON "Deal"("status");

-- CreateIndex
CREATE INDEX "Message_dealId_idx" ON "Message"("dealId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "Document_businessId_idx" ON "Document"("businessId");

-- CreateIndex
CREATE INDEX "Document_dealId_idx" ON "Document"("dealId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "SavedBusiness_userId_idx" ON "SavedBusiness"("userId");

-- CreateIndex
CREATE INDEX "SavedBusiness_businessId_idx" ON "SavedBusiness"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedBusiness_userId_businessId_key" ON "SavedBusiness"("userId", "businessId");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "BroadcastCampaign_adminId_idx" ON "BroadcastCampaign"("adminId");

-- CreateIndex
CREATE INDEX "BroadcastCampaign_status_idx" ON "BroadcastCampaign"("status");

-- CreateIndex
CREATE INDEX "BroadcastCampaign_scheduledAt_idx" ON "BroadcastCampaign"("scheduledAt");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRefreshToken" ADD CONSTRAINT "AdminRefreshToken_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorProfile" ADD CONSTRAINT "InvestorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorProfile" ADD CONSTRAINT "AdvisorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valuation" ADD CONSTRAINT "Valuation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedBusiness" ADD CONSTRAINT "SavedBusiness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedBusiness" ADD CONSTRAINT "SavedBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroadcastCampaign" ADD CONSTRAINT "BroadcastCampaign_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
