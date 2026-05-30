import { z } from 'zod'
import { Role } from '@prisma/client'

const strongPassword = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol')

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
})

export const adminRefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
})

export const bootstrapSuperAdminSchema = z.object({
  body: z.object({
    setupSecret: z.string().min(1, 'Setup secret is required'),
    email: z.string().email('Invalid email address'),
    password: strongPassword,
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  }),
})

export const createAdminSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: strongPassword,
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.enum([Role.ADMIN, Role.SUPER_ADMIN]).optional(),
  }),
})

export type AdminLoginInput = z.infer<typeof adminLoginSchema>['body']
export type AdminRefreshTokenInput = z.infer<typeof adminRefreshTokenSchema>['body']
export type BootstrapSuperAdminInput = z.infer<typeof bootstrapSuperAdminSchema>['body']
export type CreateAdminInput = z.infer<typeof createAdminSchema>['body']