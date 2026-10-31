import { CheerioCrawler, Dataset, Configuration } from 'crawlee'
import { prisma } from '../../config/prisma.js'
import { createSlug, getCrawlerOwner, parseAmount } from './helperFunctions.js'

const BASE_URL = 'https://www.smergers.com'
const page = Math.floor(Math.random() * 100 + 1)
const START_URL = `${BASE_URL}/businesses-for-sale-and-investment/b/?page=${page}`

type BusinessListing = {
  title: string
  url: string | null
  sku?: string
  // Card headline (itemprop="name"), e.g. "Premium Dubai dental & aesthetic clinic with 2,000+ loyal patients..."
  tagline: string
  // Bullet-point body (itemprop="description"), one bullet per line
  description: string
  image?: string
  rating: number | null
  // e.g. "Dubai" (text of .location)
  city: string | null
  // e.g. "UAE" (last part of .location data-title "Dubai, UAE")
  country: string | null
  // e.g. "USD 330 K"
  runRateSales: string | null
  // e.g. "30 %"
  ebitdaMargin: string | null
  // "Business for Sale", "Partial Stake Sale", etc.
  dealTypeLabel: string | null
  // e.g. "USD 520 K" or "USD 100 K for 10%"
  dealAmountText: string | null
  verification: {
    email: boolean
    phone: boolean
    linkedin: boolean
    facebook: boolean
    google: boolean
  }
}

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

/** "USD 330 thousand" -> "USD 330 K", "USD 1.2 million" -> "USD 1.2 Mn" (same format as the deal amount) */
const normalizeAmountText = (text: string | null): string | null => {
  if (!text) return null
  return text
    .replace(/\s+/g, ' ')
    .replace(/\bthousand\b/i, 'K')
    .replace(/\bmillion\b/i, 'Mn')
    .replace(/\bbillion\b/i, 'Bn')
    .trim()
}

const saveBusinessListing = async (listing: BusinessListing) => {
  // Skip Nigerian listings and anything without a title (can't build a slug)
  if (!listing.title) return
  if (listing.country && /Nigeria/i.test(listing.country)) return
  if (listing.city && /Nigeria/i.test(listing.city)) return

  const user = await getCrawlerOwner()

  const { amountText, percent } = splitDealAmount(listing.dealAmountText)
  const currencyMatch = amountText?.match(/[A-Z]{3}/)
  const currency = currencyMatch ? currencyMatch[0] : 'USD'

  const askAmount = amountText ? parseAmount(amountText) : parseAmount('0')
  const runSales = listing.runRateSales ? parseAmount(listing.runRateSales) : null

  const ebitdaMarginMatch = listing.ebitdaMargin?.match(/([\d.]+)/)
  const ebitdaMargin = ebitdaMarginMatch ? Number(ebitdaMarginMatch[1]) : null
  const description = listing.description?.trim() || listing.tagline?.trim() || listing.title

  // sku (e.g. "b-zuhtz") keeps slugs unique when two listings share a title
  const slug = createSlug(listing.sku ? `${listing.title}-${listing.sku}` : listing.title)

  await prisma.businessProfile.upsert({
    where: { slug },

    create: {
      userId: user.id,
      profileType: 'SELL_BUSINESS',

      title: listing.title,
      slug,

      description,
      shortSummary: listing.tagline,

      industry: 'General',
      country: listing.country ?? listing.city ?? 'Unknown',
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
      description,
      shortSummary: listing.tagline,

      country: listing.country ?? listing.city ?? 'Unknown',
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
  const crawlerConfig = new Configuration({ persistStorage: false, systemInfoV2: false })
  const dataset = await Dataset.open(undefined, { config: crawlerConfig })

  const crawler = new CheerioCrawler(
    {
      maxConcurrency: 5,

      async requestHandler({ $, request, log }) {
        log.info(`Scraping ${request.url}`)
        const pageListings: BusinessListing[] = []

        $('.listing-item').each((_, element) => {
          const item = $(element)

          // --- Title + URL: <h2><a href="..."><i/> Title</a></h2>
          const titleAnchor = item.find('h2 a').first()
          const title = titleAnchor.text().replace(/\s+/g, ' ').trim()
          const relativeUrl = titleAnchor.attr('href')
          const url = relativeUrl ? new URL(relativeUrl, BASE_URL).href : null

          // --- SKU: <meta itemprop="sku" content="b-zuhtz">
          const sku = item.find('meta[itemprop="sku"]').attr('content')

          // --- Tagline: <div itemprop="name">text</div>
          const tagline = item
            .find('[itemprop="name"]')
            .first()
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .replace(/\s+/g, ' ')
            .trim()

          // --- Description: <div itemprop="description"> "- bullet\n- bullet..." </div>
          // Keep line breaks (one bullet per line), only tidy each line.
          const description = item
            .find('[itemprop="description"]')
            .first()
            .text()
            .split('\n')
            .map((line) => line.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .join('\n')

          // --- Image: <img class="listing-photo" src="/media/cache/...webp">
          const imgSrc =
            item.find('img.listing-photo').first().attr('src') ??
            item.find('link[itemprop="image"]').attr('content')
          const image = imgSrc ? new URL(imgSrc, BASE_URL).href : undefined

          // --- Rating: <link itemprop="ratingValue" content="8.4">
          const ratingValue =
            item.find('link[itemprop="ratingValue"]').attr('content') ??
            item.find('.listing-rating-location .rating').first().text().trim()
          const rating = ratingValue && !Number.isNaN(Number(ratingValue)) ? Number(ratingValue) : null

          // --- Location: <span class="location" data-title="Dubai, UAE">Dubai</span>
          const locationEl = item.find('.listing-rating-location .location').first()
          const city = locationEl.text().trim() || null
          const fullLocation = locationEl.attr('data-title')?.trim() ?? ''
          const locationParts = fullLocation
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
          const country = locationParts.length > 1 ? locationParts[locationParts.length - 1] : null

          // --- Metrics: label div + value div inside .bg-grey-100
          //     <div>Run Rate Sales</div><div><span class="currency-symbol">USD</span> 330 thousand</div>
          const getMetric = (label: string): string | null => {
            const labelEl = item
              .find('.bg-grey-100 > div')
              .filter((_i, el) => $(el).text().replace(/\s+/g, ' ').trim().toLowerCase().startsWith(label.toLowerCase()))
              .first()
            const value = labelEl.next().text().replace(/\s+/g, ' ').trim()
            return value || null
          }

          const runRateSales = normalizeAmountText(getMetric('Run Rate Sales'))
          const ebitdaMargin = getMetric('EBITDA Margin')

          // --- Deal type label: text directly inside .sme-v3-smalltext (ignore the nested info icon span)
          const dealTypeLabel =
            item
              .find('.listing-contact-button .sme-v3-smalltext')
              .first()
              .clone()
              .children()
              .remove()
              .end()
              .text()
              .replace(/\s+/g, ' ')
              .trim() || null

          // --- Deal amount: tooltip attr holds the clean value, e.g. data-title="USD 520 K "
          const dealAmountEl = item.find('.listing-contact-button .sme-v3-bolder').first()
          const dealAmountText =
            dealAmountEl.attr('data-title')?.replace(/\s+/g, ' ').trim() ||
            dealAmountEl.text().replace(/\s+/g, ' ').trim() ||
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
            tagline,
            description,
            image,
            rating,
            city,
            country,
            runRateSales,
            ebitdaMargin,
            dealTypeLabel,
            dealAmountText,
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
  console.info(`[businessCrawler] Parsed ${items.length} listings`)
  if (items.length === 0) {
    console.warn('[businessCrawler] No listings matched .listing-item; selectors or upstream page markup may have changed')
  }

  const saveResults = await Promise.allSettled(
    items.map((item) => saveBusinessListing(item as unknown as BusinessListing)),
  )
  const saveFailures = saveResults.filter((result) => result.status === 'rejected')
  for (const result of saveFailures) {
    if (result.status === 'rejected') console.error('[businessCrawler] Listing save failed:', result.reason)
  }
  console.info(`[businessCrawler] Saved ${saveResults.length - saveFailures.length}/${items.length} listings`)

  return items as BusinessListing[]
}