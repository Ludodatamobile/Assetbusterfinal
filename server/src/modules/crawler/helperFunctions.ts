import { Prisma } from "@prisma/client"

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