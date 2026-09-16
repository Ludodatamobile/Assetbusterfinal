import { CheerioCrawler, Dataset, Configuration } from 'crawlee'
import { prisma } from '../../config/prisma.js'
import { createSlug, parseAmount } from './helperFunctions.js'

const BASE_URL = 'https://www.smergers.com'
const START_URL = 'https://www.smergers.com/businesses-for-sale-and-investment/b/'

type BusinessListing = {
  title: string
  url: string | null
  sku?: string
  // Short one-line tagline shown right under the title, e.g.
  // "Medical equipment manufacturer with export sales and owned factory, seeking a full sale to investors."
  tagline: string
  // Longer bullet-point description body
  description: string
  image?: string
  rating: number | null
  // e.g. "Mohali" — parsed from the "8.1 Mohali" rating+location line
  city: string | null
  runRateSales: string | null
  ebitdaMargin: string | null
  // "Business for Sale", "Partial Stake Sale", etc.
  dealTypeLabel: string | null
  // e.g. "USD 1.15 Mn" or "USD 100 K for 10%"
  dealAmountText: string | null
  verification: {
    email: boolean
    phone: boolean
    linkedin: boolean
    facebook: boolean
    google: boolean
  }
}

/**
 * Maps the page's deal-type label to the Prisma DealType enum.
 */
const mapDealType = (label: string | null): 'FULL_SALE' | 'PARTIAL_STAKE' | 'BUSINESS_LOAN' | 'INVESTMENT' => {
  if (!label) return 'FULL_SALE'
  const normalized = label.toLowerCase()
  if (normalized.includes('partial') || normalized.includes('stake')) return 'PARTIAL_STAKE'
  if (normalized.includes('loan')) return 'BUSINESS_LOAN'
  if (normalized.includes('invest')) return 'INVESTMENT'
  return 'FULL_SALE'
}

/**
 * "USD 100 K for 10%" -> { amountText: "USD 100 K", percent: 10 }
 * "USD 1.15 Mn"        -> { amountText: "USD 1.15 Mn", percent: null }
 */
const splitDealAmount = (text: string | null): { amountText: string | null; percent: number | null } => {
  if (!text) return { amountText: null, percent: null }

  const percentMatch = text.match(/for\s+([\d.]+)\s*%/i)
  const amountText = text.split(/\s+for\s+/i)[0]?.trim() ?? text.trim()

  return {
    amountText: amountText || null,
    percent: percentMatch ? Number(percentMatch[1]) : null,
  }
}

const saveBusinessListing = async (listing: BusinessListing) => {
  const user = await prisma.user.findFirst()

  if (!user) {
    return
  }

  const { amountText, percent } = splitDealAmount(listing.dealAmountText)
  const currencyMatch = amountText?.match(/[A-Z]{3}/)
  const currency = currencyMatch ? currencyMatch[0] : 'USD'

  const askAmount = amountText ? parseAmount(amountText) : parseAmount('0')
  const runSales = listing.runRateSales ? parseAmount(listing.runRateSales) : null

  const ebitdaMarginMatch = listing.ebitdaMargin?.match(/([\d.]+)/)
  const ebitdaMargin = ebitdaMarginMatch ? Number(ebitdaMarginMatch[1]) : null

  await prisma.businessProfile.upsert({
    where: {
      slug: createSlug(listing.title),
    },

    create: {
      userId: user.id,
      profileType: 'SELL_BUSINESS',

      title: listing.title,
      slug: createSlug(listing.title),

      description: listing.description || listing.tagline,
      shortSummary: listing.tagline,

      industry: 'General',
      country: listing.city ?? 'Unknown',
      city: listing.city,

      dealType: mapDealType(listing.dealTypeLabel),
      currency,
      askAmount,
      askPercent: percent,

      runSales,
      ebitdaMargin,

      website: listing.url,
      imageUrls: listing.image ? [listing.image] : [],

      rating: listing.rating ?? 0,

      isVerified: listing.verification.email || listing.verification.phone,

      status: 'ACTIVE',
    },

    update: {
      title: listing.title,
      description: listing.description || listing.tagline,
      shortSummary: listing.tagline,

      city: listing.city,
      dealType: mapDealType(listing.dealTypeLabel),
      currency,
      askAmount,
      askPercent: percent,

      runSales,
      ebitdaMargin,

      website: listing.url,
      imageUrls: listing.image ? [listing.image] : [],

      rating: listing.rating ?? 0,

      isVerified: listing.verification.email || listing.verification.phone,
    },
  })
}

export const businessCrawler = async (): Promise<BusinessListing[]> => {
  const dataset = await Dataset.open()


Configuration.getGlobalConfig().set('systemInfoV2', false)

  const crawler = new CheerioCrawler({
    maxConcurrency: 5,

    async requestHandler({ $, request, log, enqueueLinks }) {
      log.info(`Scraping ${request.url}`)

      // NOTE: as with the franchise/investor crawlers, `.listing-item` is assumed to be
      // the shared card container across all three SMERGERS listing pages. The field
      // selectors below (tagline, rating+city line, Run Rate Sales / EBITDA Margin /
      // deal-amount boxes) were reverse-engineered from the rendered text of the page,
      // since this sandbox can't reach smergers.com to inspect the live DOM directly.
      // Verify against the real page HTML (browser devtools) and adjust class names
      // before relying on this in production.
      $('.listing-item').each((_, element) => {
        const item = $(element)

        const titleAnchor = item.find('h2 a').first()
        const title = titleAnchor.text().trim()

        const relativeUrl = titleAnchor.attr('href')
        const url = relativeUrl ? new URL(relativeUrl, BASE_URL).href : null

        const sku = item.find('meta[itemprop="sku"]').attr('content')

        const tagline = item
          .find('.listing-tagline, [itemprop="description"]')
          .first()
          .text()
          .replace(/\s+/g, ' ')
          .trim()

        const description = item
          .find('.listing-summary li, .bullet-description li')
          .map((_i, el) => $(el).text().trim())
          .get()
          .join('\n')

        const image = item.find('img').first().attr('src') ?? item.find('link[itemprop="image"]').attr('content')

        const ratingLocationText = item
          .find('.rating-location, .listing-meta')
          .first()
          .text()
          .replace(/\s+/g, ' ')
          .trim()

        const ratingMatch = ratingLocationText.match(/^(\d+(\.\d+)?)\s+(.*)$/)
        const rating = ratingMatch ? Number(ratingMatch[1]) : null
        const city = ratingMatch ? ratingMatch[3].trim() : null

        const runRateSales = item
          .find('.run-rate-sales, .field-run-rate-sales')
          .first()
          .text()
          .replace(/Run Rate Sales/i, '')
          .trim() || null

        const ebitdaMargin = item
          .find('.ebitda-margin, .field-ebitda-margin')
          .first()
          .text()
          .replace(/EBITDA Margin/i, '')
          .trim() || null

        const dealTypeLabel = item
          .find('.deal-type-label, .field-deal-type')
          .first()
          .text()
          .trim() || null

        const dealAmountText = item
          .find('.deal-amount, .field-deal-amount')
          .first()
          .text()
          .trim() || null

        const verification = {
          email: item.find('.social-proof-list .ti-email').hasClass('verified'),
          phone: item.find('.social-proof-list .icon-phone').hasClass('verified'),
          linkedin: item.find('.social-proof-list .icon-linkedin-sign').hasClass('verified'),
          facebook: item.find('.social-proof-list .icon-facebook-sign').hasClass('verified'),
          google: item.find('.social-proof-list .icon-google-plus-sign').hasClass('verified'),
        }

        const listing: BusinessListing = {
          title,
          url,
          sku,
          tagline,
          description,
          image,
          rating,
          city,
          runRateSales,
          ebitdaMargin,
          dealTypeLabel,
          dealAmountText,
          verification,
        }

        void dataset.pushData(listing)
      })

      // Follow pagination links, e.g. https://www.smergers.com/businesses-for-sale-and-investment/b/?page=2
      await enqueueLinks({
        selector: 'a[href*="/businesses-for-sale-and-investment/"]',
        baseUrl: BASE_URL,
      })
    },
  })

  await crawler.run([START_URL])

  const { items } = await dataset.getData()

  try {
    await Promise.all(
      items.map((item) => saveBusinessListing(item as unknown as BusinessListing)),
    )
  } catch (error) {
    // Swallow, matching the franchise crawler's behaviour — individual save failures
    // shouldn't abort the whole run. Consider logging `error` if you need visibility.
  }

  return items as BusinessListing[]
}