import { Role } from '@prisma/client'

export interface JwtUserPayload {
  id: string
  email: string
  role: Role
  firstName: string
  lastName: string
  type: 'user'
}

export interface JwtAdminPayload {
  id: string
  email: string
  role: Role
  firstName: string
  lastName: string
  type: 'admin'
}

export interface PaginationQuery {
  page?: string
  limit?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type ApiSuccessResponse<T = unknown> = {
  success: true
  message: string
  data: T
  meta?: PaginationMeta
}

export type ApiErrorResponse = {
  success: false
  message: string
  errors?: Record<string, string[]>
}