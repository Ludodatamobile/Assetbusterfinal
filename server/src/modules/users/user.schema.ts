import { z } from 'zod'

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(80).trim().optional(),
    lastName: z.string().min(1, 'Last name is required').max(80).trim().optional(),
    phone: z.string().max(40).trim().nullable().optional(),
    country: z.string().max(80).trim().nullable().optional(),
    profileImage: z.string().url('Profile image URL must be valid').nullable().optional(),
  }),
})

export const updateAvatarSchema = z.object({
  body: z.object({
    avatarUrl: z.string().url('Avatar URL must be valid'),
  }),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body']
export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>['body']