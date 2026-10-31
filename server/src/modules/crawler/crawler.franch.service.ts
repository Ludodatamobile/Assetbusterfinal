import { CheerioCrawler, Dataset, Configuration } from 'crawlee'
import { prisma } from '../../config/prisma.js'
import { createSlug, getCrawlerOwner, parseAmount } from './helperFunctions.js'

const BASE_URL = 'https://www.smergers.com'
const page = Math.floor(Math.random() * 100 + 1)
const START_URL = `${BASE_URL}/franchise-opportunities/t11b/?page=${page}`

type FranchiseListing = {
  title: string
  url: string | null
  sku?: string
  // Card headline (itemprop="name"), e.g. "Spacewood, 31 Franchisees, Est'd in 1990, Nagpur HQ"
  name: string
  // e.g. "Spacewood"
  brand?: string
  description: string
  image?: string
  rating: number | null
  ratingCount: number | null
  // e.g. "Ranchi"
  expandingIn: string
  // e.g. "Ranchi, Jharkhand, India" -> "India"
  country: string | null
  // e.g. "USD 21 K"
  expectedMonthlySales: string | null
  // e.g. "4000 - 10000 Sq Ft"
  spaceRequired: string | null
  // e.g. "USD 21 - 53 K"
  investmentRequired: string | null
  verification: {
    email: boolean
    phone: boolean
    linkedin: boolean
    facebook: boolean
    google: boolean
  }
}

/** "USD 21 thousand" -> "USD 21 K", "USD 1.2 million" -> "USD 1.2 Mn" */
const normalizeAmountText = (text: string | null): string | null => {
  if (!text) return null
  return text
    .replace(/\s+/g, ' ')
    .replace(/\bthousand\b/i, 'K')
    .replace(/\bmillion\b/i, 'Mn')
    .replace(/\bbillion\b/i, 'Bn')
    .trim()
}

/**
 * Investment is usually a range:
 *   "USD 21 - 53 K" -> { currency: "USD", minText: "USD 21 K", maxText: "USD 53 K" }
 *   "USD 50 K"      -> { currency: "USD", minText: "USD 50 K", maxText: "USD 50 K" }
 * The unit at the end of a range applies to both ends.
 */
const splitInvestment = (
  text: string | null,
): { currency: string | null; minText: string | null; maxText: string | null } => {
  if (!text) return { currency: null, minText: null, maxText: null }

  const currency = text.match(/[A-Z]{3}/)?.[0] ?? null
  const range = text.match(/([\d.]+)\s*-\s*([\d.]+)\s*([A-Za-z]+)?/)

  if (range) {
    const [, min, max, unit] = range
    const prefix = currency ? `${currency} ` : ''
    const suffix = unit ? ` ${unit}` : ''
    return { currency, minText: `${prefix}${min}${suffix}`, maxText: `${prefix}${max}${suffix}` }
  }

  return { currency, minText: text.trim(), maxText: text.trim() }
}

const saveFranchiseListing = async (listing: FranchiseListing) => {
  if (!listing.title) return

  const user = await getCrawlerOwner()

  const { currency: investCurrency, minText } = splitInvestment(listing.investmentRequired)
  const currency = investCurrency ?? listing.expectedMonthlySales?.match(/[A-Z]{3}/)?.[0] ?? 'USD'

  // Lower bound of the investment range is stored as the ask amount
  const askAmount = parseAmount(minText ?? '0')
  const monthlyRevenue = listing.expectedMonthlySales ? parseAmount(listing.expectedMonthlySales) : null

  const slug = createSlug(listing.sku ? `${listing.title}-${listing.sku}` : listing.title)
  const country = listing.country ?? listing.expandingIn ?? 'Unknown'
  const isVerified = listing.verification.email || listing.verification.phone

  await prisma.businessProfile.upsert({
    where: { slug },

    create: {
      userId: user?.id as string,
      profileType: 'FRANCHISE_BRAND',

      title: listing.title,
      slug,

      description: listing.description || listing.name || listing.title,
      shortSummary: listing.name,

      industry: 'Franchise',
      country,
      city: listing.expandingIn || null,

      currency,
      askAmount,
      monthlyRevenue,

      businessName: listing.brand || listing.name,
      website: listing.url,

      facilities: listing.spaceRequired,

      imageUrls: listing.image ? [listing.image] : [],

      rating: listing.rating ?? 0,

      isVerified,

      status: 'ACTIVE',
    },

    update: {
      title: listing.title,
      description: listing.description || listing.name || listing.title,
      shortSummary: listing.name,

      country,
      city: listing.expandingIn || null,

      currency,
      askAmount,
      monthlyRevenue,

      businessName: listing.brand || listing.name,
      website: listing.url,

      facilities: listing.spaceRequired,

      imageUrls: listing.image ? [listing.image] : [],

      rating: listing.rating ?? 0,

      isVerified,
    },
  })
}

export const franchCrawler = async (): Promise<FranchiseListing[]> => {
  const crawlerConfig = new Configuration({ persistStorage: false, systemInfoV2: false })
  const dataset = await Dataset.open(undefined, { config: crawlerConfig })

  const crawler = new CheerioCrawler(
    {
      maxConcurrency: 5,

      async requestHandler({ $, request, log }) {
        log.info(`Scraping ${request.url}`)
        const pageListings: FranchiseListing[] = []

        $('.listing-item').each((_, element) => {
          const item = $(element)

          // --- Title + URL: <h2><a href="/franchise/spacewood/lrydy/"><i/> Title</a></h2>
          const titleAnchor = item.find('h2 a').first()
          const title = titleAnchor.text().replace(/\s+/g, ' ').trim()
          const relativeUrl = titleAnchor.attr('href')
          const url = relativeUrl ? new URL(relativeUrl, BASE_URL).href : null

          // --- SKU: <meta itemprop="sku" content="b-lrydy">
          const sku = item.find('meta[itemprop="sku"]').attr('content')

          // --- Name: own text of <div itemprop="name"> (ignore nested <link>/<ul> stats)
          const name = item
            .find('[itemprop="name"]')
            .first()
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .replace(/\s+/g, ' ')
            .trim()

          // --- Brand: <link itemprop="brand" content="Spacewood">
          const brand = item.find('link[itemprop="brand"]').attr('content')

          // --- Description: <div itemprop="description">
          const description = item
            .find('[itemprop="description"]')
            .first()
            .text()
            .split('\n')
            .map((line) => line.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .join('\n')

          // --- Image: <link itemprop="image" content="https://..."> (fallback: img.listing-photo)
          const imgSrc =
            item.find('link[itemprop="image"]').attr('content') ??
            item.find('img.listing-photo').first().attr('src')
          const image = imgSrc ? new URL(imgSrc, BASE_URL).href : undefined

          // --- Rating
          const ratingValue = item.find('link[itemprop="ratingValue"]').attr('content')
          const rating = ratingValue && !Number.isNaN(Number(ratingValue)) ? Number(ratingValue) : null

          const ratingCountValue = item.find('link[itemprop="ratingCount"]').attr('content')
          const ratingCount =
            ratingCountValue && !Number.isNaN(Number(ratingCountValue)) ? Number(ratingCountValue) : null

          // --- Location: <span class="location" data-title="Ranchi, Jharkhand, India">Ranchi</span>
          const locationEl = item.find('.listing-rating-location .location').first()
          const expandingIn = locationEl.text().trim()
          const locationParts = (locationEl.attr('data-title') ?? '')
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
          const country = locationParts.length > 1 ? locationParts[locationParts.length - 1] : null

          // --- Metrics: label div + value div inside .bg-grey-100
          const getMetric = (label: string): string | null => {
            const labelEl = item
              .find('.bg-grey-100 > div')
              .filter((_i, el) => $(el).text().replace(/\s+/g, ' ').trim().toLowerCase().startsWith(label.toLowerCase()))
              .first()
            const value = labelEl.next().text().replace(/\s+/g, ' ').trim()
            return value || null
          }

          const expectedMonthlySales = normalizeAmountText(getMetric('Exp Monthly Sales'))
          const spaceRequired = getMetric('Space Required')

          // --- Investment: tooltip attr holds the clean value, e.g. data-title="USD 21 - 53 K"
          const investmentEl = item.find('.listing-contact-button .sme-v3-bolder').first()
          const investmentRequired =
            investmentEl.attr('data-title')?.replace(/\s+/g, ' ').trim() ||
            investmentEl.text().replace(/\s+/g, ' ').trim() ||
            null

          const verification = {
            email: item.find('.social-proof-list .ti-email').hasClass('verified'),
            phone: item.find('.social-proof-list .icon-phone').hasClass('verified'),
            linkedin: item.find('.social-proof-list .icon-linkedin-sign').hasClass('verified'),
            facebook: item.find('.social-proof-list .icon-facebook-sign').hasClass('verified'),
            google: item.find('.social-proof-list .icon-google-plus-sign').hasClass('verified'),
          }

          if (!title) return

          pageListings.push({
            title,
            url,
            sku,
            name,
            brand,
            description,
            image,
            rating,
            ratingCount,
            expandingIn,
            country,
            expectedMonthlySales,
            spaceRequired,
            investmentRequired,
            verification,
          })
        })

        if (pageListings.length > 0) await dataset.pushData(pageListings)
      },
    },
    crawlerConfig,
  )

  await crawler.run([START_URL])

  const { items } = await dataset.getData()
  console.info(`[franchCrawler] Parsed ${items.length} listings`)
  if (items.length === 0) {
    console.warn('[franchCrawler] No listings matched .listing-item; selectors or upstream page markup may have changed')
  }

  const saveResults = await Promise.allSettled(
    items.map((item) => saveFranchiseListing(item as unknown as FranchiseListing)),
  )
  const saveFailures = saveResults.filter((result) => result.status === 'rejected')
  for (const result of saveFailures) {
    if (result.status === 'rejected') console.error('[franchCrawler] Listing save failed:', result.reason)
  }
  console.info(`[franchCrawler] Saved ${saveResults.length - saveFailures.length}/${items.length} listings`)

  return items as FranchiseListing[]
}