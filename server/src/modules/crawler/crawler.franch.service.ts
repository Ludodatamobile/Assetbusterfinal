import { CheerioCrawler, Dataset } from 'crawlee'
import { prisma } from "../../config/prisma.js";
import { importCrawledListing } from "./crawlImport.service.js";

const BASE_URL = 'https://www.smergers.com'

type Metric = {
  currency?: string
  value: string
}

type FranchiseListing = {
  title: string
  url: string | null
  sku?: string
  name: string
  brand?: string
  description: string
  image?: string
  rating: number | null
  ratingCount: number | null
  expandingIn: string
  expectedMonthlySales: string | null
  spaceRequired: string | null
  investmentRequired: string | null
  verification: {
    email: boolean
    phone: boolean
    linkedin: boolean
    facebook: boolean
    google: boolean
  }
}

const SOURCE_NAME = "SMERGERS Franchise Opportunities";
const SOURCE_URL = "https://www.smergers.com";

function parseCrawlerAmount(value?: string | null): number | undefined {
  if (!value) return undefined;

  const cleaned = value.replace(/,/g, "").trim();
  const number = Number(cleaned.match(/\d+(?:\.\d+)?/)?.[0]);

  if (!Number.isFinite(number)) return undefined;
  if (/billion|bn/i.test(cleaned)) return number * 1_000_000_000;
  if (/million|mn/i.test(cleaned)) return number * 1_000_000;

  return number;
}

async function getOrCreateCrawlSource() {
  return prisma.crawlSource.upsert({
    where: { baseUrl: SOURCE_URL },
    update: {
      name: SOURCE_NAME,
      isActive: true,
    },
    create: {
      name: SOURCE_NAME,
      baseUrl: SOURCE_URL,
      isActive: true,
      rateLimitMs: 5_000,
    },
  });
}

export const franchCrawler = async (): Promise<FranchiseListing[]> => {
  const dataset = await Dataset.open()

  const crawler = new CheerioCrawler({
    maxConcurrency: 5,

    async requestHandler({ $, request, log, enqueueLinks }) {
      log.info(`Scraping ${request.url}`)

      $('.listing-item').each((_, element) => {
        const item = $(element)

        const title = item
          .find('h2 a')
          .first()
          .text()
          .trim()

        const relativeUrl = item
          .find('h2 a')
          .first()
          .attr('href')

        const url = relativeUrl
          ? new URL(relativeUrl, BASE_URL).href
          : null

        const sku = item
          .find('meta[itemprop="sku"]')
          .attr('content')

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

        const brand = item
          .find('link[itemprop="brand"]')
          .attr('content')

        const description = item
          .find('[itemprop="description"]')
          .text()
          .replace(/\s+/g, ' ')
          .trim()

        const image = item
          .find('link[itemprop="image"]')
          .attr('content')

        const ratingValue = item
          .find('[itemprop="ratingValue"]')
          .attr('content')

        const rating = ratingValue
          ? Number(ratingValue)
          : null

        const ratingCountValue = item
          .find('[itemprop="ratingCount"]')
          .attr('content')

        const ratingCount = ratingCountValue
          ? Number(ratingCountValue)
          : null

        const expandingIn = item
          .find('.icon-map-marker.location')
          .text()
          .trim()

        const expectedMonthlySales =   `${item.find('.currency-symbol')?.parent()?.text()?.match(/\d.+\w/i)?.[0].replace(/\s+/g,'').trim() } ${item.find('.currency-symbol').text().trim() }` 

        const spaceRequired =  item.find('.bg-grey-100')?.children()
  .eq(3)
  .next()
  .text()
  .trim()

        const investmentRequired = item.find('span[style="font-size:1.2em;"]').text().trim();

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

        const listing: FranchiseListing = {
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
          expectedMonthlySales,
          spaceRequired,
          investmentRequired,
          verification,
        }

        // Save the actual object
        void dataset.pushData(listing)
      })

      await enqueueLinks({
        selector: 'a[href*="/franchise-opportunities/"]',
        baseUrl: BASE_URL,
      })
    },
  })

 // 
  await crawler.run([
    'https://www.smergers.com/franchise-opportunities/t11b/',
  ])

  // Get the actual scraped objects
  const { items } = await dataset.getData()
  const source = await getOrCreateCrawlSource();

  const run = await prisma.crawlRun.create({
    data: {
      sourceId: source.id,
      status: "RUNNING",
      discovered: items.length,
    },
  });

  let created = 0;
  let updated = 0;
  let rejected = 0;

  try {
    for (const item of items as FranchiseListing[]) {
      if (!item.title || !item.url) {
        rejected += 1;
        continue;
      }

      const result = await importCrawledListing(source.id, {
        externalId: item.sku || item.url,
        sourceUrl: item.url,
        contactUrl: item.url,
        title: item.title,
        description: item.description,
        industry: "Franchise",
        country: item.expandingIn || "Nigeria",
        currency: "NGN",
        askingPrice: parseCrawlerAmount(item.investmentRequired),
        imageUrl: item.image,
        rawPayload: item as unknown as Record<string, unknown>,
      });

      if (result.action === "created") created += 1;
      if (result.action === "updated") updated += 1;
    }

    await prisma.crawlRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        finishedAt: new Date(),
        created,
        updated,
        rejected,
      },
    });

    return items as FranchiseListing[];
  } catch (error) {
    await prisma.crawlRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        created,
        updated,
        rejected,
        errorMessage: error instanceof Error ? error.message : "Unknown crawl error",
      },
    });

    throw error;
  }
}




// function extractMetric(
//   item: unknown,
//   label: string,
// ) {
   
// }

// function extractTextMetric(
//   item: unknown,
//   label: string,
// ) {
//   console.log(item, label, "ITEMm", "Label")
// }

