import { CheerioCrawler, Configuration, Dataset } from 'crawlee'
import { prisma } from '../../config/prisma.js'
import { createSlug, getCrawlerOwner, parseAmount } from './helperFunctions.js'

const page = Math.floor(Math.random() * 100 + 1)
const location = ['orlando', 'california', 'delaware']

const locationIndex = Math.floor(Math.random() * location.length + 1)

const BUSINESS_FOR_SALE_URL =
  `https://www.businessesforsale.com/search?Keywords=United+States&Page=${page}`
const BIZBUYSELL_URL = `https://www.bizbuysell.com/${location[locationIndex]}-businesses-for-sale/`
const LOOPNET_URL = 'https://www.loopnet.com/biz/businesses-for-sale/'

type ExternalBusinessListing = {
  source: 'businessesforsale' | 'bizbuysell' | 'loopnet'
  title: string
  url: string | null
  description: string
  location: string
  askingPrice: string | null
  revenue: string | null
  cashFlow: string | null
  image: string | null
  tags: string[]
}

const cleanText = (value: string): string => value.replace(/\s+/g, ' ').trim()

const firstText = (item: any, selectors: string): string =>
  cleanText(item.find(selectors).first().text())

const listingUrl = (item: any, baseUrl: string): string | null => {
  const href = item
    .find('h2 a[href], .title a[href], a.details-link[href], a[href*="/business/"]')
    .first()
    .attr('href')
  return href ? new URL(href, baseUrl).href : null
}

const parseMoney = (value: string | null): ReturnType<typeof parseAmount> | null => {
  if (!value || /not disclosed|on request|undisclosed|n\/a/i.test(value)) return null

  const normalized = value.replace(/\b(USD|US\$|\$)\s*/gi, '')
  const abbreviated = normalized.match(/([\d,.]+)\s*([KMB])\b/i)
  if (abbreviated) {
    const amount = Number(abbreviated[1].replace(/,/g, ''))
    const multiplier = { K: 1_000, M: 1_000_000, B: 1_000_000_000 }[
      abbreviated[2].toUpperCase() as 'K' | 'M' | 'B'
    ]
    return parseAmount(String(amount * multiplier))
  }
  return parseAmount(normalized)
}

const parseLocation = (location: string, source: ExternalBusinessListing['source']) => {
  const parts = location.split(',').map((part) => part.trim()).filter(Boolean)
  const city = parts[0] || null
  const region = parts.at(-1) || ''
  const country = /belize/i.test(location)
    ? 'Belize'
    : /\b(FL|Florida)\b/i.test(region) || source !== 'businessesforsale'
      ? 'United States'
      : region || 'Unknown'
  return { city, country }
}

const saveListing = async (listing: ExternalBusinessListing, userId: string) => {
  const { city, country } = parseLocation(listing.location, listing.source)
  const slug = createSlug(`${listing.source}-${listing.title}-${city ?? ''}`)
  const currency = /\b(CAD|GBP|EUR|AUD|BZ\$)\b/i.exec(
    `${listing.askingPrice ?? ''} ${listing.revenue ?? ''}`,
  )?.[1]?.toUpperCase() ?? 'USD'
  const askingPrice = parseMoney(listing.askingPrice) ?? parseAmount('0')
  const revenue = parseMoney(listing.revenue)
  const cashFlow = parseMoney(listing.cashFlow)
  const description = listing.description || listing.title

  await prisma.businessProfile.upsert({
    where: { slug },
    create: {
      userId,
      profileType: 'SELL_BUSINESS',
      title: listing.title,
      slug,
      description,
      industry: 'General',
      country,
      city,
      currency,
      askAmount: askingPrice,
      runSales: revenue,
      grossRevenue: revenue,
      ebitda: cashFlow,
      website: listing.url,
      businessName: listing.title,
      headline: listing.title,
      shortSummary: listing.description.slice(0, 500) || null,
      facilities: listing.tags.length ? listing.tags.join(', ') : null,
      imageUrls: listing.image ? [listing.image] : [],
      status: 'ACTIVE',
    },
    update: {
      title: listing.title,
      description,
      country,
      city,
      currency,
      askAmount: askingPrice,
      runSales: revenue,
      grossRevenue: revenue,
      ebitda: cashFlow,
      website: listing.url,
      businessName: listing.title,
      headline: listing.title,
      shortSummary: listing.description.slice(0, 500) || null,
      facilities: listing.tags.length ? listing.tags.join(', ') : null,
      imageUrls: listing.image ? [listing.image] : [],
    },
  })
}

const runCrawler = async (
  source: ExternalBusinessListing['source'],
  startUrl: string,
): Promise<ExternalBusinessListing[]> => {
  const crawlerConfig = new Configuration({ persistStorage: false, systemInfoV2: false })
  const dataset = await Dataset.open(undefined, { config: crawlerConfig })
  const crawler = new CheerioCrawler({
    maxConcurrency: 1,
    maxRequestRetries: 1,
    useSessionPool: false,
    async requestHandler({ $, request, log, enqueueLinks }) {
      log.info(`Scraping ${request.url}`)
      const pageListings: ExternalBusinessListing[] = []

      if (source === 'businessesforsale') {
        $('.result-table').each((_, element) => {
          const item = $(element)
          const titleLink = item.find('.result-header h2 a').first()
          const title = cleanText(titleLink.text())
          if (!title) return

          const url = titleLink.attr('href')
            ? new URL(titleLink.attr('href')!, request.url).href
            : null
          const description = firstText(item, '.result-middle-description p')
            .replace(/\s*More details\s*[»>].*$/i, '')
          const priceText = item.find('.result-middle-financials tr').filter((_, row) =>
            /asking price/i.test($(row).find('th').text()),
          ).find('td').text()
          const revenueText = item.find('.result-middle-financials tr').filter((_, row) =>
            /revenue/i.test($(row).find('th').text()),
          ).find('td').text()
          const cashFlowText = item.find('.result-middle-financials tr').filter((_, row) =>
            /cash flow/i.test($(row).find('th').text()),
          ).find('td').text()
          const imageSrc = item.find('.result-middle-image img').first().attr('src')

          pageListings.push({
            source,
            title,
            url,
            description,
            location: firstText(item, 'tr.t-loc td'),
            askingPrice: cleanText(priceText) || null,
            revenue: cleanText(revenueText) || null,
            cashFlow: cleanText(cashFlowText) || null,
            image: imageSrc ? new URL(imageSrc, request.url).href : null,
            tags: item.closest('table').next('.bottom-cta').find('.t-tags li')
              .map((_index, tag) => cleanText($(tag).text())).get(),
          } satisfies ExternalBusinessListing)
        })
      } else if (source === 'bizbuysell') {
        $('.details').each((_, element) => {
          const details = $(element)
          const card = details.closest('.ng-row').length
            ? details.closest('.ng-row')
            : details.parent().parent()
          const title = firstText(details, '.title.h3, .title')
          if (!title) return

          const imageSrc = details.find('img[alt="listing image"]').first().attr('src')
          const askingPrice = firstText(card, '.asking-price')
          const cashFlowText = firstText(card, '.cash-flow, .cash-flow-on-mobile')

          pageListings.push({
            source,
            title,
            url: listingUrl(details, request.url),
            description: firstText(details, '.description'),
            location: firstText(details, '.location'),
            askingPrice: askingPrice || null,
            revenue: null,
            cashFlow: cashFlowText.replace(/^EBITDA:\s*/i, '').replace(/^Cash Flow:\s*/i, '') || null,
            image: imageSrc ? new URL(imageSrc, request.url).href : null,
            tags: [],
          } satisfies ExternalBusinessListing)
        })
      } else {
        $('.shell').each((_, element) => {
          const item = $(element)
          const title = firstText(item, '.listing-header')
          if (!title) return

          const imageSrc = item.find('.image-container img').first().attr('src')
          const cashFlowText = firstText(item, '.cash-flow, .cash-flow-on-mobile')

          pageListings.push({
            source,
            title,
            url: listingUrl(item, request.url),
            description: firstText(item, '.description'),
            location: firstText(item, '.location'),
            askingPrice: firstText(item, '.price') || null,
            revenue: null,
            cashFlow: cashFlowText.replace(/^Cash Flow:\s*/i, '') || null,
            image: imageSrc ? new URL(imageSrc, request.url).href : null,
            tags: [],
          } satisfies ExternalBusinessListing)
        })
      }

      if (pageListings.length > 0) await dataset.pushData(pageListings)

      await enqueueLinks({
        selector: 'a[rel="next"], .pagination a[href], .pager a[href], [class*="pagination"] a[href]',
        baseUrl: request.url,
      })
    },
    failedRequestHandler({ request, log }) {
      log.warning(`Giving up on ${source} request after its retry limit: ${request.url}`)
    },
  }, crawlerConfig)

  await crawler.run([startUrl])
  const { items } = await dataset.getData()
  console.info(`[${source}] Parsed ${items.length} listings`)
  if (items.length === 0) {
    console.warn(`[${source}] No listings matched the configured selectors; the page may have changed or returned a non-listing response`)
  }

  const user = items.length > 0 ? await getCrawlerOwner() : null

  const saveResults = await Promise.allSettled(
    items.map((item) => saveListing(item as ExternalBusinessListing, user!.id)),
  )
  const saveFailures = saveResults.filter((result) => result.status === 'rejected')
  for (const result of saveFailures) {
    if (result.status === 'rejected') console.error(`[${source}] Listing save failed:`, result.reason)
  }
  console.info(`[${source}] Saved ${saveResults.length - saveFailures.length}/${items.length} listings`)
  return items as ExternalBusinessListing[]
}

export const businessesForSaleCrawler = () =>
  runCrawler('businessesforsale', BUSINESS_FOR_SALE_URL)

export const bizBuySellCrawler = () => runCrawler('bizbuysell', BIZBUYSELL_URL)

export const loopNetCrawler = () => runCrawler('loopnet', LOOPNET_URL)