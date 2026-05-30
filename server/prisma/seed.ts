import bcrypt from 'bcryptjs'
import { Role, UserStatus } from '@prisma/client'
import { prisma } from '../src/config/prisma.js'

const hash = (password: string) => bcrypt.hash(password, 12)

async function main() {
  console.log('Seeding database...')

  console.log('Admin seeding skipped.')
  console.log('Create the first SUPER_ADMIN through the one-time admin bootstrap page.')

  const seller = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: {},
    create: {
      email: 'seller@test.com',
      password: await hash('Seller@123'),
      firstName: 'Emeka',
      lastName: 'Okafor',
      role: Role.BUSINESS_OWNER,
      country: 'Nigeria',
      phone: '+2348100000001',
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      verified: true,
      verificationStatus: 'VERIFIED',
    },
  })

  console.log(`Test seller created: ${seller.email} / Seller@123`)

  const investor = await prisma.user.upsert({
    where: { email: 'investor@test.com' },
    update: {},
    create: {
      email: 'investor@test.com',
      password: await hash('Investor@123'),
      firstName: 'Aisha',
      lastName: 'Al-Rashid',
      role: Role.INVESTOR,
      country: 'UAE',
      phone: '+97150000001',
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      verified: true,
      verificationStatus: 'VERIFIED',
      investorProfiles: {
        create: {
          title: 'Angel Investor focused on African acquisitions',
          firmName: 'Al-Rashid Capital',
          investorType: 'Angel Investor',
          bio: 'UAE-based angel investor focused on African tech and acquisition opportunities.',
          currency: 'USD',
          minTicket: 50000,
          maxTicket: 500000,
          industries: ['Fintech', 'Healthcare', 'SaaS'],
          countries: ['Nigeria', 'Kenya', 'Ghana'],
          dealTypes: ['PARTIAL_STAKE', 'INVESTMENT'],
          isPremium: false,
          isVerified: true,
          dealsCount: 3,
        },
      },
    },
  })

  console.log(`Test investor created: ${investor.email} / Investor@123`)

  const advisor = await prisma.user.upsert({
    where: { email: 'advisor@test.com' },
    update: {},
    create: {
      email: 'advisor@test.com',
      password: await hash('Advisor@123'),
      firstName: 'Kwame',
      lastName: 'Mensah',
      role: Role.ADVISOR,
      country: 'Ghana',
      phone: '+23320000001',
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      verified: true,
      verificationStatus: 'VERIFIED',
      advisorProfiles: {
        create: {
          title: 'M&A Advisor for West African SMEs',
          firmName: 'Mensah Advisory Group',
          bio: 'M&A advisor with 12 years of experience across West Africa.',
          specialties: ['M&A Advisory', 'Due Diligence', 'Business Valuation'],
          countries: ['Ghana', 'Nigeria', 'Ivory Coast'],
          isVerified: true,
          dealsCount: 8,
        },
      },
    },
  })

  console.log(`Test advisor created: ${advisor.email} / Advisor@123`)

  console.log('\nSeed complete.')
  console.log('IMPORTANT: Demo user passwords are for local development only.')
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })