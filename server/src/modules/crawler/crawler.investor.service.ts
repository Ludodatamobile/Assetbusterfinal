import { CheerioCrawler, Dataset } from 'crawlee'
import { prisma } from '../../config/prisma.js'
import { parseAmount } from './helperFunctions.js'

const BASE_URL = 'https://www.smergers.com'
const START_URL = 'https://www.smergers.com/investors/i/'

type InvestorListing = {
  // e.g. "Regional Sales Head, Retail Company" — the person/company headline shown above the main title
  headline: string
  // e.g. "Individual Buyer in Bengaluru, India" — the main linked title of the card
  title: string
  url: string | null
  // Derived from the title, e.g. "Individual Buyer", "Corporate Acquirer", "Corporate Franchise Buyer"
  investorType: string
  // Derived from the title, e.g. "Bengaluru, India"
  location: string | null
  rating: number | null
  dealsCount: number | null
  locations: string[]
  industries: string[]
  investmentMin: string | null
  investmentMax: string | null
  currency: string
  verification: {
    email: boolean
    phone: boolean
    linkedin: boolean
    facebook: boolean
    google: boolean
  }
}

/**
 * Splits a "Foo Bar + 32 more" style tag list into the primary value and total count hint.
 * Returns just the array of values actually rendered on the card (the "+N more" text is
 * informational only — the underlying data has more items than the page exposes here).
 */
const splitTagList = (text: string): string[] => {
  return text
    .split('+')[0]
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

/**
 * Parses strings like "USD 360 K - 2.4 Mn" or "Upto USD 1.2 Mn" into a [min, max] tuple
 * of raw amount strings (still containing the unit suffix) so parseAmount can do the
 * final numeric conversion, consistent with how the franchise crawler handles amounts.
 */
const splitInvestmentRange = (
  text: string,
): { currency: string; min: string | null; max: string | null } => {
  const currencyMatch = text.match(/[A-Z]{3}/)
  const currency = currencyMatch ? currencyMatch[0] : 'USD'

  const cleaned = text.replace(/upto/i, '').trim()

  if (cleaned.includes('-')) {
    const [minPart, maxPart] = cleaned.split('-').map((s) => s.trim())
    return { currency, min: minPart || null, max: maxPart || null }
  }

  // "Upto USD 1.2 Mn" style — no explicit minimum
  return { currency, min: null, max: cleaned || null }
}

const saveInvestorListing = async (listing: InvestorListing) => {
  const user = await prisma.user.findFirst()

  if (!user) {
    return
  }

  const { currency, min, max } = splitInvestmentRange(
    `${listing.currency} ${listing.investmentMin ?? ''} ${listing.investmentMax ?? ''}`.trim(),
  )

  const minTicket = listing.investmentMin
    ? parseAmount(`${listing.currency} ${listing.investmentMin}`)
    : parseAmount(`${listing.currency} ${listing.investmentMax ?? '0'}`)

  const maxTicket = listing.investmentMax
    ? parseAmount(`${listing.currency} ${listing.investmentMax}`)
    : minTicket

  await prisma.investorProfile.upsert({
    where: {
      // There's no unique slug column on InvestorProfile, so we key off userId + title
      // as a stand-in "natural key" for the scraped listing. Swap this for a real unique
      // constraint (e.g. an external source-id column) once one is added to the schema.
      userId_title: {
        userId: user.id,
        title: listing.title,
      },
    },

    create: {
      userId: user.id,
      profileType: 'INVEST',

      title: listing.title,
      firmName: listing.headline || null,
      investorType: listing.investorType,
      bio: listing.headline || null,

      currency,
      minTicket,
      maxTicket,

      industries: listing.industries,
      countries: listing.locations,
      dealTypes: [],

      isVerified: listing.verification.email || listing.verification.phone,
      dealsCount: listing.dealsCount ?? 0,
    },

    update: {
      firmName: listing.headline || null,
      investorType: listing.investorType,
      bio: listing.headline || null,

      currency,
      minTicket,
      maxTicket,

      industries: listing.industries,
      countries: listing.locations,

      isVerified: listing.verification.email || listing.verification.phone,
      dealsCount: listing.dealsCount ?? 0,
    },
  })
}

export const investorCrawler = async (): Promise<InvestorListing[]> => {
  const dataset = await Dataset.open()

  const crawler = new CheerioCrawler({
    maxConcurrency: 5,

    async requestHandler({ $, request, log, enqueueLinks }) {
      log.info(`Scraping ${request.url}`)

      // NOTE: `.listing-item` is the same card container used on the franchise page.
      // The investor page appears to reuse the same listing component, but the fields
      // below (headline, rating, "Connected with N businesses", Locations / Industries /
      // Investment Size blocks, and the verification icon list) were reverse-engineered
      // from the rendered text of the page rather than the raw DOM, since this sandbox
      // can't reach smergers.com directly to inspect the live markup. Verify these
      // selectors against the actual page HTML (browser devtools) and adjust class names
      // as needed before relying on this in production.
      $('.listing-item').each((_, element) => {
        const item = $(element)

        const headline = item
          .find('.listing-item-headline, .designation, .job-title')
          .first()
          .text()
          .trim()

        const titleAnchor = item.find('h2 a').first()
        const title = titleAnchor.text().trim()

        const relativeUrl = titleAnchor.attr('href')
        const url = relativeUrl ? new URL(relativeUrl, BASE_URL).href : null

        // Title text looks like "Individual Buyer in Bengaluru, India"
        const titleMatch = title.match(/^(.*?)\s+in\s+(.*)$/i)
        const investorType = titleMatch ? titleMatch[1].trim() : title
        const location = titleMatch ? titleMatch[2].trim() : null

        const ratingText = item
          .find('.rating, .rating-value')
          .first()
          .text()
          .trim()
        const ratingMatch = ratingText.match(/(\d+(\.\d+)?)\s*\/\s*10/)
        const rating = ratingMatch ? Number(ratingMatch[1]) : null

        const dealsText = item
          .find('.connected-businesses, .deals-count')
          .first()
          .text()
          .trim()
        const dealsMatch = dealsText.match(/(\d+)/)
        const dealsCount = dealsMatch ? Number(dealsMatch[1]) : null

        const locationsText = item
          .find('.locations-block, .field-locations')
          .first()
          .text()
          .replace(/Locations/i, '')
          .trim()
        const locations = locationsText ? splitTagList(locationsText) : []

        const industriesText = item
          .find('.industries-block, .field-industries')
          .first()
          .text()
          .replace(/Industries/i, '')
          .trim()
        const industries = industriesText ? splitTagList(industriesText) : []

        const investmentSizeText = item
          .find('.investment-size-block, .field-investment-size')
          .first()
          .text()
          .replace(/Investment Size/i, '')
          .trim()

        const currencyMatch = investmentSizeText.match(/[A-Z]{3}/)
        const currency = currencyMatch ? currencyMatch[0] : 'USD'

        const amounts = investmentSizeText.match(/[\d.]+\s*(K|Mn|Bn)?/gi) ?? []
        const investmentMin = amounts[1] ? amounts[0]?.trim() ?? null : null
        const investmentMax = amounts.length > 1 ? amounts[1]?.trim() ?? null : amounts[0]?.trim() ?? null

        const verification = {
          email: item
            .find('.social-proof-list .ti-email')
            .hasClass('verified'),
          phone: item
            .find('.social-proof-list .icon-phone')
            .hasClass('verified'),
          linkedin: item
            .find('.social-proof-list .icon-linkedin-sign')
            .hasClass('verified'),
          facebook: item
            .find('.social-proof-list .icon-facebook-sign')
            .hasClass('verified'),
          google: item
            .find('.social-proof-list .icon-google-plus-sign')
            .hasClass('verified'),
        }

        const listing: InvestorListing = {
          headline,
          title,
          url,
          investorType,
          location,
          rating,
          dealsCount,
          locations,
          industries,
          investmentMin,
          investmentMax,
          currency,
          verification,
        }

        void dataset.pushData(listing)
      })

      // Follow pagination links, e.g. https://www.smergers.com/investors/i/?page=2
      await enqueueLinks({
        selector: 'a[href*="/investors/i/"]',
        baseUrl: BASE_URL,
      })
    },
  })

  await crawler.run([START_URL])

  const { items } = await dataset.getData()

  try {
    await Promise.all(
      items.map((item) => saveInvestorListing(item as unknown as InvestorListing)),
    )
  } catch (error) {
    // Swallow, matching the franchise crawler's behaviour — individual save failures
    // shouldn't abort the whole run. Consider logging `error` if you need visibility.
  }

  return items as InvestorListing[]
}