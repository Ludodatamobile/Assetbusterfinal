import { CheerioCrawler, Dataset, Configuration, Logger} from 'crawlee'
import { prisma } from '../../config/prisma.js'
import { createSlug, parseAmount } from './helperFunctions.js'


const BASE_URL = 'https://www.smergers.com'


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




const saveSmaggerCralData = async (listing: FranchiseListing )=>{

    const user  = await prisma.user.findFirst();

    if(!user){
        return
    }
    
await prisma.businessProfile.upsert({
  where: {
     // id: user?.id,
      slug:  createSlug(listing.title)
    },
  


  
  create: {
    userId:  user?.id as string,
    //user: user as unknown as User,
  
    title: listing.title,
    slug: createSlug(listing.title),

    description: listing.description,
     profileType: "FRANCHISE_BRAND",

    industry: 'Franchise',
    country: 'Nigeria',

    currency: listing.expectedMonthlySales?.split(' ')?.[0] ?? 'NGN',

    askAmount: parseAmount(
      listing.investmentRequired as string,
    ),

    monthlyRevenue: parseAmount(
      listing.expectedMonthlySales as string,
    ),

    businessName: listing.name,
    website: listing.url,

    facilities: listing.spaceRequired,

    imageUrls: listing.image
      ? [listing.image]
      : [],

    rating: listing.rating ?? 0,

    isVerified:
      listing.verification.email ||
      listing.verification.phone,

    status: 'ACTIVE',

  },

  update: {
    website: listing.url,

    title: listing.title,
    description: listing.description,

    businessName: listing.name,

    monthlyRevenue: parseAmount(
      listing.expectedMonthlySales as string,
    ),

    askAmount: parseAmount(
      listing.investmentRequired as string,
    ),

    facilities: listing.spaceRequired,

    imageUrls: listing.image
      ? [listing.image]
      : [],

    rating: listing.rating ?? 0,

    isVerified:
      listing.verification.email ||
      listing.verification.phone,
  },
})

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
try {
await Promise.all(
  items.map(item => saveSmaggerCralData(item as unknown as FranchiseListing))
)
} catch (error) {
    
}


  return items as FranchiseListing[]
}

