import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { prisma } from '../config/db.js'

// ─ Paystack API base

const PAYSTACK_BASE = 'https://api.paystack.co'

const paystackRequest = async (method: string, path: string, body?: object) => {
  if (!env.PAYSTACK_SECRET_KEY) {
    throw ApiError.internal('Payment provider not configured.')
  }

  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  })

  const data = (await res.json()) as any
  if (!data.status) {
    throw ApiError.badRequest(data.message ?? 'Payment request failed.')
  }

  return data.data
}

// ─ Plan definitions

export const PLANS = {
  PREMIUM_LISTING: {
    name:       'Premium Listing',
    amountKobo: 2500000,  
    currency:   'NGN',
    description:'Boost your listing to premium status for 30 days',
  },
  PREMIUM_INVESTOR: {
    name:       'Premium Investor Profile',
    amountKobo: 1500000,  
    currency:   'NGN',
    description:'Priority deal flow and verified badge for 30 days',
  },
  ADVISOR_VERIFIED: {
    name:       'Verified Advisor Badge',
    amountKobo: 1000000, 
    currency:   'NGN',
    description:'Get your advisor profile verified',
  },
}

// ─ Initialise a payment 

export const initiatePayment = async (
  userId:   string,
  planKey:  keyof typeof PLANS,
  metadata?: Record<string, unknown>
) => {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { email: true, firstName: true, lastName: true },
  })
  if (!user) throw ApiError.notFound('User not found.')

  const plan = PLANS[planKey]
  if (!plan) throw ApiError.badRequest('Invalid plan.')

  const reference = `ab-${Date.now()}-${userId.slice(0, 6)}`

  const data = await paystackRequest('POST', '/transaction/initialize', {
    email:     user.email,
    amount:    plan.amountKobo,
    currency:  plan.currency,
    reference,
    metadata: {
      userId,
      planKey,
      userName: `${user.firstName} ${user.lastName}`,
      ...metadata,
    },
    callback_url: `${env.CLIENT_URL}/payment/verify?ref=${reference}`,
  })

  return {
    authorizationUrl: data.authorization_url,
    reference:        data.reference,
    accessCode:       data.access_code,
    plan:             plan.name,
    amount:           plan.amountKobo / 100,
    currency:         plan.currency,
  }
}

// Verify a payment

export const verifyPayment = async (reference: string) => {
  const data = await paystackRequest('GET', `/transaction/verify/${reference}`)

  if (data.status !== 'success') {
    throw ApiError.badRequest('Payment was not successful.')
  }

  const { userId, planKey } = data.metadata as any

  // Apply plan benefit
  await applyPlanBenefit(userId, planKey)

  return {
    reference:  data.reference,
    amount:     data.amount / 100,
    currency:   data.currency,
    paidAt:     data.paid_at,
    planKey,
    userId,
  }
}

//  Apply benefit after payment --

const applyPlanBenefit = async (userId: string, planKey: keyof typeof PLANS) => {
  switch (planKey) {
    case 'PREMIUM_LISTING':
      await prisma.businessProfile.updateMany({
        where: { userId },
        data:  { isPremium: true },
      })
      break

    case 'PREMIUM_INVESTOR':
      await prisma.investorProfile.updateMany({
        where: { userId },
        data:  { isPremium: true },
      })
      break

    case 'ADVISOR_VERIFIED':
      await prisma.advisorProfile.updateMany({
        where: { userId },
        data:  { verification: 'VERIFIED' },
      })
      break

    default:
      console.warn(`Unknown planKey: ${planKey}`)
  }

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      title: `${PLANS[planKey].name} activated`,
      body:  `Your ${PLANS[planKey].name} has been activated successfully.`,
      type:  'payment',
      link:  '/dashboard',
    },
  })
}

// ─ Paystack webhook verifier --

import crypto from 'crypto'

export const verifyWebhookSignature = (
  payload:   string,
  signature: string
): boolean => {
  if (!env.PAYSTACK_SECRET_KEY) return false
  const hash = crypto
    .createHmac('sha512', env.PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex')
  return hash === signature
}