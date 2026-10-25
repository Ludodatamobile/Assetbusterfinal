import { Prisma } from "@prisma/client"
import { randomBytes } from "node:crypto"
import { prisma } from "../../config/prisma.js"
import { hashPassword } from "../../utils/hashPassword.js"

const CRAWLER_OWNER_EMAIL = "crawler-owner@assetbusters.invalid"

export async function getCrawlerOwner() {
  const existing = await prisma.user.findUnique({ where: { email: CRAWLER_OWNER_EMAIL } })
  if (existing) return existing

  const password = randomBytes(32).toString("hex")
  return prisma.user.create({
    data: {
      email: CRAWLER_OWNER_EMAIL,
      password: await hashPassword(password),
      firstName: "Crawler",
      lastName: "Import",
      role: "BUSINESS_OWNER",
      status: "ACTIVE",
      isEmailVerified: true,
      verified: true,
      verificationStatus: "VERIFIED",
    },
  })
}

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
   // + '-' + Date.now()
}

export function parseAmount(value: string): Prisma.Decimal {
  const cleaned = value
    .replace(/,/g, '')
    .trim()

  const numbers = cleaned.match(/\d+(?:\.\d+)?/g)

  if (!numbers?.length) {
    return new Prisma.Decimal(0)
  }

  const first = Number(numbers[0])

  if (/million|mn/i.test(cleaned)) {
    return new Prisma.Decimal(first * 1_000_000)
  }

  if (/billion|bn/i.test(cleaned)) {
    return new Prisma.Decimal(first * 1_000_000_000)
  }

  return new Prisma.Decimal(first)
}