export type UserRole =
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'BUSINESS_OWNER'
  | 'INVESTOR'
  | 'FRANCHISE_PARTNER'
  | 'ADVISOR'
  | 'BUYER'

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'PENDING'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  phone?: string | null
  country?: string | null
  profileImage?: string | null
  isEmailVerified: boolean
  verified?: boolean
  verificationStatus?: string | null
  profileScore?: number | null
  memberSince?: string
  lastLoginAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  role: Exclude<UserRole, 'ADMIN' | 'SUPER_ADMIN'>
  phone?: string
  country?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ApiSuccessResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface AuthResponseData {
  user: User
  accessToken: string
}

export interface RegisterResponseData {
  user: User
}

export type AuthResponse = ApiSuccessResponse<AuthResponseData>
export type RegisterResponse = ApiSuccessResponse<RegisterResponseData>
export type CurrentUserResponse = ApiSuccessResponse<User>
export type RefreshTokenResponse = ApiSuccessResponse<{ accessToken: string }>